var API_URL = window.API_URL || (window.location.origin.includes(":5000") ? window.location.origin : "http://127.0.0.1:5000");
window.API_URL = API_URL;


// =====================================================
// ROLE BASED ACCESS
// =====================================================

const PAGE_ROLES = {

    "users.html": [
        "Admin",
        "Administrator"
    ],

    "activity-logs.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ],

    "settings.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ],

    "dashboard.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ],

    "cases.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ],

    "evidence.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ],

    "evidence-integrity.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ],

    "ai-analysis.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ],

    "reports.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ],

    "search.html": [
        "Admin",
        "Administrator",
        "Investigator",
        "Forensic Officer"
    ]

};


// =====================================================
// GET CURRENT PAGE
// =====================================================

function getCurrentPage() {

    let page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (!page) {

        page = "index.html";

    }


    return page;

}


// =====================================================
// GET CURRENT USER FROM BACKEND
// =====================================================

async function getLoggedInUser() {

    try {

        const response =
            await fetch(
                API_URL + "/me",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            return null;

        }


        const data =
            await response.json();


        if (
            data.success &&
            (data.authenticated || data.logged_in) &&
            data.user
        ) {

            return data.user;

        }


        return null;

    }
    catch (error) {

        console.error(
            "Role check error:",
            error
        );

        return null;

    }

}


// =====================================================
// CHECK ROLE
// =====================================================

async function checkRoleAccess() {

    const currentPage =
        getCurrentPage();


    /*
        Public pages
    */

    const publicPages = [
        "",
        "index.html",
        "login.html",
        "register.html",
        "forgot-password.html"
    ];


    if (
        publicPages.includes(
            currentPage
        )
    ) {

        return;

    }


    /*
        Get page roles
    */

    const allowedRoles =
        PAGE_ROLES[currentPage];


    /*
        If page isn't listed,
        only login authentication is needed.
    */

    if (!allowedRoles) {

        return;

    }


    /*
        Get logged-in user
    */

    const user =
        await getLoggedInUser();


    if (!user) {

        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "user_id"
        );

        localStorage.removeItem(
            "loggedIn"
        );


        window.location.href =
            "login.html";

        return;

    }


    /*
        Get role
    */

    const role =
        user.role_name || "";


    /*
        Check access
    */

    const hasAccess =
        allowedRoles.includes(
            role
        );


    if (!hasAccess) {

        alert(
            "Access Denied. You do not have permission to access this page."
        );


        window.location.href =
            "dashboard.html";


        return;

    }


    /*
        Save latest user
        information
    */

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );


    localStorage.setItem(
        "user_id",
        user.user_id
    );


    localStorage.setItem(
        "loggedIn",
        "true"
    );


    console.log(
        "Role Access Granted:",
        role,
        currentPage
    );

}


// =====================================================
// HIDE RESTRICTED NAVIGATION LINKS
// =====================================================

async function updateNavigationByRole() {

    const user =
        await getLoggedInUser();


    if (!user) {

        return;

    }


    const role =
        user.role_name || "";


    /*
        Users page is Admin only
    */

    if (
        role !== "Admin" &&
        role !== "Administrator"
    ) {

        const usersLinks =
            document.querySelectorAll(
                'a[href="users.html"]'
            );


        usersLinks.forEach(
            function(link) {

                link.style.display =
                    "none";

            }
        );

    }

}


// =====================================================
// DISPLAY ROLE IN PAGE
// =====================================================

async function displayRoleIfAvailable() {

    const user =
        await getLoggedInUser();


    if (!user) {

        return;

    }


    const roleElements =
        document.querySelectorAll(
            ".current-user-role"
        );


    roleElements.forEach(
        function(element) {

            element.innerText =
                user.role_name ||
                "User";

        }
    );


    const nameElements =
        document.querySelectorAll(
            ".current-user-name"
        );


    nameElements.forEach(
        function(element) {

            element.innerText =
                user.full_name ||
                "User";

        }
    );

}


// =====================================================
// RUN ROLE CHECK
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await checkRoleAccess();

        await updateNavigationByRole();

        await displayRoleIfAvailable();

    }
);