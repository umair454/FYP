const API_URL = window.location.origin;

// Intercom view route protection parameters
if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

document.getElementById("visitorRegistryForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = document.getElementById("gateSubmitBtn");
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = "<i class='fa-solid fa-tower-broadcast fa-spin'></i> Dispatched Network Ping...";
    submitButton.disabled = true;

    const payload = {
        visitor_name: document.getElementById("visitor_name").value.trim(),
        phone_no: document.getElementById("phone_no").value.trim(),
        house_no: document.getElementById("house_no").value.trim(),
        purpose: document.getElementById("purpose").value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/add-visitor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("✅ Entry logged successfully! Real-time alerts successfully dispatched to the target resident.");
            document.getElementById("visitorRegistryForm").reset();
            
            // 🚀 SUCCESS REDIRECT ROUTING (Guard direct logs history screen par chala jayega)
            window.location.href = "/html/visitors-log.html";
        } else {
            alert(`❌ Gate Control Alert: ${data.message || "Failed to commit visitor check."}`);
        }
    } catch (error) {
        console.error("❌ Gate Intercom Grid Offline:", error);
        alert("❌ Terminal Connection Exception: Communication node with port 5000 failed.");
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});