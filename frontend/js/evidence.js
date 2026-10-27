var API_URL = window.API_URL || ((window.location.protocol === "file:" || ["5500", "5501", "3000", "8000"].includes(window.location.port)) ? "http://127.0.0.1:5000" : window.location.origin);
window.API_URL = API_URL;

let allEvidence = [];
let allCases = [];

// =========================================================
// MODAL CONTROLS
// =========================================================

function openUploadModal() {
    const modal = document.getElementById("uploadModal");
    if (modal) {
        modal.style.display = "flex";
        const msg = document.getElementById("evidenceMessage");
        if (msg) {
            msg.style.display = "none";
            msg.textContent = "";
        }
    }
}

function closeUploadModal() {
    const modal = document.getElementById("uploadModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function closeDetailsModal() {
    const modal = document.getElementById("detailsModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Close modals on background click
window.addEventListener("click", function (event) {
    const uploadModal = document.getElementById("uploadModal");
    const detailsModal = document.getElementById("detailsModal");
    if (event.target === uploadModal) {
        uploadModal.style.display = "none";
    }
    if (event.target === detailsModal) {
        detailsModal.style.display = "none";
    }
});

// Format date helper
function formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return String(dateStr);
    }
}

// Escape HTML helper
function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =========================================================
// GET CASES
// =========================================================

async function loadCases() {
    const caseSelect = document.getElementById("evidenceCase");
    const caseFilter = document.getElementById("caseFilter");

    try {
        const response = await fetch(`${API_URL}/cases`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            console.error("Cases API Error:", data.message);
            return;
        }

        allCases = data.cases || [];

        if (caseSelect) {
            caseSelect.innerHTML = `<option value="">Select Case</option>`;
            allCases.forEach(function (c) {
                const opt = document.createElement("option");
                opt.value = c.case_id;
                opt.textContent = `${c.case_number} - ${c.case_title}`;
                caseSelect.appendChild(opt);
            });
        }

        if (caseFilter) {
            caseFilter.innerHTML = `<option value="">All Cases</option>`;
            allCases.forEach(function (c) {
                const opt = document.createElement("option");
                opt.value = c.case_id;
                opt.textContent = `${c.case_number} - ${c.case_title}`;
                caseFilter.appendChild(opt);
            });

            // If URL has ?case_id=X, auto-filter
            const params = new URLSearchParams(window.location.search);
            const urlCaseId = params.get("case_id");
            if (urlCaseId) {
                caseFilter.value = urlCaseId;
                if (caseSelect) caseSelect.value = urlCaseId;
            }
        }

    } catch (error) {
        console.error("Unable to load cases:", error);
    }
}

// =========================================================
// UPDATE STATS
// =========================================================

function updateEvidenceStats(list) {
    const totalEl = document.getElementById("totalEvidence");
    const imageEl = document.getElementById("imageEvidence");
    const videoEl = document.getElementById("videoEvidence");
    const docEl = document.getElementById("documentEvidence");

    if (totalEl) totalEl.textContent = list.length;

    let images = 0, videos = 0, docs = 0;
    list.forEach(function (e) {
        const type = (e.evidence_type || "").toLowerCase();
        if (type.includes("image")) images++;
        else if (type.includes("video")) videos++;
        else if (type.includes("document") || type.includes("pdf") || type.includes("doc")) docs++;
    });

    if (imageEl) imageEl.textContent = images;
    if (videoEl) videoEl.textContent = videos;
    if (docEl) docEl.textContent = docs;
}

// =========================================================
// RENDER EVIDENCE TABLE
// =========================================================

function renderEvidenceTable(list) {
    const tableBody = document.getElementById("evidenceTableBody");
    if (!tableBody) return;

    if (list.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message" style="text-align: center; padding: 25px; color: #6b7280;">
                    No evidence records found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = list.map(function (ev) {
        const cleanFileName = (ev.file_name || "").replace(/^uploads[\/\\]/, "");
        const statusClass = (ev.status || "").toLowerCase().includes("valid") ? "status-valid" : "";

        return `
            <tr>
                <td><strong>${escapeHtml(ev.evidence_number || "-")}</strong></td>
                <td>${escapeHtml(ev.case_number ? `${ev.case_number} (${ev.case_title || ""})` : "-")}</td>
                <td><span class="type-badge">${escapeHtml(ev.evidence_type || "-")}</span></td>
                <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(cleanFileName)}">
                    ${escapeHtml(cleanFileName)}
                </td>
                <td>${escapeHtml(ev.uploader_name || ev.uploaded_by_name || "-")}</td>
                <td>${formatDate(ev.uploaded_at)}</td>
                <td><span class="status-badge ${statusClass}">${escapeHtml(ev.status || "Active")}</span></td>
                <td>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button type="button" class="action-btn view-btn" style="padding: 5px 10px; font-size: 12px; cursor: pointer;" onclick="viewEvidence(${ev.evidence_id})">
                            Details
                        </button>
                        <button type="button" class="action-btn verify-btn" style="padding: 5px 10px; font-size: 12px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='evidence-integrity.html?evidence_id=${ev.evidence_id}'">
                            Verify
                        </button>
                        <button type="button" class="action-btn ai-btn" style="padding: 5px 10px; font-size: 12px; background: #7c3aed; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='ai-analysis.html?evidence_id=${ev.evidence_id}'">
                            AI
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// =========================================================
// SEARCH AND FILTER
// =========================================================

function searchEvidence() {
    filterEvidence();
}

function filterEvidence() {
    const searchInput = document.getElementById("searchEvidence");
    const caseFilter = document.getElementById("caseFilter");
    const typeFilter = document.getElementById("typeFilter");

    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedCase = caseFilter ? caseFilter.value : "";
    const selectedType = typeFilter ? typeFilter.value.toLowerCase() : "";

    const filtered = allEvidence.filter(function (item) {
        // Keyword match
        const matchesKeyword = !keyword ||
            (item.evidence_number && item.evidence_number.toLowerCase().includes(keyword)) ||
            (item.file_name && item.file_name.toLowerCase().includes(keyword)) ||
            (item.description && item.description.toLowerCase().includes(keyword)) ||
            (item.case_number && item.case_number.toLowerCase().includes(keyword)) ||
            (item.case_title && item.case_title.toLowerCase().includes(keyword)) ||
            (item.uploader_name && item.uploader_name.toLowerCase().includes(keyword));

        // Case match
        const matchesCase = !selectedCase || String(item.case_id) === String(selectedCase);

        // Type match
        const matchesType = !selectedType || (item.evidence_type && item.evidence_type.toLowerCase() === selectedType);

        return matchesKeyword && matchesCase && matchesType;
    });

    renderEvidenceTable(filtered);
}

// =========================================================
// LOAD EVIDENCE
// =========================================================

async function loadEvidence() {
    const tableBody = document.getElementById("evidenceTableBody");
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #6b7280;">
                    Loading evidence...
                </td>
            </tr>
        `;
    }

    try {
        const response = await fetch(`${API_URL}/evidence`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: red;">${data.message || "Unable to load evidence."}</td></tr>`;
            }
            return;
        }

        allEvidence = data.evidence || [];
        updateEvidenceStats(allEvidence);
        filterEvidence();

    } catch (error) {
        console.error("Evidence loading error:", error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: red;">Backend connection failed. Make sure Flask is running.</td></tr>`;
        }
    }
}

// =========================================================
// UPLOAD EVIDENCE
// =========================================================

async function uploadEvidence(event) {
    event.preventDefault();

    const caseSelect = document.getElementById("evidenceCase");
    const evidenceNumber = document.getElementById("evidenceNumber");
    const evidenceType = document.getElementById("evidenceType");
    const description = document.getElementById("evidenceDescription");
    const evidenceFile = document.getElementById("evidenceFile");
    const message = document.getElementById("evidenceMessage");

    if (message) {
        message.style.display = "block";
        message.style.background = "#eff6ff";
        message.style.color = "#1d4ed8";
        message.textContent = "Validating and uploading evidence...";
    }

    if (!caseSelect || !caseSelect.value) {
        if (message) {
            message.style.background = "#fee2e2";
            message.style.color = "#991b1b";
            message.textContent = "Please select a case.";
        }
        return;
    }

    if (!evidenceNumber || !evidenceNumber.value.trim()) {
        if (message) {
            message.style.background = "#fee2e2";
            message.style.color = "#991b1b";
            message.textContent = "Please enter an evidence number.";
        }
        return;
    }

    if (!evidenceType || !evidenceType.value) {
        if (message) {
            message.style.background = "#fee2e2";
            message.style.color = "#991b1b";
            message.textContent = "Please select evidence type.";
        }
        return;
    }

    if (!evidenceFile || !evidenceFile.files.length) {
        if (message) {
            message.style.background = "#fee2e2";
            message.style.color = "#991b1b";
            message.textContent = "Please select an evidence file to upload.";
        }
        return;
    }

    const formData = new FormData();
    formData.append("case_id", caseSelect.value);
    formData.append("evidence_number", evidenceNumber.value.trim());
    formData.append("evidence_type", evidenceType.value);
    formData.append("description", description ? description.value.trim() : "");
    formData.append("file", evidenceFile.files[0]);

    try {
        const response = await fetch(`${API_URL}/evidence/upload`, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            if (message) {
                message.style.background = "#dcfce7";
                message.style.color = "#15803d";
                message.textContent = `Evidence uploaded successfully! SHA-256: ${data.file_hash ? data.file_hash.substring(0, 16) + '...' : 'Generated'}`;
            }

            const form = document.getElementById("evidenceForm");
            if (form) form.reset();

            await loadEvidence();

            setTimeout(function () {
                closeUploadModal();
                if (message) message.style.display = "none";
            }, 1800);

        } else {
            if (message) {
                message.style.background = "#fee2e2";
                message.style.color = "#991b1b";
                message.textContent = data.message || "Evidence upload failed.";
            }
        }

    } catch (error) {
        console.error("Evidence upload error:", error);
        if (message) {
            message.style.background = "#fee2e2";
            message.style.color = "#991b1b";
            message.textContent = "Unable to connect to EvidenceAI backend.";
        }
    }
}

// =========================================================
// VIEW EVIDENCE DETAILS
// =========================================================

function viewEvidence(evidenceId) {
    const item = allEvidence.find(e => Number(e.evidence_id) === Number(evidenceId));
    if (!item) {
        alert("Evidence record not found.");
        return;
    }

    const modal = document.getElementById("detailsModal");
    if (!modal) return;

    const elNum = document.getElementById("detailEvidenceNumber");
    if (elNum) elNum.textContent = item.evidence_number || "-";

    const elCase = document.getElementById("detailCase");
    if (elCase) elCase.textContent = item.case_number ? `${item.case_number} - ${item.case_title || ""}` : "-";

    const elType = document.getElementById("detailType");
    if (elType) elType.textContent = item.evidence_type || "-";

    const elFileName = document.getElementById("detailFileName");
    if (elFileName) elFileName.textContent = item.file_name || "-";

    const elUploader = document.getElementById("detailUploadedBy");
    if (elUploader) elUploader.textContent = item.uploader_name || item.uploaded_by_name || "-";

    const elUploadedAt = document.getElementById("detailUploadedAt");
    if (elUploadedAt) elUploadedAt.textContent = formatDate(item.uploaded_at);

    const elStatus = document.getElementById("detailStatus");
    if (elStatus) elStatus.textContent = item.status || "Active";

    const elHash = document.getElementById("detailFileHash");
    if (elHash) elHash.textContent = item.file_hash || "Hash not generated";

    const elDesc = document.getElementById("detailDescription");
    if (elDesc) elDesc.textContent = item.description || "No description available.";

    // Wire action buttons
    const btnVerify = document.getElementById("btnVerifyIntegrity");
    if (btnVerify) {
        btnVerify.onclick = function () {
            window.location.href = `evidence-integrity.html?evidence_id=${item.evidence_id}`;
        };
    }

    const btnAi = document.getElementById("btnAiAnalyze");
    if (btnAi) {
        btnAi.onclick = function () {
            window.location.href = `ai-analysis.html?evidence_id=${item.evidence_id}`;
        };
    }

    const btnFile = document.getElementById("btnOpenFile");
    if (btnFile) {
        btnFile.onclick = function () {
            const rawName = item.file_name || "";
            const cleanName = rawName.replace(/^uploads[\/\\]/, "").replace(/\\/g, "/");
            window.open(`${API_URL}/evidence/file/${encodeURIComponent(cleanName)}`, "_blank");
        };
    }

    modal.style.display = "flex";
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

    window.location.href = "login.html";
}

// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    loadCases();
    loadEvidence();

    const form = document.getElementById("evidenceForm");
    if (form) {
        form.addEventListener("submit", uploadEvidence);
    }
});