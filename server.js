git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/FYP.git
git push -u origin maingit init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/FYP.git
git push -u origin mainconst express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); 
const path = require('path');   
const fs = require('fs');       
const { Client, LocalAuth } = require('whatsapp-web.js'); 
const qrcode = require('qrcode-terminal');             
const cron = require('node-cron');                     
const nodemailer = require('nodemailer'); 

const app = express(); 
app.use(cors());
app.use(bodyParser.json());

// Memory block to securely tracking system OTP sessions runtime variables
const activeOTPSessionGrid = {};
// Runtime temporary storage array cache mapping for role/staff deployment confirmation tokens
const activeRoleCreationSessions = {};

// ========================================================
// FRONTEND ROUTING FIX (EXACT FOLDER STRUCTURE MAPPING)
// ========================================================
app.use(express.static(path.join(__dirname, 'public')));
app.use('/html', express.static(path.join(__dirname, 'public', 'html')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

// ========================================================
// 1. EMAIL ENGINE CONFIGURATION (NODEMAILER)
// ========================================================
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hmshub22@gmail.com', // ⚠️ Apni actual gmail id lagayein
        pass: 'knae yjwd qstr tesq'       // ⚠️ Gmail se generated 16-character app password
    }
});

async function sendEmailNotification(toEmail, subject, htmlContent) {
    try {
        const mailOptions = {
            from: '"HMS Hub Alert Engine" <hmshub22@gmail.com>',
            to: toEmail,
            subject: subject,
            html: htmlContent
        };
        await emailTransporter.sendMail(mailOptions);
        console.log(`📧 Email pipeline successfully dispatched to: ${toEmail}`);
    } catch (error) {
        console.error("❌ Nodemailer pipeline transmission failure:", error.message);
    }
}

// ========================================================
// 2. WHATSAPP LOGISTICS CORE SETUP (CHROME FIXED PATH)
// ========================================================
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-js/main/dist/wppconnect-wa.js',
    }
});

let isWhatsAppReady = false; 

client.on('qr', (qr) => {
    console.log('\n==================================================');
    console.log('⚠️ SCAN THIS QR CODE FOR WHATSAPP WORKFLOW HUB ⚠️');
    console.log('==================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    isWhatsAppReady = true;
    console.log('✅ WhatsApp data interface pipelines active!');
});

client.initialize().catch(err => console.log("WhatsApp Connection Error:", err));

async function sendWhatsAppMessage(toPhone, message) {
    if (!isWhatsAppReady) {
        console.log(`❌ WhatsApp channel down. Message dropped for: ${toPhone}`);
        return;
    }
    try {
        let cleanPhone = toPhone.replace(/\D/g, ''); 
        if (cleanPhone.startsWith('0')) { cleanPhone = '92' + cleanPhone.slice(1); }
        const chatId = cleanPhone + "@c.us";
        await client.sendMessage(chatId, message);
        console.log("✅ WhatsApp dispatch verified to:", cleanPhone);
    } catch (error) {
        console.log("❌ WhatsApp engine crash trace:", error.message);
    }
}

// ========================================================
// 3. LOCAL WORKBENCH DATABASE CONNECTION SETUP
// ========================================================
const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Umair@86247',
    database: process.env.DB_NAME || 'hms_hub_db',
    port: process.env.DB_PORT || 3306
});

db.connect(err => {
    if (err) { 
        console.error('❌ Local Workbench Database Connection Failed!', err.message); 
        return; 
    }
    console.log('Connected safely to Local MySQL Server Engine via Workbench!');
    
    db.query("SET SQL_SAFE_UPDATES = 0", (safeErr) => {
        if (!safeErr) console.log("🛡️ Safe Updates Disabled for Local Session.");
    });
});

// ========================================================
// 4. STORAGE CONFIGURATION FOR FILE UPLOADS
// ========================================================
const storageConfiguration = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/cnic/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storageConfiguration });

// ========================================================
// 5. PARALLEL AUTOMATED NOTIFICATIONS PATHS (ROUTING)
// ========================================================
cron.schedule('0 0 3 * *', () => { 
    console.log("🕒 3rd of the month triggered. Launching dynamic global maintenance invoicing routines...");
    generateAutoBills(); 
});

function generateAutoBills(callback) {
    db.query("SELECT id, name, phone_no, email, monthly_bill FROM residents WHERE status = 'Active'", (err, residents) => {
        if (err || residents.length === 0) { if(callback) callback(err || "Zero accounts"); return; }
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 13).toISOString().split('T')[0];

        let processed = 0;
        residents.forEach(res => {
            const currentAmount = res.monthly_bill || 2500;
            db.query("INSERT INTO bills (resident_id, amount, bill_month, due_date) VALUES (?, ?, ?, ?)", [res.id, currentAmount, monthName, dueDate], (billErr) => {
                processed++;
                if (!billErr) {
                    const waMsg = `🔔 *HMS Hub Invoice Alert*\n\nDear *${res.name}*,\nYour monthly maintenance bill for *${monthName}* has been generated dynamically.\n\n*Amount Due:* Rs. ${currentAmount}\n*Due Date:* ${dueDate}\n\n👉 Kindly login to your Resident Dashboard Portal to review your ledger statement files.`;
                    sendWhatsAppMessage(res.phone_no, waMsg);

                    const emailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 25px; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
                            <h2 style="color: #3b82f6; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">HMS Hub: Maintenance Invoice Generated</h2>
                            <p>Dear Resident <b>${res.name}</b>,</p>
                            <p>Your property ledger dues for the current operational cycle have been compiled successfully.</p>
                            <div style="background: rgba(255,255,255,0.03); border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                📅 <b>Billing Period:</b> ${monthName}<br>
                                💵 <b>Total Amount Due:</b> Rs. ${currentAmount}<br>
                                ⏳ <b>Payment Deadline:</b> ${dueDate}
                            </div>
                            <p style="font-size: 0.85rem; color: #64748b;">Please login to your secure housing dashboard account to register payment confirmations.</p>
                        </div>`;
                    sendEmailNotification(res.email, `🔔 Maintenance Invoice Generated - ${monthName}`, emailHtml);

                    const inAppAlertText = `Your maintenance statement for ${monthName} (Amount: Rs. ${currentAmount}) has been generated. Due Date: ${dueDate}.`;
                    db.query("INSERT INTO resident_notifications (resident_id, text_alert) VALUES (?, ?)", [res.id, inAppAlertText]);
                }
                if (processed === residents.length && callback) callback(null, "Process complete.");
            });
        });
    });
}

app.post('/test-auto-billing', (req, res) => {
    generateAutoBills((err, msg) => { if (err) return res.status(500).json({ error: err }); res.json({ success: true, message: msg }); });
});

// Admin & Multi-portal Centralized Login Route
app.post('/admin-login', (req, res) => {
    const { username, password, portal_type } = req.body; 
    
    if (portal_type === 'resident') {
        db.query("SELECT id, name, house_no, email, phone_no, 'Resident' AS role FROM residents WHERE email = ? AND password = ?", [username, password], (err, result) => {
            if (err) return res.status(500).json(err);
            if (result.length > 0) res.json({ success: true, user: result[0], portal: 'resident' });
            else res.status(401).json({ success: false, message: "Invalid Resident account access parameters." });
        });
    }
    else {
        db.query("SELECT id, username, role FROM admins WHERE username = ? AND password = ?", [username, password], (err, result) => {
            if (err) return res.status(500).json(err);
            if (result.length > 0) {
                const user = result[0];
                const cleanRole = user.role.trim().toLowerCase();

                if (cleanRole === 'guard') {
                    res.json({ success: true, user: user, portal: 'guard' });
                } else if (cleanRole === 'manager' || cleanRole === 'superadmin') {
                    res.json({ success: true, user: user, portal: 'admin' });
                } else if (cleanRole === 'accountant') {
                    res.json({ success: true, user: user, portal: 'accountant' });
                } else {
                    res.json({ success: true, user: user, portal: 'staff' });
                }
            } else {
                res.status(401).json({ success: false, message: "Incorrect administration or staff database registry match." });
            }
        });
    }
});

// ========================================================
// 🔐 SECURITY OTP CORE LAYER GENERATION ROUTES
// ========================================================
app.post('/api/auth/forgot-password', (req, res) => {
    const { username, portal_type } = req.body; 
    let findQuery = "";
    if (portal_type === 'resident') {
        findQuery = "SELECT id, name, email, phone_no FROM residents WHERE email = ?";
    } else if (portal_type === 'staff') {
        findQuery = "SELECT id, name, email, phone_no FROM staff WHERE phone_no = ?";
    } else {
        return res.status(400).json({ success: false, message: "Invalid sub-portal boundary parameters." });
    }

    db.query(findQuery, [username], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ success: false, message: "Identity access parameter mismatch or not found." });
        }
        const user = result[0];
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        activeOTPSessionGrid[username] = {
            otp: generatedOTP,
            id: user.id,
            portal_type: portal_type,
            expires: Date.now() + 300000 
        };

        const waMsg = `🔐 *HMS Hub Verification Key*\n\nDear *${user.name}*,\nYour safety overhaul verification OTP token is:\n\n👉 *OTP CODE:* ${generatedOTP}\n\n⏱ nighttime parameters automatically expire in 5 minutes. Secure your identity.`;
        sendWhatsAppMessage(user.phone_no, waMsg);

        if (user.email) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: white; max-width: 450px; border-radius: 6px;">
                    <h3>🔐 HMS Hub System Password Overhaul</h3>
                    <p>An access validation handshake requested on your profile vector routing.</p>
                    <h2 style="color: #3b82f6; letter-spacing: 4px; text-align: center; background: rgba(255,255,255,0.02); padding: 10px; border: 1px dashed rgba(255,255,255,0.1);">${generatedOTP}</h2>
                    <p style="font-size: 0.8rem; color: #64748b;">Verification timeline frame drops inside 5 minutes sync loops.</p>
                </div>`;
            sendEmailNotification(user.email, "🔐 System Handshake Identity Validation Token", emailHtml);
        }
        res.json({ success: true });
    });
});

app.post('/api/auth/reset-password-commit', (req, res) => {
    const { username, otp_token, new_password } = req.body;
    const cacheToken = activeOTPSessionGrid[username];

    if (!cacheToken) return res.status(400).json({ success: false, message: "No validation logs initialized for this user sequence." });
    if (Date.now() > cacheToken.expires) { delete activeOTPSessionGrid[username]; return res.status(401).json({ success: false, message: "Handshake session validation timeout key." }); }
    if (cacheToken.otp !== otp_token.trim()) return res.status(401).json({ success: false, message: "Verification handshake failed: OTP token mismatch." });

    let updateQuery = cacheToken.portal_type === 'resident' ? 
        "UPDATE residents SET password = ? WHERE id = ?" : "UPDATE staff SET password = ? WHERE id = ?";

    db.query(updateQuery, [new_password, cacheToken.id], (err) => {
        if (err) return res.status(500).json(err);
        delete activeOTPSessionGrid[username];
        res.json({ success: true });
    });
});

app.get('/residents', (req, res) => {
    db.query("SELECT * FROM residents ORDER BY id DESC", (err, data) => { if (err) return res.status(500).json(err); res.json(data); });
});

// ========================================================
// 🧑‍🤝‍🧑 RESIDENT MANAGEMENT (VIEW, UPDATE, DELETE) - NEWLY ADDED
// ========================================================
app.get('/api/residents/:id', (req, res) => {
    db.query("SELECT * FROM residents WHERE id = ?", [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json({ error: "Resident not found" });
        res.json(data[0]);
    });
});

app.put('/api/residents/:id', (req, res) => {
    const residentId = req.params.id;
    const { name, house_no, phone_no, email, emergency_contact, monthly_bill } = req.body;
    
    const updateQuery = `
        UPDATE residents 
        SET name = ?, house_no = ?, phone_no = ?, email = ?, emergency_contact = ?, monthly_bill = ? 
        WHERE id = ?`;
        
    db.query(updateQuery, [name, house_no, phone_no, email, emergency_contact, monthly_bill, residentId], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Resident profile updated successfully." });
    });
});

app.delete('/api/residents/:id', (req, res) => {
    const residentId = req.params.id;
    db.query("DELETE FROM residents WHERE id = ?", [residentId], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Resident removed from the system." });
    });
});

// ========================================================
// 🎴 DUAL REGISTRY INSERTION Core System (Onboarding + RFID Sync Loop)
// ========================================================
app.post('/add-resident', upload.fields([{ name: 'cnicFront' }, { name: 'cnicBack' }]), (req, res) => {
    const { name, house_no, phone_no, email, password, cnic, address, emergency_contact, monthly_bill = 2500, rfid_uid } = req.body;
    
    const insertResidentQuery = `
        INSERT INTO residents (name, house_no, phone_no, email, password, cnic, address, emergency_contact, monthly_bill) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(insertResidentQuery, [name, house_no, phone_no, email, password || 'resident123', cnic, address, emergency_contact, monthly_bill], (err, result) => {
        if (err) {
            console.error("❌ Failed to create resident row node:", err.message);
            return res.status(500).json({ error: err.message });
        }
        
        const newResidentId = result.insertId;

        if (rfid_uid && rfid_uid.trim() !== "") {
            const insertCardQuery = `INSERT INTO resident_rfid_cards (resident_id, rfid_uid, status) VALUES (?, ?, 'Active')`;
            db.query(insertCardQuery, [newResidentId, rfid_uid.trim()], (cardErr) => {
                if (cardErr) console.error("⚠️ Background RFID allocation skipped safely:", cardErr.message);
            });
        }

        const welcomeMessage = `🎉 *Welcome to HMS Hub Network*\n\nDear *${name}*,\nYour residential profile allocation index for *${house_no}* has been verified and registered inside our management database.\n\n🔐 *Your App Access Portal Parameters:*\n*Username:* ${email}\n*Default Security Key:* resident123`;
        sendWhatsAppMessage(phone_no, welcomeMessage);
        
        const emailContent = `<div><h3>🎉 HMS Hub System: Welcome Onboard</h3><p>Dear <b>${name}</b>,</p><p>Your property profile registry created for <b>${house_no}</b>.</p><p><b>Username:</b> ${email}<br><b>Default Password:</b> resident123</p></div>`;
        sendEmailNotification(email, `🎉 Welcome Onboard! Property Profile Registry Created - ${house_no}`, emailContent);
        
        res.json({ success: true, message: "Identity logging allocation index created successfully." });
    });
});

// ✅ MANUAL VISITOR REGISTRY DISPATCH PIPELINE FOR SECURITY GUARD
app.post('/add-visitor', (req, res) => {
    const { visitor_name, phone_no, house_no, purpose } = req.body; 
    db.query("INSERT INTO visitors (visitor_name, phone_no, house_no, purpose) VALUES (?, ?, ?, ?)", [visitor_name, phone_no, house_no, purpose], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        // Track the resident mapped to that house destination node
        db.query("SELECT id, phone_no, email, name FROM residents WHERE house_no = ?", [house_no], (resErr, residents) => {
            if (!resErr && residents.length > 0) {
                const target = residents[0];
                
                sendWhatsAppMessage(target.phone_no, `🚪 *Gate Security Check Alert*\n\nDear *${target.name}*,\nA visitor named *${visitor_name}* (Phone: ${phone_no}) is at the main gate for *House No: ${house_no}*.\n\n*Purpose of Visit:* ${purpose}\n\n👉 Kindly verify with gate guards if entry is approved.`);
                
                const visitorEmailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 25px; background-color: #0f172a; color: #f8fafc; border-radius: 8px; max-width: 500px;">
                        <h3 style="color: #eab308; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">🚪 Gate Visitor Check Notification</h3>
                        <p>Dear Resident <b>${target.name}</b>,</p>
                        <p>A external guest has been checked into our perimeter desk referencing your house node.</p>
                        <div style="background: rgba(255,255,255,0.03); padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 15px 0;">
                            👤 <b>Visitor Name:</b> ${visitor_name}<br>
                            📞 <b>Contact Number:</b> ${phone_no}<br>
                            🔧 <b>Stated Purpose:</b> ${purpose}
                        </div>
                        <p style="font-size: 0.8rem; color: #64748b; margin-top: 20px;">HMS Hub Perimeter Guard Desk Infrastructure Module.</p>
                    </div>`;
                sendEmailNotification(target.email, "🚪 Real-time Gate Visitor Registry Log Notification", visitorEmailHtml);
                
                const alertText = `Visitor ${visitor_name} arrived at gate parameter for House ${house_no}.`;
                db.query("INSERT INTO resident_notifications (resident_id, text_alert) VALUES (?, ?)", [target.id, alertText]);
            }
        });
        res.json({ success: true, message: "Visitor record appended successfully." });
    });
});

app.post('/api/visitor/mark-exit', (req, res) => {
    const { log_id } = req.body;
    db.query("UPDATE visitors SET exit_time = CURRENT_TIMESTAMP WHERE id = ?", [log_id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.get('/visitors-log', (req, res) => { db.query("SELECT * FROM visitors ORDER BY entry_time DESC", (err, data) => { if (err) return res.status(500).json(err); res.json(data); }); });
app.get('/all-bills', (req, res) => { db.query("SELECT bills.*, residents.name, residents.house_no FROM bills JOIN residents ON bills.resident_id = residents.id ORDER BY bills.bill_id DESC", (err, data) => { if (err) return res.status(500).json(err); res.json(data); }); });

app.post('/api/billing/collect-cash', (req, res) => {
    const { bill_id } = req.body;
    db.query("UPDATE bills SET payment_status = 'Paid' WHERE bill_id = ?", [bill_id], (err) => { if (err) return res.status(500).json(err); res.json({ success: true }); });
});

app.post('/api/billing/generate-manual', (req, res) => {
    const { resident_id, amount, bill_month, due_date } = req.body;

    if (!resident_id || !amount || !bill_month || !due_date) {
        return res.status(400).json({ success: false, error: "Required individual billing dynamic parameters missing." });
    }

    db.query("SELECT name, phone_no, email FROM residents WHERE id = ?", [resident_id], (err, residentRes) => {
        if (err || residentRes.length === 0) {
            return res.status(404).json({ success: false, error: "Target resident account node profile mismatch." });
        }
        const targetResident = residentRes[0];

        const insertBillQuery = `INSERT INTO bills (resident_id, amount, bill_month, due_date, payment_status) VALUES (?, ?, ?, ?, 'Unpaid')`;
        db.query(insertBillQuery, [resident_id, amount, bill_month, due_date], (billErr) => {
            if (billErr) return res.status(500).json({ success: false, error: billErr.message });

            const waMessage = `🔔 *HMS Hub Manual Invoice Alert*\n\nDear *${targetResident.name}*,\nA manual maintenance invoice has been generated for *${bill_month}*.\n\n*Amount Due:* Rs. ${amount}\n*Due Date:* ${due_date}\n\n👉 Kindly login to your secure Resident Portal to review outstanding statements.`;
            sendWhatsAppMessage(targetResident.phone_no, waMessage);

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 25px; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
                    <h2 style="color: #3b82f6; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">HMS Hub: Manual Invoice Created</h2>
                    <p>Dear Resident <b>${targetResident.name}</b>,</p>
                    <div style="background: rgba(255,255,255,0.03); border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        📅 <b>Billing Month:</b> ${bill_month}<br>
                        💵 <b>Invoice Amount:</b> Rs. ${amount}<br>
                        ⏳ <b>Payment Due Date:</b> ${due_date}
                    </div>
                </div>`;
            sendEmailNotification(targetResident.email, `🔔 Manual Invoice Posted - ${bill_month}`, emailHtml);

            db.query("INSERT INTO resident_notifications (resident_id, text_alert) VALUES (?, ?)", [resident_id, `Manual invoice for ${bill_month} (Amount: Rs. ${amount}) posted. Due Date: ${due_date}.`]);
            
            res.json({ success: true, message: "Manual invoice generated safely." });
        });
    });
});

app.get('/api/staff', (req, res) => { 
    db.query("SELECT id, username, role, phone_no, email, created_at FROM admins WHERE role NOT IN ('SuperAdmin', 'Manager') ORDER BY id DESC", (err, data) => { 
        if (err) return res.status(500).json(err);
        res.json(data); 
    }); 
});

app.get('/api/expenses', (req, res) => { db.query("SELECT * FROM expenses ORDER BY expense_date DESC", (err, data) => { if (err) return res.status(500).json(err); res.json(data); }); });
app.post('/api/expenses', (req, res) => { const { title, amount, category = 'General' } = req.body; db.query("INSERT INTO expenses (title, amount, category) VALUES (?, ?, ?)", [title, amount, category], (err) => { if (err) return res.status(500).json(err); res.json({ success: true }); }); });

app.get('/api/complaints', (req, res) => {
    const queryStr = `SELECT complaints.*, residents.name AS resident_name FROM complaints JOIN residents ON complaints.resident_id = residents.id ORDER BY complaints.id DESC`;
    db.query(queryStr, (err, data) => { if (err) return res.status(500).json(err); res.json(data); });
});

app.post('/api/complaints/assign', (req, res) => {
    const { complaint_id, staff_id } = req.body;

    if (!complaint_id || !staff_id) {
        return res.status(400).json({ error: "Required tracking target identifiers are missing." });
    }

    db.query("SELECT * FROM admins WHERE id = ?", [staff_id], (adminErr, adminRes) => {
        if (adminErr || adminRes.length === 0) {
            return res.status(500).json({ error: "Target technical staff profile node not verified." });
        }
        
        const targetStaff = adminRes[0];

        db.query("SELECT * FROM complaints WHERE id = ?", [complaint_id], (compErr, compRes) => {
            if (compErr || compRes.length === 0) {
                return res.status(500).json({ error: "Complaint ticket mismatch or invalid reference tracker." });
            }
            
            const complaint = compRes[0];

            db.query("UPDATE complaints SET status = 'Assigned', assigned_staff_id = ? WHERE id = ?", [staff_id, complaint_id], (updateErr) => {
                if (updateErr) {
                    console.error("❌ Complaints Assignment Query Error:", updateErr.message);
                    return res.status(500).json({ error: "Database state execution failure." });
                }

                db.query("SET SQL_SAFE_UPDATES = 0", (safeErr) => {
                    db.query("UPDATE staff SET status = 'Busy' WHERE name = ?", [targetStaff.username], (staffUpErr) => {
                        if (staffUpErr) console.error("⚠️ Secondary sync block safely bypassed: ", staffUpErr.message);
                    });
                });

                if (targetStaff.phone_no) {
                    const staffAlertMessage = `🛠️ *HMS Hub Job Assignment Alert*\n\nDear *${targetStaff.username}*,\nYou have been assigned a task:\n\n📍 *Location:* House ${complaint.house_no}\n🔧 *Job:* ${complaint.title}\n📝 *Details:* ${complaint.description}`;
                    sendWhatsAppMessage(targetStaff.phone_no, staffAlertMessage);
                }

                res.json({ success: true });
            });
        });
    });
});

// ====================================================================
// 🚪 SMART TOGGLE ENTRY/EXIT LOGIC (RFID & QR CODE)
// ====================================================================

app.post('/api/rfid/log-tap', (req, res) => {
    const { rfid_uid } = req.body;

    if (!rfid_uid) return res.status(400).json({ success: false, error: "Missing RFID UID" });

    // 1. Resident aur card verify karo
    const checkCardQuery = `
        SELECT cards.*, residents.name AS resident_name, residents.house_no, residents.phone_no 
        FROM resident_rfid_cards cards 
        JOIN residents ON cards.resident_id = residents.id 
        WHERE cards.rfid_uid = ? AND cards.status = 'Active'`;

    db.query(checkCardQuery, [rfid_uid], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ success: false, error: "Resident not found" });

        const resident = result[0];

        // 2. Check karo ke kya banda abhi andar hai? (Jo record 'Entry' wala ho aur uska 'exit_time' NULL ho)
        const checkActiveLog = `SELECT id FROM visitors \
                                WHERE visitor_name = ? \
                                AND exit_time IS NULL \
                                ORDER BY entry_time DESC LIMIT 1`;

        db.query(checkActiveLog, [`Resident: ${resident.resident_name}`], (logErr, logRes) => {
            if (!logErr && logRes.length > 0) {
                // AGAR RECORD MILA: Iska matlab banda 'Exit' kar raha hai
                const log_id = logRes[0].id;

                // Exit time update karo
                db.query("UPDATE visitors SET exit_time = CURRENT_TIMESTAMP WHERE id = ?", [log_id], (updErr) => {
                    if (updErr) return res.status(500).json({ success: false, error: updErr.message });

                    db.query("INSERT INTO resident_logs (resident_id, log_type, verification_method) VALUES (?, 'Exit', 'RFID_Card')", [resident.resident_id], (insertErr) => {
                        if (insertErr) return res.status(500).json({ success: false, error: insertErr.message });

                        res.json({ success: true, direction: "Exit", message: "Exit Marked Successfully" });
                    });
                });

            } else {
                // AGAR RECORD NAHI MILA: Iska matlab banda 'Entry' kar raha hai
                db.query("INSERT INTO visitors (visitor_name, phone_no, house_no, purpose) VALUES (?, ?, ?, 'RFID Auto-Entry')",
                [`Resident: ${resident.resident_name}`, resident.phone_no, resident.house_no], (insErr) => {
                    if (insErr) return res.status(500).json({ success: false, error: insErr.message });

                    db.query("INSERT INTO resident_logs (resident_id, log_type, verification_method) VALUES (?, 'Entry', 'RFID_Card')", [resident.resident_id], (insertErr) => {
                        if (insertErr) return res.status(500).json({ success: false, error: insertErr.message });

                        res.json({ success: true, direction: "Entry", message: "Entry Marked Successfully" });
                    });
                });
            }
        });
    });
});

app.post('/api/qr/verify-tap', (req, res) => {
    const { qr_token } = req.body;

    if (!qr_token) {
        return res.status(400).json({ success: false, error: "QR payload validation parameters missing." });
    }

    try {
        const tokenParts = qr_token.split('|');
        if (tokenParts.length !== 2) {
            return res.status(400).json({ success: false, error: "Security Exception: Malformed QR pattern token envelope." });
        }

        const residentSeed = tokenParts[0];
        const generatedTime = parseInt(tokenParts[1], 10);
        
        if (Date.now() - generatedTime > 60000) {
            return res.status(401).json({ success: false, error: "Access Denied: Dynamic validation token expired. Refresh dashboard." });
        }

        db.query("SELECT id, name, house_no, phone_no FROM residents WHERE email = ? OR phone_no = ?", [residentSeed, residentSeed], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: `Database Lookup Error: ${err.message}` });
            if (result.length === 0) {
                return res.status(404).json({ success: false, error: "Verification Failed: Resident identity profile not matching." });
            }

            const residentMatch = result[0];

            const lastLogQuery = "SELECT log_type FROM resident_logs WHERE resident_id = ? ORDER BY id DESC LIMIT 1";
            
            db.query(lastLogQuery, [residentMatch.id], (lastLogErr, lastLogRes) => {
                let calculatedDirection = 'Entry';
                
                if (!lastLogErr && lastLogRes.length > 0) {
                    calculatedDirection = (lastLogRes[0].log_type === 'Entry') ? 'Exit' : 'Entry';
                }

                db.query("INSERT INTO resident_logs (resident_id, log_type, verification_method) VALUES (?, ?, 'QR_Code')", 
                [residentMatch.id, calculatedDirection], (insertErr) => {
                    if (insertErr) return res.status(500).json({ success: false, error: `Table resident_logs write failure: ${insertErr.message}` });
                    
                    const parsedUniformLogText = `Resident: ${residentMatch.name} (${calculatedDirection})`;
                    db.query("INSERT INTO visitors (visitor_name, phone_no, house_no, purpose) VALUES (?, ?, ?, ?)",
                    [parsedUniformLogText, residentMatch.phone_no, residentMatch.house_no, `QR Auto-${calculatedDirection}`], (syncErr) => {
                        if (syncErr) return res.status(500).json({ success: false, error: `Table visitors sync failure: ${syncErr.message}` });
                        
                        res.json({ 
                            success: true, 
                            resident_name: residentMatch.name, 
                            house_no: residentMatch.house_no, 
                            direction: calculatedDirection 
                        });
                    });
                });
            });
        });
    } catch (ex) {
        return res.status(500).json({ success: false, error: `Failed to read digital credential token packets: ${ex.message}` });
    }
});

// ========================================================
// 📊 CENTRALIZED ANALYTICS ENGINE: WITH ENGINE AUTO-FALLBACK
// ========================================================
app.get('/api/dashboard/stats', (req, res) => {
    const queries = {
        residents: "SELECT COUNT(*) AS total FROM residents",
        pendingBills: "SELECT IFNULL(SUM(amount), 0) AS total FROM bills WHERE payment_status = 'Unpaid'",
        todayVisitors: "SELECT COUNT(*) AS total FROM visitors WHERE DATE(entry_time) = CURRENT_DATE()",
        totalRevenue: "SELECT IFNULL(SUM(amount), 0) AS total FROM bills WHERE payment_status = 'Paid'",
        totalExpenses: "SELECT IFNULL(SUM(amount), 0) AS total FROM expenses",
        pendingComplaints: "SELECT COUNT(*) AS total FROM complaints WHERE status != 'Resolved'",
        resolvedComplaints: "SELECT COUNT(*) AS total FROM complaints WHERE status = 'Resolved'"
    };

    db.query(queries.residents, (err1, res1) => {
        db.query(queries.pendingBills, (err2, res2) => {
            db.query(queries.todayVisitors, (err3, res3) => {
                db.query(queries.totalRevenue, (err4, res4) => {
                    db.query(queries.totalExpenses, (err5, res5) => {
                        db.query(queries.pendingComplaints, (err6, res6) => {
                            db.query(queries.resolvedComplaints, (err7, res7) => {
                                if (err1 || err2 || err3 || err4 || err5 || err6 || err7) {
                                    return res.status(500).json({ error: "Analytics grid timeout" });
                                }

                                const revenue = parseFloat(res4[0].total);
                                const expenses = parseFloat(res5[0].total);
                                const profitOrLoss = revenue - expenses;

                                const trendQuery = `
                                    SELECT bill_month AS month, SUM(amount) AS collected 
                                    FROM bills WHERE payment_status = 'Paid' 
                                    GROUP BY bill_month ORDER BY id DESC LIMIT 6`;

                                db.query(trendQuery, (trendErr, trendRows) => {
                                    let monthsLabels = [];
                                    let collectionData = [];
                                    
                                    if (!trendErr && trendRows.length > 0) {
                                        trendRows.forEach(row => {
                                            monthsLabels.push(row.month);
                                            collectionData.push(parseFloat(row.collected));
                                        });
                                    } else {
                                        const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
                                        monthsLabels = [currentMonthName];
                                        collectionData = [revenue > 0 ? revenue : 0]; 
                                    }

                                    res.json({
                                        totalResidents: res1[0].total || 0,
                                        pendingBillsSum: res2[0].total || 0,
                                        todayVisitorsCount: res3[0].total || 0,
                                        totalRevenue: revenue,
                                        totalExpenses: expenses,
                                        netFinancialState: profitOrLoss,
                                        complaintsPending: res6[0].total || 0,
                                        complaintsResolved: res7[0].total || 0,
                                        chartLabels: monthsLabels,
                                        chartCollections: collectionData
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/reports/visitors', (req, res) => {
    const { month, year } = req.query; // e.g., /api/reports/visitors?month=06&year=2026
    const query = `SELECT * FROM visitors WHERE MONTH(entry_time) = ? AND YEAR(entry_time) = ?`;
    db.query(query, [month, year], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// ====================================================================
// 🎴 ADVANCED RFID CARD MANAGEMENT CONTROL MATRIX (ADMIN ROUTINES)
// ====================================================================
app.get('/api/admin/rfid-cards', (req, res) => {
    const fetchCardsQuery = `
        SELECT cards.*, residents.name AS resident_name, residents.house_no 
        FROM resident_rfid_cards cards
        JOIN residents ON cards.resident_id = residents.id 
        ORDER BY cards.id DESC`;

    db.query(fetchCardsQuery, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post('/api/admin/rfid/assign', (req, res) => {
    const { resident_id, rfid_uid } = req.body;
    if (!resident_id || !rfid_uid) return res.status(400).json({ error: "Missing required values." });

    const insertCardQuery = `
        INSERT INTO resident_rfid_cards (resident_id, rfid_uid, status) 
        VALUES (?, ?, 'Active') 
        ON DUPLICATE KEY UPDATE resident_id = ?, status = 'Active'`;

    db.query(insertCardQuery, [resident_id, rfid_uid.trim(), resident_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/admin/rfid/update-status', (req, res) => {
    const { card_id, action_status } = req.body;
    if (!card_id || !action_status) return res.status(400).json({ error: "Missing inputs." });

    if (action_status === 'Delete') {
        db.query("DELETE FROM resident_rfid_cards WHERE id = ?", [card_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    } else {
        db.query("UPDATE resident_rfid_cards SET status = ? WHERE id = ?", [action_status, card_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    }
});

// ========================================================
// 🔐 SUBSYSTEM CREATION OTP VERIFICATION HANDSHAKE ROUTERS
// ========================================================
app.get('/api/admin/roles', (req, res) => { 
    db.query("SELECT id, username, role, created_at FROM admins WHERE role != 'SuperAdmin' ORDER BY id DESC", (err, data) => { 
        if (err) return res.status(500).json(err); 
        res.json(data); 
    }); 
});

app.post('/api/admin/roles/initiate', (req, res) => {
    const { username, password, role, phone_no, email } = req.body;
    
    if(!username || !password || !role || !phone_no || !email) {
        return res.status(400).json({ success: false, error: "Verification required parameters are missing." });
    }

    db.query("SELECT id FROM admins WHERE username = ?", [username], (err, row) => {
        if (err) return res.status(500).json(err);
        if (row.length > 0) return res.status(400).json({ success: false, error: "Username already allocated." });

        const registrationOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const secureKey = username.trim().toLowerCase();
        
        activeRoleCreationSessions[secureKey] = {
            username: username.trim(), password, role, phone_no, email,
            otp: registrationOTP, expires: Date.now() + 600000 
        };

        const waTemplate = `🔐 *HMS Hub Access Creation Request*\n\nAdmin setup profile verification initiated for user:\n👤 *Username:* ${username}\n⚡ *Designation:* ${role}\n\n👉 *OTP VERIFICATION CODE:* ${registrationOTP}\n\n⏱ Expiry set to 10 minutes framework loop.`;
        sendWhatsAppMessage(phone_no, waTemplate);

        const emailTemplate = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: white; max-width: 450px; border-radius: 6px;">
                <h3 style="color:#3b82f6; margin-top:0;">🔐 System Privilege Node Verification</h3>
                <p>Enter the below authorization dynamic validation token inside settings container form:</p>
                <h2 style="color:#10b981; letter-spacing:4px; text-align:center; background:rgba(255,255,255,0.01); padding:10px; border:1px dashed rgba(255,255,255,0.08);">${registrationOTP}</h2>
            </div>`;
        sendEmailNotification(email, "🔐 Sub-Admin Creation Handshake Validation Token", emailTemplate);

        res.json({ success: true });
    });
});

app.post('/api/admin/roles/confirm', (req, res) => {
    const { username, otp_token } = req.body;
    const cleanUsername = username ? username.trim().toLowerCase() : "";
    const cacheContext = activeRoleCreationSessions[cleanUsername];

    if (!cacheContext) return res.status(400).json({ error: "No activation profile matching tracking logs found." });
    if (Date.now() > cacheContext.expires) { delete activeRoleCreationSessions[cleanUsername]; return res.status(401).json({ error: "OTP verification signature handshake timeout." }); }
    
    if (cacheContext.otp.trim() !== otp_token.trim()) return res.status(401).json({ error: "Validation mismatch token rejection: Incorrect OTP." });

    db.query("INSERT INTO admins (username, password, role, phone_no, email) VALUES (?, ?, ?, ?, ?)", 
    [cacheContext.username, cacheContext.password, cacheContext.role, cacheContext.phone_no, cacheContext.email], (err, insertResult) => {
        if (err) {
            console.error("❌ Main Admins Insertion Failure:", err.message);
            return res.status(500).json({ error: "Database error during administrator role initialization." });
        }

        if (cacheContext.role !== 'Manager') {
            db.query("INSERT INTO staff (name, position, phone_no, status, email, password) VALUES (?, ?, ?, 'Available', ?, ?)", 
            [cacheContext.username, cacheContext.role, cacheContext.phone_no, cacheContext.email, cacheContext.password], (staffErr) => {
                if(staffErr) console.error("⚠️ Sync matrix creation failure:", staffErr.message);
            });
        }

        delete activeRoleCreationSessions[cleanUsername];
        res.json({ success: true });
    });
});

app.put('/api/staff/update/:id', (req, res) => {
    const adminId = req.params.id;
    const { username, role, phone_no, email } = req.body;

    db.query("UPDATE admins SET username = ?, role = ?, phone_no = ?, email = ? WHERE id = ?", [username, role, phone_no, email, adminId], (updateErr) => {
        if (updateErr) return res.status(500).json(updateErr);
        res.json({ success: true });
    });
});

app.delete('/api/staff/delete/:id', (req, res) => {
    const adminId = req.params.id;

    db.query("DELETE FROM admins WHERE id = ?", [adminId], (delErr) => {
        if (delErr) return res.status(500).json(delErr);
        res.json({ success: true });
    });
});

// ========================================================
// 🛠️ STAFF DASHBOARD ROUTES (MISSING ROUTES ADDED)
// ========================================================

app.get('/api/staff/tasks/:staff_id', (req, res) => { 
    const staffId = req.params.staff_id;
    db.query("SELECT * FROM complaints WHERE assigned_staff_id = ? AND status = 'Assigned' ORDER BY id DESC", [staffId], (err, data) => { 
        if (err) return res.status(500).json(err);
        res.json(data); 
    }); 
});

app.post('/api/staff/task-complete', (req, res) => {
    const { complaint_id, staff_id } = req.body;
    db.query("UPDATE complaints SET status = 'Resolved' WHERE id = ?", [complaint_id], (err) => { 
        if (err) return res.status(500).json(err);
        
        db.query("UPDATE staff SET status = 'Available' WHERE id = ?", [staff_id], (updateErr) => {
            if (updateErr) console.log("Minor sync error ignored:", updateErr.message);
        });
        
        res.json({ success: true }); 
    });
});

// 1. Submit Complaint from Resident Dashboard
app.post('/api/resident/submit-complaint', (req, res) => {
    const { resident_id, house_no, title, description } = req.body;
    db.query("INSERT INTO complaints (resident_id, house_no, title, description, status) VALUES (?, ?, ?, ?, 'Pending')", 
    [resident_id, house_no, title, description], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Push notification to admin
        const adminAlertText = `⚠️ New Complaint filed by House ${house_no || "N/A"}: "${title}"`;
        db.query("INSERT INTO admin_notifications (text_alert) VALUES (?)", [adminAlertText], (notifErr) => {
            res.json({ success: true });
        });
    });
});

// 2. Fetch Resident Dashboard Metrics
app.get('/api/resident/dashboard/:resident_id', (req, res) => {
    const residentId = req.params.resident_id;
    db.query("SELECT (SELECT IFNULL(SUM(amount), 0) FROM bills WHERE resident_id = ? AND payment_status = 'Unpaid') AS pending_bill, house_no FROM residents WHERE id = ?", [residentId, residentId], (err, statsRes) => {
        if (err || statsRes.length === 0) return res.status(500).json({ error: "Resident not found." });
        
        const houseNo = statsRes[0].house_no;
        db.query("SELECT * FROM visitors WHERE house_no = ? ORDER BY entry_time DESC", [houseNo], (visErr, visitors) => {
            db.query("SELECT * FROM resident_notifications WHERE resident_id = ? ORDER BY id DESC", [residentId], (notifErr, alerts) => {
                res.json({ pendingDues: statsRes[0].pending_bill, visitorHistory: visitors || [], dashboardAlerts: alerts || [] });
            });
        });
    });
});

// Admin API to get notifications
app.get('/api/admin/notifications', (req, res) => {
    db.query("SELECT * FROM admin_notifications ORDER BY id DESC LIMIT 10", (err, data) => {
        if (err) return res.status(500).json(err);
        db.query("SELECT COUNT(*) AS count FROM admin_notifications WHERE is_read = 0", (countErr, countRes) => {
            res.json({ list: data || [], unreadCount: countRes ? (countRes[0].count || 0) : 0 });
        });
    });
});

// Admin API to clear notifications
app.post('/api/admin/notifications/mark-read', (req, res) => {
    db.query("UPDATE admin_notifications SET is_read = 1", (err) => {
        res.json({ success: true });
    });
});

// ========================================================
// FRONTEND NAVIGATION LAYOUT INDEX PATH ROUTINGS LOCKS
// ========================================================
app.get('/html/guard-dashboard.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'guard-dashboard.html')); });
app.get('/html/dashboard.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html')); });
app.get('/html/residents.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'residents.html')); });
app.get('/html/billing.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'billing.html')); });
app.get('/html/expenses.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'expenses.html')); });
app.get('/html/complaints.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'complaints.html')); });
app.get('/html/staff.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'staff.html')); });
app.get('/html/settings.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'settings.html')); });
app.get('/html/visitors-log.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'visitors-log.html')); });
app.get('/html/add-resident.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'add-resident.html')); });
app.get('/html/add-visitor.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'add-visitor.html')); });
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'html', 'login.html')); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`🚀 API backend active on port: ${PORT}`); });