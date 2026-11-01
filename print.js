// print.js - النهائي والصح
function handlePrintKashf(btn) {
  // جيب بيانات العامل الحقيقي من الزر
  const workerId = btn.dataset.workerId || btn.getAttribute('data-id');
  let worker = null;
  
  // حاول تلاقيه من الـ store تبعك
  if (window.store && window.store.workers) {
    worker = window.store.workers.find(w => w.id == workerId) || window.store.workers[0];
  }
  // اذا ما لقى، خذ الاسم من الكرت نفسه
  if (!worker) {
    let card = btn.closest('div');
    worker = {
      name: card.querySelector('h3, .font-bold')?.innerText || 'العامل',
      job: 'عامل',
      sakneh: '3'
    };
  }

  // جيب الأيام الحقيقية للعامل
  let days = [];
  if (window.store && window.store.days) {
    days = window.store.days.filter(d => d.worker_id == workerId);
  }
  
  // اذا ما في أيام، خليه فاضي مش مثال وهمي
  let workerData = {
    name: worker.name || worker.worker_name || 'يوسف نادر',
    job: worker.job || worker.work_type || 'عامل',
    sakneh: worker.sakneh || worker.sakna || '3'
  };

  let daysData = days.map(d => ({
    date: d.date || d.day || '',
    hours: d.hours || 0,
    wage: d.wage || d.daily || d.ajr || 0,
    food: d.food || d.akel || 0,
    smoke: d.smoke || d.dukhan || 0,
    advance: d.advance || d.silfa || 0,
    payment: d.payment || d.dofaa || 0
  }));

  // نادي الفاتورة القديمة الحلوة اللي بـ invoices.js
  if (window.printInvoice) {
    window.printInvoice(workerData, daysData);
  } else {
    alert('ملف invoices.js مش محمل - تأكد انك ضفت الكود الجديد');
  }
}

// اربط كل ازرار "طباعة الكشف"
document.addEventListener('click', function(e) {
  let btn = e.target.closest('button');
  if (btn && btn.textContent.includes('طباعة الكشف')) {
    e.preventDefault();
    handlePrintKashf(btn);
  }
});
