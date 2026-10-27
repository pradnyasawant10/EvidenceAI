var API_URL = window.API_URL || ((window.location.protocol === "file:" || ["5500", "5501", "3000", "8000"].includes(window.location.port)) ? "http://127.0.0.1:5000" : window.location.origin);
window.API_URL = API_URL;

let allCases = [];
let allReports = [];


/* =====================================================
   LOAD CASES
===================================================== */

async function loadCases() {

    try {

        const response =
            await fetch(`${API_URL}/cases`, {
                method: "GET",
                credentials: "include"
            });

        const data =
            await response.json();


        if (!data.success) {

            console.error(data.message);

            return;
        }


        allCases = data.cases;

        populateCaseDropdown();

    } catch (error) {

        console.error(
            "Error loading cases:",
            error
        );

    }
}


/* =====================================================
   POPULATE CASE DROPDOWN
===================================================== */

function populateCaseDropdown() {

    const dropdown =
        document.getElementById(
            "reportCase"
        );


    dropdown.innerHTML = `
        <option value="">
            Select Case
        </option>
    `;


    allCases.forEach(caseItem => {

        const option =
            document.createElement("option");


        option.value =
            caseItem.case_id;


        option.textContent =
            `${caseItem.case_number} - ${caseItem.case_title}`;


        dropdown.appendChild(
            option
        );

    });
}


/* =====================================================
   LOAD REPORTS
===================================================== */

async function loadReports() {

    try {

        const response =
            await fetch(`${API_URL}/reports`, {
                method: "GET",
                credentials: "include"
            });

        const data =
            await response.json();


        if (!data.success) {

            console.error(data.message);

            displayReports([]);

            return;
        }


        allReports =
            data.reports;


        displayReports(
            allReports
        );


        updateStatistics(
            allReports
        );


    } catch (error) {

        console.error(
            "Error loading reports:",
            error
        );


        displayReports([]);

    }
}


/* =====================================================
   DISPLAY REPORTS
===================================================== */

function displayReports(reportList) {

    const tableBody =
        document.getElementById(
            "reportTableBody"
        );


    tableBody.innerHTML = "";


    if (
        !reportList ||
        reportList.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-message"
                >
                    No reports available.
                </td>
            </tr>
        `;

        return;
    }


    reportList.forEach(report => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <strong>
                    ${escapeHTML(
                        report.report_title || "-"
                    )}
                </strong>

            </td>


            <td>

                ${escapeHTML(
                    report.case_number || "-"
                )}

                <br>

                <small>
                    ${escapeHTML(
                        report.case_title || ""
                    )}
                </small>

            </td>


            <td>

                <span class="report-type-badge">

                    ${escapeHTML(
                        report.report_type || "-"
                    )}

                </span>

            </td>


            <td>

                ${escapeHTML(
                    report.file_name || "-"
                )}

            </td>


            <td>

                ${escapeHTML(
                    report.generated_by_name || "-"
                )}

            </td>


            <td>

                ${formatDateTime(
                    report.generated_at
                )}

            </td>


            <td>

                ${getReportStatus(
                    report.status
                )}

            </td>


            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewReport(${report.report_id})"
                >
                    View
                </button>


                ${
                    report.file_path
                    ?
                    `
                    <button
                        class="action-btn download-btn"
                        onclick="downloadReport(${report.report_id})"
                    >
                        Download
                    </button>
                    `
                    :
                    ""
                }

            </td>

        `;


        tableBody.appendChild(
            row
        );

    });
}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics(reportList) {

    const total =
        reportList.length;


    const generated =
        reportList.filter(
            report =>
                report.status === "Generated"
        ).length;


    const drafts =
        reportList.filter(
            report =>
                report.status === "Draft"
        ).length;


    const archived =
        reportList.filter(
            report =>
                report.status === "Archived"
        ).length;


    document.getElementById(
        "totalReports"
    ).textContent = total;


    document.getElementById(
        "generatedReports"
    ).textContent = generated;


    document.getElementById(
        "draftReports"
    ).textContent = drafts;


    document.getElementById(
        "archivedReports"
    ).textContent = archived;
}


/* =====================================================
   SEARCH REPORTS
===================================================== */

function searchReports() {

    const searchText =
        document.getElementById(
            "searchReport"
        ).value
        .toLowerCase()
        .trim();


    applyFilters(
        searchText
    );
}


/* =====================================================
   FILTER REPORTS
===================================================== */

function filterReports() {

    const searchText =
        document.getElementById(
            "searchReport"
        ).value
        .toLowerCase()
        .trim();


    applyFilters(
        searchText
    );
}


/* =====================================================
   APPLY FILTERS
===================================================== */

function applyFilters(searchText = "") {

    const reportType =
        document.getElementById(
            "reportTypeFilter"
        ).value;


    const reportStatus =
        document.getElementById(
            "reportStatusFilter"
        ).value;


    const filteredReports =
        allReports.filter(report => {

            const title =
                (
                    report.report_title || ""
                ).toLowerCase();


            const caseNumber =
                (
                    report.case_number || ""
                ).toLowerCase();


            const caseTitle =
                (
                    report.case_title || ""
                ).toLowerCase();


            const fileName =
                (
                    report.file_name || ""
                ).toLowerCase();


            const searchMatch =
                !searchText ||
                title.includes(searchText) ||
                caseNumber.includes(searchText) ||
                caseTitle.includes(searchText) ||
                fileName.includes(searchText);


            const typeMatch =
                !reportType ||
                report.report_type === reportType;


            const statusMatch =
                !reportStatus ||
                report.status === reportStatus;


            return (
                searchMatch &&
                typeMatch &&
                statusMatch
            );

        });


    displayReports(
        filteredReports
    );
}


/* =====================================================
   OPEN REPORT MODAL
===================================================== */

function openReportModal() {

    document.getElementById(
        "reportModal"
    ).style.display = "flex";
}


/* =====================================================
   CLOSE REPORT MODAL
===================================================== */

function closeReportModal() {

    document.getElementById(
        "reportModal"
    ).style.display = "none";
}


/* =====================================================
   VIEW REPORT
===================================================== */

function viewReport(reportId) {

    const report =
        allReports.find(
            item =>
                item.report_id == reportId
        );


    if (!report) {
        return;
    }


    document.getElementById(
        "detailReportTitle"
    ).textContent =
        report.report_title || "-";


    document.getElementById(
        "detailCase"
    ).textContent =
        `${report.case_number || "-"} - ${report.case_title || ""}`;


    document.getElementById(
        "detailReportType"
    ).textContent =
        report.report_type || "-";


    document.getElementById(
        "detailFileName"
    ).textContent =
        report.file_name || "-";


    document.getElementById(
        "detailGeneratedBy"
    ).textContent =
        report.generated_by_name || "-";


    document.getElementById(
        "detailGeneratedAt"
    ).textContent =
        formatDateTime(
            report.generated_at
        );


    document.getElementById(
        "detailStatus"
    ).textContent =
        report.status || "-";


    document.getElementById(
        "detailDescription"
    ).textContent =
        report.description ||
        "No description available.";


    const btnPdf =
        document.getElementById("btnDownloadReportPdf");

    if (btnPdf) {
        btnPdf.onclick = function() {
            downloadReport(reportId);
        };
    }

    document.getElementById(
        "detailsModal"
    ).style.display = "flex";
}


/* =====================================================
   CLOSE DETAILS MODAL
===================================================== */

function closeDetailsModal() {

    document.getElementById(
        "detailsModal"
    ).style.display = "none";
}


/* =====================================================
   DOWNLOAD REPORT
===================================================== */

function downloadReport(reportId) {

    const report =
        allReports.find(
            item =>
                item.report_id == reportId
        );


    if (!report) {
        return;
    }

    const filename = report.file_name || (report.file_path ? report.file_path.replace(/^reports[\/\\]/, '') : '');

    if (!filename) {

        alert(
            "Report file is not available."
        );

        return;
    }


    window.open(
        `${API_URL}/reports/${encodeURIComponent(filename)}`,
        "_blank"
    );
}


/* =====================================================
   GENERATE REPORT
===================================================== */

document
    .getElementById("reportForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const caseId =
                document.getElementById(
                    "reportCase"
                ).value;


            const reportTitle =
                document.getElementById(
                    "reportTitle"
                ).value
                .trim();


            const reportType =
                document.getElementById(
                    "reportType"
                ).value;


            const description =
                document.getElementById(
                    "reportDescription"
                ).value
                .trim();


            if (
                !caseId ||
                !reportTitle ||
                !reportType
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }


            const button =
                document.querySelector(
                    "#reportForm .save-btn"
                );


            button.disabled = true;

            button.textContent =
                "Generating...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/reports`,
                        {

                            method: "POST",

                            credentials: "include",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                case_id:
                                    caseId,

                                report_title:
                                    reportTitle,

                                report_type:
                                    reportType,

                                description:
                                    description

                            })

                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    alert(
                        data.message ||
                        "Report generated successfully!"
                    );


                    document
                        .getElementById(
                            "reportForm"
                        )
                        .reset();


                    closeReportModal();


                    loadReports();

                } else {

                    alert(
                        data.message ||
                        "Report generation failed."
                    );

                }


            } catch (error) {

                console.error(
                    "Report error:",
                    error
                );


                alert(
                    "Unable to connect to EvidenceAI backend."
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    "Generate Report";

            }

        }
    );


/* =====================================================
   STATUS BADGE
===================================================== */

function getReportStatus(status) {

    if (status === "Generated") {

        return `
            <span class="report-status status-generated">
                Generated
            </span>
        `;
    }


    if (status === "Draft") {

        return `
            <span class="report-status status-draft">
                Draft
            </span>
        `;
    }


    if (status === "Archived") {

        return `
            <span class="report-status status-archived">
                Archived
            </span>
        `;
    }


    return `
        <span class="report-status">
            ${escapeHTML(status || "Unknown")}
        </span>
    `;
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateValue;
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =====================================================
   HTML SECURITY
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =====================================================
   LOGOUT
===================================================== */

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


/* =====================================================
   CLOSE MODALS ON OUTSIDE CLICK
===================================================== */

window.addEventListener(
    "click",
    function(event) {

        const reportModal =
            document.getElementById(
                "reportModal"
            );


        const detailsModal =
            document.getElementById(
                "detailsModal"
            );


        if (
            event.target === reportModal
        ) {

            closeReportModal();

        }


        if (
            event.target === detailsModal
        ) {

            closeDetailsModal();

        }

    }
);


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await loadCases();

        await loadReports();

    }
);