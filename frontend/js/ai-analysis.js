var API_URL = window.API_URL || ((window.location.protocol === "file:" || ["5500", "5501", "3000", "8000"].includes(window.location.port)) ? "http://127.0.0.1:5000" : window.location.origin);
window.API_URL = API_URL;

let allEvidence = [];
let allAnalyses = [];
let allCases = [];


/* =====================================================
   LOAD CASES
===================================================== */

async function loadCases() {

    try {

        const response = await fetch(`${API_URL}/cases`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            console.error(data.message);
            return;
        }

        allCases = data.cases;

        populateCaseDropdown();

    } catch (error) {

        console.error("Error loading cases:", error);

    }
}


/* =====================================================
   CASE DROPDOWN
===================================================== */

function populateCaseDropdown() {

    const caseDropdown =
        document.getElementById("analysisCase");

    caseDropdown.innerHTML = `
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

        caseDropdown.appendChild(option);

    });
}


/* =====================================================
   LOAD EVIDENCE
===================================================== */

async function loadEvidence() {

    try {

        const response =
            await fetch(`${API_URL}/evidence`, {
                method: "GET",
                credentials: "include"
            });

        const data =
            await response.json();


        if (!data.success) {

            console.error(data.message);

            return;
        }


        allEvidence =
            data.evidence;


    } catch (error) {

        console.error(
            "Error loading evidence:",
            error
        );

    }
}


/* =====================================================
   EVIDENCE DROPDOWN
===================================================== */

function populateEvidenceDropdown(caseId) {

    const evidenceDropdown =
        document.getElementById("analysisEvidence");


    evidenceDropdown.innerHTML = `
        <option value="">
            Select Evidence
        </option>
    `;


    if (!caseId) {
        return;
    }


    const caseEvidence =
        allEvidence.filter(
            evidence =>
                String(evidence.case_id) === String(caseId)
        );


    caseEvidence.forEach(evidence => {

        const option =
            document.createElement("option");

        option.value =
            evidence.evidence_id;

        option.textContent =
            `${evidence.evidence_number} - ${evidence.file_name} (${evidence.evidence_type})`;

        evidenceDropdown.appendChild(option);

    });


    if (caseEvidence.length === 0) {

        const option =
            document.createElement("option");

        option.value = "";

        option.textContent =
            "No evidence available for this case";

        option.disabled = true;

        evidenceDropdown.appendChild(option);
    }
}


/* =====================================================
   ANALYSIS TYPE INFORMATION
===================================================== */

function updateAnalysisDescription() {

    const type =
        document.getElementById("analysisType").value;

    const description =
        document.getElementById("analysisDescription");


    const descriptions = {

        "Object Detection":
            "Detects and identifies objects present in images and video evidence using YOLO11n AI model.",

        "OCR":
            "Extracts readable text from images, PDF files, and text documents using OCR and Document Parsing.",

        "Face Detection":
            "Detects human faces present in image and video evidence using Haar Cascade recognition.",

        "Audio Transcription":
            "Converts spoken dialogue from audio and video recordings into written text using Whisper AI.",

        "General Analysis":
            "Performs multi-modal AI-based forensic analysis and integrity checks on any evidence file."
    };


    description.textContent =
        descriptions[type] ||
        "Select an analysis type to see what the AI module will perform.";
}


/* =====================================================
   LOAD ANALYSES
===================================================== */

async function loadAnalyses() {

    try {

        const response =
            await fetch(`${API_URL}/ai-analysis`, {
                method: "GET",
                credentials: "include"
            });

        const data =
            await response.json();


        if (!data.success) {

            console.error(data.message);

            displayAnalyses([]);

            return;
        }


        allAnalyses =
            data.analyses;


        displayAnalyses(
            allAnalyses
        );

        updateStatistics(
            allAnalyses
        );


    } catch (error) {

        console.error(
            "Error loading AI analyses:",
            error
        );

        displayAnalyses([]);

    }
}


/* =====================================================
   DISPLAY ANALYSES
===================================================== */

function displayAnalyses(analysisList) {

    const tableBody =
        document.getElementById(
            "analysisTableBody"
        );


    tableBody.innerHTML = "";


    if (analysisList.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="empty-message"
                >
                    No AI analysis available.
                </td>
            </tr>
        `;

        return;
    }


    analysisList.forEach(analysis => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(
                        analysis.evidence_number || "-"
                    )}
                </strong>

                <br>

                <small>
                    ${escapeHTML(
                        analysis.file_name || ""
                    )}
                </small>
            </td>


            <td>
                ${escapeHTML(
                    analysis.case_number || "-"
                )}

                <br>

                <small>
                    ${escapeHTML(
                        analysis.case_title || ""
                    )}
                </small>
            </td>


            <td>

                <span class="analysis-type-badge">

                    ${escapeHTML(
                        analysis.analysis_type
                    )}

                </span>

            </td>


            <td>

                ${escapeHTML(
                    truncateResult(
                        analysis.result,
                        70
                    )
                )}

            </td>


            <td>

                <span class="confidence-value">

                    ${
                        analysis.confidence !== null &&
                        analysis.confidence !== undefined
                            ? analysis.confidence + "%"
                            : "-"
                    }

                </span>

            </td>


            <td>
                ${escapeHTML(
                    analysis.model_name || "-"
                )}
            </td>


            <td>
                ${getAnalysisStatus(
                    analysis.status
                )}
            </td>


            <td>
                ${formatDateTime(
                    analysis.analyzed_at
                )}
            </td>


            <td>

                <button
                    class="result-view-btn"
                    onclick="viewAnalysis(${analysis.analysis_id})"
                >
                    View
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics(analysisList) {

    const total =
        analysisList.length;


    const completed =
        analysisList.filter(
            item =>
                item.status === "Completed"
        ).length;


    const processing =
        analysisList.filter(
            item =>
                item.status === "Processing"
        ).length;


    const failed =
        analysisList.filter(
            item =>
                item.status === "Failed"
        ).length;


    document.getElementById(
        "totalAnalyses"
    ).textContent = total;


    document.getElementById(
        "completedAnalyses"
    ).textContent = completed;


    document.getElementById(
        "processingAnalyses"
    ).textContent = processing;


    document.getElementById(
        "failedAnalyses"
    ).textContent = failed;
}


/* =====================================================
   RUN AI ANALYSIS
===================================================== */

document
    .getElementById("analysisForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const caseId =
                document.getElementById(
                    "analysisCase"
                ).value;


            const evidenceId =
                document.getElementById(
                    "analysisEvidence"
                ).value;


            const analysisType =
                document.getElementById(
                    "analysisType"
                ).value;


            if (
                !caseId ||
                !evidenceId ||
                !analysisType
            ) {

                alert(
                    "Please select Case, Evidence and Analysis Type."
                );

                return;
            }


            const button =
                document.querySelector(
                    ".run-analysis-btn"
                );


            button.disabled = true;

            button.textContent =
                "⏳ Processing...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/ai-analysis`,
                        {

                            method: "POST",

                            credentials: "include",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                evidence_id:
                                    evidenceId,

                                analysis_type:
                                    analysisType

                            })

                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    alert(
                        data.message ||
                        "AI Analysis completed successfully!"
                    );


                    document
                        .getElementById(
                            "analysisForm"
                        )
                        .reset();


                    document
                        .getElementById(
                            "analysisEvidence"
                        )
                        .innerHTML = `
                            <option value="">
                                Select Evidence
                            </option>
                        `;


                    updateAnalysisDescription();


                    loadAnalyses();

                } else {

                    alert(
                        data.message ||
                        "AI Analysis failed."
                    );

                }


            } catch (error) {

                console.error(
                    "AI Analysis error:",
                    error
                );


                alert(
                    "Unable to connect to EvidenceAI backend."
                );


            } finally {

                button.disabled = false;

                button.textContent =
                    "🤖 Run AI Analysis";

            }

        }
    );


/* =====================================================
   VIEW ANALYSIS DETAILS
===================================================== */

function viewAnalysis(analysisId) {

    const analysis =
        allAnalyses.find(
            item =>
                item.analysis_id == analysisId
        );


    if (!analysis) {
        return;
    }


    document.getElementById(
        "detailEvidence"
    ).textContent =
        `${analysis.evidence_number || "-"} - ${analysis.file_name || ""}`;


    document.getElementById(
        "detailCase"
    ).textContent =
        `${analysis.case_number || "-"} - ${analysis.case_title || ""}`;


    document.getElementById(
        "detailAnalysisType"
    ).textContent =
        analysis.analysis_type || "-";


    document.getElementById(
        "detailConfidence"
    ).textContent =
        analysis.confidence !== null &&
        analysis.confidence !== undefined
            ? analysis.confidence + "%"
            : "-";


    document.getElementById(
        "detailModel"
    ).textContent =
        analysis.model_name || "-";


    document.getElementById(
        "detailAnalysisStatus"
    ).textContent =
        analysis.status || "-";


    document.getElementById(
        "detailAnalyzedAt"
    ).textContent =
        formatDateTime(
            analysis.analyzed_at
        );


    document.getElementById(
        "detailResult"
    ).textContent =
        analysis.result ||
        "No result available.";


    document.getElementById(
        "resultModal"
    ).style.display = "flex";
}


/* =====================================================
   CLOSE RESULT MODAL
===================================================== */

function closeResultModal() {

    document.getElementById(
        "resultModal"
    ).style.display = "none";
}


/* =====================================================
   ANALYSIS STATUS
===================================================== */

function getAnalysisStatus(status) {

    if (status === "Completed") {

        return `
            <span class="analysis-status status-completed">
                Completed
            </span>
        `;
    }


    if (status === "Processing") {

        return `
            <span class="analysis-status status-processing">
                Processing
            </span>
        `;
    }


    if (status === "Failed") {

        return `
            <span class="analysis-status status-failed">
                Failed
            </span>
        `;
    }


    return `
        <span class="analysis-status">
            ${escapeHTML(status || "Unknown")}
        </span>
    `;
}


/* =====================================================
   RESULT TRUNCATION
===================================================== */

function truncateResult(
    result,
    maxLength
) {

    if (!result) {
        return "-";
    }


    if (result.length <= maxLength) {
        return result;
    }


    return result.substring(
        0,
        maxLength
    ) + "...";
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


    if (isNaN(date.getTime())) {
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
   CLOSE MODAL OUTSIDE CLICK
===================================================== */

window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "resultModal"
            );


        if (
            event.target === modal
        ) {

            closeResultModal();

        }

    }
);


/* =====================================================
   CASE CHANGE
===================================================== */

document
    .getElementById("analysisCase")
    .addEventListener(
        "change",
        function() {

            const caseId =
                this.value;


            populateEvidenceDropdown(
                caseId
            );

        }
    );


/* =====================================================
   ANALYSIS TYPE CHANGE
===================================================== */

document
    .getElementById("analysisType")
    .addEventListener(
        "change",
        function() {

            updateAnalysisDescription();

        }
    );


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await loadCases();

        await loadEvidence();

        await loadAnalyses();

        updateAnalysisDescription();

        // Check if evidence_id was passed in URL query param
        const params = new URLSearchParams(window.location.search);
        const urlEvidenceId = params.get("evidence_id");
        if (urlEvidenceId && allEvidence.length > 0) {
            const ev = allEvidence.find(e => String(e.evidence_id) === String(urlEvidenceId));
            if (ev) {
                const caseDropdown = document.getElementById("analysisCase");
                if (caseDropdown) {
                    caseDropdown.value = ev.case_id;
                    populateEvidenceDropdown(ev.case_id);
                }
                const evDropdown = document.getElementById("analysisEvidence");
                if (evDropdown) {
                    evDropdown.value = ev.evidence_id;
                }
                const typeDropdown = document.getElementById("analysisType");
                if (typeDropdown) {
                    const t = (ev.evidence_type || "").toLowerCase();
                    if (t.includes("audio")) typeDropdown.value = "Audio Transcription";
                    else if (t.includes("doc") || t.includes("pdf")) typeDropdown.value = "OCR";
                    else typeDropdown.value = "Object Detection";
                    updateAnalysisDescription();
                }
            }
        }

    }
);