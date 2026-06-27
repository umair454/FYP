const API_URL = "http://localhost:5000";

if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

let activeHistoricalLogCacheGrid = []; // Global matrix holder

// 📋 Fetch all visitor registry records directly from backend log stream
async function fetchVisitorsHistoricalLogs() {
    try {
        const response = await fetch(`${API_URL}/visitors-log`);
        activeHistoricalLogCacheGrid = await response.json();
        
        // Render current data utilizing the global active state filters
        applyLogDateFilters();
        
    } catch (error) {
        console.error("❌ Security logs system compiler failure trace:", error);
    }
}

// 🗓️ Apply dynamic date filtration array mapping runtime
function applyLogDateFilters() {
    const selectedMonth = document.getElementById("filterMonth").value;
    const selectedYear = document.getElementById("filterYear").value;
    const tbody = document.querySelector("#visitorsLogTable tbody");
    
    if (!tbody) return;
    tbody.innerHTML = "";

    // Filtering runtime array stream
    const filteredDataset = activeHistoricalLogCacheGrid.filter(entry => {
        const logDateObj = new Date(entry.entry_time);
        const matchMonth = selectedMonth === "ALL" || logDateObj.getMonth() == selectedMonth;
        const matchYear = selectedYear === "ALL" || logDateObj.getFullYear() == selectedYear;
        return matchMonth && matchYear;
    });

    if (filteredDataset.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; padding:20px;">No gate entries logged inside selected date constraints grid.</td></tr>`;
        return;
    }

    filteredDataset.forEach(entry => {
        const checkInTime = new Date(entry.entry_time).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let checkOutTime = "<span style='color:#64748b;'>-- Still Inside --</span>";
        let statusAction = "";

        if (entry.exit_time) {
            checkOutTime = new Date(entry.exit_time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
            statusAction = `<span style="background:rgba(100, 116, 139, 0.1); color:#94a3b8; padding:4px 8px; border-radius:4px; font-size:0.8rem;"><i class="fa-solid fa-door-closed"></i> Left</span>`;
        } else {
            statusAction = `<button onclick="markManualExit(${entry.id})" style="background:rgba(239, 68, 68, 0.15); border:1px solid #ef4444; color:#ef4444; padding:5px 10px; border-radius:4px; font-weight:600; cursor:pointer; font-size:0.75rem;"><i class="fa-solid fa-person-walking-arrow-right"></i> Mark Exit</button>`;
        }

        let nameStyle = entry.purpose.includes("Auto") ? "color:#3b82f6; font-weight:700;" : "font-weight:bold;";

        tbody.innerHTML += `
            <tr>
                <td style="${nameStyle}">${entry.visitor_name}</td>
                <td><i class="fa-solid fa-phone" style="color:#64748b; font-size:0.85rem;"></i> ${entry.phone_no}</td>
                <td><span style="color:#10b981; font-weight:600;">${entry.house_no}</span></td>
                <td><span style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:4px 8px; border-radius:4px; font-size:0.85rem;">${entry.purpose}</span></td>
                <td style="color:#10b981;">${checkInTime}</td>
                <td style="color:#ef4444;">${checkOutTime}</td>
                <td>${statusAction}</td>
            </tr>`;
    });
}

// 🖨️ Core Export Mechanism Client Side Dispatch Pipeline 
function triggerLogsExport(exportFormatType) {
    const targetTableElement = document.getElementById("visitorsLogTable");
    const monthSelector = document.getElementById("filterMonth");
    const yearSelector = document.getElementById("filterYear");
    
    const monthText = monthSelector.options[monthSelector.selectedIndex].text;
    const yearText = yearSelector.options[yearSelector.selectedIndex].text;
    const reportTitleString = `Security_Logs_Report_(${monthText}_${yearText})`;

    if (exportFormatType === 'excel') {
        // Parse current state visual DOM matrix mapping to sheets
        const workbookNode = XLSX.utils.table_to_book(targetTableElement, { sheet: "Security Logs Matrix" });
        XLSX.writeFile(workbookNode, `${reportTitleString}.xlsx`);
    } 
    else if (exportFormatType === 'pdf') {
        try {
            const { jsPDF } = window.jspdf;
            const printPdfDocument = new jsPDF('landscape', 'pt', 'a4'); // Landscape layout to securely capture complete timeline paths
            
            printPdfDocument.setFont("helvetica", "bold");
            printPdfDocument.setFontSize(16);
            printPdfDocument.setTextColor(15, 23, 42); // Theme Deep slate match
            printPdfDocument.text("HMSHub Central Security Grid Logs Statement", 40, 35);
            
            printPdfDocument.setFont("helvetica", "normal");
            printPdfDocument.setFontSize(10);
            printPdfDocument.setTextColor(100, 116, 139);
            printPdfDocument.text(`Timeline Context Cycle Filter: ${monthText} / ${yearText}`, 40, 52);

            printPdfDocument.autoTable({
                html: '#visitorsLogTable',
                startY: 65,
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42], textColor: [248, 250, 252], fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 6 },
                didParseCell: function (data) {
                    // 🛠️ FIX: Format changed to Array ["Text"] to prevent silent crash in jsPDF
                    if (data.column.index === 6 && data.cell.section === 'body') {
                        // Safely extract text from HTML string
                        const cellContent = data.cell.element ? data.cell.element.innerHTML : "";
                        if (cellContent.includes("Left")) {
                            data.cell.text = ["Left"];
                        } else {
                            data.cell.text = ["Still Inside"];
                        }
                    }
                }
            });
            printPdfDocument.save(`${reportTitleString}.pdf`);
        } catch (error) {
            console.error("❌ PDF Export Crash Trace:", error);
            alert("PDF generation failed. Please check the console for details.");
        }
    }
}

async function markManualExit(logId) {
    if(!confirm("Are you sure this person has exited the premises?")) return;
    try {
        await fetch(`${API_URL}/api/visitor/mark-exit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ log_id: logId })
        });
        fetchVisitorsHistoricalLogs(); // Refresh grid
    } catch (err) {
        alert("Failed to mark exit.");
    }
}

function filterVisitorsTable() {
    const input = document.getElementById("visitorSearchInput");
    const filter = input.value.toLowerCase();
    const table = document.getElementById("visitorsLogTable");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let nameTd = tr[i].getElementsByTagName("td")[0];
        let houseTd = tr[i].getElementsByTagName("td")[2];
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

window.addEventListener('DOMContentLoaded', () => {
    fetchVisitorsHistoricalLogs();
    window.filterVisitorsTable = filterVisitorsTable;
    window.markManualExit = markManualExit;
    window.applyLogDateFilters = applyLogDateFilters;
    window.triggerLogsExport = triggerLogsExport;
    setInterval(fetchVisitorsHistoricalLogs, 15000); // 15 seconds auto-refresh
});