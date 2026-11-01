// print.js - طباعة كشف العامل (اليومية - أكل - دخان - سلفة - الصافي)
function printWorkerTable(btn) {
  // لاقي الجدول القريب من الزر اللي كبست عليه
  let container = btn.closest('div')?.parentElement;
  let table = document.querySelector('table'); 
  
  // دور على آخر جدول فيه كلمة "التاريخ" و "اليومية"
  const tables = document.querySelectorAll('table');
  for (let t of tables) {
    if (t.innerHTML.includes('التاريخ') && t.innerHTML.includes('اليومية')) {
      table = t;
      break;
    }
  }
  
  if (!table) {
    alert('ما لقيت الجدول للطباعة');
    return;
  }

  // اسم العامل من الصفحة
  let workerName = document.querySelector('h1,h2,h3')?.innerText || 'كشف حساب عامل';
  let projectName = '';
  // حاول تلاقي اسم المشروع
  const allText = document.body.innerText;
  if (allText.includes('طوبار') || allText.includes('مشروع')) {
    projectName = ' - المشروع';
  }

  let tableClone = table.cloneNode(true);
  // احذف عمود تعديل/حذف من الطباعة
  tableClone.querySelectorAll('th:last-child, td:last-child').forEach(el => {
    if (el.textContent.includes('تعديل') || el.textContent.includes('حذف') || el.querySelector('button')) {
      // بس لو هو فعلا عمود الأزرار
      let isAction = el.innerHTML.includes('🗑') || el.innerHTML.includes('✏') || el.textContent.includes('تعديل');
      if (isAction) el.remove();
    }
  });
  // احذف الأزرار جوا الخلايا كمان
  tableClone.querySelectorAll('button').forEach(b => b.remove());

  let win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    // لو المتصفح بلوك، استخدم الطباعة المباشرة
    document.body.innerHTML = `<div style="padding:20px; font-family:Tajawal">${table.outerHTML}</div>`;
    window.print();
    location.reload();
    return;
  }

  win.document.write(`
    <html dir="rtl" lang="ar"><head><meta charset="UTF-8">
    <title>كشف حساب</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Tajawal', Tahoma; padding: 20px; direction: rtl; background: white; }
      h2 { text-align: center; background: #2563eb; color: white; padding: 12px; border-radius: 8px; margin-bottom: 15px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th { background: #eef2ff; color: #1e3a8a; padding: 10px 6px; border: 1px solid #d1d5db; font-size: 14px; }
      td { padding: 8px 6px; border: 1px solid #d1d5db; text-align: center; font-size: 14px; }
      tr:nth-child(even) { background: #f9fafb; }
      .footer { display: flex; justify-content: space-between; margin-top: 50px; font-weight: bold; }
      @media print { button { display: none; } }
    </style>
    </head><body>
      <h2>كشف حساب: ${workerName}</h2>
      <div style="text-align:center; color:#6b7280; font-size:13px; margin-bottom:10px;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>
      ${tableClone.outerHTML}
      <div class="footer">
        <span>توقيع العامل: ___________</span>
        <span>توقيع المقاول: ___________</span>
      </div>
      <br><center><button onclick="window.print()" style="background:#2563eb; color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer;">🖨️ اطبع / احفظ PDF</button></center>
    </body></html>
  `);
  win.document.close();
  setTimeout(() => win.focus(), 300);
}

// شغّل الطباعة لأي زر فيه كلمة "طباعة الكشف" تلقائياً
document.addEventListener('click', function(e) {
  let btn = e.target.closest('button');
  if (btn && btn.textContent.includes('طباعة الكشف')) {
    e.preventDefault();
    e.stopPropagation();
    printWorkerTable(btn);
  }
});
