const API_URL = "http://localhost:5000";

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "/html/login.html";
}

// 📋 Fetch all central maintenance invoices records
async function fetchGlobalInvoicesData() {
    try {
        const response = await fetch(`${API_URL}/all-bills`);
        const data = await response.json();
        const tbody = document.querySelector("#allBillsTable tbody");
        
        if (!tbody) return;
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding:20px;">No historical invoices tracking data logs inside server nodes.</td></tr>`;
            return;
        }

        data.forEach(bill => {
            const isPaid = bill.payment_status === 'Paid';
            const badgeClass = isPaid ? 'status-paid' : 'status-unpaid';
            
            let actionButtonHTML = "";
            if (!isPaid) {
                actionButtonHTML = `
                    <button onclick="collectCashPaymentReceipt(${bill.bill_id})" style="background:#10b981; border:none; color:white; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
                        <i class="fa-solid fa-cash-register"></i> Collect Cash
                    </button>`;
            } else {
                actionButtonHTML = `<span style="color:#64748b; font-size:0.85rem;"><i class="fa-solid fa-clipboard-check"></i> Statement Closed</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td><b>${bill.name}</b></td>
                    <td><i class="fa-solid fa-location-dot" style="color:#64748b; margin-right:4px;"></i> ${bill.house_no}</td>
                    <td><b style="color:#e2e8f0;">Rs. ${Number(bill.amount).toLocaleString()}</b></td>
                    <td><i class="fa-regular fa-calendar-check" style="color:#10b981; margin-right:4px;"></i> ${bill.bill_month}</td>
                    <td><span class="status-badge ${badgeClass}">${bill.payment_status}</span></td>
                    <td>${actionButtonHTML}</td>
                </tr>`;
        });
    } catch (error) {
        console.error("❌ Billing array node matrix tracking error:", error);
    }
}

// 📋 Populate active residents records dropdown options list inside selector box frame
async function populateResidentsDropdownInBillingForm() {
    try {
        const response = await fetch(`${API_URL}/residents`);
        const residents = await response.json();
        const selectMenu = document.getElementById("billingResidentSelectId");
        
        if (!selectMenu) return;
        selectMenu.innerHTML = `<option value="" disabled selected>Select Target Resident Profile...</option>`;
        
        residents.forEach(res => {
            selectMenu.innerHTML += `<option value="${res.id}">${res.name} (House: ${res.house_no})</option>`;
        });
    } catch (err) {
        console.error("❌ Dropdown occupants compilation fault context:", err);
    }
}

// ⚡ CORE TRANSACTION ROUTINE ALGORITHM: Mark invoice row as Paid inside database model arrays
async function collectCashPaymentReceipt(billId) {
    if (!confirm("Confirm cash collection receipt synchronization for this residential account node?")) return;

    try {
        const response = await fetch(`${API_URL}/api/billing/collect-cash`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bill_id: billId })
        });
        const result = await response.json();

        if (result.success) {
            alert("🎉 Transaction secured! Invoice status updated to Paid inside central system arrays grid.");
            fetchGlobalInvoicesData(); 
        } else {
            alert("❌ Operational error mapping cash collection parameters.");
        }
    } catch (err) {
        alert("❌ Payout pipeline terminal validation connection timeout.");
    }
}

// 🔍 Live input search data grid structural layout filter mechanisms
function filterBillingTable() {
    const input = document.getElementById("billingSearchInput");
    const filter = input.value.toLowerCase();
    const table = document.getElementById("allBillsTable");
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

// ⚡ INTERCEPTOR HOOK: Submit manual invoice handler triggers
const manualBillingForm = document.getElementById("manualBillingGenerationForm");
if (manualBillingForm) {
    manualBillingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById("billingSubmitBtn");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Posting Invoice...";
        submitBtn.disabled = true;

        const payload = {
            resident_id: document.getElementById("billingResidentSelectId").value,
            bill_month: document.getElementById("billingMonthText").value.trim(),
            amount: document.getElementById("billingAmountNum").value,
            due_date: document.getElementById("billingDueDate").value
        };

        try {
            const response = await fetch(`${API_URL}/api/billing/generate-manual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("🎉 Invoice Posted! Manual billing row allocated inside database registers and notifications dispatched successfully.");
                manualBillingForm.reset();
                fetchGlobalInvoicesData(); // Live updates stream refresh
            } else {
                alert("❌ Mismatch constraints: Failed to generate individual ledger.");
            }
        } catch (err) {
            alert("❌ Network processing deadlock timeout checking server endpoints.");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    fetchGlobalInvoicesData();
    populateResidentsDropdownInBillingForm();
    window.filterBillingTable = filterBillingTable;
    window.collectCashPaymentReceipt = collectCashPaymentReceipt;
});