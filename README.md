# 🎨 Color Formula Desktop App

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/titee12345678/color-formula-desktop-app)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/electron-31.2.1-blueviolet.svg)](https://www.electronjs.org/)
[![SQLite](https://img.shields.io/badge/sqlite-better--sqlite3-orange.svg)](https://github.com/WiseLibs/better-sqlite3)

ระบบจัดการสูตรสีสำหรับงานย้อมผ้าและการผลิตสิ่งทอ พัฒนาด้วย Electron และ SQLite สำหรับการใช้งานแบบ Desktop

## 📋 สารบัญ

- [ภาพรวมโครงการ](#ภาพรวมโครงการ)
- [Screenshots](#screenshots)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [คุณสมบัติหลัก](#คุณสมบัติหลัก)
- [Architecture และ Design Patterns](#architecture-และ-design-patterns)
- [การติดตั้งและใช้งาน](#การติดตั้งและใช้งาน)
- [โครงสร้างโปรแกรม](#โครงสร้างโปรแกรม)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Tools และ Libraries](#tools-และ-libraries)
- [Performance และ Optimization](#performance-และ-optimization)
- [Security Features](#security-features)
- [ข้อดีและข้อเสีย](#ข้อดีและข้อเสีย)
- [คู่มือการใช้งานแต่ละฟีเจอร์](#คู่มือการใช้งานแต่ละฟีเจอร์)
- [Advanced Features](#advanced-features)
- [การพัฒนาและขยายฟีเจอร์](#การพัฒนาและขยายฟีเจอร์)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [การสร้าง Build](#การสร้าง-build)
- [Contributing](#contributing)
- [FAQ](#faq)
- [Changelog](#changelog)

## 🎯 ภาพรวมโครงการ

Color Formula Desktop App เป็นระบบจัดการสูตรสีที่ทันสมัยสำหรับอุตสาหกรรมสิ่งทอและการย้อมผ้า พัฒนาด้วยเทคโนโลยี Electron, SQLite และ AI แบบ Offline

### 🎯 วัตถุประสงค์หลัก
- เพิ่มประสิทธิภาพการค้นหาสูตรสีในโรงงานและห้องแลป
- ลดเวลาการทำงานด้วยระบบ AI Search ที่เข้าใจภาษาไทย
- จัดการฐานข้อมูลสูตรสีแบบครบวงจร
- วิเคราะห์ข้อมูลเพื่อการตัดสินใจทางธุรกิจ

### 🚀 ความสามารถหลัก
- **🔍 Multi-Search Engine**: ค้นหาได้ 3 แบบ (Basic, Formula-based, AI)
- **🤖 AI ฟรี 100%**: ใช้ NLP แบบ offline ไม่ต้องเสียค่า API
- **🎨 Visual Color Management**: แสดงสี RGB จริงของสูตร
- **📊 Business Intelligence**: วิเคราะห์ข้อมูลเชิงลึกด้วย Charts
- **🔐 Enterprise Security**: ระบบรักษาความปลอดภัยระดับองค์กร
- **💾 Data Portability**: Import/Export หลายรูปแบบ
- **⚡ High Performance**: ใช้ SQLite + In-memory cache

### 🏭 Target Users
- โรงงานผลิตสิ่งทอและเครื่องนุ่งห่ม
- ห้องแลปทดสอบสีและคุณภาพ
- นักวิจัยและพัฒนาสีใหม่
- ผู้ประกอบการ SMEs ด้านสิ่งทอ
- นักศึกษาสาขาวิทยาศาสตร์สี

### 🎨 การแสดงสี RGB และ Color Management
โปรแกรมมีระบบจัดการสีที่ทันสมัย:
- **RGB Color Preview**: แสดงสีจริงของสูตรในรูปแบบ RGB hex
- **Color Accuracy**: คำนวณสีที่แม่นยำจากส่วนผสมแม่สี
- **Visual Feedback**: แสดงตัวอย่างสีบนการ์ดแต่ละสูตร
- **Color Matching**: เปรียบเทียบสีระหว่างสูตรต่างๆ
- **RGB to Lab Conversion**: สามารถแปลงค่าสีได้หลายรูปแบบ

### 🔄 Data Flow และ Processing
- **Real-time Processing**: ประมวลผลข้อมูลแบบเรียลไทม์
- **Background Tasks**: การประมวลผลแบบ background สำหรับงานหนัก
- **Memory Management**: จัดการหน่วยความจำอย่างมีประสิทธิภาพ
- **Cache Strategy**: ใช้ cache เพื่อเพิ่มความเร็ว
- **Error Handling**: ระบบจัดการข้อผิดพลาดที่ครอบคลุม

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

### 🗄 การจัดการข้อมูล (Data Management)
- **Import Capabilities**:
  - รองรับไฟล์ Excel (.xlsx) แบบ batch processing
  - Validation ข้อมูลอัตโนมัติ พร้อม error reporting
  - Progress tracking สำหรับไฟล์ขนาดใหญ่
  - Data normalization และ cleaning
  - Duplicate detection และ handling

- **Export Options**:
  - SQLite Database (.sqlite) สำหรับ developers
  - Excel Workbook (.xlsx) พร้อม formatting
  - CSV format สำหรับ data analysis
  - JSON export สำหรับ API integration
  - PDF reports พร้อม charts และ summaries

- **Security & Access Control**:
  - Password-protected data management (LAB1221)
  - Delete confirmation system (รหัส 1221)
  - Activity logging และ audit trail
  - Backup verification และ integrity checks
  - Role-based access (Admin vs User)

### 🤖 AI Search Engine (ฟรี 100% - Offline)
**Core AI Technologies:**
- **Natural Language Processing (NLP)**:
  - Thai language understanding
  - Query parsing และ intent recognition
  - Semantic search capabilities
  - Fuzzy matching for typos
  - Context-aware search

- **Machine Learning Features**:
  - Formula similarity algorithms
  - Percentage-based matching
  - Color composition analysis
  - Pattern recognition in yarn types
  - Learning from user search patterns

- **Search Intelligence**:
  - Multi-criteria search (color + yarn + percentage)
  - Boolean operations (AND, OR, NOT)
  - Range queries (percentage between X-Y%)
  - Weighted scoring system
  - Search result ranking by relevance

- **Performance Features**:
  - 100% offline processing
  - No API keys or internet required
  - Sub-second response times
  - Memory-efficient algorithms
  - Scalable to large datasets

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

## Screenshots

### 🖼️ Main Interface
```
┌─────────────────────────────────────────────────┐
│ Color Formula Desktop App - หน้าหลัก            │
├─────────────────────────────────────────────────┤
│ [ค้นหาสูตร] [แม่สี] [สถิติ] [จัดการ]               │
├─────────────────────────────────────────────────┤
│ เล่ม: [DATA2025] รหัส: [BN0173] ชนิด: [PC16/2]    │
│ [ค้นหา] [🤖 AI Search] [📊 วิเคราะห์]             │
├─────────────────────────────────────────────────┤
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐ │
│ │🎨   │🎨   │🎨   │🎨   │🎨   │🎨   │🎨   │🎨   │ │
│ │BN173│D0123│YE3G │RD15 │BL22 │GR08 │OR44 │PK77 │ │
│ │PC16 │DG   │Silk │Cot  │PC16 │DG   │Wool │PC16 │ │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘ │
│ [◀ 1 2 3 4 5 ▶] แสดง 1-20 จาก 1,547 รายการ      │
└─────────────────────────────────────────────────┘
```

### 🤖 AI Search Interface
```
┌─────────────────────────────────────────────────┐
│ AI Search - ค้นหาด้วยภาษาธรรมชาติ                │
├─────────────────────────────────────────────────┤
│ 💬 "หาสีแดงเข้มสำหรับด้าย PC16/2"               │
│ [🔍 ค้นหา] [💡 ตัวอย่าง] [⚙️ ตั้งค่า]            │
├─────────────────────────────────────────────────┤
│ 🎯 ผลลัพธ์: พบ 15 สูตรที่ตรงเงื่อนไข              │
│ ┌─────────────────┬─────────────────┬─────────┐   │
│ │ 🎨 RD0173       │ ความคล้าย: 94% │ PC16/2  │   │
│ │ D01231: 0.25%   │ ความเข้ม: สูง   │ หน้า 45 │   │
│ │ DIANIX RED: 1.5%│ RGB: #8B0000    │ แถว 12  │   │
│ └─────────────────┴─────────────────┴─────────┘   │
└─────────────────────────────────────────────────┘
```

### 📊 Analytics Dashboard
```
┌─────────────────────────────────────────────────┐
│ วิเคราะห์ข้อมูล - ปี 2024                        │
├─────────────────────────────────────────────────┤
│ 📈 สถิติรวม: 1,547 สูตร | 89 แม่สี | 12 ชนิดด้าย │
├─────────────────────────────────────────────────┤
│ 🎨 แม่สียอดนิยม        📊 การกระจายตามชนิดด้าย   │
│ ┌─────────────────┐   ┌─────────────────────┐   │
│ │ D01231 ████▌   │   │     PC16/2 45%     │   │
│ │ DIANIX ███▌    │   │      DG 28%        │   │
│ │ YELLOW ██▌     │   │    Cotton 15%      │   │
│ │ RED 3G █▌      │   │     Silk 12%       │   │
│ └─────────────────┘   └─────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Architecture และ Design Patterns

### 🏗️ System Architecture
```
┌─────────────────────┐    ┌─────────────────────┐
│   Frontend (HTML)   │◄──►│  Backend (Node.js)  │
│  - Tailwind CSS     │    │  - Electron Main    │
│  - JavaScript ES6+  │    │  - SQLite Database  │
│  - Chart.js         │    │  - Excel Processing │
└─────────────────────┘    └─────────────────────┘
            │                         │
            ▼                         ▼
┌─────────────────────┐    ┌─────────────────────┐
│   IPC Communication │    │  Data Layer (MVC)   │
│  - Preload Scripts  │    │  - Models           │
│  - Event Handlers   │    │  - Controllers      │
│  - API Calls        │    │  - Services         │
└─────────────────────┘    └─────────────────────┘
```

### 🎯 Design Patterns ที่ใช้

#### 1. **MVC Pattern** (Model-View-Controller)
```javascript
// Model: Database operations
class FormulaModel {
    static async findByCode(code) {
        return db.prepare('SELECT * FROM formulas WHERE resultCode = ?').get(code);
    }
}

// View: HTML Templates and UI Updates
class FormulaView {
    static renderFormula(formula) {
        return `<div class="formula-card">${formula.resultCode}</div>`;
    }
}

// Controller: Business Logic
class FormulaController {
    static async search(criteria) {
        const results = await FormulaModel.search(criteria);
        return FormulaView.render(results);
    }
}
```

#### 2. **Observer Pattern** (Event-Driven)
```javascript
// Event system for UI updates
class EventManager {
    static events = new Map();

    static on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    static emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(data));
        }
    }
}
```

#### 3. **Factory Pattern** (สำหรับ Search Engines)
```javascript
class SearchEngineFactory {
    static create(type) {
        switch(type) {
            case 'basic': return new BasicSearchEngine();
            case 'formula': return new FormulaSearchEngine();
            case 'ai': return new AISearchEngine();
            default: throw new Error('Unknown search engine type');
        }
    }
}
```

#### 4. **Singleton Pattern** (Database Connection)
```javascript
class DatabaseManager {
    static instance = null;

    static getInstance() {
        if (!this.instance) {
            this.instance = new Database(DB_PATH);
        }
        return this.instance;
    }
}
```

### 🔄 Data Flow Architecture
```
User Input → UI Event → IPC Message → Main Process → Database → Response → UI Update
     ↓           ↓           ↓            ↓           ↓          ↓         ↓
  [Search]  [Validate]  [Serialize]  [Process]   [Query]   [Format]  [Render]
```

## 🏗 โครงสร้างโปรแกรม

### 📁 Project Structure
```
color-formula-desktop-app/
├── 📄 main.js                 # Electron main process (IPC, DB, File I/O)
├── 📄 preload.js             # Security bridge (contextIsolation)
├── 📄 index.html             # Single Page Application (SPA)
├── 📦 package.json           # Dependencies & build scripts
├── 📚 AI_SEARCH_SETUP.md     # AI Search documentation
├── 📖 README.md              # Project documentation
│
├── 📂 image/
│   ├── 🖼️ icon.png           # Application icon
│   ├── 🖼️ icon.ico           # Windows icon
│   └── 🖼️ icon.icns          # macOS icon
│
├── 📂 assets/ (runtime)
│   ├── 🎨 styles.css         # Custom CSS (if needed)
│   ├── 🔧 utils.js           # Utility functions
│   └── 📊 charts.js          # Chart configurations
│
├── 📂 dist/ (build output)
│   ├── 📦 win/               # Windows builds
│   ├── 📦 mac/               # macOS builds
│   └── 📦 linux/             # Linux builds (future)
│
└── 📂 temp/ (runtime)
    ├── 💾 database.sqlite    # User data database
    ├── 📊 exports/           # Exported files
    └── 📁 logs/              # Application logs
```

### 💾 Database Schema (SQLite)
```sql
-- =====================================================
-- Table: formulas (ข้อมูลสูตรสีหลัก)
-- =====================================================
CREATE TABLE formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- รหัสอัตโนมัติ
    book TEXT NOT NULL,                    -- เล่ม (DATA2025, BOOK001)
    resultCode TEXT NOT NULL,              -- รหัสสี (BN0173, D01231)
    date TEXT,                             -- วันที่ (YYYY-MM-DD)
    yarnType TEXT,                         -- ชนิดด้าย (PC16/2, Cotton)
    yarnModel TEXT,                        -- รุ่นด้าย (DG, Premium)
    page INTEGER,                          -- หน้า (1-999)
    row INTEGER,                           -- แถว (1-50)
    swatchColor TEXT,                      -- สี RGB hex (#FF0000)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_resultCode (resultCode),
    INDEX idx_book_page (book, page),
    INDEX idx_yarnType (yarnType),
    UNIQUE INDEX idx_unique_formula (book, page, row)
);

-- =====================================================
-- Table: ingredients (ส่วนผสมแม่สี)
-- =====================================================
CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- รหัสอัตโนมัติ
    formula_id INTEGER NOT NULL,           -- Foreign key
    motherCode TEXT NOT NULL,              -- รหัสแม่สี (D01231)
    name TEXT,                             -- ชื่อแม่สี (DIANIX RED)
    percentage REAL NOT NULL,              -- เปอร์เซ็นต์ (0.2500)
    sequence_order INTEGER DEFAULT 1,      -- ลำดับการผสม

    FOREIGN KEY (formula_id) REFERENCES formulas(id) ON DELETE CASCADE,
    INDEX idx_formula_id (formula_id),
    INDEX idx_motherCode (motherCode),
    INDEX idx_percentage (percentage)
);

-- =====================================================
-- Table: search_history (ประวัติการค้นหา)
-- =====================================================
CREATE TABLE search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_type TEXT NOT NULL,             -- 'basic', 'formula', 'ai'
    query_text TEXT,                       -- คำค้นหาที่ใช้
    results_count INTEGER,                 -- จำนวนผลลัพธ์
    search_time REAL,                      -- เวลาที่ใช้ค้นหา (ms)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Table: app_settings (การตั้งค่าแอป)
-- =====================================================
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,                  -- setting key
    value TEXT,                           -- setting value (JSON)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Views for common queries
-- =====================================================
CREATE VIEW formula_with_ingredients AS
SELECT
    f.*,
    GROUP_CONCAT(i.motherCode || ':' || i.percentage, ';') as ingredients_list,
    COUNT(i.id) as ingredient_count,
    AVG(i.percentage) as avg_percentage
FROM formulas f
LEFT JOIN ingredients i ON f.id = i.formula_id
GROUP BY f.id;

-- =====================================================
-- Triggers for data integrity
-- =====================================================
CREATE TRIGGER update_formula_timestamp
AFTER UPDATE ON formulas
BEGIN
    UPDATE formulas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

## 🔧 Tools และ Libraries

### 💾 Database & Storage
- **better-sqlite3** (v11.1.2): High-performance SQLite binding
  - Synchronous API สำหรับความเร็ว
  - Native binary compilation
  - Transaction support
  - Full-text search capabilities
  - WAL mode สำหรับ concurrent access

- **ExcelJS** (v4.3.0): Advanced Excel processing
  - Read/Write .xlsx files
  - Multiple worksheets support
  - Cell styling และ formatting
  - Formula support
  - Large file handling (streaming)

- **read-excel-file** (v5.5.3): Fast Excel reader
  - Optimized for read-only operations
  - Date parsing support
  - Schema validation
  - Error handling and recovery

- **dotenv** (v16.3.1): Environment configuration
  - Secure credential management
  - Development/Production configs
  - Cross-platform compatibility

### 🎨 Frontend & UI Libraries
- **Tailwind CSS** (CDN): Modern utility-first framework
  - Responsive design system
  - Dark mode support (future)
  - Component utilities
  - Custom color palettes
  - JIT compilation

- **Font Awesome** (v6.0.0): Comprehensive icon library
  - 10,000+ free icons
  - Vector-based scalability
  - Brand icons support
  - Animation capabilities

- **Chart.js** (Latest): Interactive data visualization
  - Canvas-based rendering
  - Responsive charts
  - Animation support
  - Plugin ecosystem
  - TypeScript support

- **Google Fonts - Sarabun**: Thai typography
  - Web font optimization
  - Multiple weights (400, 500, 700)
  - Thai character support
  - Fast loading via CDN

### 🛠️ Development & Build Tools
- **electron-builder** (v24.13.3): Advanced packaging
  - Multi-platform builds (Windows, macOS, Linux)
  - Code signing support
  - Auto-updater integration
  - NSIS installer (Windows)
  - DMG creation (macOS)
  - Notarization support

- **electron-packager** (v17.1.2): Alternative packager
  - Simple packaging workflow
  - Custom app icons
  - Platform-specific builds
  - Asar archive support

- **rimraf** (v3.0.2): Cross-platform file removal
  - Reliable rm -rf alternative
  - Windows long path support
  - Glob pattern support
  - Promise-based API

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

Color Formula เป็นโซลูชันที่ครอบคลุมสำหรับการจัดการสูตรสีในอุตสาหกรรมสิ่งทอ ด้วยเทคโนโลยีที่ทันสมัยและฟีเจอร์ที่หลากหลาย ทั้งการวิเคราะห์ข้อมูล, และระบบจัดการที่ปลอดภัย

**ผู้พัฒนา:** Tee Jakkrit
**เวอร์ชัน:** 1.1.0
**อัปเดตล่าสุด:** 2024
**License:** Tee Jakkrit
