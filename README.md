# 🎨 Color Formula Desktop App

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/titee12345678/color-formula-desktop-app)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/electron-31.2.1-blueviolet.svg)](https://www.electronjs.org/)
[![SQLite](https://img.shields.io/badge/sqlite-better--sqlite3-orange.svg)](https://github.com/WiseLibs/better-sqlite3)

ระบบจัดการสูตรสีสำหรับงานย้อมผ้าและการผลิตสิ่งทอ พัฒนาด้วย Electron และ SQLite สำหรับการใช้งานแบบ Desktop

## 📋 สารบัญ

- [ภาพรวมโครงการ](#ภาพรวมโครงการ)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [คุณสมบัติหลัก](#คุณสมบัติหลัก)
- [การติดตั้งและใช้งาน](#การติดตั้งและใช้งาน)
- [โครงสร้างโปรแกรม](#โครงสร้างโปรแกรม)
- [Tools และ Libraries](#tools-และ-libraries)
- [ข้อดีและข้อเสีย](#ข้อดีและข้อเสีย)
- [คู่มือการใช้งานแต่ละฟีเจอร์](#คู่มือการใช้งานแต่ละฟีเจอร์)
- [การพัฒนาและขยายฟีเจอร์](#การพัฒนาและขยายฟีเจอร์)
- [Troubleshooting](#troubleshooting)
- [การสร้าง Build](#การสร้าง-build)

## 🎯 ภาพรวมโครงการ

Color Formula Desktop App เป็นโปรแกรมจัดการสูตรสีสำหรับอุตสาหกรรมสิ่งทอและการย้อมผ้า ที่ช่วยให้ผู้ใช้สามารถ:

- **ค้นหาสูตรสี** ด้วยเงื่อนไขต่างๆ เช่น รหัสสี ชนิดด้าย เล่ม หน้า
- **ค้นหาจากส่วนผสม** ระบุแม่สีและเปอร์เซ็นต์เพื่อหาสูตรที่คล้ายกัน
- **AI Search** ค้นหาด้วยภาษาธรรมชาติแบบ offline ไม่ต้องใช้ API key
- **วิเคราะห์ข้อมูล** สถิติการใช้งาน กราฟแม่สียอดนิยม การกระจายตามชนิดด้าย
- **จัดการข้อมูล** นำเข้า/ส่งออกข้อมูล ล้างข้อมูล พร้อมระบบรักษาความปลอดภัย
- **แก้ไขและลบ** ข้อมูลสูตรสีแต่ละรายการ

### 🎨 การแสดงสี RGB
โปรแกรมสามารถแสดงสีจริงของสูตรในรูปแบบ RGB ทำให้ผู้ใช้เห็นตัวอย่างสีก่อนนำไปใช้งาน

## 🛠 เทคโนโลยีที่ใช้

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Electron** | 31.2.1 | สร้าง Desktop App ข้ามแพลตฟอร์ม |
| **SQLite** | better-sqlite3 v11.1.2 | ฐานข้อมูลแบบ embedded |
| **Node.js** | - | Runtime environment |
| **HTML5** | - | UI Structure |
| **CSS3** | - | Styling & Animations |
| **JavaScript ES6+** | - | Application Logic |

### Frontend Technologies
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Font Awesome 6.0** | Icons และ UI elements |
| **Google Fonts (Sarabun)** | Typography ภาษาไทย |
| **Chart.js** | Data visualization และ charts |

### Backend & Data Processing
| Library | Version | Purpose |
|---------|---------|---------|
| **better-sqlite3** | 11.1.2 | High-performance SQLite binding |
| **ExcelJS** | 4.3.0 | Excel file processing |
| **read-excel-file** | 5.5.3 | Excel import functionality |
| **axios** | 1.6.0 | HTTP requests |
| **dotenv** | 16.3.1 | Environment variables |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| **electron-builder** | 24.13.3 | Build และ package app |
| **electron-packager** | 17.1.2 | Alternative packaging tool |
| **rimraf** | 3.0.2 | Cross-platform rm -rf |

## ✨ คุณสมบัติหลัก

### 🔍 ระบบค้นหาแบบหลากหลาย
- **ค้นหาพื้นฐาน**: รหัสสี, เล่ม, หน้า, ชนิดด้าย
- **ค้นหาจากส่วนผสม**: ระบุแม่สีและเปอร์เซ็นต์
- **AI Search**: ค้นหาด้วยภาษาธรรมชาติแบบ offline
- **การแบ่งหน้า**: แสดงผลแบบ pagination เพื่อประสิทธิภาพ

### 📊 การวิเคราะห์ข้อมูล
- **สถิติการใช้งาน**: จำนวนสูตร, แม่สี, ชนิดด้าย
- **กราฟแม่สียอดนิยม**: Top 10 แม่สีที่ใช้บ่อยที่สุด
- **การกระจายตามชนิดด้าย**: สัดส่วนสูตรแต่ละชนิด
- **สูตรตามเล่ม**: การกระจายข้อมูลในแต่ละเล่ม
- **แผนภูมิแบบ Interactive**: สามารถ interact ได้

### 🗄 การจัดการข้อมูล
- **นำเข้า Excel**: รองรับรูปแบบ .xlsx
- **ส่งออกข้อมูล**: SQLite Database, Excel format
- **ระบบรักษาความปลอดภัย**: รหัสผ่านสำหรับการจัดการ
- **เทมเพลต Excel**: ดาวน์โหลดรูปแบบมาตรฐาน

### 🎨 AI Search (ฟรี 100%)
- **Natural Language Processing**: เข้าใจคำค้นหาภาษาไทย
- **Offline Processing**: ไม่ต้องการ internet หรือ API key
- **Smart Matching**: ค้นหาจากหลายเงื่อนไขพร้อมกัน
- **Similarity Scoring**: แสดงเปอร์เซ็นต์ความคล้ายกัน

## 📦 การติดตั้งและใช้งาน

### ความต้องการของระบบ
- **Windows**: 10 หรือใหม่กว่า
- **macOS**: 10.14 หรือใหม่กว่า
- **RAM**: อย่างน้อย 4GB
- **Storage**: อย่างน้อย 500MB

### การติดตั้งสำหรับ Developer

```bash
# 1. Clone repository
git clone https://github.com/titee12345678/color-formula-desktop-app.git
cd color-formula-desktop-app

# 2. ติดตั้ง dependencies
npm install

# 3. รัน development mode
npm start

# 4. Build สำหรับ production
npm run build

# Build แยกตาม platform
npm run build:win    # สำหรับ Windows
npm run build:mac    # สำหรับ macOS
```

### การติดตั้งสำหรับ End User
1. ดาวน์โหลด installer ตาม OS ที่ใช้
2. รันไฟล์ installer
3. ติดตั้งตามขั้นตอน
4. เปิดโปรแกรม "Color Formula App"

## 🏗 โครงสร้างโปรแกรม

### ไฟล์หลัก
```
color-formula-desktop-app/
├── main.js                 # Electron main process
├── preload.js             # Preload scripts
├── index.html             # UI หลัก
├── package.json           # Dependencies & scripts
├── AI_SEARCH_SETUP.md     # คู่มือ AI Search
└── README.md              # เอกสารนี้

├── image/
│   └── icon.png           # App icon

└── dist/                  # Build output (สร้างหลัง build)
```

### Database Schema
```sql
-- Table: formulas (ข้อมูลสูตรหลัก)
CREATE TABLE formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book TEXT,           -- เล่ม
    resultCode TEXT,     -- รหัสสี
    date TEXT,           -- วันที่
    yarnType TEXT,       -- ชนิดด้าย
    yarnModel TEXT,      -- รุ่นด้าย
    page INTEGER,        -- หน้า
    row INTEGER,         -- แถว
    swatchColor TEXT     -- สี RGB hex
);

-- Table: ingredients (ส่วนผสมแม่สี)
CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formula_id INTEGER,  -- Foreign key to formulas
    motherCode TEXT,     -- รหัสแม่สี
    name TEXT,           -- ชื่อแม่สี
    percentage REAL,     -- เปอร์เซ็นต์
    FOREIGN KEY (formula_id) REFERENCES formulas(id)
);
```

## 🔧 Tools และ Libraries

### การจัดการข้อมูล
- **better-sqlite3**: SQLite binding ประสิทธิภาพสูง
- **ExcelJS**: การประมวลผลไฟล์ Excel
- **read-excel-file**: การอ่านไฟล์ Excel
- **dotenv**: การจัดการ environment variables

### UI/UX Libraries
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library
- **Chart.js**: Data visualization
- **Google Fonts**: Typography

### Development Tools
- **Electron Builder**: Packaging และ distribution
- **Electron Packager**: Alternative packaging
- **rimraf**: ลบไฟล์ cross-platform

### Security Features
- **รหัสผ่านการเข้าถึง**: ป้องกันการลบข้อมูล
- **Input validation**: ตรวจสอบข้อมูลนำเข้า
- **Safe file handling**: การจัดการไฟล์อย่างปลอดภัย

## ✅ ข้อดีและข้อเสีย

### ✅ ข้อดี

#### ประสิทธิภาพ
- **ฐานข้อมูล SQLite**: เร็ว, เสถียร, ไม่ต้องการ server
- **In-memory caching**: การค้นหาที่รวดเร็ว
- **Offline operation**: ใช้งานได้โดยไม่ต้องการ internet
- **Cross-platform**: รองรับ Windows, macOS

#### ความสะดวกในการใช้งาน
- **UI ภาษาไทย**: เหมาะสำหรับผู้ใช้ไทย
- **Responsive design**: ใช้งานได้หลายขนาดหน้าจอ
- **AI Search ฟรี**: ไม่ต้องเสียค่า API
- **Visual color preview**: เห็นสีจริงของสูตร

#### การจัดการข้อมูล
- **Excel integration**: นำเข้า/ส่งออกง่าย
- **Data visualization**: กราฟและสถิติที่เข้าใจง่าย
- **Backup & restore**: ส่งออกฐานข้อมูลได้
- **Security**: รหัสผ่านป้องกัน

#### การพัฒนา
- **Modern tech stack**: Electron, ES6+, SQLite
- **Modular code**: ง่ายต่อการขยายและปรับปรุง
- **Good documentation**: เอกสารครบถ้วน

### ❌ ข้อเสีย

#### ข้อจำกัดทางเทคนิค
- **ขนาดแอป**: Electron ทำให้แอปใหญ่ (~100MB+)
- **การใช้ RAM**: สูงกว่าแอป native
- **Single-user**: ไม่รองรับการใช้งานหลายคนพร้อมกัน
- **ไม่มี cloud sync**: ข้อมูลเก็บเฉพาะเครื่อง

#### ความซับซ้อน
- **การ setup development**: ต้องติดตั้งหลาย dependency
- **Building process**: ใช้เวลานานในการ build
- **Platform-specific issues**: อาจมีปัญหาต่างกันในแต่ละ OS

#### ฟีเจอร์ที่ขาด
- **Multi-language**: รองรับเฉพาะภาษาไทย
- **Advanced analytics**: วิเคราะห์ข้อมูลระดับลึกจำกัด
- **User management**: ไม่มีระบบผู้ใช้หลายคน
- **Version control**: ไม่มีการ track การเปลี่ยนแปลง

## 📖 คู่มือการใช้งานแต่ละฟีเจอร์

### 🔍 การค้นหาสูตรทั่วไป
```
หน้าหลัก > ใส่เงื่อนไขค้นหา > Enter
- เล่มที่: DATA2025, BOOK001
- รหัสสี: BN0173, D01231
- ชนิดด้าย: PC16/2, Cotton
- รุ่นด้าย: DG, Premium
- หน้า: 1-999
```

### 🧪 การค้นหาจากแม่สี
```
ค้นหาจากแม่สี > เพิ่มรหัสแม่สี > ใส่เปอร์เซ็นต์ > ค้นหา
ตัวอย่าง:
- D01231: 0.2500%
- DIANIX RED: 1.5000%
- YELLOW 3G: 0.1000%
```

### 🤖 AI Search (ฟรี)
```
ค้นหาจากแม่สี > 🤖 AI Search > พิมพ์คำค้นหา
ตัวอย่างคำค้นหา:
- "หาสีแดงเข้มสำหรับด้าย PC16/2"
- "สูตรที่มี D01231 มากกว่า 0.2%"
- "ค้นหาสีเหลืองในเล่ม DATA2025"
```

### 📊 การดูสถิติ
```
สรุปข้อมูล > เลือกปี > ดูกราฟและสถิติ
- สถิติทั่วไป: จำนวนสูตร, แม่สี, ชนิดด้าย
- กราหแม่สียอดนิยม: Top 10 แม่สี
- สัดส่วนตามชนิดด้าย: Pie chart
- สูตรตามเล่ม: Bar chart
```

### 🗄 การจัดการข้อมูล (ต้องรหัส: LAB1221)
```
จัดการข้อมูล > ใส่รหัส LAB1221 > เลือกการทำงาน

Export ข้อมูล:
- SQLite Database: สำหรับ developer
- Excel Database: ข้อมูลครบถ้วนพร้อม RGB

Import ข้อมูล:
- ดาวน์โหลดเทมเพลต > กรอกข้อมูล > อัปโหลด

ล้างข้อมูล:
- ใส่รหัสยืนยัน 1221 > ยืนยันการลบ
```

## 🚀 การพัฒนาและขยายฟีเจอร์

### การเพิ่มฟีเจอร์ใหม่

#### 1. เพิ่มฟังก์ชัน Backend (main.js)
```javascript
// เพิ่ม IPC handler
ipcMain.handle('new-feature-action', async (event, data) => {
    try {
        // Logic ใหม่
        return { success: true, result: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
```

#### 2. เพิ่ม Frontend Logic (index.html)
```javascript
// เพิ่มฟังก์ชันใน script tag
async function newFeature() {
    const result = await window.electronAPI.newFeatureAction(data);
    if (result.success) {
        // แสดงผลสำเร็จ
    }
}
```

#### 3. เพิ่ม UI Elements
```html
<!-- เพิ่มใน section ที่เหมาะสม -->
<button id="newFeatureBtn" class="btn-primary">
    ฟีเจอร์ใหม่
</button>
```

### การปรับปรุงฐานข้อมูล
```javascript
// ใน main.js - function setupDatabase()
function addNewColumn() {
    try {
        db.exec(`ALTER TABLE formulas ADD COLUMN new_field TEXT`);
        console.log('Added new column successfully');
    } catch (error) {
        console.log('Column might already exist:', error.message);
    }
}
```

## 🔧 Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. ไม่สามารถเริ่มแอปได้
```bash
# ตรวจสอบ dependencies
npm install

# ล้าง cache
npm cache clean --force

# ลบ node_modules แล้วติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

#### 2. ปัญหาฐานข้อมูล
```bash
# ตำแหน่งฐานข้อมูล
Windows: %APPDATA%/Color Formula App/database.sqlite
macOS: ~/Library/Application Support/Color Formula App/database.sqlite

# ลบฐานข้อมูลเก่า (จะสร้างใหม่อัตโนมัติ)
```

#### 3. ปัญหาการ Build
```bash
# ตรวจสอบ platform tools
npm run postinstall

# Build แบบ verbose
npm run build -- --verbose

# ลบ dist แล้ว build ใหม่
rm -rf dist
npm run build
```

#### 4. ปัญหา Excel Import
- ตรวจสอบรูปแบบไฟล์ (.xlsx เท่านั้น)
- ใช้เทมเพลตที่ดาวน์โหลดจากโปรแกรม
- ตรวจสอบรูปแบบวันที่ (DD/MM/YYYY)
- ตรวจสอบเปอร์เซ็นต์ (ตัวเลขเท่านั้น)

### Performance Optimization
```javascript
// เพิ่มใน main.js สำหรับ optimize
const BATCH_SIZE = 1000;
function processBatchData(data) {
    const chunks = [];
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        chunks.push(data.slice(i, i + BATCH_SIZE));
    }
    return chunks;
}
```

## 📦 การสร้าง Build

### Build Scripts ที่มีอยู่
```json
{
  "build": "rimraf dist && electron-builder",
  "build:win": "rimraf dist && electron-builder --win --x64",
  "build:mac": "rimraf dist && electron-builder --mac --x64 --arm64"
}
```

### Build Configuration
```json
{
  "build": {
    "appId": "com.teejakkrit.colorformulaapp.sqlite",
    "productName": "Color Formula App",
    "files": ["main.js", "preload.js", "index.html"],
    "win": {
      "target": "nsis",
      "icon": "icon.ico"
    },
    "mac": {
      "category": "public.app-category.utilities",
      "target": ["dmg"]
    }
  }
}
```

### การเตรียม Build Environment

#### Windows
```bash
# ติดตั้ง Windows Build Tools
npm install --global windows-build-tools

# หรือใช้ Visual Studio Build Tools
# ดาวน์โหลดจาก Microsoft
```

#### macOS
```bash
# ติดตั้ง Xcode Command Line Tools
xcode-select --install

# ตรวจสอบ code signing (สำหรับ distribution)
security find-identity -v -p codesigning
```

### Output Files
หลังจาก build สำเร็จ:
```
dist/
├── Color Formula App Setup 1.1.0.exe     # Windows installer
├── Color Formula App-1.1.0.dmg           # macOS installer
├── win-unpacked/                          # Windows unpacked
└── mac/                                   # macOS app bundle
```

## 📝 สรุป

Color Formula เป็นโซลูชันที่ครอบคลุมสำหรับการจัดการสูตรสีในอุตสาหกรรมสิ่งทอ ด้วยเทคโนโลยีที่ทันสมัยและฟีเจอร์ที่หลากหลาย ทั้ง AI Search แบบฟรี, การวิเคราะห์ข้อมูล, และระบบจัดการที่ปลอดภัย

**เหมาะสำหรับ:**
- โรงงานสิ่งทอ
- ห้อง LAB ทดสอบสี
- นักวิจัยด้านสี

**ผู้พัฒนา:** Tee Jakkrit
**เวอร์ชัน:** 1.1.0
**อัปเดตล่าสุด:** 2024
**License:** ISC

สำหรับคำถามหรือการสนับสนุน ติดต่อผ่าน GitHub Issues