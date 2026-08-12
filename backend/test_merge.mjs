import ExcelJS from 'exceljs';
async function run() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('c:/wamp64/www/procurement/backend/templates/PURCHASE REQUEST- FINAL-2026.xlsx');
  const ws = workbook.getWorksheet(1);
  console.log('Merges:', ws.model.merges);
}
run();
