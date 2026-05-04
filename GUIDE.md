# AFM System - Application Guide (Taglish)

## 📋 Ano ang AFM System?

Ang **AFM (Attendance & Fine Management)** ay isang web application para sa pag-track ng attendance ng mga estudyante gamit ang QR codes at pag-manage ng fines (multa).

---

## 🎯 Paano Gumagana ang App?

### 1. **Login Process**
- User ay pumipili ng role: **Adviser**, **Officer**, o **Student**
- Nag-enter ng email at password
- System ay nag-verify at nag-redirect sa tamang dashboard

### 2. **Three Different Roles:**

#### **👨‍🏫 Adviser (Guro/Adviser)**
- Nag-manage ng students (add, edit, delete)
- Nag-create ng activities (events/sessions)
- Nag-view ng attendance records
- Nag-manage ng fines
- Nag-generate ng reports

#### **👮 Officer (Security/Staff)**
- Nag-scan ng QR codes ng students
- Nag-record ng attendance in real-time
- Nag-view ng scanned records

#### **👨‍🎓 Student**
- Nag-view ng sariling attendance
- Nag-view ng fines
- Nag-check ng participation sa activities

### 3. **Attendance Flow**
```
Officer scans QR → System checks student → Records attendance → Shows result
```

### 4. **Fine Management**
```
Adviser creates fine → Student views fine → Adviser marks as paid
```

---

## 📁 Folder Structure Explanation

### **Root Level**
```
project/
├── client/          ← Frontend (React) - Ang makikita ng users
├── server/          ← Backend (Node.js) - Ang logic at database
├── .gitignore       ← Files na hindi i-upload sa GitHub
└── GUIDE.md         ← This file
```

---

## 🖥️ CLIENT FOLDER (Frontend - React)

Ito ang parte na nakikita ng users sa browser.

```
client/
├── src/
│   ├── pages/                    ← Mga pages ng app
│   │   ├── LoginPage.jsx         ← Login screen
│   │   ├── adviser/              ← Pages para sa adviser
│   │   │   ├── Overview.jsx      ← Dashboard
│   │   │   ├── Students.jsx      ← Manage students
│   │   │   ├── Activities.jsx    ← Create activities
│   │   │   ├── Attendance.jsx    ← View attendance
│   │   │   ├── Fines.jsx         ← Manage fines
│   │   │   ├── Reports.jsx       ← Generate reports
│   │   │   └── Logs.jsx          ← Activity logs
│   │   ├── officer/              ← Pages para sa officer
│   │   │   ├── Scanner.jsx       ← QR code scanner
│   │   │   └── Overview.jsx      ← Dashboard
│   │   └── student/              ← Pages para sa student
│   │       └── Overview.jsx      ← Student dashboard
│   │
│   ├── components/               ← Reusable components
│   │   ├── DashboardLayout.jsx   ← Sidebar at header
│   │   ├── StudentQRCode.jsx     ← QR code display
│   │   └── PesoIcon.jsx          ← Currency icon
│   │
│   ├── services/                 ← API calls (communication sa backend)
│   │   ├── api.js                ← Base API setup
│   │   ├── authService.js        ← Login/logout
│   │   ├── studentService.js     ← Student operations
│   │   ├── activityService.js    ← Activity operations
│   │   ├── attendanceService.js  ← Attendance operations
│   │   ├── fineService.js        ← Fine operations
│   │   ├── reportService.js      ← Report operations
│   │   └── logService.js         ← Log operations
│   │
│   ├── context/                  ← Global state management
│   │   └── AuthContext.jsx       ← User login state
│   │
│   ├── lib/                      ← Utility functions
│   │   └── utils.js              ← Helper functions
│   │
│   ├── assets/                   ← Images at media
│   │   └── background/
│   │       └── login-logo.png
│   │
│   ├── App.jsx                   ← Main app component
│   ├── main.jsx                  ← Entry point
│   └── index.css                 ← Global styles
│
├── package.json                  ← Dependencies (libraries)
├── vite.config.js                ← Build configuration
├── tailwind.config.js            ← Styling configuration
└── .env                          ← Environment variables (API URL)
```

**Ano ang ginagawa ng bawat folder:**
- **pages/** = Mga screen na makikita ng users
- **components/** = Reusable UI parts (buttons, modals, etc.)
- **services/** = Nag-communicate sa backend API
- **context/** = Nag-store ng user info globally
- **assets/** = Images at files

---

## 🔧 SERVER FOLDER (Backend - Node.js)

Ito ang "brain" ng app - nag-process ng data at nag-communicate sa database.

```
server/
├── controller/                   ← Business logic (ang "brain")
│   ├── authController.js         ← Login logic
│   ├── studentController.js      ← Student operations
│   ├── activityController.js     ← Activity operations
│   ├── attendanceController.js   ← Attendance recording
│   ├── fineController.js         ← Fine management
│   ├── reportController.js       ← Report generation
│   └── logController.js          ← Activity logging
│
├── model/                        ← Database structure (schema)
│   ├── User.js                   ← Adviser/Officer data
│   ├── Student.js                ← Student data
│   ├── Activity.js               ← Activity data
│   ├── Attendance.js             ← Attendance records
│   ├── Fine.js                   ← Fine records
│   ├── ActivityLog.js            ← System logs
│   └── ActivityLog.js            ← Activity logs
│
├── routes/                       ← API endpoints (URLs)
│   ├── auth.js                   ← /api/auth routes
│   ├── students.js               ← /api/students routes
│   ├── activities.js             ← /api/activities routes
│   ├── attendance.js             ← /api/attendance routes
│   ├── fines.js                  ← /api/fines routes
│   ├── reports.js                ← /api/reports routes
│   └── logs.js                   ← /api/logs routes
│
├── middleware/                   ← Filters/Guards
│   └── auth.js                   ← Check kung logged in ba
│
├── server.js                     ← Main server file (entry point)
├── package.json                  ← Dependencies
└── .env                          ← Database credentials
```

**Ano ang ginagawa ng bawat folder:**
- **controller/** = Nag-process ng requests mula sa frontend
- **model/** = Nag-define kung paano mag-store ng data sa database
- **routes/** = Nag-define ng API endpoints (URLs)
- **middleware/** = Nag-check ng permissions bago mag-execute

---

## 🔄 Data Flow (Paano Gumagalaw ang Data)

### **Example: Student Login**

```
1. User nag-type ng email at password sa LoginPage.jsx
   ↓
2. LoginPage ay nag-call ng authService.login()
   ↓
3. authService ay nag-send ng request sa backend: POST /api/auth/login
   ↓
4. Backend (authController.js) ay nag-check sa database
   ↓
5. Kung tama, nag-return ng token at user data
   ↓
6. Frontend ay nag-save ng token sa localStorage
   ↓
7. User ay nag-redirect sa dashboard
```

### **Example: Officer Scans QR Code**

```
1. Officer ay nag-click ng "Start Scanning" sa Scanner.jsx
   ↓
2. Camera ay nag-open at nag-scan ng QR code
   ↓
3. Scanner ay nag-extract ng student ID
   ↓
4. attendanceService ay nag-call ng POST /api/attendance/record
   ↓
5. Backend (attendanceController.js) ay nag-save sa database
   ↓
6. Backend ay nag-return ng result (Present/Late/Absent)
   ↓
7. Frontend ay nag-display ng success message
```

---

## 🛠️ Technology Stack (Ano ang Ginagamit)

### **Frontend (Client)**
- **React** - UI library para gumawa ng interactive pages
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **SweetAlert2** - Pop-up notifications
- **html5-qrcode** - QR code scanning

### **Backend (Server)**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database (nag-store ng data)
- **Mongoose** - Database library
- **JWT** - Authentication tokens
- **bcryptjs** - Password encryption

---

## 📝 Common Tasks

### **Paano mag-add ng bagong feature?**

1. **Create UI sa frontend** (pages/ o components/)
2. **Create API endpoint sa backend** (routes/ at controller/)
3. **Create database model** kung kailangan (model/)
4. **Connect frontend sa backend** gamit ang services/

### **Paano mag-debug?**

- **Frontend errors** - Check browser console (F12)
- **Backend errors** - Check terminal/console kung saan tumatakbo ang server
- **Database errors** - Check MongoDB connection

---

## 🚀 Paano i-run ang App?

### **Backend**
```bash
cd server
npm install
npm start
```

### **Frontend**
```bash
cd client
npm install
npm run dev
```

---

## 📞 Quick Reference

| Folder | Purpose |
|--------|---------|
| `client/pages/` | Mga screen ng app |
| `client/services/` | API calls |
| `server/controller/` | Business logic |
| `server/model/` | Database structure |
| `server/routes/` | API endpoints |

---

## ✅ Summary

- **Client** = Kung ano ang nakikita ng users
- **Server** = Kung paano nag-process ng data
- **Database** = Kung saan nag-store ng data
- **Services** = Nag-connect ng client sa server
- **Controllers** = Nag-handle ng requests mula sa client

Yan lang! Simple lang ang flow: User → Frontend → Backend → Database → Response → User 🎉

