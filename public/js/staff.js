const API_URL = "http://localhost:5000";

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "/html/login.html";
}

// 📋 Fetch all staff members from backend API data pool & enable administrative actions
async function fetchSocietyStaff() {
    try {
        const response = await fetch(`${API_URL}/api/staff`);
        const staffList = await response.json();
        const tbody = document.querySelector("#staffMasterTable tbody");
        
        if (!tbody) return;
        tbody.innerHTML = "";

        if (staffList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding:20px;">No operational staff registered inside database.</td></tr>`;
            return;
        }

        staffList.forEach(staff => {
            // Setup dynamic style rules based on status states
            let badgeStyle = "background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b98130;";
            if (staff.status === 'Busy') {
                badgeStyle = "background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid #f59e0b30;";
            } else if (staff.status === 'On Leave') {
                badgeStyle = "background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef444430;";
            }

            // Fallbacks if data properties names differ slightly from query select
            const operatorName = staff.username || staff.name || "Unknown";
            const operatorPosition = staff.role || staff.position || "Operator";
            const operatorEmail = staff.email || "N/A";

            tbody.innerHTML += `
                <tr id="row-node-grid-${staff.id}">
                    <td><b style="color:white;"><i class="fa-solid fa-id-badge" style="color:#64748b; margin-right:6px;"></i> ${operatorName}</b></td>
                    <td><span style="color:#e2e8f0; font-weight:600;"><i class="fa-solid fa-wrench" style="color:#64748b; margin-right:6px; font-size:0.85rem;"></i>${operatorPosition}</span></td>
                    <td><i class="fa-solid fa-phone" style="color:#64748b; margin-right:4px; font-size:0.85rem;"></i> ${staff.phone_no}</td>
                    <td><i class="fa-solid fa-envelope" style="color:#64748b; margin-right:4px; font-size:0.85rem;"></i> ${operatorEmail}</td>
                    <td style="padding: 8px 4px; display:flex; gap:8px; align-items:center;">
                        <button onclick="triggerInlineUpdatePipeline(${staff.id}, '${operatorName}', '${operatorPosition}', '${staff.phone_no}', '${operatorEmail}')" style="background:#3b82f6; color:white; border:none; padding:6px 12px; font-size:0.8rem; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-user-pen"></i> Edit</button>
                        <button onclick="executeDestructiveAccountDrop(${staff.id})" style="background:#ef4444; color:white; border:none; padding:6px 12px; font-size:0.8rem; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-user-minus"></i> Drop</button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error("❌ Staff array data matrix tracking execution failure:", error);
    }
}

// 🛠️ ADMIN MASTER CONTROLS: REVEAL INLINE EDIT FIELDS INSIDE GRID ACTIVE ROW
function triggerInlineUpdatePipeline(targetId, username, role, phone, email) {
    const targetRow = document.getElementById(`row-node-grid-${targetId}`);
    if (!targetRow) return;

    targetRow.innerHTML = `
        <td><input type="text" id="inlineEditUser-${targetId}" value="${username}" style="padding:6px; background:#0f172a; border:1px solid #3b82f6; color:white; border-radius:4px; width:100%;"></td>
        <td><input type="text" id="inlineEditRole-${targetId}" value="${role}" style="padding:6px; background:#0f172a; border:1px solid #3b82f6; color:white; border-radius:4px; width:100%;"></td>
        <td><input type="text" id="inlineEditPhone-${targetId}" value="${phone}" style="padding:6px; background:#0f172a; border:1px solid #3b82f6; color:white; border-radius:4px; width:100%;"></td>
        <td><input type="email" id="inlineEditEmail-${targetId}" value="${email}" style="padding:6px; background:#0f172a; border:1px solid #3b82f6; color:white; border-radius:4px; width:100%;"></td>
        <td style="display:flex; gap:6px;">
            <button onclick="commitInlineChangesRegistry(${targetId})" style="background:#10b981; color:white; border:none; padding:6px 10px; font-size:0.75rem; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-save"></i> Save</button>
            <button onclick="fetchSocietyStaff()" style="background:#64748b; color:white; border:none; padding:6px 10px; font-size:0.75rem; border-radius:4px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-xmark"></i> Cancel</button>
        </td>`;
}

// COMMIT INTERFACES MODIFICATIONS PAYLOAD TRIGGERS TO SERVER
async function commitInlineChangesRegistry(targetId) {
    const payload = {
        username: document.getElementById(`inlineEditUser-${targetId}`).value.trim(),
        role: document.getElementById(`inlineEditRole-${targetId}`).value.trim(),
        phone_no: document.getElementById(`inlineEditPhone-${targetId}`).value.trim(),
        email: document.getElementById(`inlineEditEmail-${targetId}`).value.trim()
    };

    try {
        const res = await fetch(`${API_URL}/api/staff/update/${targetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert("🎉 Profile data updated cleanly cascading login parameters repository!");
            fetchSocietyStaff();
        } else {
            alert("❌ Operational fault updating staff schema target data.");
        }
    } catch(err) {
        alert("❌ Error connecting validation handshake link lines.");
    }
}

// 🚨 DESTRUCTIVE PRIVILEGE OPERATION: PURGE DATA SCHEMAS ENTRY PERMANENTLY
async function executeDestructiveAccountDrop(targetId) {
    if (!confirm("⚠️ DANGER CONTROL: Dropping this operator profile will permanently purge their multi-portal authentication logs and records. Proceed?")) return;

    try {
        const res = await fetch(`${API_URL}/api/staff/delete/${targetId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            alert("🎉 Operator record and login profile successfully detached across clusters!");
            fetchSocietyStaff();
        } else {
            alert("❌ Server rejected configuration drop request pipeline.");
        }
    } catch (err) {
        alert("❌ Loss of interconnection to target routing node server.");
    }
}

// 🔍 Live input search data grid structural layout filter mechanisms
function filterStaffTable() {
    const input = document.getElementById("staffSearchInput");
    const filter = input.value.toLowerCase();
    const table = document.getElementById("staffMasterTable");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let nameTd = tr[i].getElementsByTagName("td")[0];
        let roleTd = tr[i].getElementsByTagName("td")[1];
        if (nameTd || roleTd) {
            let nameText = nameTd.textContent || nameTd.innerText;
            let roleText = roleTd.textContent || roleTd.innerText;
            if (nameText.toLowerCase().indexOf(filter) > -1 || roleText.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    fetchSocietyStaff();
    window.filterStaffTable = filterStaffTable;
    window.triggerInlineUpdatePipeline = triggerInlineUpdatePipeline;
    window.commitInlineChangesRegistry = commitInlineChangesRegistry;
    window.executeDestructiveAccountDrop = executeDestructiveAccountDrop;
});