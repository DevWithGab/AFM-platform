# 🚀 AFM System - Setup Instructions (Para sa Beginners)

Walang kailangan na prior knowledge! Sundin lang ang steps na ito step-by-step.

---

## 📥 PART 1: Download at Install ng Software

### **Step 1: Install Node.js**

Node.js ay kailangan para patakbuhin ang app.

1. Pumunta sa: https://nodejs.org/
2. Download ang **LTS version** (yung may "Recommended" na label)
3. I-install:
   - Windows: Double-click ang downloaded file, click "Next" lang ng "Next"
   - Mac: Double-click ang .pkg file, follow instructions
4. Para i-check kung nag-install:
   - Open **Command Prompt** (Windows) o **Terminal** (Mac)
   - Type: `node --version`
   - Dapat may lumabas na version number (e.g., v20.11.0)

---

### **Step 2: Install Git**

Git ay para ma-download ang code mula sa GitHub.

1. Pumunta sa: https://git-scm.com/downloads
2. Download para sa iyong operating system
3. I-install:
   - Windows: Double-click, click "Next" lang (default settings okay na)
   - Mac: Double-click ang .dmg file
4. Para i-check:
   - Open Command Prompt/Terminal
   - Type: `git --version`
   - Dapat may lumabas na version number

---

### **Step 3: Install MongoDB Community Server**

MongoDB ay ang database kung saan mag-store ng data.

1. Pumunta sa: https://www.mongodb.com/try/download/community
2. Download ang **MongoDB Community Server**
   - Version: Latest
   - Platform: Windows/Mac (depende sa computer mo)
3. I-install:
   - Windows: 
     - Double-click ang installer
     - Choose "Complete" installation
     - **IMPORTANTE:** I-check ang "Install MongoDB as a Service"
     - I-check din ang "Install MongoDB Compass" (GUI tool)
   - Mac:
     - Follow ang installer instructions
4. After installation, MongoDB ay automatic na tumatakbo sa background

---

### **Step 4: Install MongoDB Compass (Optional pero Recommended)**

Kung hindi kasama sa MongoDB installation, download separately:

1. Pumunta sa: https://www.mongodb.com/try/download/compass
2. Download at install
3. Ito ay GUI tool para makita mo ang database visually

---

### **Step 5: Install VS Code (Code Editor)**

Para ma-view at ma-edit ang code.

1. Pumunta sa: https://code.visualstudio.com/
2. Download at install
3. Ito ay optional pero highly recommended

---

## 📦 PART 2: Download ang Project mula sa GitHub

### **Step 1: Kumuha ng GitHub Link**

1. Pumunta sa GitHub repository ng project
2. Click ang green button na **"Code"**
3. Copy ang URL (dapat may `.git` sa dulo)

---

### **Step 2: Clone ang Project**

1. Open **Command Prompt** (Windows) o **Terminal** (Mac)
2. Pumunta sa folder kung saan mo gusto i-save ang project:
   ```bash
   cd Desktop
   ```
   (Pwede ring ibang folder like Documents)

3. I-clone ang project:
   ```bash
   git clone [PASTE_GITHUB_URL_DITO]
   ```
   Example:
   ```bash
   git clone https://github.com/username/afm-system.git
   ```

4. Hintayin mag-download (may progress bar)

5. Pumasok sa project folder:
   ```bash
   cd afm-system
   ```
   (Replace `afm-system` kung iba ang folder name)

---

## ⚙️ PART 3: Setup ng Database

### **Step 1: Buksan ang MongoDB Compass**

1. Open **MongoDB Compass** application
2. Sa connection screen, dapat may default na:
   ```
   mongodb://localhost:27017
   ```
3. Click **"Connect"**

---

### **Step 2: Create New Database**

1. Sa MongoDB Compass, click **"Create Database"** button
2. Fill in:
   - **Database Name:** `afm_database`
   - **Collection Name:** `users`
3. Click **"Create Database"**

Tapos na! Ang database ay ready na.

---

## 🔧 PART 4: Setup ng Backend (Server)

### **Step 1: Pumasok sa Server Folder**

1. Open Command Prompt/Terminal
2. Pumunta sa server folder:
   ```bash
   cd server
   ```

---

### **Step 2: Install Dependencies**

I-install ang lahat ng kailangan ng backend:

```bash
npm install
```

Hintayin mag-install (mga 1-2 minutes). May makikita kang maraming text na dumadaan.

---

### **Step 3: Create .env File**

1. Sa `server` folder, gumawa ng bagong file na `.env`
2. I-open ang file at i-paste ito:

```
PORT=5002
MONGODB_URI=mongodb://localhost:27017/afm_database
JWT_SECRET=your_super_secret_key_change_this_in_production
```

**IMPORTANTE:** Palitan ang `JWT_SECRET` ng kahit anong random text (for security).

**Paano gumawa ng .env file:**
- **VS Code:** Right-click sa server folder → New File → type `.env`
- **Notepad:** Save as `.env` (make sure "All Files" ang file type)

---

### **Step 4: Test ang Backend**

1. Sa terminal (nasa server folder pa rin):
   ```bash
   npm start
   ```

2. Dapat may makita kang:
   ```
   Server running on port 5002
   MongoDB connected
   ```

3. Kung may error, check:
   - Naka-install ba ang MongoDB?
   - Tama ba ang `.env` file?
   - Naka-connect ba sa internet?

4. Para i-stop ang server: Press `Ctrl + C`

---

## 🎨 PART 5: Setup ng Frontend (Client)

### **Step 1: Open New Terminal/Command Prompt**

**IMPORTANTE:** Huwag i-close ang server terminal! Kailangan ng 2 terminals.

1. Open bagong Command Prompt/Terminal window
2. Pumunta sa project folder:
   ```bash
   cd Desktop/afm-system
   ```
   (Adjust depende kung saan mo na-save)

---

### **Step 2: Pumasok sa Client Folder**

```bash
cd client
```

---

### **Step 3: Install Dependencies**

```bash
npm install
```

Hintayin mag-install (mga 2-3 minutes).

---

### **Step 4: Create .env File**

1. Sa `client` folder, gumawa ng `.env` file
2. I-paste ito:

```
VITE_API_URL=http://localhost:5002/api
```

---

### **Step 5: Run ang Frontend**

```bash
npm run dev
```

Dapat may makita kang:
```
Local: http://localhost:5173
```

---

## 🎉 PART 6: Access ang Application

### **Step 1: Buksan ang Browser**

1. Open **Google Chrome** o any browser
2. Pumunta sa: `http://localhost:5173`

---

### **Step 2: Test ang Login**

Kailangan mo munang mag-create ng test users sa database.

**Option 1: Gamit ang MongoDB Compass**

1. Open MongoDB Compass
2. Click `afm_database` → `users` collection
3. Click **"Add Data"** → **"Insert Document"**
4. I-paste ito (para sa Adviser account):

```json
{
  "name": "Test Adviser",
  "email": "adviser@school.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "adviser"
}
```

**Option 2: Gumamit ng Seed Script**

Kung may seed.js file sa server folder:
```bash
cd server
node seed.js
```

---

### **Default Test Accounts** (kung may seed script):

| Role | Email | Password |
|------|-------|----------|
| Adviser | adviser@school.com | password123 |
| Officer | officer@school.com | password123 |
| Student | student@school.com | password123 |

---

## ✅ PART 7: Verification Checklist

Siguruhing lahat ay gumagana:

- [ ] Node.js installed (`node --version` sa terminal)
- [ ] Git installed (`git --version` sa terminal)
- [ ] MongoDB running (check MongoDB Compass)
- [ ] Project na-clone mula sa GitHub
- [ ] Backend dependencies installed (`server/node_modules` folder exists)
- [ ] Frontend dependencies installed (`client/node_modules` folder exists)
- [ ] `.env` files created (both server and client)
- [ ] Backend running (`npm start` sa server folder)
- [ ] Frontend running (`npm run dev` sa client folder)
- [ ] Browser naka-open sa `http://localhost:5173`
- [ ] Naka-login successfully

---

## 🐛 Common Problems at Solutions

### **Problem 1: "npm is not recognized"**
**Solution:** Hindi naka-install ng maayos ang Node.js. I-install ulit.

---

### **Problem 2: "Port 5002 is already in use"**
**Solution:** May tumatakbo nang ibang app sa port 5002.
- Option 1: I-stop ang other app
- Option 2: Palitan ang PORT sa `.env` file (e.g., 5003)

---

### **Problem 3: "Cannot connect to MongoDB"**
**Solution:** 
- Check kung naka-install ang MongoDB
- Check kung running ang MongoDB service
- Windows: Open Services → Find "MongoDB" → Start
- Mac: `brew services start mongodb-community`

---

### **Problem 4: "Module not found"**
**Solution:** Hindi nag-install ng dependencies.
```bash
npm install
```

---

### **Problem 5: Frontend hindi nag-load**
**Solution:**
- Check kung running ang backend (port 5002)
- Check ang `.env` file sa client folder
- Clear browser cache (Ctrl + Shift + Delete)

---

## 📱 PART 8: Paano Gamitin ang App

### **Para sa Adviser:**
1. Login gamit ang adviser account
2. Mag-add ng students sa "Manage Students"
3. Mag-create ng activity sa "Activities"
4. I-activate ang activity
5. View attendance records

### **Para sa Officer:**
1. Login gamit ang officer account
2. Click "Scanner"
3. Click "Start Scanning"
4. Allow camera access
5. I-scan ang QR code ng student

### **Para sa Student:**
1. Login gamit ang student account
2. View attendance records
3. View fines
4. Download QR code

---

## 🔄 Paano Mag-update ng Code (Kung may changes sa GitHub)

1. Open terminal sa project folder
2. Run:
   ```bash
   git pull origin main
   ```
3. Update dependencies:
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```
4. Restart both server and client

---

## 💡 Tips para sa Development

1. **Always run 2 terminals:**
   - Terminal 1: Backend (server folder)
   - Terminal 2: Frontend (client folder)

2. **Kung may error:**
   - Check terminal kung may error message
   - Check browser console (F12)
   - Read ang error message carefully

3. **Kung mag-edit ng code:**
   - Frontend: Auto-reload (no need to restart)
   - Backend: Kailangan i-restart (Ctrl+C then `npm start` ulit)

4. **Para i-stop ang app:**
   - Press `Ctrl + C` sa both terminals
   - Close browser tab

---

## 📞 Need Help?

Kung may problema:
1. Check ang error message sa terminal
2. Check ang browser console (F12)
3. Google ang error message
4. Ask sa team lead

---

## 🎓 Summary ng Commands

```bash
# Clone project
git clone [GITHUB_URL]
cd [PROJECT_FOLDER]

# Setup Backend
cd server
npm install
npm start

# Setup Frontend (new terminal)
cd client
npm install
npm run dev

# Update code
git pull origin main
npm install (sa both server at client)
```

---

## ✨ Congratulations!

Kung naka-setup mo na lahat, ready ka na mag-develop! 🎉

**Next Steps:**
1. Basahin ang GUIDE.md para maintindihan ang code structure
2. Try mag-explore ng code
3. Try mag-add ng features

Good luck! 🚀

