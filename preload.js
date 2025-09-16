const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getFormulas: () => ipcRenderer.invoke('get-formulas'),
    updateFormula: (data) => ipcRenderer.invoke('update-formula', data),
    deleteFormula: (id) => ipcRenderer.invoke('delete-formula', id),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    importExcel: (filePath) => ipcRenderer.invoke('import-excel', filePath),
    downloadTemplate: () => ipcRenderer.invoke('download-template'),
    getAnalytics: () => ipcRenderer.invoke('get-analytics'),
    wipeDatabase: (code) => ipcRenderer.invoke('wipe-database', code),
});
