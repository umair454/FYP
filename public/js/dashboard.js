const API_URL = window.location.origin;

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

let barChartInstanceReference = null;
let doughnutChartInstanceReference = null;

function displayDate() {
    const dateElement = document.getElementById("current-date");
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.innerText = now.toLocaleDateString('en-US', options);
    }
}

// 📊 FETCH LIVE BALANCES & COMPILE FINANCIAL STATE (PROFIT/LOSS)
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/api/dashboard/stats`);
        if (response.ok) {
            const stats = await response.json();
            
            const resValue = document.querySelector("#card-residents .value");
            if (resValue) resValue.innerText = stats.totalResidents;

            const billValue = document.querySelector("#card-billing .value");
            if (billValue) billValue.innerText = `Rs. ${Number(stats.pendingBillsSum).toLocaleString()}`;

            const visElement = document.getElementById("today-visitors");
            if (visElement) visElement.innerText = stats.todayVisitorsCount;

            // P&L Core Component Engine Rendering
            const pnlCard = document.getElementById("card-financial-pnl");
            const pnlTitle = pnlCard.querySelector(".title");
            const pnlText = document.getElementById("pnlAccountSumText");
            const pnlIcon = document.getElementById("pnl-icon-frame").querySelector("i");
            
            const stateAmount = parseFloat(stats.netFinancialState);
            pnlText.innerText = `Rs. ${Math.abs(stateAmount).toLocaleString()}`;

            if (stateAmount >= 0) {
                pnlCard.style.borderLeft = "4px solid #10b981"; // Vibrant Profit Green
                pnlTitle.innerText = "Net Surplus Balance (Profit)";
                pnlTitle.style.color = "#10b981";
                pnlIcon.className = "fa-solid fa-arrow-trend-up";
                pnlIcon.style.color = "#10b981";
            } else {
                pnlCard.style.borderLeft = "4px solid #ef4444"; // Deficit Alert Red
                pnlTitle.innerText = "Net Deficit Deflator (Loss)";
                pnlTitle.style.color = "#ef4444";
                pnlIcon.className = "fa-solid fa-arrow-trend-down";
                pnlIcon.style.color = "#ef4444";
            }

            // ========================================================
            // 📊 FIXED & VERIFIED: CHART RENDERING GRID CONTEXTS
            // ========================================================
            
            // Graph 1: Monthly Maintenance Collection Trends
            const canvasBarElement = document.getElementById('collectionTrendBarChart');
            if (canvasBarElement) {
                const ctxBar = canvasBarElement.getContext('2d');
                if (barChartInstanceReference) barChartInstanceReference.destroy();

                barChartInstanceReference = new Chart(ctxBar, {
                    type: 'bar',
                    data: {
                        labels: stats.chartLabels,
                        datasets: [{
                            label: 'Collection Inflow (Rs.)',
                            data: stats.chartCollections,
                            backgroundColor: 'rgba(59, 130, 246, 0.35)',
                            borderColor: '#3b82f6',
                            borderWidth: 2,
                            borderRadius: 4,
                            barThickness: 30
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } },
                            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                        }
                    }
                });
            }

            // Graph 2: Tickets Operational Progress
            const canvasPieElement = document.getElementById('complaintsResolutionPieChart');
            if (canvasPieElement) {
                const ctxPie = canvasPieElement.getContext('2d');
                if (doughnutChartInstanceReference) doughnutChartInstanceReference.destroy();

                doughnutChartInstanceReference = new Chart(ctxPie, {
                    type: 'doughnut',
                    data: {
                        labels: ['Pending Tasks', 'Resolved Dues'],
                        datasets: [{
                            data: [stats.complaintsPending, stats.complaintsResolved],
                            backgroundColor: ['rgba(245, 158, 11, 0.35)', 'rgba(16, 185, 129, 0.35)'],
                            borderColor: ['#f59e0b', '#10b981'],
                            borderWidth: 2,
                            hoverOffset: 5
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: '600', size: 11 } } }
                        }
                    }
                });
            }
        }
    } catch (err) {
        console.error("❌ UI Interface sync fault logs trace:", err);
    }
}

// 🔔 REAL-TIME LIVE NOTIFICATION RE-RENDER PLATFORM ENGINE
async function syncAdminSystemNotifications() {
    try {
        const res = await fetch(`${API_URL}/api/admin/notifications`);
        if (!res.ok) return;
        const data = await res.json();
        
        const badge = document.getElementById("bellCounterBadge");
        const listWrapper = document.getElementById("notifListContainer");

        if (data.unreadCount > 0) {
            badge.innerText = data.unreadCount;
            badge.style.display = "block";
        } else {
            badge.style.display = "none";
        }

        if (listWrapper) {
            listWrapper.innerHTML = "";
            if (!data.list || data.list.length === 0) {
                listWrapper.innerHTML = `<div class="notif-item" style="color:#64748b; text-align:center; padding:15px;">All operations clean. No complaints tracking.</div>`;
                return;
            }

            data.list.forEach(item => {
                const statusClass = item.is_read === 0 ? "notif-item unread" : "notif-item";
                listWrapper.innerHTML += `<div class="${statusClass}"><i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b; margin-right:6px;"></i> ${item.text_alert}</div>`;
            });
        }
    } catch (err) {
        console.error("❌ Error running async notification pipelines:", err);
    }
}

function toggleAdminNotificationsMenu() {
    const dropdown = document.getElementById("adminNotifDropdown");
    if (dropdown) {
        const isOpen = dropdown.style.display === "flex";
        dropdown.style.display = isOpen ? "none" : "flex";
    }
}

async function clearAdminBadgeCount(event) {
    if (event) event.stopPropagation(); // Stop dropdown auto-shut execution context
    try {
        const response = await fetch(`${API_URL}/api/admin/notifications/mark-read`, { method: 'POST' });
        if (response.ok) {
            syncAdminSystemNotifications();
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadResidents() {
    try {
        const response = await fetch(`${API_URL}/residents`);
        const data = await response.json();
        const tableBody = document.querySelector("#residentTable tbody");
        if (tableBody && Array.isArray(data)) {
            tableBody.innerHTML = ""; 
            if (data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan='4' style='text-align:center; color:#475569; padding: 15px;'>No logged residents verified inside database registry block.</td></tr>`;
                return;
            }
            data.slice(0, 5).forEach(res => {
                tableBody.innerHTML += `
                    <tr>
                        <td><b>${res.name}</b></td>
                        <td><i class="fa-solid fa-location-dot" style="color:#10b981; margin-right:4px;"></i> ${res.house_no}</td>
                        <td><span style="color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Active</span></td>
                        <td><button style="background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" onclick="alert('Manual tracking instance reference created for logic check.')"><i class="fa-solid fa-eye"></i> View</button></td>
                    </tr>`;
            });
        }
    } catch (err) {
        console.log("Waiting for backend dynamic parameters pipeline flow...");
    }
}

async function runAutoBilling(btn) {
    if (!confirm("Are you sure you want to run automatic billing routine algorithms for all active resident grids?")) return;
    
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/test-auto-billing`, { method: 'POST' });
        if (response.ok) {
            alert("🎉 Dynamic billing sequences initiated. WhatsApp and Email channels dispatched successfully!");
            updateStats();
        } else {
            alert("❌ Operational processing block encountered.");
        }
    } catch (err) {
        alert("❌ Connection failure tracking server endpoints.");
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

function searchTableFilter() {
    const input = document.getElementById("tableSearchInput");
    if (!input) return;
    const filter = input.value.toLowerCase();
    const table = document.getElementById("residentTable");
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

function lockNavigationLayout() {
    const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
    sidebarLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            if (this.getAttribute("href") === "#") {
                e.preventDefault();
                sidebarLinks.forEach(l => l.classList.remove("active"));
                this.classList.add("active");
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    displayDate();
    loadResidents();
    updateStats();
    syncAdminSystemNotifications();
    lockNavigationLayout();
    
    window.searchTableFilter = searchTableFilter;
    window.runAutoBilling = runAutoBilling;
    window.toggleAdminNotificationsMenu = toggleAdminNotificationsMenu;
    window.clearAdminBadgeCount = clearAdminBadgeCount;

    setInterval(updateStats, 20000); // 20 Seconds live numbers poll refresh
    setInterval(syncAdminSystemNotifications, 10000); // 10 Seconds live complaint badge check refresh
});