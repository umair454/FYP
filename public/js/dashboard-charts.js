const API_URL = "http://localhost:5000";

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

// Global variable chart object pointers to track updates on hot reloads
let dynamicCollectionBarChartInstance = null;
let dynamicComplaintsPieChartInstance = null;

// 📋 Dynamic layout pipeline loader hitting /api/dashboard/stats route
async function loadMasterDashboardAnalytics() {
    try {
        const response = await fetch(`${API_URL}/api/dashboard/stats`);
        const data = await response.json();

        if (!response.ok) throw new Error("Analytics telemetry fetch broken.");

        // 1. Sync primary overview text widget card elements variables mapping
        document.getElementById("widgetTotalResidents").innerText = Number(data.totalResidents).toLocaleString();
        document.getElementById("widgetTotalRevenue").innerText = `Rs. ${Number(data.totalRevenue).toLocaleString()}`;
        document.getElementById("widgetTotalExpenses").innerText = `Rs. ${Number(data.totalExpenses).toLocaleString()}`;
        
        const netProfitWidget = document.getElementById("widgetNetProfit");
        netProfitWidget.innerText = `Rs. ${Number(data.netFinancialState).toLocaleString()}`;
        netProfitWidget.style.color = data.netFinancialState >= 0 ? "#10b981" : "#ef4444";

        // 2. COMPILE GRAPH A: Monthly Collection Bar Chart Core Engine
        const ctxBar = document.getElementById('financialCollectionTrendChart').getContext('2m');
        if (dynamicCollectionBarChartInstance) { dynamicCollectionBarChartInstance.destroy(); }
        
        dynamicCollectionBarChartInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: data.chartLabels,
                datasets: [{
                    label: 'Revenue Collections (Rs.)',
                    data: data.chartCollections,
                    backgroundColor: 'rgba(59, 130, 246, 0.4)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 4,
                    barThickness: 35
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        // 3. COMPILE GRAPH B: Ticket Operations Complaints Pie Chart Layout
        const ctxPie = document.getElementById('complaintsResolutionPieChart').getContext('2d');
        if (dynamicComplaintsPieChartInstance) { dynamicComplaintsPieChartInstance.destroy(); }

        dynamicComplaintsPieChartInstance = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Pending / Assigned', 'Resolved Operations'],
                datasets: [{
                    data: [data.complaintsPending, data.complaintsResolved],
                    backgroundColor: ['rgba(245, 158, 11, 0.4)', 'rgba(16, 185, 129, 0.4)'],
                    borderColor: ['#f59e0b', '#10b981'],
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: '600' } } }
                }
            }
        });

    } catch (err) {
        console.error("❌ Analytics presentation layers mapping exception:", err);
    }
}

// Bootstrap Engine Onload Hooks
window.addEventListener('DOMContentLoaded', () => {
    loadMasterDashboardAnalytics();
});