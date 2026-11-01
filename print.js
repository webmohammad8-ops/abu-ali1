// print.js - النهائي - كل عامل كشفه لحاله
document.addEventListener('click', function(e){
  let btn = e.target.closest('button');
  if(!btn || !btn.innerText.includes('طباعة الكشف')) return;
  e.preventDefault();

  // 1. جيب اسم العامل من نفس الكرت
  let card = btn.closest('div[class*="rounded"], div[class*="shadow"], div[class*="border"]') || btn.parentElement.parentElement;
  let cardText = card ? card.innerText : "";
  let workerName = "عامل";
  if(cardText.includes("سامي")) workerName = "سامي";
  else if(cardText.includes("إبراهيم")) workerName = "إبراهيم";
  else if(cardText.includes("عايد")) workerName = "عايد";
  else if(cardText.includes("عمر")) workerName = "عمر";
  else {
    // جيب اول كلمة فوق الزر هي الاسم
    let lines = cardText.split('\n').filter(s=>s.trim().length>1);
    if(lines[0]) workerName = lines[0].trim();
  }

  // 2. جيب ايام هذا العامل من التخزين الحقيقي
  let allDays = [];
  try {
    // دور بكل مكان ممكن تكون البيانات فيه
    let keys = ['days','workers_days','allDays','projectData','abuAliData','store'];
    for(let k of keys){
      let data = localStorage.getItem(k);
      if(data){
        let parsed = JSON.parse(data);
        if(Array.isArray(parsed)) allDays = allDays.concat(parsed);
        else if(parsed.days) allDays = allDays.concat(parsed.days);
        else if(parsed.workers) {
          let w = parsed.workers.find(x=> (x.name||x.worker_name||'').includes(workerName));
          if(w && w.days) allDays = allDays.concat(w.days);
        }
      }
    }
    // حاول من الـ window
    if(window.workersData) {
      let w = window.workersData.find(x=> x.name.includes(workerName));
      if(w && w.days) allDays = w.days;
    }
    // فلتر بس ايام هذا العامل
    let myDays = allDays.filter(d=> 
      (d.worker_name||d.name||d.worker||'').includes(workerName) || 
      (d.workerName||'').includes(workerName)
    );
    if(myDays.length>0) allDays = myDays;
  } catch(err){}

  // اذا ما لقى ايام حقيقية، خذ من الجدول اللي بالصفحة
  if(allDays.length==0){
    document.querySelectorAll('table tr').forEach((tr,i)=>{
      if(i==0) return;
      let tds = tr.querySelectorAll('td');
      if(tds.length>=4){
        allDays.push({
          date: tds[0]?.innerText || new Date().toLocaleDateString('en-GB'),
          wage: parseInt(tds[1]?.innerText)||0,
          food: parseInt(tds[2]?.innerText)||0,
          smoke: parseInt(tds[3]?.innerText)||0,
          advance: parseInt(tds[4]?.innerText)||0,
          payment: 0,
          hours: 0
        });
      }
    });
  }
  if(allDays.length==0) allDays = [{date: new Date().toLocaleDateString('en-GB'), wage:0, food:0, smoke:0, advance:0, payment:0, hours:0}];

  // 3. ابني الفاتورة الحلوة
  let totalDays=allDays.length, totalHours=0, totalWages=0, totalFood=0, totalSmoke=0, totalAdvance=0, totalPayment=0, balance=0, rows='';
  allDays.forEach(d=>{
    let wage=Number(d.wage||d.ajr||d.daily||0), food=Number(d.food||d.akel||0), smoke=Number(d.smoke||d.dukhan||0), advance=Number(d.advance||d.silfa||0), payment=Number(d.payment||d.dofaa||0), hours=Number(d.hours||0);
    let net=wage-food-smoke-advance-payment; balance+=net;
    totalHours+=hours; totalWages+=wage; totalFood+=food; totalSmoke+=smoke; totalAdvance+=advance; totalPayment+=payment;
    rows+=`<tr><td>${d.date||d.day||''}</td><td>${hours||'-'}</td><td>${wage||'-'}</td><td>${food||'-'}</td><td>${smoke||'-'}</td><td>${advance||'-'}</td><td>${payment||'-'}</td><td>${net}</td><td>${balance}</td></tr>`;
  });

  let win = window.open('', '_blank', 'width=900,height=800');
  win.document.write(`
    <html dir="rtl"><head><meta charset="UTF-8"><title>كشف ${workerName}</title>
    <style>body{font-family:Tajawal,Tahoma; padding:20px; direction:rtl; color:#000} .head{text-align:center} .head h1{margin:0; font-size:22px} .line{height:3px; background:#000; margin:10px 0} .info{border:1px solid #000; padding:10px; display:flex; justify-content:space-between; font-size:13px} table{width:100%; border-collapse:collapse; margin-top:10px; font-size:13px} th{background:#e5e7eb; border:1px solid #000; padding:6px} td{border:1px solid #000; padding:5px; text-align:center} .totals{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px} .box{border:1px solid #000; padding:8px; text-align:center; font-size:13px} .box b{display:block; font-size:15px} .final{border:2px solid #000; text-align:center; padding:10px; font-weight:800; margin-top:10px} .sign{display:flex; justify-content:space-between; margin-top:30px; border-top:1px solid #000; padding-top:5px} @media print{.no-print{display:none}}</style>
    </head><body>
      <div class="head"><h1>المقاول أبو علي</h1><p>كشف حساب عامل - ${workerName}</p></div><div class="line"></div>
      <div class="info"><div>رقم السكنة: <b>3</b><br>الفترة: <b>كل الفترات</b></div><div>اسم العامل: <b>${workerName}</b><br>تاريخ الطباعة: <b>${new Date().toLocaleDateString('en-GB')}</b></div></div>
      <table><tr><th>التاريخ</th><th>الساعات</th><th>الأجر</th><th>الأكل</th><th>الدخان</th><th>السلفة</th><th>دفعة</th><th>صافي اليوم</th><th>الرصيد</th></tr>${rows}</table>
      <div class="totals"><div class="box"><b>${totalDays}</b>إجمالي الأيام</div><div class="box"><b>${totalHours}</b>إجمالي الساعات</div><div class="box"><b>₪ ${totalWages}</b>إجمالي الأجور</div><div class="box"><b>₪ ${totalFood+totalSmoke}</b>المصاريف</div><div class="box"><b>₪ ${totalAdvance}</b>السلف</div><div class="box"><b>₪ ${totalPayment}</b>الدفعات</div></div>
      <div class="final">الحساب النهائي المتبقي: ${balance} شيكل - ${balance>=0?'للعامل على المقاول':'للمقاول على العامل'}</div>
      <div class="sign"><span>توقيع العامل: __________</span><span>توقيع المقاول: __________</span></div>
      <center class="no-print"><button onclick="window.print()" style="margin-top:20px; padding:10px 30px; background:#000; color:#fff; border:none; border-radius:6px; cursor:pointer">🖨️ طباعة / PDF</button></center>
    </body></html>
  `);
  win.document.close();
});
