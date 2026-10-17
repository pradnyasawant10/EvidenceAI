var API_URL = window.API_URL || (window.location.origin.includes(":5000") ? window.location.origin : "http://127.0.0.1:5000");
window.API_URL = API_URL;

let allCases = [];

// =========================================================
// MODAL HELPER FUNCTIONS
// =========================================================

function openAddCaseModal() {
    const modal = document.getElementById("caseModal");
    if (modal) {
        modal.style.display = "flex";
    }
    loadOfficers();
}
window.openAddCaseModal = openAddCaseModal;

function closeAddCaseModal() {
    const modal = document.getElementById("caseModal");
    if (modal) {
        modal.style.display = "none";
    }
}
window.closeAddCaseModal = closeAddCaseModal;

function closeViewCaseModalFunc() {
    const modal = document.getElementById("viewCaseModal");
    if (modal) {
        modal.style.display = "none";
    }
}
window.closeViewCaseModalFunc = closeViewCaseModalFunc;


// =========================================================
// LOAD CASES
// =========================================================

async function loadCases() {

    const tableBody =
        document.getElementById("casesTableBody");

    try {

        const response = await fetch(
            `${API_URL}/cases`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();


        if (!data.success) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty">
                        Unable to load cases.
                    </td>
                </tr>
            `;

            return;
        }


        allCases = Array.isArray(data.cases) ? data.cases : (Array.isArray(data) ? data : []);


        displayCases(allCases);

        updateCaseStatistics(allCases);


    } catch (error) {

        console.error(
            "Cases API Error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    Unable to connect to the server.
                    Please make sure Flask is running.
                </td>
            </tr>
        `;
    }
}


// =========================================================
// DISPLAY CASES
// =========================================================

function displayCases(cases) {

    const tableBody =
        document.getElementById("casesTableBody");


    tableBody.innerHTML = "";


    if (cases.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No cases found.
                </td>
            </tr>
        `;

        return;
    }


    cases.forEach(function (caseData) {

        let statusClass =
            "status-open";


        if (caseData.status === "Closed") {

            statusClass =
                "status-closed";

        } else if (
            caseData.status === "Under Investigation"
        ) {

            statusClass =
                "status-investigation";
        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${caseData.case_number}
                </strong>
            </td>


            <td>
                ${caseData.case_title}
            </td>


            <td>
                ${caseData.crime_type}
            </td>


            <td>
                ${formatDate(caseData.incident_date)}
            </td>


            <td>
                ${caseData.location}
            </td>


            <td>
                ${caseData.officer_name || "Not Assigned"}
            </td>


            <td>

                <span class="status ${statusClass}">
                    ${caseData.status}
                </span>

            </td>


            <td>

                <button
                    class="view-btn"
                    onclick="viewCase(${caseData.case_id})"
                >
                    View
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateCaseStatistics(cases) {

    let open = 0;

    let investigation = 0;

    let closed = 0;


    cases.forEach(function (caseData) {

        if (caseData.status === "Open") {

            open++;

        } else if (
            caseData.status === "Under Investigation"
        ) {

            investigation++;

        } else if (
            caseData.status === "Closed"
        ) {

            closed++;
        }

    });


    document.getElementById(
        "totalCases"
    ).textContent = cases.length;


    document.getElementById(
        "openCases"
    ).textContent = open;


    document.getElementById(
        "investigationCases"
    ).textContent = investigation;


    document.getElementById(
        "closedCases"
    ).textContent = closed;
}


// =========================================================
// SEARCH
// =========================================================

const searchCaseEl = document.getElementById("searchCase");
if (searchCaseEl) {
    searchCaseEl.addEventListener(
        "input",
        function () {

            const searchText =
                this.value
                    .toLowerCase()
                    .trim();


            const filteredCases =
                allCases.filter(
                    function (caseData) {

                        return (

                            (caseData.case_number || "")
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            (caseData.case_title || "")
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            (caseData.crime_type || "")
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            (caseData.location || "")
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            (
                                caseData.officer_name ||
                                ""
                            )
                                .toLowerCase()
                                .includes(searchText)

                        );

                    }
                );


            displayCases(filteredCases);

        }
    );
}


// =========================================================
// OPEN & CLOSE ADD CASE MODAL
// =========================================================

const addCaseBtn = document.getElementById("addCaseBtn");
if (addCaseBtn) {
    addCaseBtn.addEventListener("click", openAddCaseModal);
}

const closeCaseModal = document.getElementById("closeCaseModal");
if (closeCaseModal) {
    closeCaseModal.addEventListener("click", closeAddCaseModal);
}

const cancelCaseBtn = document.getElementById("cancelCaseBtn");
if (cancelCaseBtn) {
    cancelCaseBtn.addEventListener("click", closeAddCaseModal);
}

const caseModal = document.getElementById("caseModal");
if (caseModal) {
    caseModal.addEventListener("click", function (event) {
        if (event.target === caseModal) {
            closeAddCaseModal();
        }
    });
}


// =========================================================
// LOAD OFFICERS
// =========================================================

async function loadOfficers() {

    const officerSelect =
        document.getElementById("officer");


    officerSelect.innerHTML = `
        <option value="">
            Loading officers...
        </option>
    `;


    try {

       const response = await fetch(
            `${API_URL}/officers`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data =
            await response.json();


        if (!data.success) {

            officerSelect.innerHTML = `
                <option value="">
                    Unable to load officers
                </option>
            `;

            return;
        }


        officerSelect.innerHTML = `
            <option value="">
                Select Officer
            </option>
        `;


        data.officers.forEach(
            function (user) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    user.user_id;


                option.textContent =
                    user.full_name;


                officerSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Officer Loading Error:",
            error
        );


        officerSelect.innerHTML = `
            <option value="">
                Unable to connect to server
            </option>
        `;
    }
}


// =========================================================
// SAVE NEW CASE
// =========================================================

const caseForm = document.getElementById("caseForm");
if (caseForm) {
    caseForm.addEventListener(
        "submit",
        async function (event) {

        event.preventDefault();


        const caseNumber =
            document
                .getElementById("caseNumber")
                .value
                .trim();


        const caseTitle =
            document
                .getElementById("caseTitle")
                .value
                .trim();


        const crimeType =
            document
                .getElementById("crimeType")
                .value;


        const incidentDate =
            document
                .getElementById("incidentDate")
                .value;


        const location =
            document
                .getElementById("location")
                .value
                .trim();


        const description =
            document
                .getElementById("description")
                .value
                .trim();


        const officerId =
            document
                .getElementById("officer")
                .value;


        const status =
            document
                .getElementById("caseStatus")
                .value;


        if (!caseNumber) {

            alert(
                "Please enter case number."
            );

            return;
        }


        if (!caseTitle) {

            alert(
                "Please enter case title."
            );

            return;
        }


        if (!crimeType) {

            alert(
                "Please select crime type."
            );

            return;
        }


        if (!incidentDate) {

            alert(
                "Please select incident date."
            );

            return;
        }


        if (!location) {

            alert(
                "Please enter location."
            );

            return;
        }


        if (!officerId) {

            alert(
                "Please select officer."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/cases`,
                    {

                        method: "POST",

                        credentials: "include",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                case_number:
                                    caseNumber,

                                case_title:
                                    caseTitle,

                                crime_type:
                                    crimeType,

                                incident_date:
                                    incidentDate,

                                location:
                                    location,

                                description:
                                    description,

                                officer_id:
                                    officerId,

                                status:
                                    status

                            })

                    }
                );


            const result =
                await response.json();


            if (result.success) {

                alert(
                    "Case added successfully!"
                );

                closeAddCaseModal();

                caseForm.reset();

                loadCases();

            } else {

                alert(
                    result.message ||
                    "Unable to add case."
                );

            }

        } catch (error) {

            console.error(
                "Add Case Error:",
                error
            );

            alert(
                "Unable to connect to the server. " +
                "Please make sure Flask is running."
            );

        }

    });
}


// =========================================================
// VIEW CASE DETAILS
// =========================================================

function viewCase(caseId) {

    const selectedCase =
        allCases.find(
            function (caseData) {

                return (
                    caseData.case_id === caseId
                );

            }
        );


    if (!selectedCase) {

        return;

    }


    // -------------------------
    // SET DETAILS
    // -------------------------

    document.getElementById(
        "viewCaseNumber"
    ).textContent =
        selectedCase.case_number;


    document.getElementById(
        "viewCaseTitle"
    ).textContent =
        selectedCase.case_title;


    document.getElementById(
        "viewCrimeType"
    ).textContent =
        selectedCase.crime_type;


    document.getElementById(
        "viewIncidentDate"
    ).textContent =
        formatDate(
            selectedCase.incident_date
        );


    document.getElementById(
        "viewLocation"
    ).textContent =
        selectedCase.location;


    document.getElementById(
        "viewOfficer"
    ).textContent =
        selectedCase.officer_name ||
        "Not Assigned";


    document.getElementById(
        "viewStatus"
    ).textContent =
        selectedCase.status;


    document.getElementById(
        "viewDescription"
    ).textContent =
        selectedCase.description ||
        "No description available.";


    const viewCaseEvidenceBtn =
        document.getElementById("viewCaseEvidenceBtn");

    if (viewCaseEvidenceBtn) {
        viewCaseEvidenceBtn.onclick = function () {
            window.location.href = `evidence.html?case_id=${selectedCase.case_id}`;
        };
    }

    // -------------------------
    // OPEN DETAILS MODAL
    // -------------------------

    const modal = document.getElementById("viewCaseModal");
    if (modal) {
        modal.style.display = "flex";
    }
}


// =========================================================
// CLOSE CASE DETAILS MODAL
// =========================================================

const closeViewCaseModal = document.getElementById("closeViewCaseModal");
if (closeViewCaseModal) {
    closeViewCaseModal.addEventListener("click", closeViewCaseModalFunc);
}

const closeDetailsBtn = document.getElementById("closeDetailsBtn");
if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener("click", closeViewCaseModalFunc);
}

const viewCaseModal = document.getElementById("viewCaseModal");
if (viewCaseModal) {
    viewCaseModal.addEventListener("click", function (event) {
        if (event.target === viewCaseModal) {
            closeViewCaseModalFunc();
        }
    });
}


// =========================================================
// LOGOUT
// =========================================================

async function logout() {

    try {
        await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include"
        });
    } catch (e) {
        console.error("Logout error:", e);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("loggedIn");

    window.location.href =
        "login.html";
}


// =========================================================
// PAGE LOAD
// =========================================================

function initCasesPage() {
    loadCases();

    const addBtn = document.getElementById("addCaseBtn");
    if (addBtn) {
        addBtn.onclick = openAddCaseModal;
    }

    const closeBtn = document.getElementById("closeCaseModal");
    if (closeBtn) {
        closeBtn.onclick = closeAddCaseModal;
    }

    const cancelBtn = document.getElementById("cancelCaseBtn");
    if (cancelBtn) {
        cancelBtn.onclick = closeAddCaseModal;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCasesPage);
} else {
    initCasesPage();
}