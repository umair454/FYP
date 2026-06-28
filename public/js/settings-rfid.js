const CORE_API = window.location.origin;

// 📋 Load active occupants combo select menu for easy linking
async function loadResidentsMenuToRfidDropdown() {
    try {
        const response = await fetch(`${CORE_API}/residents`);
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

// 📋 Compile and render structural data grid inventory table rows
async function refreshRfidHardwareInventoryGrid() {
    try {
        const response = await fetch(`${CORE_API}/api/admin/rfid-cards`);
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

// ⚡ Handle State parameters modifications toggles (Suspend / Activate / Erase)
async function triggerRfidCardStateModification(cardId, targetedAction) {
    if (targetedAction === 'Delete' && !confirm("Are you sure you want to permanently erase this RFID key token map? Gate reader camera nodes will trigger automatic alarms.")) return;

    try {
        const response = await fetch(`${CORE_API}/api/admin/rfid/update-status`, {
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

// 🛡️ Submit Allocation Form Link Core Pipeline Form Interceptor Trigger
const rfidForm = document.getElementById("adminRfidAssignForm");
if (rfidForm) {
    rfidForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById("rfidAssignBtnSubmit");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Syncing Token...";
        submitBtn.disabled = true;

        const payload = {
            resident_id: document.getElementById("rfidResidentSelectId").value,
            rfid_uid: document.getElementById("rfidRawInputUid").value.trim()
        };

        try {
            const response = await fetch(`${CORE_API}/api/admin/rfid/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("🎉 Hardware Handshake Connected! RFID card token locked securely to resident perimeter registry line.");
                document.getElementById("adminRfidAssignForm").reset();
                refreshRfidHardwareInventoryGrid();
            } else {
                const errData = await response.json();
                alert(`❌ Link Rejected: ${errData.error || "UID key matrix mismatch."}`);
            }
        } catch (err) {
            alert("❌ Server transaction communication deadlock timeout.");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Global runtime execution pointers scope map injection
window.triggerRfidCardStateModification = triggerRfidCardStateModification;

// Initialize layout modules hooks safely on runtime bootstrap
window.addEventListener('DOMContentLoaded', () => {
    loadResidentsMenuToRfidDropdown();
    refreshRfidHardwareInventoryGrid();
});