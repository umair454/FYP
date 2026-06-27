const API_URL = "http://localhost:5000";

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "/html/login.html";
}

// Global cached array variable to store matching available staff
let technicalStaffCache = [];

// 📊 Fetch active staff from database matrix who are marked 'Available'
async function syncAvailableStaffCache() {
    try {
        const response = await fetch(`${API_URL}/api/staff`);
        const data = await response.json();
        
        // ✅ FIXED: admins table se aane wale saare custom sub-logins direct cache mein pass kiye
        technicalStaffCache = data || [];
    } catch (err) {
        console.error("❌ Failed to synchronize technical crew telemetry layers:", err);
    }
}

// 📋 Compile and render database complaints grid rows
async function compileComplaintsDashboard() {
    try {
        // Dropdowns load hone se pehle cache update karna laazmi hai
        await syncAvailableStaffCache();

        const response = await fetch(`${API_URL}/api/complaints`);
        const tickets = await response.json();
        const tbody = document.querySelector("#complaintsTable tbody");
        
        if (!tbody) return;
        tbody.innerHTML = "";

        if (tickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:20px;">No registered complaints logged inside system parameters.</td></tr>`;
            return;
        }

        tickets.forEach(ticket => {
            // Setup dynamic style rules based on status states
            let badgeStyle = "background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef444430;";
            if (ticket.status === 'Assigned') {
                badgeStyle = "background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid #f59e0b30;";
            } else if (ticket.status === 'Resolved') {
                badgeStyle = "background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b98130;";
            }

            // Generate contextual layout mapping buttons
            let allocationControlHTML = "";
            if (ticket.status === 'Pending') {
                // ✅ FIXED: s.name aur s.position ki jagah backend response keys s.username aur s.role map kiye
                let dropdownOptions = technicalStaffCache.map(s => `<option value="${s.id}">${s.username} (${s.role})</option>`).join('');
                
                allocationControlHTML = `
                    <div style="display:flex; gap:6px;">
                        <select id="assign-select-${ticket.id}" style="background:rgba(1e, 29, 59, 0.5); border:1px solid rgba(255,255,255,0.08); color:white; padding:6px; border-radius:4px; outline:none; font-size:0.85rem;">
                            <option value="">Choose Staff...</option>
                            ${dropdownOptions}
                        </select>
                        <button onclick="executeStaffDeployment(${ticket.id})" style="background:#10b981; border:none; color:white; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
                            <i class="fa-solid fa-paper-plane"></i> Assign
                        </button>
                    </div>`;
            } else {
                allocationControlHTML = `<span style="color:#64748b; font-size:0.85rem;"><i class="fa-solid fa-lock"></i> Dispatched Node Locked</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td><b>${ticket.resident_name || 'System User'}</b></td>
                    <td><i class="fa-solid fa-house" style="color:#64748b; margin-right:4px;"></i> House ${ticket.house_no}</td>
                    <td><span style="font-weight:600; color:#e2e8f0;">${ticket.title}</span></td>
                    <td><p style="max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#94a3b8; font-size:0.85rem;" title="${ticket.description}">${ticket.description}</p></td>
                    <td><span style="padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:600; ${badgeStyle}">${ticket.status}</span></td>
                    <td>${allocationControlHTML}</td>
                </tr>`;
        });
    } catch (error) {
        console.error("❌ Complaints render system failure trace:", error);
    }
}

// 🚀 Core operational action button dispatch mapping rule
async function executeStaffDeployment(complaintId) {
    const selectWidget = document.getElementById(`assign-select-${complaintId}`);
    if (!selectWidget || !selectWidget.value) {
        alert("Please map an available staff candidate signature first before initializing trigger.");
        return;
    }
    const targetStaffId = selectWidget.value;

    try {
        const response = await fetch(`${API_URL}/api/complaints/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ complaint_id: complaintId, staff_id: targetStaffId })
        });

        if (response.ok) {
            alert("🎉 Technical crew deployed! Real-time WhatsApp alert data parameters transmitted safely to operators phone!");
            compileComplaintsDashboard(); // Refresh current table parameters instantly without shifting layout
        } else {
            alert("❌ Operational system error tracking transaction indices.");
        }
    } catch (err) {
        alert("❌ Payout allocation node validation terminal timeout.");
    }
}

window.addEventListener('DOMContentLoaded', () => {
    compileComplaintsDashboard();
    window.executeStaffDeployment = executeStaffDeployment; // Map global tracking signature references
});