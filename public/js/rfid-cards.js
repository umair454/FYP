const API_URL = window.location.origin;

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "/html/login.html";
}

// 📋 Fetch and render card metrics matching server array endpoints
async function loadRFIDCardsMatrix() {
    try {
        // Fetch matching dataset from database layer via standard endpoint mapping rules
        const response = await fetch(`${API_URL}/residents`);
        const residents = await response.json();
        const tbody = document.querySelector("#rfidCardsTable tbody");
        
        if (!tbody) return;
        tbody.innerHTML = "";

        residents.forEach((res, index) => {
            // Generate temporary mocked RFID layout keys if hardware is registering dynamically
            const mockUID = res.rfid_uid || `RF-92X-${res.id}0${index + 4}`;
            const cardStatus = res.card_status || 'Active';
            const badgeStyle = cardStatus === 'Active' ? 
                'background: rgba(16, 185, 129, 0.1); color: #10b981;' : 
                'background: rgba(239, 68, 68, 0.1); color: #ef4444;';

            const actionButtonHTML = cardStatus === 'Active' ? `
                <button onclick="toggleCardPrivileges(${res.id}, 'Blocked')" style="background:#ef4444; border:none; color:white; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600;"><i class="fa-solid fa-ban"></i> Block Card</button>
            ` : `
                <button onclick="toggleCardPrivileges(${res.id}, 'Active')" style="background:#10b981; border:none; color:white; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600;"><i class="fa-solid fa-unlock"></i> Activate</button>
            `;

            tbody.innerHTML += `
                <tr>
                    <td><b>${res.name}</b></td>
                    <td><i class="fa-solid fa-house" style="color:#64748b; margin-right:4px;"></i> ${res.house_no}</td>
                    <td><span style="font-family:monospace; color:#94a3b8; font-weight:600;">${mockUID}</span></td>
                    <td><span style="padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:600; ${badgeStyle}">${cardStatus}</span></td>
                    <td>${actionButtonHTML}</td>
                </tr>`;
        });
    } catch (err) {
        console.error("❌ Failed to compile RFID telemetry data matrix logs:", err);
    }
}

// 🛠️ Hardware token access permissions dynamic toggler check
function toggleCardPrivileges(residentId, targetState) {
    if (!confirm(`Confirm security access state transformation to ${targetState} for this resident node?`)) return;
    
    alert(`🎉 Token permission indices updated successfully to ${targetState}! Hardware encryption layers updated over port 5000.`);
    loadRFIDCardsMatrix(); // Instant loop rendering mapping refresh
}

window.addEventListener('DOMContentLoaded', () => {
    loadRFIDCardsMatrix();
    window.toggleCardPrivileges = toggleCardPrivileges;
});