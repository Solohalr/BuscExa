const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos (HTML, CSS, JS) desde la raíz del proyecto
app.use(express.static(__dirname));

let allData = [];
let headers = [];

console.log("🔄 Cargando datos JSON...");

try {
    // Rutas a los archivos JSON (ajustadas a la estructura de carpetas)
    const pathCentro = path.join(__dirname, 'archivos', 'centro.json');
    const pathNorte = path.join(__dirname, 'archivos', 'norte.json');

    // Leer y parsear JSON al iniciar el servidor
    const centro = JSON.parse(fs.readFileSync(pathCentro, 'utf8'));
    const norte = JSON.parse(fs.readFileSync(pathNorte, 'utf8'));

    // Unir ambos conjuntos de datos
    allData = [...centro, ...norte];

    // Extraer encabezados del primer registro
    if (allData.length > 0) {
        headers = Object.keys(allData[0]);
    }

    console.log(`✅ Listo: ${allData.length} registros cargados | ${headers.length} columnas`);
} catch (error) {
    console.error("💥 Error cargando JSON:", error.message);
    console.log("⚠️ Verifica que 'centro.json' y 'norte.json' existan en la carpeta 'archivos/'");
}

// ================= ENDPOINT DE BÚSQUEDA =================
app.get('/api/search', (req, res) => {
    const { q, column } = req.query;

    // Si no hay término de búsqueda, devolver estructura vacía
    if (!q || q.trim() === '') {
        return res.json({ headers, results: [], count: 0 });
    }

    const term = q.trim().toLowerCase();
    let colIndex = -1;

    // Si se especifica columna, buscar su índice exacto
    if (column) {
        colIndex = headers.findIndex(h => h.toLowerCase() === column.toLowerCase());
    }

    // Filtrar datos según el modo de búsqueda
    const results = allData.filter(row => {
        if (colIndex >= 0 && column) {
            // 🔍 BÚSQUEDA EXACTA (prioriza el filtro seleccionado)
            const val = row[headers[colIndex]];
            return val !== null && val !== undefined && String(val).trim().toLowerCase() === term;
        } else {
            // 🔎 BÚSQUEDA PARCIAL (en todas las columnas)
            return Object.values(row).some(v => 
                v !== null && v !== undefined && String(v).toLowerCase().includes(term)
            );
        }
    }).slice(0, 200); // Límite de 200 resultados para evitar saturación

    res.json({
        headers,
        results,
        count: results.length,
        total: allData.length
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
