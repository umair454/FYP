const API_URL = window.location.origin;

// Route tracking gateway authorization protocol security check
if (localStorage.getItem("adminUser") === null) {
    window.location.href = "/html/login.html";
}

document.getElementById("residentOnboardingForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = document.getElementById("submitBtn");
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Committing Records to Grid...";
    submitButton.disabled = true;

    // Construct FormData constructor matrix for binary tracking uploads
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value.trim());
    formData.append("house_no", document.getElementById("house_no").value.trim());
    formData.append("phone_no", document.getElementById("phone_no").value.trim());
    formData.append("email", document.getElementById("email").value.trim());
    formData.append("cnic", document.getElementById("cnic").value.trim());
    formData.append("emergency_contact", document.getElementById("emergency_contact").value.trim());
    formData.append("monthly_bill", document.getElementById("monthly_bill").value);
    formData.append("address", document.getElementById("address").value.trim());
    
    // ✅ ADDED: Capture and append the card sequence data safely into binary boundaries
    formData.append("rfid_uid", document.getElementById("rfid_uid").value.trim());
    
    // Append binary file pointers safely if added
    const frontCnicFile = document.getElementById("cnicFront").files[0];
    const backCnicFile = document.getElementById("cnicBack").files[0];
    if (frontCnicFile) formData.append("cnicFront", frontCnicFile);
    if (backCnicFile) formData.append("cnicBack", backCnicFile);

    try {
        const response = await fetch(`${API_URL}/add-resident`, {
            method: "POST",
            body: formData // Content-Type explicitly assigned by browser defaults configuration
        });

        const data = await response.json();

        if (response.ok) {
            alert("🎉 Success: Profile and immediate RFID card successfully logged inside central database schema!");
            document.getElementById("residentOnboardingForm").reset();
            window.location.href = "/html/residents.html";
        } else {
            alert(`❌ Operational Database Failure: ${data.error || "Database allocation conflict."}`);
        }
    } catch (error) {
        console.error("❌ Data Engine Transmission Exception:", error);
        alert("❌ Processing Grid Pipeline Offline: Backend server unreachable.");
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});