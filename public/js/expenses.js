const API_URL = "http://localhost:5000";

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

// 📋 Fetch and Render Outflow Transactions Rows Matrix
async function loadSocietyExpensesLedger() {
    try {
        const response = await fetch(`${API_URL}/api/expenses`);
        const data = await response.json();
        const tbody = document.querySelector("#expensesMasterTable tbody");
        
        if (!tbody) return;
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding:20px;">No operational cash debit events logged inside schema grid.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const dateLogged = new Date(item.expense_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            tbody.innerHTML += `
                <tr>
                    <td><b>${item.title}</b></td>
                    <td><span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;"><i class="fa-solid fa-tags" style="font-size:0.75rem; margin-right:4px;"></i>${item.category}</span></td>
                    <td style="color:#ef4444; font-weight:700;">Rs. ${Number(item.amount).toLocaleString()}</td>
                    <td style="color:#94a3b8; font-size:0.85rem;"><i class="fa-solid fa-calendar-day"></i> ${dateLogged}</td>
                </tr>`;
        });
    } catch (error) {
        console.error("❌ Outflow telemetry compile pipeline exception logs:", error);
    }
}

// 🛡️ Post New Expenses Data Payload Form Submission Trigger
document.getElementById("addExpenseForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("expenseSubmitBtn");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Committing Transaction...";
    submitBtn.disabled = true;

    const payload = {
        title: document.getElementById("expenseTitle").value.trim(),
        amount: document.getElementById("expenseAmount").value,
        category: document.getElementById("expenseCategory").value
    };

    try {
        const response = await fetch(`${API_URL}/api/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("🎉 Transaction debited and saved successfully into database ledger stream!");
            document.getElementById("addExpenseForm").reset();
            loadSocietyExpensesLedger(); // Refresh rows grid immediately
        } else {
            alert("❌ Operational processing exception updating ledger.");
        }
    } catch (err) {
        alert("❌ Processing link error: Connection timeout mapping endpoints.");
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// 🔍 Inline Input Character Search Data Filter Mechanic
function filterExpensesTable() {
    const input = document.getElementById("expenseSearchInput");
    const filter = input.value.toLowerCase();
    const table = document.getElementById("expensesMasterTable");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let titleTd = tr[i].getElementsByTagName("td")[0];
        if (titleTd) {
            let textValue = titleTd.textContent || titleTd.innerText;
            if (textValue.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadSocietyExpensesLedger();
    window.filterExpensesTable = filterExpensesTable;
});