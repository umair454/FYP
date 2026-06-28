const API_URL = window.location.origin;

// Validate if active session contains valid technical crew operator
const activeStaff = JSON.parse(localStorage.getItem("staffUser"));
if (!activeStaff) {
    window.location.href = "/html/login.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "/html/login.html";
}

// 📋 Load assigned maintenance logs assigned by admin
async function loadStaffAssignedTasks() {
    try {
        document.getElementById("staff-welcome").innerText = `Operator Console: ${activeStaff.name}`;
        document.getElementById("staff-meta").innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> Position: <b>${activeStaff.role}</b> | Phone Contact: ${activeStaff.phone_no}`;

        // Hit the dedicated staff tasks route we appended inside server.js
        const response = await fetch(`${API_URL}/api/staff/tasks/${activeStaff.id}`);
        const tasks = await response.json();
        const container = document.getElementById("tasks-container");
        
        if (!container) return;
        container.innerHTML = "";

        if (tasks.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.08); border-radius: 8px;">
                    <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; color: #10b981; margin-bottom: 10px;"></i>
                    <p style="color: #64748b; margin: 0;">No active job allocations found. Standby state active.</p>
                </div>`;
            return;
        }

        tasks.forEach(task => {
            container.innerHTML += `
                <div class="stat-card" style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <h4 style="color: #f8fafc; margin: 0; font-size: 1.1rem;">${task.title}</h4>
                            <span style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Assigned</span>
                        </div>
                        <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 15px;">${task.description}</p>
                        <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 15px;">
                            <i class="fa-solid fa-location-dot" style="color: #ef4444; margin-right: 6px;"></i> Location Target: <b>House ${task.house_no}</b>
                        </div>
                    </div>
                    <button onclick="submitTaskClosure(${task.id}, this)" style="width: 100%; background: #10b981; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s;">
                        <i class="fa-solid fa-check-double"></i> Mark As Completed
                    </button>
                </div>`;
        });
    } catch (err) {
        console.error("❌ Staff job boards rendering context crash:", err);
    }
}

// ⚡ Task Closure Submission Logic Execution Block
async function submitTaskClosure(complaintId, button) {
    if (!confirm("Are you sure you have resolved this residential maintenance task order?")) return;

    const originalText = button.innerHTML;
    button.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Closing Job Matrix...";
    button.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/staff/task-complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ complaint_id: complaintId, staff_id: activeStaff.id })
        });

        if (response.ok) {
            alert("🎉 Success! Job resolution committed. Roster status updated to Available.");
            loadStaffAssignedTasks(); // Reload dynamic jobs view instantly
        } else {
            alert("❌ Operational fault processing task status update.");
        }
    } catch (err) {
        alert("❌ Processing link error: Connection timeout tracking endpoints.");
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Bootstrap Engine Initializer
window.addEventListener('DOMContentLoaded', () => {
    loadStaffAssignedTasks();
    // Dynamic refresh every 15 seconds to sync incoming jobs
    setInterval(loadStaffAssignedTasks, 15000);
});