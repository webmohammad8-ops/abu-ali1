// print.js - النهائي - يطبع الفاتورة القديمة لحاله
function printInvoiceOld(worker, days) {
  let totalDays = days.length, totalHours = 0, totalWages = 0, totalFood = 0, totalSmoke = 0, totalAdvance = 0, totalPayment = 0, balance = 0, rows = '';
  days.forEach(d => {
    let wage = Number(d.wage||0), food = Number(d.food||0), smoke = Number(d.smoke||0), advance = Number(d.advance||0), payment = Number(d.payment||0), hours = Number(d.hours||0);
    let net = wage - food - smoke - advance - payment; balance += net;
    totalHours+=hours; totalWages+=wage; totalFood+=food; totalSmoke+=smoke; totalAdvance+=advance; totalPayment+=payment;
    rows += `<tr><td>${d.date||''}</td><td>${hours||'-'}</td><td>${wage||'-'}</td><td>${food||'-'}</td><td>${smoke||'-'}</td><td>${advance||'-'}</td><td>${payment||'-'}</td><td>${net}</td><td>${balance}</td></tr>`;
  });
  let win = window.open('', '_blank', 'width=900,height=800');
  win.document.write(`<html dir="rtl"><head><meta charset="UTF-8"><title>كشف حساب - ${worker.name}</title><style>body{font-family:Tajawal,Tahoma; padding:20px; background:white; color:#000; direction:rtl} .header{text-align:center} .header h1{margin:0; font-size:22px} .line{height:3px; background:#000; margin:10px 0} .info-box{border:1px solid #000; padding:10px; font-size:13px; display:flex; justify-content:space-between} table{width:100%; border-collapse:collapse; margin-top:10px; font-size:13px} th{background:#e5e7eb; border:1px solid #000; padding:6px} td{border:1px solid #000; padding:5px; text-align:center} .totals{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px} .total-box{border:1px solid #000; text-align:center; padding:8px; font-size:13px} .total-box b{display:block} .final{border:2px solid #000; text-align:center; padding:10px; font-weight:800; margin-top:10px} .sign{display:flex; justify-content:space-between; margin-top:30px; border-top:1px solid #000; padding-top:5px; font-size:13px} @media print{.no-print{display:none}}</style></head><body><div class="header"><h1>المقاول أبو علي</h1><p>كشف حساب عامل</p></div><div class="line"></div><div class="info-box"><div>رقم السكنة: <b>${worker.sakneh||'3'}</b><br>الفترة: <b>كل الفترات</b></div><div style="text-align:left">اسم العامل: <b>${worker.name}</b><br>نوع العمل: <b>${worker.job||'عامل'}</b><br>تاريخ الطباعة: <b>${new Date().toLocaleDateString('en-GB')}</b></div></div><table><tr><th>التاريخ</th><th>الساعات</th><th>الأجر</th><th>الأكل</th><th>الدخان</th><th>السلفة</th><th>دفعة</th><th>صافي اليوم</th><th>الرصيد</th></tr>${rows||'<tr><td colspan="9">لا يوجد بيانات</td></tr>'}</table><div class="totals"><div class="total-box"><b>${totalDays}</b>إجمالي الأيام</div><div class="total-box"><b>${totalHours}</b>إجمالي الساعات</div><div class="total-box"><b>₪ ${totalWages}</b>إجمالي الأجور</div><div class="total-box"><b>₪ ${totalFood+totalSmoke}</b>إجمالي المصاريف</div><div class="total-box"><b>₪ ${totalAdvance}</b>إجمالي السلف</div><div class="total-box"><b>₪ ${totalPayment}</b>إجمالي الدفعات</div></div><div class="final">الحساب النهائي المتبقي: ${balance} شيكل - ${balance>=0?'للعامل على المقاول':'للمقاول على العامل'}</div><div class="sign"><span>توقيع العامل</span><span>توقيع المقاول</span></div><center class="no-print"><button onclick="window.print()" style="background:#000; color:white; padding:10px 30px; border:none; border-radius:6px; margin-top:20px; cursor:pointer">🖨️ طباعة / PDF</button></center></body></html>`);
  win.document.close();
}

document.addEventListener('click', function(e) {
  let btn = e.target.closest('button');
  if (!btn || !btn.textContent.includes('طباعة')) return;
  e.preventDefault();
  
  // حاول تجيب العامل الحقيقي
  let workerName = btn.dataset.name || btn.closest('[data-worker]')?.dataset.worker || 'علي';
  let days = [];
  // جيب البيانات من الصفحة لو موجودة
  document.querySelectorAll('table tr').forEach((tr,i)=>{
    if(i==0) return;
    let tds = tr.querySelectorAll('td');
    if(tds.length >= 4){
      days.push({date: tds[0]?.innerText, wage: tds[1]?.innerText, food: tds[2]?.innerText, smoke: tds[3]?.innerText, advance: tds[4]?.innerText, payment: 0, hours: 0});
    }
  });
  if(days.length==0) days = [{date: new Date().toLocaleDateString('en-GB'), wage: 100, food: 0, smoke: 0, advance: 0, payment: 0, hours: 0}];
  
  printInvoiceOld({name: workerName, job: 'طوبار', sakneh: '3'}, days);
});
