const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');
const ExcelJS = require('exceljs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(app.getPath('userData'), 'database.sqlite');
const ICON_PATH = path.join(__dirname, 'image', 'icon.png');
const appIcon = nativeImage.createFromPath(ICON_PATH);
const DELETE_CODE = '1221';
const db = new Database(DB_PATH);

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

        const match = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
        if (match) {
            let [, dd, mm, yyyy] = match;
            let year = parseInt(yyyy, 10);
            if (year < 100) {
                year += year >= 70 ? 1900 : 2000;
            }
            const month = parseInt(mm, 10) - 1;
            const day = parseInt(dd, 10);
            const result = new Date(year, month, day);
            return Number.isNaN(result.getTime()) ? null : result;
        }

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
                if (!ingredient || !ingredient.motherCode) continue;
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
 * Initializes the database, creates tables if they don't exist,
 * and migrates data from db.json if necessary.
 */
function initializeDB() {
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

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  db.close(); // Gracefully close the database connection
  if (process.platform !== 'darwin') app.quit();
});
