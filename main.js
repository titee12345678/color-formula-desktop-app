const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');
const ExcelJS = require('exceljs');
const Database = require('better-sqlite3');
require('dotenv').config();
const axios = require('axios');

const DB_PATH = path.join(app.getPath('userData'), 'database.sqlite');
const ICON_PATH = path.join(__dirname, 'image', 'icon.png');
const appIcon = nativeImage.createFromPath(ICON_PATH);
const DELETE_CODE = '1221';
let db;

// Initialize database connection
function initializeDBConnection() {
    try {
        db = new Database(DB_PATH);
        return true;
    } catch (error) {
        console.error('Failed to open database:', error);
        return false;
    }
}


// In-memory cache for fast read operations
let formulaCache = [];

// --- Database & Cache Functions ---

/**
 * Loads all formulas from the database into the in-memory cache.
 * This function reconstructs the data to match the original JSON structure.
 */
function loadCacheFromDB() {
    console.log('Loading database into memory cache...');
    try {
        if (!db || !db.open) {
            console.log('Database not open, reinitializing...');
            initializeDBConnection();
        }

        const stmt = db.prepare(`
            SELECT
                f.id, f.book, f.resultCode, f.date, f.yarnType, f.yarnModel, f.page, f.row, f.swatchColor,
                GROUP_CONCAT(i.motherCode || '::' || IFNULL(i.name, '') || '::' || i.percentage, ';;') as ingredients
            FROM formulas f
            LEFT JOIN ingredients i ON f.id = i.formula_id
            GROUP BY f.id
            ORDER BY f.page, f.row
        `);
        
        const rows = stmt.all();

        formulaCache = rows.map(row => {
            const formulaParts = row.ingredients && row.ingredients.split(';;')[0] !== '::::'
                ? row.ingredients.split(';;').map(part => {
                    const [motherCode, name, percentage] = part.split('::');
                    return { 
                        motherCode, 
                        name: name || '', 
                        percentage: parseFloat(percentage) 
                    };
                }) 
                : [];

            delete row.ingredients; // Clean up the temporary field
            row.formula = formulaParts;
            return row;
        });

        console.log(`Successfully loaded ${formulaCache.length} formulas into cache.`);
    } catch (error) {
        console.error('Failed to load cache from DB:', error);
        formulaCache = [];
    }
}


function parseFormulaDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;

        // Support DD/MM/YYYY, DD-MM-YYYY formats
        const match = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
        if (match) {
            let [, dd, mm, yyyy] = match;
            let year = parseInt(yyyy, 10);
            let month = parseInt(mm, 10);
            let day = parseInt(dd, 10);

            // Validate ranges
            if (month < 1 || month > 12) return null;
            if (day < 1 || day > 31) return null;

            // Fix 2-digit years
            if (year < 100) {
                year += year >= 70 ? 1900 : 2000;
            }

            // Validate year range
            if (year < 1900 || year > 2100) return null;

            const result = new Date(year, month - 1, day);
            // Double check the date is valid (handles things like Feb 30)
            if (result.getFullYear() !== year ||
                result.getMonth() !== month - 1 ||
                result.getDate() !== day) {
                return null;
            }

            return result;
        }

        // Try ISO format or other standard formats
        const fallback = new Date(trimmed);
        return Number.isNaN(fallback.getTime()) ? null : fallback;
    }

    return null;
}


function buildAnalyticsSummary() {
    const totalFormulas = formulaCache.length;
    const bookCounts = new Map();
    const yarnCounts = new Map();
    const yearMonthMap = new Map();
    const ingredientCounts = new Map();
    let latestDate = null;

    const dateFormatter = new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
    const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    for (const formula of formulaCache) {
        if (formula.book) {
            const key = formula.book;
            bookCounts.set(key, (bookCounts.get(key) || 0) + 1);
        }

        if (formula.yarnType) {
            const key = formula.yarnType;
            yarnCounts.set(key, (yarnCounts.get(key) || 0) + 1);
        }

        if (Array.isArray(formula.formula)) {
            for (const ingredient of formula.formula) {
                if (!ingredient || typeof ingredient !== 'object' || !ingredient.motherCode) continue;
                const code = ingredient.motherCode;
                const entry = ingredientCounts.get(code) || { count: 0, name: ingredient.name || '' };
                entry.count += 1;
                if (ingredient.name && !entry.name) {
                    entry.name = ingredient.name;
                }
                ingredientCounts.set(code, entry);
            }
        }

        const parsedDate = parseFormulaDate(formula.date);
        if (parsedDate) {
            const year = parsedDate.getFullYear();
            const monthIndex = parsedDate.getMonth();

            if (!yearMonthMap.has(year)) {
                yearMonthMap.set(year, Array(12).fill(0));
            }

            const countsByMonth = yearMonthMap.get(year);
            countsByMonth[monthIndex] = (countsByMonth[monthIndex] || 0) + 1;

            if (!latestDate || parsedDate > latestDate) {
                latestDate = parsedDate;
            }
        }
    }

    const aggregateToArray = (map) => Array.from(map.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

    const formulasByBook = aggregateToArray(bookCounts);
    const formulasByYarnType = aggregateToArray(yarnCounts);

    const sortedYears = Array.from(yearMonthMap.keys()).sort((a, b) => b - a);
    const monthlyTrend = {
        years: sortedYears,
        data: {}
    };

    for (const year of sortedYears) {
        const countsByMonth = yearMonthMap.get(year) || [];
        monthlyTrend.data[year] = monthLabels.map((label, index) => ({
            label,
            count: countsByMonth[index] || 0
        }));
    }

    const topMotherCodes = Array.from(ingredientCounts.entries())
        .map(([motherCode, { count, name }]) => ({ motherCode, name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        totalFormulas,
        totalBooks: bookCounts.size,
        latestFormulaDate: latestDate ? dateFormatter.format(latestDate) : null,
        formulasByBook,
        formulasByYarnType,
        monthlyTrend,
        topMotherCodes,
    };
}

/**
 * User Analytics & Logging Functions
 */
let currentSessionId = generateSessionId();
const APP_VERSION = '1.1.0';

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function logUserActivity(action, data = {}) {
    try {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            session_id: currentSessionId,
            action,
            category: data.category || null,
            view_name: data.viewName || null,
            search_query: data.searchQuery || null,
            search_type: data.searchType || null,
            results_count: data.resultsCount || null,
            search_filters: data.searchFilters ? JSON.stringify(data.searchFilters) : null,
            response_time: data.responseTime || null,
            formula_id: data.formulaId || null,
            yarn_type: data.yarnType || null,
            data: data.extra ? JSON.stringify(data.extra) : null,
            user_agent: process.platform || null,
            app_version: APP_VERSION
        };

        const stmt = db.prepare(`
            INSERT INTO user_logs (
                timestamp, session_id, action, category, view_name, search_query,
                search_type, results_count, search_filters, response_time, formula_id,
                yarn_type, data, user_agent, app_version
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `);

        stmt.run(
            logEntry.timestamp, logEntry.session_id, logEntry.action,
            logEntry.category, logEntry.view_name, logEntry.search_query,
            logEntry.search_type, logEntry.results_count, logEntry.search_filters,
            logEntry.response_time, logEntry.formula_id, logEntry.yarn_type,
            logEntry.data, logEntry.user_agent, logEntry.app_version
        );

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึก Log:', error);
    }
}



/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 204, g: 204, b: 204 }; // Default gray if invalid
}

/**
 * Export all formulas to SQLite database file
 */
async function exportSQLiteDatabase() {
    try {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Export SQLite Database',
            defaultPath: `color_formulas_export_${new Date().toISOString().split('T')[0]}.sqlite`,
            filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }]
        });

        if (canceled || !filePath) return { success: false, message: 'การ export ถูกยกเลิก' };

        // Copy the current database to export location
        const sourcePath = DB_PATH;
        fs.copyFileSync(sourcePath, filePath);

        return { success: true, filePath };
    } catch (error) {
        console.error('SQLite Export Error:', error);
        return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการ export SQLite' };
    }
}

/**
 * Export all formulas to Excel with complete information including RGB values
 */
async function exportExcelDatabase() {
    try {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Export Excel Database',
            defaultPath: `color_formulas_complete_export_${new Date().toISOString().split('T')[0]}.xlsx`,
            filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
        });

        if (canceled || !filePath) return { success: false, message: 'การ export ถูกยกเลิก' };

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Color Formulas Export');

        // Define columns with proper headers
        worksheet.columns = [
            { header: 'เล่ม (Book)', key: 'book', width: 15 },
            { header: 'หน้า (Page)', key: 'page', width: 10 },
            { header: 'แถว (Row)', key: 'row', width: 10 },
            { header: 'รหัสสี (Result Code)', key: 'resultCode', width: 20 },
            { header: 'วันที่ (Date)', key: 'date', width: 15 },
            { header: 'ชนิดด้าย (Yarn Type)', key: 'yarnType', width: 15 },
            { header: 'รุ่นด้าย (Yarn Model)', key: 'yarnModel', width: 15 },
            { header: 'สีตัวอย่าง (Hex)', key: 'swatchColorHex', width: 15 },
            { header: 'RGB_R', key: 'rgb_r', width: 10 },
            { header: 'RGB_G', key: 'rgb_g', width: 10 },
            { header: 'RGB_B', key: 'rgb_b', width: 10 },
            { header: 'รหัสแม่สี (Mother Code)', key: 'motherCode', width: 20 },
            { header: 'ชื่อสี (Color Name)', key: 'colorName', width: 30 },
            { header: 'เปอร์เซ็นต์ (Percentage)', key: 'percentage', width: 15 }
        ];

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Get all formulas from cache
        const formulas = formulaCache || [];

        // Process each formula and its ingredients
        formulas.forEach(formula => {
            const rgb = hexToRgb(formula.swatchColor || '#CCCCCC');

            if (Array.isArray(formula.formula) && formula.formula.length > 0) {
                // Add row for each ingredient
                formula.formula.forEach(ingredient => {
                    const row = worksheet.addRow({
                        book: formula.book || '',
                        page: formula.page || '',
                        row: formula.row || '',
                        resultCode: formula.resultCode || '',
                        date: formula.date || '',
                        yarnType: formula.yarnType || '',
                        yarnModel: formula.yarnModel || '',
                        swatchColorHex: formula.swatchColor || '#CCCCCC',
                        rgb_r: rgb.r,
                        rgb_g: rgb.g,
                        rgb_b: rgb.b,
                        motherCode: ingredient.motherCode || '',
                        colorName: ingredient.name || '',
                        percentage: ingredient.percentage || 0
                    });

                    // Color the swatch color cell with actual color
                    const swatchCell = row.getCell('swatchColorHex');
                    swatchCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: `FF${(formula.swatchColor || '#CCCCCC').replace('#', '')}` }
                    };
                });
            } else {
                // Add formula without ingredients
                const row = worksheet.addRow({
                    book: formula.book || '',
                    page: formula.page || '',
                    row: formula.row || '',
                    resultCode: formula.resultCode || '',
                    date: formula.date || '',
                    yarnType: formula.yarnType || '',
                    yarnModel: formula.yarnModel || '',
                    swatchColorHex: formula.swatchColor || '#CCCCCC',
                    rgb_r: rgb.r,
                    rgb_g: rgb.g,
                    rgb_b: rgb.b,
                    motherCode: '',
                    colorName: '',
                    percentage: 0
                });

                const swatchCell = row.getCell('swatchColorHex');
                swatchCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: `FF${(formula.swatchColor || '#CCCCCC').replace('#', '')}` }
                };
            }
        });

        // Add borders to all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Add summary information at the bottom
        const summaryStartRow = worksheet.rowCount + 3;
        worksheet.getCell(`A${summaryStartRow}`).value = 'สรุปข้อมูล:';
        worksheet.getCell(`A${summaryStartRow}`).font = { bold: true };
        worksheet.getCell(`A${summaryStartRow + 1}`).value = `จำนวนสูตรทั้งหมด: ${formulas.length} สูตร`;
        worksheet.getCell(`A${summaryStartRow + 2}`).value = `Export เมื่อ: ${new Date().toLocaleString('th-TH')}`;

        await workbook.xlsx.writeFile(filePath);
        return { success: true, filePath, totalFormulas: formulas.length };
    } catch (error) {
        console.error('Excel Export Error:', error);
        return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการ export Excel' };
    }
}

/**
 * Initializes the database, creates tables if they don't exist,
 * and migrates data from db.json if necessary.
 */
function initializeDB() {
    if (!db) {
        initializeDBConnection();
    }

    db.exec(`
        CREATE TABLE IF NOT EXISTS formulas (
            id TEXT PRIMARY KEY,
            book TEXT,
            resultCode TEXT,
            date TEXT,
            yarnType TEXT,
            yarnModel TEXT,
            page INTEGER,
            row INTEGER,
            swatchColor TEXT
        );
        CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            formula_id TEXT NOT NULL,
            motherCode TEXT,
            name TEXT,
            percentage REAL,
            FOREIGN KEY (formula_id) REFERENCES formulas(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_formula_id ON ingredients(formula_id);

        CREATE TABLE IF NOT EXISTS user_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            session_id TEXT NOT NULL,
            action TEXT NOT NULL,
            category TEXT,
            view_name TEXT,
            search_query TEXT,
            search_type TEXT,
            results_count INTEGER,
            search_filters TEXT,
            response_time INTEGER,
            formula_id TEXT,
            yarn_type TEXT,
            data TEXT,
            user_agent TEXT,
            app_version TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_session_id ON user_logs(session_id);
        CREATE INDEX IF NOT EXISTS idx_action ON user_logs(action);
        CREATE INDEX IF NOT EXISTS idx_timestamp ON user_logs(timestamp);
    `);

    // Check for old db.json and migrate if it exists
    const oldDbPath = path.join(app.getPath('userData'), 'db.json');
    const migratedMarker = path.join(app.getPath('userData'), 'db.json.migrated');

    if (fs.existsSync(oldDbPath) && !fs.existsSync(migratedMarker)) {
        console.log('Found db.json, starting migration to SQLite...');
        const formulas = JSON.parse(fs.readFileSync(oldDbPath, 'utf8'));
        
        const insertFormula = db.prepare('INSERT OR REPLACE INTO formulas (id, book, resultCode, date, yarnType, yarnModel, page, row, swatchColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const insertIngredient = db.prepare('INSERT INTO ingredients (formula_id, motherCode, name, percentage) VALUES (?, ?, ?, ?)');

        db.transaction((data) => {
            for (const formula of data) {
                insertFormula.run(formula.id, formula.book, formula.resultCode, formula.date, formula.yarnType, formula.yarnModel, formula.page, formula.row, formula.swatchColor);
                if (formula.formula && formula.formula.length > 0) {
                    for (const ingredient of formula.formula) {
                        insertIngredient.run(formula.id, ingredient.motherCode, ingredient.name, ingredient.percentage);
                    }
                }
            }
        })(formulas);

        fs.renameSync(oldDbPath, migratedMarker);
        console.log('Migration complete. Renamed db.json to db.json.migrated.');
    }
}


async function transformAndValidateExcelData(filePath) {
    const rows = await readXlsxFile(filePath);
    rows.shift(); // Remove header
    
    const groupedFormulas = new Map();
    const errors = [];
    
    const pages = formulaCache
        .map(f => Number(f.page))
        .filter(page => Number.isFinite(page) && page > 0);

    let currentPage = pages.length > 0 ? Math.max(...pages) : 1;

    const rowsOnCurrentPage = formulaCache
        .filter(f => Number(f.page) === currentPage)
        .map(f => Number(f.row))
        .filter(row => Number.isFinite(row) && row >= 0);

    let currentRow = rowsOnCurrentPage.length > 0 ? Math.max(...rowsOnCurrentPage) : 0;

    if (!Number.isFinite(currentPage) || currentPage < 1) {
        currentPage = 1;
    }

    if (!Number.isFinite(currentRow) || currentRow < 0) {
        currentRow = 0;
    }
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; 

        const [
            colorCode, materialName, materialCode, matPercent,
            mat, seriesCode, clabNo, formulaDateRaw
        ] = row;

        if (!clabNo || !mat || !seriesCode || !materialCode || typeof matPercent !== 'number' || !formulaDateRaw) {
            errors.push(`แถวที่ ${rowNum}: ข้อมูลไม่ครบถ้วนหรือรูปแบบผิดพลาด`);
            continue;
        }

        let formulaDate;
        if (formulaDateRaw instanceof Date) {
             formulaDate = formulaDateRaw.toLocaleDateString('en-GB');
        } else if (typeof formulaDateRaw === 'string' && formulaDateRaw.trim() !== '') {
             formulaDate = formulaDateRaw;
        } else {
            errors.push(`แถวที่ ${rowNum}: FORMULA_DATE มีรูปแบบไม่ถูกต้อง`);
            continue;
        }

        const key = `${clabNo}-${mat}-${seriesCode}`;
        
        const formulaPart = {
            motherCode: materialCode.toString(),
            name: materialName ? materialName.toString() : '',
            percentage: parseFloat(matPercent)
        };

        if (!groupedFormulas.has(key)) {
             currentRow++;
            if(currentRow > 12) {
                currentRow = 1;
                currentPage++;
            }
            const uniqueId = `${colorCode || 'NO_CODE'}-${mat}-${seriesCode}-${Date.now()}`;
            groupedFormulas.set(key, {
                id: uniqueId,
                book: "DATA2025",
                resultCode: colorCode ? colorCode.toString() : '',
                date: formulaDate,
                yarnType: mat.toString(),
                yarnModel: seriesCode.toString(),
                page: currentPage,
                row: currentRow,
                formula: [],
                swatchColor: "#CCCCCC"
            });
        }
        
        groupedFormulas.get(key).formula.push(formulaPart);
    }

    if (errors.length > 0) return { success: false, errors };
    return { success: true, data: Array.from(groupedFormulas.values()) };
}

// --- Window Creation ---
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: appIcon.isEmpty() ? undefined : appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools();
}


// --- App Lifecycle ---
app.whenReady().then(() => {
  if (!appIcon.isEmpty() && process.platform === 'darwin') {
    app.dock.setIcon(appIcon);
  }

  // Initialize database connection first
  initializeDBConnection();
  initializeDB();
  loadCacheFromDB();

  // --- IPC Handlers ---
  ipcMain.handle('get-formulas', () => {
    return formulaCache; // Return from fast cache
  });

  ipcMain.handle('update-formula', (event, updatedFormula) => {
      if (!updatedFormula || !updatedFormula.id) return { success: false, message: 'Invalid data' };
      
      try {
          const page = Number(updatedFormula.page);
          const row = Number(updatedFormula.row);

          if (!Number.isFinite(page) || !Number.isFinite(row)) {
              return { success: false, message: 'page หรือ row ต้องเป็นตัวเลข' };
          }

          const stmt = db.prepare('UPDATE formulas SET book = ?, page = ?, row = ?, swatchColor = ? WHERE id = ?');
          stmt.run(updatedFormula.book, page, row, updatedFormula.swatchColor, updatedFormula.id);

          // Update cache
          const index = formulaCache.findIndex(f => f.id === updatedFormula.id);
          if (index !== -1) {
              formulaCache[index] = { ...formulaCache[index], ...updatedFormula, page, row };
          }
          return { success: true };
      } catch (error) {
          console.error('Update failed:', error);
          return { success: false, message: 'Database update failed' };
      }
  });

  ipcMain.handle('delete-formula', (event, id) => {
      if (!id) return { success: false, message: 'Invalid ID' };
      
      try {
          const stmt = db.prepare('DELETE FROM formulas WHERE id = ?');
          const result = stmt.run(id);

          if (result.changes === 0) return { success: false, message: 'Formula not found' };

          // Update cache
          formulaCache = formulaCache.filter(f => f.id !== id);
          return { success: true };
      } catch (error) {
          console.error('Delete failed:', error);
          return { success: false, message: 'Database delete failed' };
      }
  });

  ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle('import-excel', async (event, filePath) => {
      try {
        const result = await transformAndValidateExcelData(filePath);
        if (!result.success) return { success: false, message: 'ข้อมูลในไฟล์ Excel ไม่ถูกต้อง', errors: result.errors };
        
        const newFormulas = result.data;
        const existingKeys = new Set(formulaCache.map(f => `${f.resultCode}-${f.yarnType}-${f.yarnModel}`));
        const uniqueNewFormulas = newFormulas.filter(f => !existingKeys.has(`${f.resultCode}-${f.yarnType}-${f.yarnModel}`));

        if (uniqueNewFormulas.length === 0) {
            return { success: true, message: 'ข้อมูลมีอยู่แล้ว ไม่มีการเพิ่มสูตรใหม่' };
        }
        
        // Transaction for bulk insert
        const insertFormula = db.prepare('INSERT INTO formulas (id, book, resultCode, date, yarnType, yarnModel, page, row, swatchColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const insertIngredient = db.prepare('INSERT INTO ingredients (formula_id, motherCode, name, percentage) VALUES (?, ?, ?, ?)');
        const importTransaction = db.transaction((formulasToImport) => {
            for (const formula of formulasToImport) {
                insertFormula.run(formula.id, formula.book, formula.resultCode, formula.date, formula.yarnType, formula.yarnModel, formula.page, formula.row, formula.swatchColor);
                for (const ingredient of formula.formula) {
                    insertIngredient.run(formula.id, ingredient.motherCode, ingredient.name, ingredient.percentage);
                }
            }
        });
        
        importTransaction(uniqueNewFormulas);

        // Reload cache to reflect changes
        loadCacheFromDB();

        return { success: true, message: `นำเข้า ${uniqueNewFormulas.length} สูตรใหม่สำเร็จ` };
      } catch (error) {
          console.error('Import Error:', error);
          return { success: false, message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลลงฐานข้อมูล' };
      }
  });

  ipcMain.handle('get-analytics', () => {
      try {
          return { success: true, data: buildAnalyticsSummary() };
      } catch (error) {
          console.error('Analytics failed:', error);
          return { success: false, message: 'ไม่สามารถสร้างสรุปข้อมูลได้' };
      }
  });

  ipcMain.handle('download-template', async () => {
      const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'บันทึกไฟล์เทมเพลต',
          defaultPath: 'template.xlsx',
          filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
      });

      if (canceled || !filePath) return { success: false };
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Template');
      worksheet.columns = [
          { header: 'COLOR_CODE', key: 'cc', width: 20 },
          { header: 'MATERIALNAME', key: 'mn', width: 40 },
          { header: 'MATERIAL_CODE', key: 'mc', width: 20 },
          { header: 'MAT_PERCENT', key: 'mp', width: 15, style: { numFmt: '0.0000' } },
          { header: 'MAT', key: 'm', width: 20 },
          { header: 'SERIES_CODE', key: 'sc', width: 15 },
          { header: 'CLAB_NO', key: 'cn', width: 20 },
          { header: 'FORMULA_DATE', key: 'fd', width: 15, style: { numFmt: 'dd/mm/yyyy' } }
      ];
      worksheet.getRow(1).font = { bold: true };
      worksheet.addRow(['BN0173', 'DIANIX RED S-G01', 'D01231', 0.2120, 'PC16/2', 'DG', 'GL2506-005', new Date()]);
      await workbook.xlsx.writeFile(filePath);
      return { success: true };
  });

  ipcMain.handle('wipe-database', (event, code) => {
      if (code !== DELETE_CODE) {
          return { success: false, message: 'รหัสยืนยันไม่ถูกต้อง' };
      }

      try {
          const wipeTransaction = db.transaction(() => {
              db.prepare('DELETE FROM ingredients').run();
              db.prepare('DELETE FROM formulas').run();
          });

          wipeTransaction();
          db.exec('VACUUM');
          formulaCache = [];
          return { success: true };
      } catch (error) {
          console.error('Wipe database failed:', error);
          return { success: false, message: 'ไม่สามารถลบข้อมูลทั้งหมดได้' };
      }
  });

  ipcMain.handle('export-sqlite', async () => {
      try {
          const result = await exportSQLiteDatabase();
          return result;
      } catch (error) {
          console.error('Export SQLite IPC Error:', error);
          return {
              success: false,
              message: 'เกิดข้อผิดพลาดในการ export SQLite database'
          };
      }
  });

  ipcMain.handle('export-excel', async () => {
      try {
          const result = await exportExcelDatabase();
          return result;
      } catch (error) {
          console.error('Export Excel IPC Error:', error);
          return {
              success: false,
              message: 'เกิดข้อผิดพลาดในการ export Excel database'
          };
      }
  });

  ipcMain.handle('log-user-activity', async (event, action, data) => {
      try {
          logUserActivity(action, data);
          return { success: true };
      } catch (error) {
          console.error('เกิดข้อผิดพลาดในการบันทึกกิจกรรมผู้ใช้:', error);
          return { success: false, message: error.message };
      }
  });


  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (db && db.open) {
    db.close(); // Gracefully close the database connection
  }
  if (process.platform !== 'darwin') app.quit();
});
