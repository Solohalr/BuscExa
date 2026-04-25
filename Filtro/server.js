const express = require('express');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos (HTML, CSS)
app.use(express.static('public'));

// Variables para guardar los datos en memoria del servidor
let allData = [];
let headers = [];

console.log("📂 Iniciando servidor...");
console.log("🔄 Cargando archivos Excel... (Esto puede tardar unos segundos)");

try {
    // 1. Leer Archivo 1
    const wb1 = XLSX.readFile('archivos/CENTRO_Universo_Consolidados trafos.xlsx');
    const sheet1 = wb1.Sheets["Exportar"] || wb1.Sheets[wb1.SheetNames[1]]; // Busca hoja Exportar o la 2da
    const json1 = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: "" });

    // 2. Leer Archivo 2
    const wb2 = XLSX.readFile('archivos/NORTE_Universo_Consolidados trafos.xlsx');
    const sheet2 = wb2.Sheets["Exportar"] || wb2.Sheets[wb2.SheetNames[1]];
    const json2 = XLSX.utils.sheet_to_json(sheet2, { header: 1, defval: "" });

    // 3. Unir datos
    // El primer elemento es el encabezado, el resto son datos
    headers = json1[0]; 
    const data1 = json1.slice(1);
    const data2 = json2.slice(1);
    
    allData = [...data1, ...data2];

    console.log(`✅ Servidor listo! ${allData.length} registros cargados en memoria.`);

} catch (error) {
    console.error("💥 Error cargando archivos:", error);
    console.log("Verifica que los archivos estén en la carpeta 'archivos/' y tengan el nombre exacto.");
}

// ================= API DE BÚSQUEDA =================
app.get('/api/search', (req, res) => {
    const { q, column } = req.query; // q = búsqueda, column = filtro seleccionado

    if (!q || q.length < 1) {
        return res.json({ headers, results: [], count: 0 });
    }

    const term = q.toLowerCase().trim();
    
    // Buscar índice de la columna si existe
    let colIndex = -1;
    if (column) {
        colIndex = headers.findIndex(h => h && h.trim().toLowerCase() === column.trim().toLowerCase());
    }

    // Filtrar datos
    const results = allData.filter(row => {
        if (colIndex >= 0 && column) {
            // Búsqueda EXACTA en columna específica
            const val = row[colIndex];
            return val !== null && val !== undefined && String(val).trim().toLowerCase() === term;
        } else {
            // Búsqueda PARCIAL en todas las columnas
            return row.some(cell => cell !== null && cell !== undefined && String(cell).toLowerCase().includes(term));
        }
    }).slice(0, 200); // Limitamos a 200 resultados para no saturar la red

    res.json({
        headers,
        results,
        count: results.length,
        filteredBy: column || "Todas"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Celsia API corriendo en http://localhost:${PORT}`);
});