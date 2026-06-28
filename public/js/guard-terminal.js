const API_URL = window.location.origin;

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

let html5QrScannerInstance = null;

// 🧭 Tab Switcher Engine Module + Camera Instance Shuter Control
function switchGuardPanelTab(targetTabId) {
    document.querySelectorAll(".panel-content-view").forEach(panel => {
        panel.style.display = "none";
        panel.classList.remove("active");
    });
    document.querySelectorAll(".guard-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    const activePanel = document.getElementById(targetTabId);
    if (activePanel) {
        activePanel.style.display = "block";
        activePanel.classList.add("active");
    }
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    // Camera routing control states
    if (targetTabId === "qr-scanner-tab") {
        initializeLiveGateCameraScanner();
    } else {
        stopLiveGateCameraScanner();
    }

    if (targetTabId === "rfid-card-tab") {
        keepFocusOnRfidHardwareInput();
    }
}

// 🎴 CORE 1: RFID CARD AUTOPILOT SUBMITTER
function keepFocusOnRfidHardwareInput() {
    const rfidInput = document.getElementById("rfidHardwareInput");
    const radarBox = document.getElementById("rfidRadarBox");
    
    if (rfidInput) {
        rfidInput.focus();
        if(radarBox) radarBox.style.borderColor = "#3b82f6";
        
        // Anti-blur force lock script
        rfidInput.onblur = () => {
            if(document.getElementById("rfid-card-tab").classList.contains("active")) {
                setTimeout(() => rfidInput.focus(), 100);
            }
        };
    }
}

async function processAutomatedHardwareCardTap(uidValue) {
    const statusText = document.getElementById("rfidStatusText");
    
    if(!uidValue) return;
    if(statusText) statusText.innerText = "PROCESSING VERIFICATION SECURITY CARD...";

    try {
        const response = await fetch(`${API_URL}/api/rfid/log-tap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rfid_uid: uidValue })
        });

        const result = await response.json();
        if(response.ok && result.success) {
            alert(`🎉 HARDWARE VALIDATION SUCCESS!\n\nResident Account: "${result.resident_name}"\nProperty Node: House ${result.house_no}\nDirection Vector Mapped: [${result.direction}]\n\nACCESS GRANTED. GATE PARAMETERS OPENED.`);
        } else {
            alert(`❌ SECURITY REJECTION: ${result.error || "Card database array footprint mismatch."}`);
        }
    } catch (err) {
        alert("❌ Error connecting to central card telemetry grid nodes.");
    } finally {
        if(statusText) statusText.innerText = "READY TO CAPTURE CARD TAP";
        document.getElementById("rfidHardwareInput").value = "";
        keepFocusOnRfidHardwareInput();
    }
}

// 📱 CORE 2: CAMERA VIEWPORT LIVE QR CODE SCANNER INSTANCE
function initializeLiveGateCameraScanner() {
    const logStateText = document.getElementById("qrScanStateLogText");
    if(logStateText) logStateText.innerText = "";

    if (html5QrScannerInstance === null) {
        html5QrScannerInstance = new Html5QrcodeScanner("qrCameraViewport", { 
            fps: 10, 
            qrbox: { width: 260, height: 260 },
            rememberLastUsedCamera: true
        });
        html5QrScannerInstance.render(onQrCodeScanSuccess, onQrCodeScanFailure);
    }
}

async function onQrCodeScanSuccess(decodedText, decodedResult) {
    const logStateText = document.getElementById("qrScanStateLogText");
    
    if(logStateText) logStateText.innerText = "🚨 BARCODE CAPTURED! EXECUTING IDENTITY CHECK...";
    
    // Shut camera instance to avoid async alert modal loop locks
    stopLiveGateCameraScanner();

    try {
        const response = await fetch(`${API_URL}/api/qr/verify-tap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qr_token: decodedText.trim() })
        });

        const result = await response.json();
        if(response.ok && result.success) {
            alert(`🎉 QR TOKEN CODE VERIFIED!\n\nResident Identity: "${result.resident_name}"\nHouse Ref Node: ${result.house_no}\nDirection Flow Mapped: [${result.direction}]\n\nACCESS GRANTED. GATE PARAMETERS OPENED.`);
        } else {
            alert(`❌ QR VALIDATION FALLBACK: ${result.error || "Token expired or unauthorized context."}`);
        }
    } catch (err) {
        alert("❌ Loss of real-time validation pipe handshake streams.");
    } finally {
        // Automatically restart camera scanner viewport loops engine
        initializeLiveGateCameraScanner();
    }
}

function onQrCodeScanFailure(error) {
    // Non blocking trace background hooks streams
}

function stopLiveGateCameraScanner() {
    if (html5QrScannerInstance) {
        html5QrScannerInstance.clear().then(() => {
            html5QrScannerInstance = null;
        }).catch(err => console.error(err));
    }
}

// 📝 CORE 3: MANUAL VISITOR HANDLER DISPATCH
async function handleManualVisitorSubmit(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById("visSubmitBtn");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Dispatching Secure Notifications channels...`;
    btn.disabled = true;

    const payload = {
        visitor_name: document.getElementById("visName").value.trim(),
        phone_no: document.getElementById("visPhone").value.trim(),
        house_no: document.getElementById("visHouseTarget").value.trim(),
        purpose: document.getElementById("visPurpose").value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/add-visitor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if(response.ok) {
            alert("🎉 Log appended cleanly! Real-time notifications dispatched to target property resident via WhatsApp & Email channels.");
            document.getElementById("manualVisitorDispatchForm").reset();
        } else {
            alert("❌ Operational error compilation loop logs vector.");
        }
    } catch (err) {
        alert("❌ Loss of connection to security central loops server.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Bootloader Hooks Hooks Setup
window.addEventListener('DOMContentLoaded', () => {
    keepFocusOnRfidHardwareInput();

    // Desktop RFID Card hardware auto submission listener rules matching Enter keys string
    const rfidInput = document.getElementById("rfidHardwareInput");
    if(rfidInput) {
        rfidInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                processAutomatedHardwareCardTap(rfidInput.value.trim());
            }
        });
    }

    const visitorForm = document.getElementById("manualVisitorDispatchForm");
    if (visitorForm) {
        visitorForm.addEventListener("submit", handleManualVisitorSubmit);
    }
    
    window.switchGuardPanelTab = switchGuardPanelTab;
});