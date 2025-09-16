const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');
const ExcelJS = require('exceljs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(app.getPath('userData'), 'database.sqlite');
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
    
    let lastFormula = formulaCache.length > 0 ? formulaCache[formulaCache.length - 1] : { page: 0, row: 0 };
    let currentPage = lastFormula.page || 1;
    let currentRow = lastFormula.row || 0;
    
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
  initializeDB();
  loadCacheFromDB();

  // --- IPC Handlers ---
  ipcMain.handle('get-formulas', () => {
    return formulaCache; // Return from fast cache
  });

  ipcMain.handle('update-formula', (event, updatedFormula) => {
      if (!updatedFormula || !updatedFormula.id) return { success: false, message: 'Invalid data' };
      
      try {
          const stmt = db.prepare('UPDATE formulas SET book = ?, page = ?, row = ?, swatchColor = ? WHERE id = ?');
          stmt.run(updatedFormula.book, updatedFormula.page, updatedFormula.row, updatedFormula.swatchColor, updatedFormula.id);

          // Update cache
          const index = formulaCache.findIndex(f => f.id === updatedFormula.id);
          if (index !== -1) {
              formulaCache[index] = { ...formulaCache[index], ...updatedFormula };
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

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  db.close(); // Gracefully close the database connection
  if (process.platform !== 'darwin') app.quit();
});

