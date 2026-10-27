// ===============================
// EvidenceAI Dashboard JavaScript
// ===============================

var API_URL = window.API_URL || ((window.location.protocol === "file:" || ["5500", "5501", "3000", "8000"].includes(window.location.port)) ? "http://127.0.0.1:5000" : window.location.origin);
window.API_URL = API_URL;

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", function () {
        sidebar.classList.toggle("show");
    });
}

// Close sidebar when a navigation item is clicked
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach(function (item) {
    item.addEventListener("click", function () {
        navItems.forEach(function (nav) {
            nav.classList.remove("active");
        });
        this.classList.add("active");

        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove("show");
        }
    });
});

// Format date helper
function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return String(dateStr);
    }
}

// Safe string helper
function escapeHtml(text) {
    if (!text && text !== 0) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// Load Dashboard Statistics
// ==========================================
async function loadDashboardStats() {
    // Set current date
    const dateBox = document.getElementById("currentDateBox");
    if (dateBox) {
        const now = new Date();
        dateBox.textContent = "📅 " + now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }

    try {
        const response = await fetch(API_URL + "/dashboard-stats", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            console.warn("Dashboard stats request returned status:", response.status);
            return;
        }

        const data = await response.json();
        if (!data.success || !data.stats) {
            console.log("Unable to load dashboard statistics.");
            return;
        }

        const stats = data.stats;

        // 1. Counter cards
        const totalCases = document.getElementById("totalCases");
        if (totalCases) totalCases.textContent = stats.total_cases ?? 0;

        const totalEvidence = document.getElementById("totalEvidence");
        if (totalEvidence) totalEvidence.textContent = stats.total_evidence ?? 0;

        const totalAnalyses = document.getElementById("totalAnalyses");
        if (totalAnalyses) totalAnalyses.textContent = stats.total_analyses ?? 0;

        const totalReports = document.getElementById("totalReports");
        if (totalReports) totalReports.textContent = stats.total_reports ?? 0;

        // 2. Case Overview Breakdown
        const openCases = stats.open_cases ?? 0;
        const underInvestigation = stats.under_investigation ?? 0;
        const closedCases = stats.closed_cases ?? 0;
        const totalCount = stats.total_cases ?? 0;
        const otherCases = Math.max(0, totalCount - (openCases + underInvestigation + closedCases));

        const elTotal = document.getElementById("overviewTotalCases");
        if (elTotal) elTotal.textContent = totalCount;

        const elOpen = document.getElementById("overviewOpenCases");
        if (elOpen) elOpen.textContent = openCases;

        const elInvestigating = document.getElementById("overviewInvestigatingCases");
        if (elInvestigating) elInvestigating.textContent = underInvestigation;

        const elClosed = document.getElementById("overviewClosedCases");
        if (elClosed) elClosed.textContent = closedCases;

        const elOther = document.getElementById("overviewOtherCases");
        if (elOther) elOther.textContent = otherCases;

        // 3. Recent Cases
        const recentCasesBody = document.getElementById("recentCasesBody");
        if (recentCasesBody && Array.isArray(stats.recent_cases)) {
            if (stats.recent_cases.length === 0) {
                recentCasesBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #6b7280; padding: 15px;">No cases found.</td></tr>`;
            } else {
                recentCasesBody.innerHTML = stats.recent_cases.map(function (c) {
                    let statusClass = "open";
                    const st = (c.status || "").toLowerCase();
                    if (st.includes("investigat")) statusClass = "investigation";
                    else if (st.includes("close")) statusClass = "closed";

                    return `
                        <tr style="cursor: pointer;" onclick="window.location.href='cases.html'">
                            <td><strong>${escapeHtml(c.case_number)}</strong></td>
                            <td>${escapeHtml(c.title)}</td>
                            <td>${escapeHtml(c.crime_type)}</td>
                            <td><span class="status ${statusClass}">${escapeHtml(c.status)}</span></td>
                            <td>${formatDate(c.incident_date || c.created_at)}</td>
                        </tr>
                    `;
                }).join("");
            }
        }

        // 4. Recent Evidence
        const recentEvidenceList = document.getElementById("recentEvidenceList");
        if (recentEvidenceList && Array.isArray(stats.recent_evidence)) {
            if (stats.recent_evidence.length === 0) {
                recentEvidenceList.innerHTML = `<div style="text-align: center; color: #6b7280; padding: 15px;">No evidence uploaded yet.</div>`;
            } else {
                recentEvidenceList.innerHTML = stats.recent_evidence.map(function (e) {
                    let icon = "📄";
                    let typeClass = "pdf-text";
                    let typeLabel = e.evidence_type || "Document";
                    const t = typeLabel.toLowerCase();

                    if (t.includes("image")) {
                        icon = "🖼️";
                        typeClass = "image-text";
                    } else if (t.includes("video")) {
                        icon = "▶";
                        typeClass = "video-text";
                    } else if (t.includes("audio")) {
                        icon = "🔊";
                        typeClass = "audio-text";
                    }

                    return `
                        <div class="evidence-item" style="cursor: pointer;" onclick="window.location.href='evidence.html'">
                            <div class="evidence-icon">${icon}</div>
                            <div style="flex: 1; min-width: 0;">
                                <strong style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(e.file_name || e.evidence_number)}</strong>
                                <p style="margin: 3px 0 0; color: #6b7280; font-size: 12px;">${escapeHtml(e.evidence_number)} • ${formatDate(e.uploaded_at)}</p>
                            </div>
                            <span class="file-type ${typeClass}">${escapeHtml(typeLabel)}</span>
                        </div>
                    `;
                }).join("");
            }
        }

        // 5. Recent Activity
        const recentActivityList = document.getElementById("recentActivityList");
        if (recentActivityList && Array.isArray(stats.recent_activity)) {
            if (stats.recent_activity.length === 0) {
                recentActivityList.innerHTML = `<div style="text-align: center; color: #6b7280; padding: 15px;">No recent activity logs.</div>`;
            } else {
                recentActivityList.innerHTML = stats.recent_activity.map(function (act) {
                    let icon = "📌";
                    const mod = (act.module_name || "").toLowerCase();
                    const actType = (act.action_type || "").toLowerCase();

                    if (mod.includes("evidence") || actType.includes("evidence")) icon = "⬆️";
                    else if (mod.includes("ai") || actType.includes("ai")) icon = "🤖";
                    else if (mod.includes("report")) icon = "📑";
                    else if (mod.includes("case")) icon = "📁";

                    return `
                        <div class="activity-item" style="cursor: pointer;" onclick="window.location.href='activity-logs.html'">
                            <div class="activity-icon">${icon}</div>
                            <div>
                                <strong>${escapeHtml(act.action_type || act.module_name)}</strong>
                                <p style="margin: 2px 0 0; color: #6b7280; font-size: 13px;">${escapeHtml(act.description || "")}</p>
                                <small style="color: #9ca3af;">By ${escapeHtml(act.full_name || "User")} • ${formatDate(act.created_at)}</small>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }

        // 6. AI Summary Breakdown
        if (stats.ai_summary) {
            const elObj = document.getElementById("aiObjectsCount");
            if (elObj) elObj.textContent = stats.ai_summary.object_detection ?? 0;

            const elOcr = document.getElementById("aiOcrCount");
            if (elOcr) elOcr.textContent = stats.ai_summary.ocr ?? 0;

            const elTrans = document.getElementById("aiTranscriptionsCount");
            if (elTrans) elTrans.textContent = stats.ai_summary.audio_transcription ?? 0;

            const elFace = document.getElementById("aiFacesCount");
            if (elFace) elFace.textContent = stats.ai_summary.face_detection ?? 0;
        }

    } catch (error) {
        console.error("Dashboard API Error:", error);
    }
}

// Load statistics when page loads
document.addEventListener("DOMContentLoaded", function () {
    loadDashboardStats();
});