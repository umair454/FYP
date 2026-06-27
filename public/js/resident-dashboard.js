const API_URL = "http://localhost:5000";

// Ensure session state contains verified resident payload
const activeResident = JSON.parse(localStorage.getItem("residentUser"));
if (!activeResident) {
    window.location.href = "/html/login.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "/html/login.html";
}

// Global runtime memory pointers for tracking 60-seconds loop states
let qrCodeEngineInstance = null;
let qrRefreshCycleTimerLoop = null;
let uiCountdownClockCounter = 60;
let uiSecondsTickerClock = null;

// 🧭 Dynamic Multi-Tab Viewport Controller Switcher
function switchResidentPortalTab(targetTabId) {
    // 1. Hide all panel content views cleanly
    document.querySelectorAll(".panel-content-view").forEach(panel => {
        panel.style.display = "none";
        panel.classList.remove("active");
    });
    
    // 2. Remove active highlighting classes from all tab buttons
    document.querySelectorAll(".res-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    // Remap structural layout wrapper container ID strings safely
    let resolvedPanelDivId = targetTabId === 'digital-qr-tab' ? 'digital-qr-pass-tab' : targetTabId;
    
    const activePanel = document.getElementById(resolvedPanelDivId);
    if (activePanel) {
        activePanel.style.display = "block";
        activePanel.classList.add("active");
    }

    // Toggle button activation rules
    const btnOverview = document.getElementById('btn-overview-tab');
    const btnDigitalQr = document.getElementById('btn-digital-qr-tab');

    if (targetTabId === 'digital-qr-tab') {
        if (btnDigitalQr) btnDigitalQr.classList.add("active");
        startDynamicTokenRefreshPipeline();
    } else {
        if (btnOverview) btnOverview.classList.add("active");
        clearDynamicTokenRefreshPipeline();
    }
}

// 🧠 AUTOMATED 60-SEC REFRESH HARDWARE PROTOCOL ENGINE MODULE
function startDynamicTokenRefreshPipeline() {
    clearDynamicTokenRefreshPipeline(); // Safeguard cleanup trace resets
    
    // Initial instant compilation trace run
    generateTimedriftEncryptedTokenPayload();

    uiCountdownClockCounter = 60;
    const countdownDisplay = document.getElementById("tokenSecondsTimerText");
    if (countdownDisplay) countdownDisplay.innerText = uiCountdownClockCounter;

    // Interval Node A: Recompile seed hash strings exactly every 60000ms loop
    qrRefreshCycleTimerLoop = setInterval(() => {
        generateTimedriftEncryptedTokenPayload();
        uiCountdownClockCounter = 60;
    }, 60000);

    // Interval Node B: Handle fast 1-second interval UI clock ticking decrements
    uiSecondsTickerClock = setInterval(() => {
        uiCountdownClockCounter--;
        if (countdownDisplay) {
            countdownDisplay.innerText = uiCountdownClockCounter;
        }
    }, 1000);
}

function generateTimedriftEncryptedTokenPayload() {
    const canvasBox = document.getElementById("qrCanvasFrame");
    if (!canvasBox) return;

    // Flush out historical nodes layout wrapper canvas structures
    canvasBox.innerHTML = "";

    // Generate strict crypto matching handshake string pattern: "unique_resident_seed|timestamp"
    const residentIdentifierSeed = activeResident.email || activeResident.phone_no;
    const dynamicHandshakeEnvelopeToken = `${residentIdentifierSeed}|${Date.now()}`;

    try {
        // Instantiate dynamic engine over target render element frame bounds
        qrCodeEngineInstance = new QRCode(canvasBox, {
            text: dynamicHandshakeEnvelopeToken,
            width: 210,
            height: 210,
            colorDark : "#0f172a",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    } catch (qrEx) {
        console.error("❌ QRCode Generation Library Exception:", qrEx);
    }

    const houseTextTag = document.getElementById("residentQrHouseRefText");
    if (houseTextTag) houseTextTag.innerText = `HOUSE NODE ID: ${activeResident.house_no}`;
}

function clearDynamicTokenRefreshPipeline() {
    if (qrRefreshCycleTimerLoop) clearInterval(qrRefreshCycleTimerLoop);
    if (uiSecondsTickerClock) clearInterval(uiSecondsTickerClock);
    qrRefreshCycleTimerLoop = null;
    uiSecondsTickerClock = null;
}

// 📋 Sync Profile UI Text Nodes & Live Data Counters
async function syncResidentConsoleMetrics() {
    try {
        const welcomeMsg = document.getElementById("welcome-message");
        const metaInfo = document.getElementById("resident-meta-info");
        
        if (welcomeMsg) welcomeMsg.innerText = `Welcome, ${activeResident.name}`;
        if (metaInfo) metaInfo.innerHTML = `<i class="fa-solid fa-location-dot" style="color:#10b981;"></i> House Node Location: <b>${activeResident.house_no}</b> | Registered Email: ${activeResident.email}`;

        const response = await fetch(`${API_URL}/api/resident/dashboard/${activeResident.id}`);
        const data = await response.json();

        if (response.ok) {
            const pendingBill = document.getElementById("resident-pending-bill");
            const alertCount = document.getElementById("resident-alert-count");
            
            if (pendingBill) pendingBill.innerText = `Rs. ${Number(data.pendingDues || 0).toLocaleString()}`;
            if (alertCount) alertCount.innerText = data.dashboardAlerts ? data.dashboardAlerts.length : 0;

            const streamContainer = document.getElementById("residentVisitorStream");
            if (streamContainer) {
                streamContainer.innerHTML = "";

                if (!data.visitorHistory || data.visitorHistory.length === 0) {
                    streamContainer.innerHTML = `<p style="color:#64748b; text-align:center; padding-top:40px;">No gate visitor logs recorded for your house vector.</p>`;
                    return;
                }

                data.visitorHistory.forEach(vis => {
                    const entryDate = new Date(vis.entry_time).toLocaleString();
                    streamContainer.innerHTML += `
                        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; margin-bottom: 8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <span style="color:#f8fafc; font-weight:600;">${vis.visitor_name}</span>
                                <span style="font-size:0.75rem; color:#64748b;"><i class="fa-solid fa-clock"></i> ${entryDate}</span>
                            </div>
                            <p style="font-size:0.8rem; color:#94a3b8; margin:0;"><b>Purpose:</b> ${vis.purpose} | <b>Phone:</b> ${vis.phone_no}</p>
                        </div>`;
                });
            }
        }
    } catch (err) {
        console.error("❌ Resident workspace metrics telemetry transmission exception:", err);
    }
}

// 🛡️ Submit Maintenance Fault Logs Pipeline Form Trigger
const complaintForm = document.getElementById("residentComplaintForm");
if (complaintForm) {
    complaintForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById("complaintSubmitBtn");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Submitting to Admin...";
        submitBtn.disabled = true;

        const payload = {
            resident_id: activeResident.id,
            house_no: activeResident.house_no,
            title: document.getElementById("complaintTitle").value.trim(),
            description: document.getElementById("complaintDesc").value.trim()
        };

        try {
            const response = await fetch(`${API_URL}/api/resident/submit-complaint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert("🎉 Complaint logged! It has been securely dispatched to the central administration table workspace.");
                document.getElementById("residentComplaintForm").reset();
                syncResidentConsoleMetrics();
            } else {
                alert(`❌ Server Rejection: ${result.error || "Failed to push complaint payload parameters."}`);
            }
        } catch (err) {
            alert("❌ Processing link error: Connection timeout mapping endpoint.");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Bootstrap Engine Onload Hooks
window.addEventListener('DOMContentLoaded', () => {
    syncResidentConsoleMetrics();
    
    // ✅ NEW EVENT DRIVEN BINDING: HTML onclick hta kar direct event listeners bind kiye
    const btnOverview = document.getElementById('btn-overview-tab');
    const btnDigitalQr = document.getElementById('btn-digital-qr-tab');

    if (btnOverview) {
        btnOverview.addEventListener('click', () => switchResidentPortalTab('overview-tab'));
    }
    if (btnDigitalQr) {
        btnDigitalQr.addEventListener('click', () => switchResidentPortalTab('digital-qr-tab'));
    }

    window.switchResidentPortalTab = switchResidentPortalTab;
    
    // Refresh log lines array every 20 seconds for dynamic entry tracking
    setInterval(syncResidentConsoleMetrics, 20000);
});