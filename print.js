// print.js - النهائي - يقرأ من الجدول الحقيقي اللي شايفه
document.addEventListener('click', function(e){
  let btn = e.target.closest('button');
  if(!btn || !btn.innerText.includes('طباعة الكشف')) return;
  e.preventDefault();

  // جيب اسم العامل
  let workerName = document.querySelector('h1, h2, .text-xl, .font-bold')?.innerText || "سامي";
  // لو احنا بصفحة القائمة، خذ الاسم من الكرت نفسه
  if(window.location.hash.includes('/p/') && !window.location.hash.includes('/w/')){
    let card = btn.closest('div');
    let txt = card ? card.innerText : "";
    if(txt.includes("سامي")) workerName="سامي";
    else if(txt.includes("إبراهيم")) workerName="إبراهيم";
    else if(txt.includes("عايد")) workerName="عايد";
    // اذا بالقائمة ما بقدر اجيب التفاصيل، افتح صفحة العامل
    alert("ادخل على صفحة " + workerName + " نفسه (اكبس على اسمه) وبعدين من جوة اضغط طباعة الكشف - هيك بطلع الكشف الصح");
    return;
  }

  // احنا جوة صفحة العامل - اقرأ الجدول الحقيقي اللي بالصورة الثانية
  let table = document.querySelector('table');
  let rowsData = [];
  if(table){
    table.querySelectorAll('tbody tr, tr').forEach((tr, idx)=>{
      if(idx==0) return; // header
      let tds = tr.querySelectorAll('td');
      if(tds.length < 5) return;
      // الجدول عندك ترتيبه: [تعديل, ملاحظات, الصافي, سلفة, دخان, أكل, اليومية, التاريخ]
      // يعني التاريخ هو اخر td
      let dateText = tds[tds.length-1]?.innerText.trim() || "";
      let dailyText = tds[tds.length-2]?.innerText.trim() || "0";
      let foodText = tds[tds.length-3]?.innerText.trim() || "0";
      let smokeText = tds[tds.length-4]?.innerText.trim() || "0";
      let advanceText = tds[tds.length-5]?.innerText.trim() || "0";
      
      // نظف الارقام
      let wage = parseInt(dailyText) || 0;
      if(dateText.includes("دفعة جماعية") || (tds[1]?.innerText.includes("دفعة"))) {
        wage = 0; // هاي سلفة مش يومية
      }
      // لو الصافي سالب وفيه سلفة
      let advance = parseInt(advanceText) || 0;
      if(isNaN(advance)) advance = 0;
      let food = (foodText === '-' ? 0 : parseInt(foodText) || 0);
      let smoke = (smokeText === '-' ? 0 : parseInt(smokeText) || 0);
      
      // بس اذا فيه تاريخ حقيقي
      if(dateText.match(/\d{2}\/\d{2}\/\d{4}/)){
        rowsData.push({
          date: dateText.split('\n')[0],
          wage: wage,
          food: food,
          smoke: smoke,
          advance: advance,
          payment: 0
        });
      }
    });
  }

  // اقلب الترتيب عشان الاقدم فوق
  rowsData = rowsData.reverse();

  // ابني الفاتورة المرتبة
  let totalDays=0, totalWages=0, totalAdvance=0, balance=0, rowsHtml='';
  rowsData.forEach(d=>{
    let net = d.wage - d.food - d.smoke - d.advance;
    if(d.wage==0 && d.advance>0) net = -d.advance; // دفعة سلفة
    balance += net;
    if(d.wage>0) totalDays++;
    totalWages += d.wage;
    totalAdvance += d.advance;
    rowsHtml += `<tr><td>${d.date}</td><td>-</td><td>${d.wage||'-'}</td><td>${d.food||'-'}</td><td>${d.smoke||'-'}</td><td>${d.advance||'-'}</td><td>-</td><td>${net}</td><td>${balance}</td></tr>`;
  });

  let win = window.open('', '_blank');
  win.document.write(`
    <html dir="rtl"><head><meta charset="UTF-8"><title>كشف ${workerName}</title>
    <style>
      body{font-family:Tajawal,Tahoma; padding:20px; direction:rtl; color:#000; background:#fff}
      .head{text-align:center} .head h1{margin:0} .line{height:3px; background:#000; margin:10px 0}
      .info{border:1px solid #000; padding:10px; display:flex; justify-content:space-between; font-size:13px}
      table{width:100%; border-collapse:collapse; margin-top:10px; font-size:13px}
      th{background:#e5e7eb; border:1px solid #000; padding:6px} td{border:1px solid #000; padding:5px; text-align:center}
      .totals{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px}
      .box{border:1px solid #000; padding:8px; text-align:center} .box b{display:block; font-size:16px}
      .final{border:2px solid #000; text-align:center; padding:12px; font-weight:800; margin-top:12px; font-size:16px}
      .sign{display:flex; justify-content:space-between; margin-top:30px; border-top:1px solid #000; padding-top:6px}
      @media print{.no-print{display:none}}
    </style>
    </head><body>
      <div class="head"><h1>المقاول أبو علي</h1><p>كشف حساب عامل - ${workerName}</p></div><div class="line"></div>
      <div class="info"><div>رقم السكنة: 3<br>الفترة: كل الفترات</div><div>اسم العامل: <b>${workerName}</b><br>تاريخ الطباعة: <b>${new Date().toLocaleDateString('en-GB')}</b></div></div>
      <table><tr><th>التاريخ</th><th>الساعات</th><th>الأجر</th><th>الأكل</th><th>الدخان</th><th>السلفة</th><th>دفعة</th><th>صافي اليوم</th><th>الرصيد</th></tr>${rowsHtml}</table>
      <div class="totals"><div class="box"><b>${totalDays}</b>إجمالي الأيام</div><div class="box"><b>0</b>إجمالي الساعات</div><div class="box"><b>₪ ${totalWages}</b>إجمالي الأجور</div><div class="box"><b>₪ 0</b>المصاريف</div><div class="box"><b>₪ ${totalAdvance}</b>السلف</div><div class="box"><b>₪ 0</b>الدفعات</div></div>
      <div class="final">الحساب النهائي المتبقي: ${balance} شيكل - ${balance>=0?'للعامل على المقاول':'للمقاول على العامل'}</div>
      <div class="sign"><span>توقيع العامل: __________</span><span>توقيع المقاول: __________</span></div>
      <center class="no-print"><button onclick="window.print()" style="margin-top:20px; padding:12px 30px; background:#000; color:#fff; border:none; border-radius:8px">🖨️ طباعة / PDF</button></center>
    </body></html>
  `);
  win.document.close();
});
