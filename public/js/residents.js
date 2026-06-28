const API_URL = window.location.origin;

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

let globalResidentsData = []; // Cache dataset to load Modals instantly

// 📊 Load all residents into the matrix
async function loadAllResidentsData() {
    try {
        const response = await fetch(`${API_URL}/residents`);
        globalResidentsData = await response.json();
        const tbody = document.querySelector("#allResidentsTable tbody");
        
        if (!tbody) return;
        tbody.innerHTML = "";

        if (globalResidentsData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding:20px;">No registered residents found inside system nodes.</td></tr>`;
            return;
        }

        globalResidentsData.forEach(res => {
            tbody.innerHTML += `
                <tr>
                    <td><b>${res.name}</b></td>
                    <td><i class="fa-solid fa-location-dot" style="color:#10b981; margin-right:4px;"></i> ${res.house_no}</td>
                    <td>${res.phone_no || 'N/A'}</td>
                    <td><small style="color:#64748b;">${res.email}</small></td>
                    <td class="action-btns">
                        <button class="btn-view" onclick="openViewModal(${res.id})" title="View Complete Profile"><i class="fa-solid fa-eye"></i> View</button>
                        <button class="btn-edit" onclick="openEditModal(${res.id})" title="Edit Details"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                        <button class="btn-delete" onclick="deleteResident(${res.id})" title="Remove Resident"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error("❌ Residents grid pipeline execution tracking error:", error);
    }
}

// 🔍 1. View Resident Profile Modal Logic
function openViewModal(id) {
    const resident = globalResidentsData.find(r => r.id === id);
    if (!resident) return;

    const content = document.getElementById("viewResidentContent");
    content.innerHTML = `
        <p><strong>Full Name:</strong> <span style="color:#f8fafc; font-weight:bold;">${resident.name}</span></p>
        <p><strong>House Number:</strong> <span style="color:#10b981; font-weight:bold;">${resident.house_no}</span></p>
        <p><strong>Contact Phone:</strong> ${resident.phone_no}</p>
        <p><strong>Email Address:</strong> ${resident.email}</p>
        <p><strong>CNIC ID:</strong> ${resident.cnic || 'N/A'}</p>
        <p><strong>Emergency Contact:</strong> <span style="color:#ef4444;">${resident.emergency_contact || 'N/A'}</span></p>
        <p><strong>Monthly Maintenance:</strong> Rs. ${Number(resident.monthly_bill || 0).toLocaleString()}</p>
        <p><strong>System Status:</strong> ${resident.status || 'Active'}</p>
    `;
    
    document.getElementById("viewModal").style.display = "flex";
}

// ✏️ 2. Edit Resident Details Modal Logic
function openEditModal(id) {
    const resident = globalResidentsData.find(r => r.id === id);
    if (!resident) return;

    document.getElementById("edit_id").value = resident.id;
    document.getElementById("edit_name").value = resident.name;
    document.getElementById("edit_house").value = resident.house_no;
    document.getElementById("edit_phone").value = resident.phone_no;
    document.getElementById("edit_email").value = resident.email;
    document.getElementById("edit_emergency").value = resident.emergency_contact || '';
    document.getElementById("edit_bill").value = resident.monthly_bill || 2500;

    document.getElementById("editModal").style.display = "flex";
}

// 💾 3. Save Edited Changes to Backend Database
const editForm = document.getElementById("editResidentForm");
if(editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("edit_id").value;
        
        const payload = {
            name: document.getElementById("edit_name").value,
            house_no: document.getElementById("edit_house").value,
            phone_no: document.getElementById("edit_phone").value,
            email: document.getElementById("edit_email").value,
            emergency_contact: document.getElementById("edit_emergency").value,
            monthly_bill: document.getElementById("edit_bill").value
        };

        try {
            const response = await fetch(`${API_URL}/api/residents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.success) {
                alert("✅ Resident profile updated successfully in registry!");
                closeModal('editModal');
                loadAllResidentsData(); // Live Refresh
            } else {
                alert("❌ Validation block failed to update resident data.");
            }
        } catch (err) {
            console.error("Update sequence crash:", err);
        }
    });
}

// 🗑️ 4. Completely Remove Resident from System
async function deleteResident(id) {
    if (!confirm("⚠️ SEVERE WARNING: Are you absolutely sure you want to permanently delete this resident profile?")) return;

    try {
        const response = await fetch(`${API_URL}/api/residents/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.success) {
            alert("🗑️ Profile securely wiped from central matrix.");
            loadAllResidentsData(); // Live Refresh
        } else {
            alert("❌ Failed to delete registry block.");
        }
    } catch (err) {
        console.error("Deletion node crash:", err);
    }
}

// ❌ Universal Modal Close Mechanism
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// 🔍 Search box filter routing mechanics
function filterResidentsTable() {
    const input = document.getElementById("residentSearchInput");
    const filter = input.value.toLowerCase();
    const table = document.getElementById("allResidentsTable");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let nameTd = tr[i].getElementsByTagName("td")[0];
        let houseTd = tr[i].getElementsByTagName("td")[1];
        if (nameTd || houseTd) {
            let nameText = nameTd.textContent || nameTd.innerText;
            let houseText = houseTd.textContent || houseTd.innerText;
            if (nameText.toLowerCase().indexOf(filter) > -1 || houseText.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// Expose internal functions to Global DOM for direct HTML onclick binds
window.openViewModal = openViewModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.deleteResident = deleteResident;
window.filterResidentsTable = filterResidentsTable;

window.addEventListener('DOMContentLoaded', () => {
    loadAllResidentsData();
});