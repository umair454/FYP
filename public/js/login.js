const API_URL = "http://localhost:5000";

localStorage.clear();

document.getElementById("adminLoginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value;
    const chosenPortal = document.getElementById("portalType").value;
    const loginButton = document.getElementById("loginBtn");

    const originalText = loginButton.innerText;
    loginButton.innerText = "Authenticating Engine...";
    loginButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/admin-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: usernameInput, password: passwordInput, portal_type: chosenPortal })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // 🌐 FIXED AUTOMATIC TARGET SECTOR LANDING CONTROL ROUTER
            const portalDest = data.portal.trim().toLowerCase();

            if (portalDest === 'admin') {
                localStorage.setItem("adminUser", JSON.stringify(data.user));
                window.location.href = "/html/dashboard.html";
            } 
            else if (portalDest === 'resident') {
                localStorage.setItem("residentUser", JSON.stringify(data.user));
                window.location.href = "/html/resident-dashboard.html";
            } 
            else if (portalDest === 'accountant') {
                localStorage.setItem("staffUser", JSON.stringify(data.user));
                window.location.href = "/html/billing.html"; 
            } 
            // ✅ CRITICAL FIX: Guard landing path targeted exactly to the new specialized control console dashboard
            else if (portalDest === 'guard') {
                localStorage.setItem("adminUser", JSON.stringify(data.user)); 
                window.location.href = "/html/guard-dashboard.html";
            }
            else {
                // Dynamic assignment landing allocation rule for technical operators (Plumber / Electrician)
                localStorage.setItem("staffUser", JSON.stringify(data.user));
                window.location.href = "/html/staff-dashboard.html"; 
            }
        } else {
            alert(`❌ Error: ${data.message || "Invalid Login Credentials."}`);
            loginButton.innerText = originalText;
            loginButton.disabled = false;
        }
    } catch (error) {
        console.error("❌ Connection Exception:", error);
        alert("❌ Operational Connection Failure: Cannot reach Node server backend grid on port 5000.");
        loginButton.innerText = originalText;
        loginButton.disabled = false;
    }
});

function toggleRecoveryModal(showState) {
    const modal = document.getElementById("recoveryModal");
    if (modal) {
        modal.style.display = showState ? "flex" : "none";
        if(!showState) {
            document.getElementById("requestOTPForm").reset();
            document.getElementById("commitResetForm").reset();
            document.getElementById("commitResetForm").style.display = "none";
        }
    }
}

document.getElementById("requestOTPForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const sendBtn = document.getElementById("sendOtpBtn");
    const originalText = sendBtn.innerText;
    sendBtn.innerText = "Routing OTP Payload...";
    sendBtn.disabled = true;

    const payload = {
        username: document.getElementById("recoveryUser").value.trim(),
        portal_type: document.getElementById("recoveryPortal").value
    };

    try {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        let data = {};
        try { data = await res.json(); } catch(pErr) {}

        if (res.ok && data.success) {
            alert("🎉 Handshake success! Verification key routed to your registered WhatsApp and Email.");
            document.getElementById("commitResetForm").style.display = "flex";
        } else {
            alert(`❌ Security Rejection: ${data.message || "Account parameters not matching database records."}`);
        }
    } catch (err) {
        alert("❌ Interconnection pipeline timeout error.");
    } finally {
        sendBtn.innerText = originalText;
        sendBtn.disabled = false;
    }
});

document.getElementById("commitResetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const commitBtn = document.getElementById("commitBtn");
    const originalText = commitBtn.innerText;
    commitBtn.innerText = "Overhauling Core Keys...";
    commitBtn.disabled = true;

    const payload = {
        username: document.getElementById("recoveryUser").value.trim(),
        otp_token: document.getElementById("otpToken").value.trim(),
        new_password: document.getElementById("newPassword").value
    };

    try {
        const res = await fetch(`${API_URL}/api/auth/reset-password-commit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        let data = {};
        try { data = await res.json(); } catch(pErr) {}
        
        if (res.ok && data.success) {
            alert("🎉 Password overhaul successful! Kindly login with your fresh credentials.");
            toggleRecoveryModal(false);
        } else {
            alert(`❌ Modification Blocked: ${data.message || "Invalid or expired OTP token."}`);
        }
    } catch (err) {
        alert("❌ Processing link error: Schema update timeout.");
    } finally {
        commitBtn.innerText = originalText;
        commitBtn.disabled = false;
    }
});

window.toggleRecoveryModal = toggleRecoveryModal;