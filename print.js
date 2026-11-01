// ===== طباعة كشف حساب عامل كامل زي الصورة =====
function printWorkerFullStatement(workerName, workerJob, records) {
  // records = مصفوفة السجلات تبعت العامل [{date, daily, food, smoke, advance, notes}, ...]
  
  let total = 0, thisWeek = 0, thisMonth = 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // حساب الاسبوع الحالي (السبت للجمعة)
  let startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() - 1); // السبت
  
  let rowsHtml = "";
  records.forEach(r => {
    let daily = Number(r.daily || r.yomiya || 0);
    let food = Number(r.food || r.akel || 0);
    let smoke = Number(r.smoke || r.dukhan || 0);
    let advance = Number(r.advance || r.silfa || 0);
    let net = daily - food - smoke - advance;
    if(r.safi) net = Number(r.safi); // لو عندك صافي جاهز
    
    total += net;
    
    let d = new Date(r.date.split('/').reverse().join('-')); // 31/10/2026
    if(d.getMonth() === currentMonth && d.getFullYear() === currentYear) thisMonth += net;
    if(d >= startOfWeek) thisWeek += net;
    
    rowsHtml += `<tr>
      <td>${r.date}</td>
      <td>${daily || '-'}</td>
      <td>${food || '-'}</td>
      <td>${smoke || '-'}</td>
      <td>${advance || '-'}</td>
      <td style="color:${net<0?'red':'green'};font-weight:bold">${net}</td>
      <td>${r.notes || r.molahazat || '-'}</td>
    </tr>`;
  });

  const win = window.open('', '_blank');
  win.document.write(`
    <html dir="rtl"><head><title>كشف حساب - ${workerName}</title>
    <style>
      body{font-family:Arial; padding:15px; direction:rtl; background:#f5f5f5}
      .page{max-width:800px; margin:auto; background:white; padding:20px; border-radius:10px}
      .header{background:#1e40ff; color:white; padding:10px; text-align:center; border-radius:8px}
      .stats{display:flex; gap:10px; margin:15px 0}
      .stat{flex:1; background:#fff8e1; border:1px solid #ddd; padding:12px; text-align:center; border-radius:10px}
      .stat b{font-size:20px; display:block; background:#e0f2f1; border-radius:20px; padding:5px; margin:5px 0}
      table{width:100%; border-collapse:collapse; margin-top:10px}
      th,td{border:1px solid #ddd; padding:8px; text-align:center; font-size:14px}
      th{background:#f1f5f9}
      @media print { button{display:none} .page{box-shadow:none} }
    </style></head><body>
    <div class="page">
      <div class="header">كشف حساب العامل: ${workerName} - ${workerJob}</div>
      <div class="stats">
        <div class="stat">هذا الأسبوع<br><b>${thisWeek} ₪</b></div>
        <div class="stat">هذا الشهر<br><b>${thisMonth} ₪</b></div>
        <div class="stat">الإجمالي<br><b>${total} ₪</b><small>${records.length} سجل</small></div>
      </div>
      <p style="font-size:12px; color:gray; text-align:left">الأسبوع من السبت إلى الجمعة. الأخضر = للعامل، الأحمر = على العامل</p>
      <table>
        <tr><th>التاريخ</th><th>اليومية</th><th>أكل</th><th>دخان</th><th>سلفة</th><th>الصافي</th><th>ملاحظات</th></tr>
        ${rowsHtml}
        <tr style="background:#eee; font-weight:bold"><td colspan="5">المجموع النهائي</td><td>${total}</td><td></td></tr>
      </table>
      <div style="display:flex; justify-content:space-between; margin-top:50px">
        <span>توقيع العامل: ___________</span>
        <span>توقيع المقاول: ___________</span>
      </div>
      <br><center><button onclick="window.print()" style="background:#1e40ff; color:white; border:none; padding:12px 30px; border-radius:8px; font-size:16px">🖨️ طباعة / حفظ PDF</button></center>
    </div></body></html>
  `);
  win.document.close();
}
