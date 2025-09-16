const express = require('express');
const cors = require('cors');
const multer = require('multer');
const readXlsxFile = require('read-excel-file/node');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const DB_PATH = path.join(__dirname, 'db.json');
const UPLOAD_PATH = path.join(__dirname, 'uploads');

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- Multer Setup for File Uploads ---
if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });


// --- Helper Functions ---
function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, '[]', 'utf8');
            return [];
        }
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database file:', error);
        return [];
    }
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4), 'utf8');
    } catch (error) {
        console.error('Error writing to database file:', error);
    }
}

async function transformAndValidateExcelData(filePath) {
    const rows = await readXlsxFile(filePath);
    rows.shift(); // Remove header
    
    const groupedFormulas = new Map();
    const errors = [];

    // Assign initial page and row from the existing DB to avoid overlap
    const existingFormulas = readDB();
    let currentPage = Math.max(0, ...existingFormulas.map(f => f.page));
    let currentRow = Math.max(0, ...existingFormulas.filter(f => f.page === currentPage).map(f => f.row));
     if (isNaN(currentPage) || isNaN(currentRow) || currentPage === 0) {
        currentPage = 1;
        currentRow = 0;
    }


    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // Excel row number (1-based index + header)

        const [
            colorCode, materialName, materialCode, matPercent,
            mat, seriesCode, clabNo, formulaDateRaw
        ] = row;

        // --- Validation Step ---
        if (!clabNo) { errors.push(`แถวที่ ${rowNum}: CLAB_NO ห้ามว่าง`); continue; }
        if (!mat) { errors.push(`แถวที่ ${rowNum}: MAT ห้ามว่าง`); continue; }
        if (!seriesCode) { errors.push(`แถวที่ ${rowNum}: SERIES_CODE ห้ามว่าง`); continue; }
        if (!materialCode) { errors.push(`แถวที่ ${rowNum}: MATERIAL_CODE ห้ามว่าง`); continue; }
         if (typeof matPercent !== 'number') { errors.push(`แถวที่ ${rowNum}: MAT_PERCENT ต้องเป็นตัวเลข`); continue; }

        let formulaDate;
        if (formulaDateRaw instanceof Date) {
             formulaDate = formulaDateRaw.toLocaleDateString('en-GB'); // DD/MM/YYYY
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
            if(currentRow > 12) { // Assuming 12 rows per page
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

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return { success: true, data: Array.from(groupedFormulas.values()) };
}


// --- API Routes ---
app.get('/api/formulas', (req, res) => {
    res.json(readDB());
});

app.put('/api/formulas', (req, res) => {
    const updatedFormula = req.body;
    if (!updatedFormula || !updatedFormula.id) {
        return res.status(400).json({ success: false, message: 'Invalid data provided for update.' });
    }

    try {
        const formulas = readDB();
        const formulaIndex = formulas.findIndex(f => f.id === updatedFormula.id);

        if (formulaIndex === -1) {
            return res.status(404).json({ success: false, message: 'Formula not found.' });
        }

        // Update only the allowed fields
        formulas[formulaIndex].book = updatedFormula.book;
        formulas[formulaIndex].page = updatedFormula.page;
        formulas[formulaIndex].row = updatedFormula.row;
        formulas[formulaIndex].swatchColor = updatedFormula.swatchColor;

        writeDB(formulas);
        res.json({ success: true, message: 'อัปเดตสูตรสำเร็จ', data: formulas[formulaIndex] });
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
});

app.delete('/api/formulas/:id', (req, res) => {
    // Express automatically decodes URI components from params
    const { id } = req.params; 
    if (!id) {
        return res.status(400).json({ success: false, message: 'Missing formula ID.' });
    }

    try {
        const formulas = readDB();
        const initialLength = formulas.length;
        const updatedFormulas = formulas.filter(f => f.id !== id);

        if (updatedFormulas.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Formula not found.' });
        }

        writeDB(updatedFormulas);
        res.json({ success: true, message: 'ลบสูตรสำเร็จ' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
});


app.post('/api/import', upload.single('excelFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    try {
        const result = await transformAndValidateExcelData(req.file.path);

        if (!result.success) {
            return res.status(400).json({ success: false, message: 'ข้อมูลในไฟล์ Excel ไม่ถูกต้อง', errors: result.errors });
        }

        const newFormulas = result.data;
        const existingFormulas = readDB();
        const existingKeys = new Set(existingFormulas.map(f => `${f.resultCode}-${f.yarnType}-${f.yarnModel}`));
        
        const uniqueNewFormulas = newFormulas.filter(f => !existingKeys.has(`${f.resultCode}-${f.yarnType}-${f.yarnModel}`));

        if (uniqueNewFormulas.length === 0) {
            return res.status(200).json({ success: true, message: 'ข้อมูลมีอยู่แล้ว ไม่มีการเพิ่มสูตรใหม่' });
        }

        const updatedFormulas = existingFormulas.concat(uniqueNewFormulas);
        writeDB(updatedFormulas);
        
        res.json({ 
            success: true, 
            message: `นำเข้า ${uniqueNewFormulas.length} สูตรใหม่สำเร็จ` 
        });

    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์' });
    } finally {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });
    }
});

// Route for downloading the template
app.get('/api/template', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Template');

        worksheet.columns = [
            { header: 'COLOR_CODE', key: 'color_code', width: 20 },
            { header: 'MATERIALNAME', key: 'material_name', width: 40 },
            { header: 'MATERIAL_CODE', key: 'material_code', width: 20 },
            { header: 'MAT_PERCENT', key: 'mat_percent', width: 15, style: { numFmt: '0.0000' } },
            { header: 'MAT', key: 'mat', width: 20 },
            { header: 'SERIES_CODE', key: 'series_code', width: 15 },
            { header: 'CLAB_NO', key: 'clab_no', width: 20 },
            { header: 'FORMULA_DATE', key: 'formula_date', width: 15, style: { numFmt: 'dd/mm/yyyy' } }
        ];
        
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FF4F81BD'} };

        worksheet.addRow(['BN0173', 'DIANIX RED S-G01', 'D01231', 0.2120, 'PC16/2', 'DG', 'GL2506-005', new Date()]);
        worksheet.addRow(['BN0173', 'DIANIX YELLOW S-6G', 'D01121', 0.2300, 'PC16/2', 'DG', 'GL2506-005', new Date()]);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template.xlsx"');

        await workbook.xlsx.write(res);
        res.end();

    } catch(err) {
        console.error("Error creating template", err);
        res.status(500).send("Error creating Excel template");
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

