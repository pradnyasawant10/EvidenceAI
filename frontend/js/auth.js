var API_URL = window.API_URL || (window.location.origin.includes(":5000") ? window.location.origin : "http://127.0.0.1:5000");
window.API_URL = API_URL;


// =====================================================
// CHECK LOGIN SESSION
// =====================================================

async function checkAuth() {

    try {

        const response = await fetch(
            API_URL + "/me",
            {
                method: "GET",
                credentials: "include"
            }
        );


        const data = await response.json();


        if (
            response.ok &&
            data.success &&
            (data.authenticated || data.logged_in)
        ) {

            // Save latest user information

            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                localStorage.setItem(
                    "user_id",
                    data.user.user_id
                );

                localStorage.setItem(
                    "loggedIn",
                    "true"
                );

            }

            return true;
        }


        return false;

    }
    catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

        return false;

    }

}


// =====================================================
// PROTECT CURRENT PAGE
// =====================================================

async function protectPage() {

    const authenticated =
        await checkAuth();


    if (!authenticated) {

        // Remove old local session data

        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "user_id"
        );

        localStorage.removeItem(
            "loggedIn"
        );


        // Redirect to login

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

    try {

        await fetch(
            API_URL + "/logout",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }
    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    // Clear browser session data

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "user_id"
    );

    localStorage.removeItem(
        "loggedIn"
    );


    // Go to login page

    window.location.href =
        "login.html";

}


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    try {

        const response = await fetch(
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
            (data.authenticated || data.logged_in)
        ) {

            return data.user;

        }


        return null;

    }
    catch (error) {

        console.error(
            "Current user error:",
            error
        );

        return null;

    }

}


// =====================================================
// DISPLAY CURRENT USER
// =====================================================

async function displayCurrentUser(
    nameElementId,
    roleElementId
) {

    const user =
        await getCurrentUser();


    if (!user) {
        return;
    }


    const nameElement =
        document.getElementById(
            nameElementId
        );


    const roleElement =
        document.getElementById(
            roleElementId
        );


    if (nameElement) {

        nameElement.innerText =
            user.full_name ||
            "User";

    }


    if (roleElement) {

        roleElement.innerText =
            user.role_name ||
            "User";

    }

}


// =====================================================
// AUTO PROTECTION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /*
            Home, Login, Register and Forgot Password pages
            should not be protected.

            All other pages are protected.
        */

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        const publicPages = [
            "",
            "index.html",
            "login.html",
            "register.html",
            "forgot-password.html"
        ];


        if (
            !publicPages.includes(
                currentPage
            )
        ) {

            await protectPage();

        }

    }
);