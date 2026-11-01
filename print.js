function printWorkerTable(btn) {
  // 1. حاول تلاقي جدول اليوميات
  let table = null;
  const tables = document.querySelectorAll('table');
  for (let t of tables) {
    if (t.innerHTML.includes('التاريخ') || t.innerHTML.includes('اليومية')) {
      table = t;
      break;
    }
  }

  // لو ما لقيت جدول = انت بصفحة المشاريع، اطبع كرت العامل فقط
  if (!table) {
    let card = btn.closest('div[class*="bg-white"], div[class*="rounded"]');
    if (!card) card = btn.parentElement.parentElement;
    
    let win = window.open('', '_blank');
    win.document.write(`
      <html dir="rtl"><head><meta charset="UTF-8"><title>كشف عامل</title>
      <style>body{font-family:Tajawal; padding:20px; direction:rtl} .card{border:1px solid #ddd; padding:20px; border-radius:10px}</style>
      </head><body>
        <div class="card">
          <h2>كشف حساب العامل</h2>
          ${card.innerHTML}
        </div>
        <br><button onclick="window.print()">🖨️ اطبع</button>
      </body></html>
    `);
    win.document.close();
    return;
  }

  // 2. لقيت جدول = انت جوا صفحة العامل، اطبع الجدول التفصيلي
  let clone = table.cloneNode(true);
  clone.querySelectorAll('button, [class*="edit"], [class*="delete"]').forEach(b => b.remove());
  // احذف اخر عمود اذا فيه تعديل/حذف
  let ths = clone.querySelectorAll('th');
  let lastTh = ths[ths.length-1];
  if (lastTh && (lastTh.innerText.includes('تعديل') || lastTh.innerText.includes('حذف'))) {
    let idx = ths.length-1;
    clone.querySelectorAll('tr').forEach(tr => { if(tr.children[idx]) tr.children[idx].remove(); });
  }

  let win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`
    <html dir="rtl"><head><meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body{font-family:Tajawal; padding:20px; direction:rtl}
      h2{background:#2563eb; color:white; padding:12px; border-radius:8px; text-align:center}
      table{width:100%; border-collapse:collapse; margin-top:15px}
      th{background:#eef2ff; padding:10px; border:1px solid #ccc}
      td{padding:8px; border:1px solid #ccc; text-align:center}
    </style>
    </head><body>
      <h2>كشف حساب - ${document.querySelector('h1,h2')?.innerText || ''}</h2>
      ${clone.outerHTML}
      <br><center><button onclick="window.print()" style="background:#2563eb; color:white; padding:10px 20px; border:none; border-radius:8px;">🖨️ طباعة / PDF</button></center>
    </body></html>
  `);
  win.document.close();
}

document.addEventListener('click', function(e) {
  let btn = e.target.closest('button');
  if (btn && btn.textContent.includes('طباعة الكشف')) {
    e.preventDefault();
    e.stopPropagation();
    printWorkerTable(btn);
  }
});
