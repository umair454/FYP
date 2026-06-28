const API_URL = window.location.origin;

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

// ========================================================
// 🔐 PART 1: CORE SUB-ADMIN ACCOUNT ROLES SUBMISSIONS LOGIC
// ========================================================
async function fetchAdminControlRoles() {
    try {
        const response = await fetch(`${API_URL}/api/admin/roles`);
        const data = await response.json();
        const tbody = document.querySelector("#adminRolesTable tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#64748b; padding:15px;">No custom administration roles deployed.</td></tr>`;
            return;
        }

        data.forEach(role => {
            const rowDate = new Date(role.created_at).toLocaleString();
            tbody.innerHTML += `
                <tr>
                    <td><b>${role.username}</b></td>
                    <td><span style="background:rgba(59,130,246,0.1); color:#3b82f6; padding:3px 8px; border-radius:4px; font-size:0.8rem; font-weight:600;">${role.role}</span></td>
                    <td style="color:#64748b; font-size:0.85rem;"><i class="fa-solid fa-clock"></i> ${rowDate}</td>
                </tr>`;
        });
    } catch (err) {
        console.error(err);
    }
}

// Form 1 Hook Interceptor Trigger: Access Node Request Registration (OTP Dispatch)
const roleForm = document.getElementById("roleCreationForm");
if (roleForm) {
    roleForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("roleSubmitBtn");
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Dispatched Handshake...`;
        btn.disabled = true;

        const payload = {
            username: document.getElementById("roleUsername").value.trim(),
            password: document.getElementById("rolePassword").value.trim(),
            role: document.getElementById("roleSelection").value,
            phone_no: document.getElementById("rolePhone").value.trim(),
            email: document.getElementById("roleEmail").value.trim()
        };

        try {
            const response = await fetch(`${API_URL}/api/admin/roles/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("🎉 Handshake complete! 6-Digit authorization signature keys dispatched over WhatsApp & Email.");
                document.getElementById("verifyRoleOTPForm").style.display = "flex";
            } else {
                const errRes = await response.json();
                alert(`❌ Registration Mismatch: ${errRes.error || "Username allocated."}`);
            }
        } catch (err) {
            alert("❌ Connection loss parsing tracking router.");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// Form 2 Hook Interceptor Trigger: Commit Password Overhaul / Access Generation Node
const verifyOTPForm = document.getElementById("verifyRoleOTPForm");
if (verifyOTPForm) {
    verifyOTPForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("confirmCreationBtn");
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying Matrix Token...`;
        btn.disabled = true;

        const payload = {
            username: document.getElementById("roleUsername").value.trim(),
            otp_token: document.getElementById("creationOTPToken").value.trim()
        };

        try {
            const response = await fetch(`${API_URL}/api/admin/roles/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("🎉 Identity deployed successfully! Security node privilege keys appended inside infrastructure registries.");
                document.getElementById("roleCreationForm").reset();
                document.getElementById("verifyRoleOTPForm").reset();
                document.getElementById("verifyRoleOTPForm").style.display = "none";
                fetchAdminControlRoles();
            } else {
                alert("❌ Handshake token validation mismatch rejection: Incorrect OTP signature key.");
            }
        } catch (err) {
            alert("❌ Network handshake timeout tracking endpoint.");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// ========================================================
// 🎴 PART 2: DYNAMIC PERIMETER RFID CONTROL LAYERS MATRIX
// ========================================================
async function loadResidentsMenuToRfidDropdown() {
    try {
        const response = await fetch(`${API_URL}/residents`);
        const residents = await response.json();
        const selectMenu = document.getElementById("rfidResidentSelectId");
        
        if (!selectMenu) return;
        selectMenu.innerHTML = `<option value="" disabled selected>Choose Resident Profile Vector...</option>`;
        
        residents.forEach(res => {
            selectMenu.innerHTML += `<option value="${res.id}">${res.name} (House: ${res.house_no})</option>`;
        });
    } catch (err) {
        console.error("❌ Exception setting lookup streams dropdown menu:", err);
    }
}

async function refreshRfidHardwareInventoryGrid() {
    try {
        const response = await fetch(`${API_URL}/api/admin/rfid-cards`);
        const tokens = await response.json();
        const tbody = document.querySelector("#adminRfidInventoryTable tbody");
        
        if (!tbody) return;
        tbody.innerHTML = "";

        if (tokens.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding:30px; font-size:0.85rem;">No physical RFID access cards deployed to perimeter gate nodes yet.</td></tr>`;
            return;
        }

        tokens.forEach(card => {
            const stateColor = card.status === 'Active' ? '#10b981' : '#f59e0b';
            const actionText = card.status === 'Active' ? 'Suspend' : 'Activate';
            const actionTargetState = card.status === 'Active' ? 'Suspended' : 'Active';

            tbody.innerHTML += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.03); font-size:0.85rem; color:#cbd5e1;">
                    <td style="padding:14px 8px;"><code style="background:rgba(255,255,255,0.03); padding:4px 8px; border-radius:4px; color:#3b82f6; font-weight:600; font-family:monospace;">${card.rfid_uid}</code></td>
                    <td style="padding:14px 8px;"><b>${card.resident_name}</b><br><span style="font-size:0.75rem; color:#64748b;">House Address Vector: ${card.house_no}</span></td>
                    <td style="padding:14px 8px;"><span style="color:${stateColor}; font-weight:700;"><i class="fa-solid fa-circle" style="font-size:0.5rem; margin-right:4px;"></i> ${card.status}</span></td>
                    <td style="padding:14px 8px; text-align:right; display:flex; justify-content:flex-end; gap:8px;">
                        <button onclick="triggerRfidCardStateModification(${card.id}, '${actionTargetState}')" style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); color:#f59e0b; padding:5px 10px; border-radius:4px; font-weight:600; cursor:pointer; transition:0.2s; font-size:0.75rem;">${actionText}</button>
                        <button onclick="triggerRfidCardStateModification(${card.id}, 'Delete')" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:#ef4444; padding:5px 10px; border-radius:4px; font-weight:600; cursor:pointer; transition:0.2s; font-size:0.75rem;"><i class="fa-solid fa-trash-can"></i> Erase</button>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("❌ Core hardware inventory rendering exception:", err);
    }
}

async function triggerRfidCardStateModification(cardId, targetedAction) {
    if (targetedAction === 'Delete' && !confirm("Are you sure you want to permanently erase this RFID key token map?")) return;

    try {
        const response = await fetch(`${API_URL}/api/admin/rfid/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_id: cardId, action_status: targetedAction })
        });

        if (response.ok) {
            refreshRfidHardwareInventoryGrid();
        } else {
            alert("❌ Database constraint tracking error execution.");
        }
    } catch (err) {
        alert("❌ Link processing timeout.");
    }
}

// Form 3 Hook Interceptor Trigger: Link RFID Form Request Pipeline
const rfidForm = document.getElementById("adminRfidAssignForm");
if (rfidForm) {
    rfidForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("rfidAssignBtnSubmit");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Linking Hardware...";
        submitBtn.disabled = true;

        const payload = {
            resident_id: document.getElementById("rfidResidentSelectId").value,
            rfid_uid: document.getElementById("rfidRawInputUid").value.trim()
        };

        try {
            const response = await fetch(`${API_URL}/api/admin/rfid/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("🎉 Hardware Handshake Connected! RFID card linked cleanly.");
                document.getElementById("adminRfidAssignForm").reset();
                refreshRfidHardwareInventoryGrid();
            } else {
                alert("❌ Mismatch token signature rejection.");
            }
        } catch (err) {
            alert("❌ Server deadlocks error loop constraints.");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Global scope mapping locks injection
window.triggerRfidCardStateModification = triggerRfidCardStateModification;

// Master Bootloader Hook Onload Initializer
window.addEventListener('DOMContentLoaded', () => {
    fetchAdminControlRoles();
    loadResidentsMenuToRfidDropdown();
    refreshRfidHardwareInventoryGrid();
});