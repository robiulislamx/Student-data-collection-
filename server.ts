import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DatabaseState, StudentSubmission, DynamicField, ApprovalLog, NotificationLog, AuditLog, GoogleSheetRow } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11).toUpperCase();

// Seed data
const initialSeedData: DatabaseState = {
  submissions: [
    {
      id: "S001",
      student_id: "202611024",
      full_name: "Mahmudur Rahman Sifat",
      fathers_name: "Ataur Rahman",
      mothers_name: "Sultana Begum",
      gender: "Male",
      dob: "2003-08-14",
      blood_group: "A+",
      nationality: "Bangladeshi",
      institution: "Dhaka University",
      institution_type: "University",
      division: "Dhaka",
      department: "Computer Science & Engineering",
      session: "2021-22",
      semester: "6th Semester",
      roll_number: "24",
      registration_number: "182749502",
      mobile: "+8801712345678",
      alt_mobile: "+8801512345678",
      email: "mahmudur.sifat@du.ac.bd",
      present_address: "Room 304, Salimullah Muslim Hall, University of Dhaka, Dhaka-1000",
      permanent_address: "Village: Ghorashal, P.O: Ghorashal, Narsingdi",
      profile_picture: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&fit=crop&q=80",
      guardian_info: "Ataur Rahman (Father) - Businessman",
      emergency_contact: "Mother (Sultana Begum) - +8801912345678",
      custom_fields: {
        "ext_shift": "Day",
        "ext_extracurricular": "Robotics Society"
      },
      status: "Approved",
      created_at: "2026-06-01T09:15:00Z",
      updated_at: "2026-06-01T09:30:00Z"
    },
    {
      id: "S002",
      student_id: "202611099",
      full_name: "Anika Tasnim",
      fathers_name: "Fazlul Haque",
      mothers_name: "Rehana Parvin",
      gender: "Female",
      dob: "2004-02-21",
      blood_group: "O+",
      nationality: "Bangladeshi",
      institution: "Dhaka College",
      institution_type: "College",
      division: "Dhaka",
      department: "Science",
      session: "2022-23",
      semester: "4th Semester",
      roll_number: "105",
      registration_number: "1923485012",
      mobile: "+8801812345679",
      alt_mobile: "",
      email: "anika.tasnim@outlook.com",
      present_address: "Block-D, Lalmatia, Dhaka",
      permanent_address: "Mymensingh Sadar, Mymensingh",
      profile_picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop&q=80",
      guardian_info: "Fazlul Haque (Father) - Government Employee",
      emergency_contact: "Fazlul Haque - +8801812345679",
      custom_fields: {
        "ext_shift": "Morning",
        "ext_extracurricular": "Debate Club"
      },
      status: "Pending",
      created_at: "2026-06-02T04:10:00Z",
      updated_at: "2026-06-02T04:10:00Z"
    },
    {
      id: "S003",
      student_id: "202622340",
      full_name: "Mashrafe Mortaza",
      fathers_name: "Golam Mortaza",
      mothers_name: "Hamida Begum",
      gender: "Male",
      dob: "2002-11-10",
      blood_group: "B+",
      nationality: "Bangladeshi",
      institution: "Bangladesh University of Engineering and Technology",
      institution_type: "University",
      division: "Dhaka",
      department: "Electrical & Electronic Engineering (EEE)",
      session: "2020-21",
      semester: "8th Semester",
      roll_number: "45",
      registration_number: "1720859402",
      mobile: "+8801912345680",
      alt_mobile: "+8801312345680",
      email: "mashrafe.eee@buet.ac.bd",
      present_address: "Ahsanullah Hall, BUET, Dhaka",
      permanent_address: "Narail Sadar, Narail",
      profile_picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80",
      guardian_info: "Golam Mortaza (Father)",
      emergency_contact: "Ahsanullah Hall Provost - +88029665650",
      custom_fields: {
        "ext_shift": "Day",
        "ext_extracurricular": "Sports"
      },
      status: "Rejected",
      rejection_reason: "Provide a clearer profile picture and fix the registration number typo.",
      created_at: "2026-06-01T12:00:00Z",
      updated_at: "2026-06-01T14:45:00Z"
    },
    {
      id: "S004",
      student_id: "202634057",
      full_name: "Farhana Yasmin",
      fathers_name: "Abdul Latif",
      mothers_name: "Jesmin Ara",
      gender: "Female",
      dob: "2003-05-12",
      blood_group: "AB-",
      nationality: "Bangladeshi",
      institution: "Dhaka Mohila Polytechnic Institute",
      institution_type: "Polytechnic",
      division: "Dhaka",
      department: "Computer Technology",
      session: "2021-22",
      semester: "6th Semester",
      roll_number: "2091",
      registration_number: "1502930491",
      mobile: "+8801312345681",
      alt_mobile: "",
      email: "farhana.yasmin@gmail.com",
      present_address: "Sher-e-Bangla Nagar, Dhaka",
      permanent_address: "Saturia, Manikganj",
      profile_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&fit=crop&q=80",
      guardian_info: "Abdul Latif (Father) - Farmer",
      emergency_contact: "Abdul Latif - +8801512345681",
      custom_fields: {
        "ext_shift": "Day",
        "ext_extracurricular": "None"
      },
      status: "Pending",
      created_at: "2026-06-02T08:30:00Z",
      updated_at: "2026-06-02T08:30:00Z"
    },
    {
      id: "S005",
      student_id: "202678512",
      full_name: "Abdur Rahman",
      fathers_name: "Saidur Rahman",
      mothers_name: "Fatema Khatun",
      gender: "Male",
      dob: "2005-01-05",
      blood_group: "O-",
      nationality: "Bangladeshi",
      institution: "Jamatul Falah Madrasa",
      institution_type: "Madrasa",
      division: "Chittagong",
      department: "Kamil (Hadith)",
      session: "2023-24",
      semester: "2nd Semester",
      roll_number: "12",
      registration_number: "1620593849",
      mobile: "+8801512345682",
      alt_mobile: "",
      email: "abdur.rahman@madrasa-edu.com",
      present_address: "Shahi Jame Masjid Hostel, Chittagong",
      permanent_address: "Feni Sadar, Feni",
      profile_picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop&q=80",
      guardian_info: "Saidur Rahman (Father) - Imam",
      emergency_contact: "Saidur Rahman - +8801512345682",
      custom_fields: {
        "ext_shift": "Morning",
        "ext_extracurricular": "None"
      },
      status: "Approved",
      created_at: "2026-05-30T10:00:00Z",
      updated_at: "2026-05-30T16:20:00Z"
    }
  ],
  dynamic_fields: [
    {
      id: "DF1",
      name: "ext_shift",
      label: "Shift Preferences",
      type: "radio",
      required: true,
      options: ["Morning", "Day"],
      category: "academic",
      placeholder: "Select your preferred academic shift"
    },
    {
      id: "DF2",
      name: "ext_extracurricular",
      label: "Primary Extracurricular Activities",
      type: "dropdown",
      required: false,
      options: ["None", "Sports", "Debate Club", "Robotics Society", "Cultural Club"],
      category: "additional",
      placeholder: "Choose your primary group"
    }
  ],
  logs: [
    {
      id: "L1",
      action: "Database Initialized",
      actor: "System Kernel",
      timestamp: "2026-06-02T13:22:00Z",
      details: "Database seed records successfully generated for Bangladesh region schools."
    },
    {
      id: "L2",
      action: "Google Sheet Configuration Set",
      actor: "Security Master",
      timestamp: "2026-06-02T13:22:15Z",
      details: "Simulated bidirectional sync configured targeting spreadsheet: SIMS_Sheet_2026."
    }
  ],
  notifications: [
    {
      id: "N1",
      recipient_email: "allisonburgee@gmail.com",
      subject: "SIMS Admin Alert: New submission from Mahmudur Rahman Sifat",
      body: "Name: Mahmudur Rahman Sifat\nID: 202611024\nInstitution: Dhaka University\nMobile: +8801712345678\nEmail: mahmudur.sifat@du.ac.bd",
      type: "AdminAlert",
      status: "sent",
      timestamp: "2026-06-01T09:15:10Z"
    },
    {
      id: "N2",
      recipient_email: "mahmudur.sifat@du.ac.bd",
      subject: "SIMS Student Profile Approved",
      body: "Dear Mahmudur Rahman Sifat, your Student Profile with ID 202611024 has been Approved on 2026-06-01 by Admin.\nWelcome message: Your profile is synchronized fully with college rosters and Google Sheets.",
      type: "StudentApproval",
      status: "sent",
      timestamp: "2026-06-01T09:30:15Z"
    }
  ],
  approval_logs: [
    {
      id: "AL1",
      student_id: "202611024",
      student_name: "Mahmudur Rahman Sifat",
      action: "Approve",
      admin_email: "allisonburgee@gmail.com",
      timestamp: "2026-06-01T09:30:00Z"
    },
    {
      id: "AL2",
      student_id: "202622340",
      student_name: "Mashrafe Mortaza",
      action: "Reject",
      reason: "Provide a clearer profile picture and fix the registration number typo.",
      admin_email: "allisonburgee@gmail.com",
      timestamp: "2026-06-01T14:45:00Z"
    }
  ],
  sheet_rows: [
    {
      student_id: "202611024",
      full_name: "Mahmudur Rahman Sifat",
      institution: "Dhaka University",
      department: "Computer Science & Engineering",
      email: "mahmudur.sifat@du.ac.bd",
      mobile: "+8801712345678",
      status: "Approved",
      synced_at: "2026-06-01T09:30:00Z"
    },
    {
      student_id: "202678512",
      full_name: "Abdur Rahman",
      institution: "Jamatul Falah Madrasa",
      department: "Kamil (Hadith)",
      email: "abdur.rahman@madrasa-edu.com",
      mobile: "+8801512345682",
      status: "Approved",
      synced_at: "2026-05-30T16:20:00Z"
    }
  ],
  settings: {
    sheet_url: "https://docs.google.com/spreadsheets/d/1_SIMS_OFFICIAL_STUDENTS_SHEET_REAL_TIME_SYNC/edit",
    sheet_sync_enabled: true,
    auto_email_alerts: true,
    admin_notify_email: "allisonburgee@gmail.com"
  }
};

// Database helper operations
async function getDB(): Promise<DatabaseState> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify(initialSeedData, null, 2));
      return initialSeedData;
    }
  } catch (err) {
    console.error("Failed to read database state", err);
    return initialSeedData;
  }
}

async function writeDB(state: DatabaseState): Promise<void> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to write database state", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/db', async (_req, res) => {
    try {
      const db = await getDB();
      res.json(db);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // STUDENT REGISTRATION (with Duplicate Prevention System)
  app.post('/api/register', async (req, res) => {
    try {
      const db = await getDB();
      const submission: Omit<StudentSubmission, 'id' | 'status' | 'created_at' | 'updated_at'> & { bot_token?: string, math_answer?: number } = req.body;

      if (!submission.student_id || !submission.email || !submission.mobile || !submission.full_name) {
        return res.status(400).json({ error: "Missing required core registration fields." });
      }

      // Spam/Bot protection check
      if (submission.bot_token === "ROBOT_SPAM") {
        return res.status(403).json({ error: "Bot activity identified. Threat mitigation shields active." });
      }

      // STRICT MULTI-KEY DUPLICATE DETECTION LOGIC
      // IF StudentID EXISTS OR Email EXISTS OR Mobile EXISTS THEN Reject Submission
      const normalizedStudentId = submission.student_id.trim();
      const normalizedEmail = submission.email.trim().toLowerCase();
      const normalizedMobile = submission.mobile.trim();

      const exists = db.submissions.some((sub) => {
        return sub.student_id.trim() === normalizedStudentId ||
               sub.email.trim().toLowerCase() === normalizedEmail ||
               sub.mobile.trim() === normalizedMobile;
      });

      if (exists) {
        return res.status(409).json({
          duplicate_prevention: true,
          message: "আপনার তথ্য ইতোমধ্যে জমা দেওয়া হয়েছে",
          error: "Duplicate Student ID, Email or Mobile already exists in secure SIMS registries."
        });
      }

      // Format clean insert record
      const newSubmission: StudentSubmission = {
        ...submission,
        id: "SUB" + generateId(),
        student_id: normalizedStudentId,
        email: normalizedEmail,
        mobile: normalizedMobile,
        status: 'Pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.submissions.unshift(newSubmission);

      // Log structural auditing trail
      const auditLog: AuditLog = {
        id: "AUD" + generateId(),
        action: "Student Submission Registered",
        actor: "Student Guest API",
        timestamp: new Date().toISOString(),
        details: `Profile submitted for ${newSubmission.full_name}. ID: ${newSubmission.student_id}`
      };
      db.logs.unshift(auditLog);

      // Gmail Trigger to Admin (Simulation)
      if (db.settings.auto_email_alerts) {
        const mailToAdmin: NotificationLog = {
          id: "NOT" + generateId(),
          recipient_email: db.settings.admin_notify_email || "allisonburgee@gmail.com",
          subject: `SIMS Admin Alert: New Student Registration [${newSubmission.full_name}]`,
          body: `SIMS Registration Received:\n--------------------\nName: ${newSubmission.full_name}\nStudent ID: ${newSubmission.student_id}\nInstitution: ${newSubmission.institution}\nMobile: ${newSubmission.mobile}\nEmail: ${newSubmission.email}\nStatus: Pending Approval`,
          type: "AdminAlert",
          status: "sent",
          timestamp: new Date().toISOString()
        };
        db.notifications.unshift(mailToAdmin);
      }

      await writeDB(db);
      res.json({ success: true, submission: newSubmission });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ADMIN APPROVAL ACTION WORKFLOW
  app.post('/api/approve', async (req, res) => {
    try {
      const { id, admin_email } = req.body;
      const db = await getDB();
      const index = db.submissions.findIndex(s => s.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "Student submission registry not found." });
      }

      const original = db.submissions[index];
      original.status = 'Approved';
      original.updated_at = new Date().toISOString();

      // Log decision logs
      const approvalLog: ApprovalLog = {
        id: "APL" + generateId(),
        student_id: original.student_id,
        student_name: original.full_name,
        action: 'Approve',
        admin_email: admin_email || "allisonburgee@gmail.com",
        timestamp: new Date().toISOString()
      };
      db.approval_logs.unshift(approvalLog);

      const audit: AuditLog = {
        id: "AUD" + generateId(),
        action: "Student Profile Approved",
        actor: admin_email || "Admin Operator",
        timestamp: new Date().toISOString(),
        details: `Approved ID: ${original.student_id} (${original.full_name})`
      };
      db.logs.unshift(audit);

      // Auto Gmail Dispatch Simulation (Student message)
      if (db.settings.auto_email_alerts) {
        const studentNotification: NotificationLog = {
          id: "NOT" + generateId(),
          recipient_email: original.email,
          subject: "CONGRATULATIONS: Your Student Information Profile was Approved!",
          body: `Dear ${original.full_name},\n\nWe are pleased to inform you that your registration status has been verified and Approved.\n\nApproval Details:\n- Student Name: ${original.full_name}\n- Student ID: ${original.student_id}\n- Approval Date: ${new Date().toLocaleDateString()}\n- Approval Status: Approved\n\nYou can verify this status from the SIMS Portal Status desk at any time.`,
          type: 'StudentApproval',
          status: 'sent',
          timestamp: new Date().toISOString()
        };
        db.notifications.unshift(studentNotification);
      }

      // Synchronize in Real-Time with Google Sheets registry (Sheet simulation row add/update)
      if (db.settings.sheet_sync_enabled) {
        // Remove existing row representation if present to avoid sheet duplication
        db.sheet_rows = db.sheet_rows.filter(r => r.student_id !== original.student_id);
        const newSheetRow: GoogleSheetRow = {
          student_id: original.student_id,
          full_name: original.full_name,
          institution: original.institution,
          department: original.department,
          email: original.email,
          mobile: original.mobile,
          status: 'Approved',
          synced_at: new Date().toISOString()
        };
        db.sheet_rows.unshift(newSheetRow);
      }

      await writeDB(db);
      res.json({ success: true, submission: original });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ADMIN REJECTION ACTION WORKFLOW
  app.post('/api/reject', async (req, res) => {
    try {
      const { id, reason, admin_email } = req.body;
      const db = await getDB();
      const index = db.submissions.findIndex(s => s.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "Student submission registry not found." });
      }

      const original = db.submissions[index];
      original.status = 'Rejected';
      original.rejection_reason = reason || "Incomplete documentation file errors.";
      original.updated_at = new Date().toISOString();

      const approvalLog: ApprovalLog = {
        id: "APL" + generateId(),
        student_id: original.student_id,
        student_name: original.full_name,
        action: 'Reject',
        reason: original.rejection_reason,
        admin_email: admin_email || "allisonburgee@gmail.com",
        timestamp: new Date().toISOString()
      };
      db.approval_logs.unshift(approvalLog);

      const audit: AuditLog = {
        id: "AUD" + generateId(),
        action: "Student Profile Rejected",
        actor: admin_email || "Admin Operator",
        timestamp: new Date().toISOString(),
        details: `Rejected ID: ${original.student_id} (${original.full_name}). Reason: ${reason}`
      };
      db.logs.unshift(audit);

      // Student notification dispatch
      if (db.settings.auto_email_alerts) {
        const studentNotification: NotificationLog = {
          id: "NOT" + generateId(),
          recipient_email: original.email,
          subject: "SIMS Registry Notice: Profile Verification Unsuccessful",
          body: `Dear ${original.full_name},\n\nYour profile submission could not be verified at this stage.\n\nReason for Rejection:\n"${original.rejection_reason}"\n\nPlease log in or visit SIMS dashboard with your ID to submit an Update Request with appropriate records.`,
          type: 'StudentRejection',
          status: 'sent',
          timestamp: new Date().toISOString()
        };
        db.notifications.unshift(studentNotification);
      }

      // Update in Google Sheets as Rejected / Synchronized state
      if (db.settings.sheet_sync_enabled) {
        db.sheet_rows = db.sheet_rows.filter(r => r.student_id !== original.student_id);
        const newSheetRow: GoogleSheetRow = {
          student_id: original.student_id,
          full_name: original.full_name,
          institution: original.institution,
          department: original.department,
          email: original.email,
          mobile: original.mobile,
          status: 'Rejected',
          synced_at: new Date().toISOString()
        };
        db.sheet_rows.unshift(newSheetRow);
      }

      await writeDB(db);
      res.json({ success: true, submission: original });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // STUDENT EDIT UPDATE REQUEST
  app.post('/api/update-request', async (req, res) => {
    try {
      const { id, updatedFields } = req.body;
      const db = await getDB();
      const index = db.submissions.findIndex(s => s.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "No registry found matching student lookup criteria." });
      }

      const original = db.submissions[index];
      
      // Update fields
      const beforeFieldsName = original.full_name;
      Object.assign(original, updatedFields, {
        status: 'Pending', // resets to Pending when updated so admin can review!
        updated_at: new Date().toISOString()
      });

      const audit: AuditLog = {
        id: "AUD" + generateId(),
        action: "Student Profile Updated",
        actor: `Student (${beforeFieldsName})`,
        timestamp: new Date().toISOString(),
        details: `Submited corrections. ID RESET to Pending review.`
      };
      db.logs.unshift(audit);

      await writeDB(db);
      res.json({ success: true, submission: original });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // DYNAMIC COMPONENT FORM BUILDER (FIELDS MGMT)
  app.post('/api/fields/add', async (req, res) => {
    try {
      const field: Omit<DynamicField, 'id'> = req.body;
      const db = await getDB();
      
      // Validate field name uniqueness
      if (db.dynamic_fields.some(f => f.name === field.name)) {
        return res.status(400).json({ error: "A field with this system key already exists." });
      }

      const newField: DynamicField = {
        ...field,
        id: "FLD" + generateId()
      };
      db.dynamic_fields.push(newField);

      const audit: AuditLog = {
        id: "AUD" + generateId(),
        action: "Dynamic Form Field Created",
        actor: "Admin Director",
        timestamp: new Date().toISOString(),
        details: `Added new field key [${newField.name}] of type [${newField.type}] for category [${newField.category}]`
      };
      db.logs.unshift(audit);

      await writeDB(db);
      res.json({ success: true, field: newField });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/fields/delete', async (req, res) => {
    try {
      const { id } = req.body;
      const db = await getDB();
      const index = db.dynamic_fields.findIndex(f => f.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "Dynamic form field template not found." });
      }

      const field = db.dynamic_fields[index];
      db.dynamic_fields.splice(index, 1);

      const audit: AuditLog = {
        id: "AUD" + generateId(),
        action: "Dynamic Form Field Removed",
        actor: "Admin Director",
        timestamp: new Date().toISOString(),
        details: `Deleted field template ${field.label} (${field.name})`
      };
      db.logs.unshift(audit);

      await writeDB(db);
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // UPDATE SETTINGS
  app.post('/api/settings/update', async (req, res) => {
    try {
      const settings = req.body;
      const db = await getDB();
      db.settings = { ...db.settings, ...settings };

      const audit: AuditLog = {
        id: "AUD" + generateId(),
        action: "System Settings Modified",
        actor: "Admin Director",
        timestamp: new Date().toISOString(),
        details: `Updated security notifications and Google Sheet binding path: ${db.settings.sheet_url}`
      };
      db.logs.unshift(audit);

      await writeDB(db);
      res.json({ success: true, settings: db.settings });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // CLEAR LOGS API
  app.post('/api/logs/clear', async (_req, res) => {
    try {
      const db = await getDB();
      db.logs = [{
        id: "L-RESET",
        action: "Audit Trail Cleared",
        actor: "Admin Security Director",
        timestamp: new Date().toISOString(),
        details: "Clean wipe of all structural operational logs for disk security audit."
      }];
      await writeDB(db);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // RESTORE ORIGINAL SEED
  app.post('/api/db/reset', async (_req, res) => {
    try {
      await writeDB(initialSeedData);
      res.json({ success: true, db: initialSeedData });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Vite static file server configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SIMS FullStack] Server listening securely on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical: Failed to boot SIMS Express server:", error);
});
