


// print.js - يحول زر "طباعة الكشف" للفاتورة القديمة
document.addEventListener('click', function(e){
  let btn = e.target.closest('button');
  if(!btn || !btn.textContent.includes('طباعة الكشف')) return;
  e.preventDefault();
  
  // حاول تجيب بيانات العامل من الصفحة
  let workerName = btn.getAttribute('data-worker') || document.querySelector('[data-worker-name]')?.innerText || 'يوسف نادر';
  let workerJob = btn.getAttribute('data-job') || 'عامل';
  let workerSakneh = btn.getAttribute('data-sakneh') || '3';
  
  // جيب الأيام من جدول الصفحة اذا موجود
  let days = [];
  document.querySelectorAll('table tr').forEach((tr,i)=>{
    if(i==0) return;
    let tds = tr.querySelectorAll('td');
    if(tds.length >= 6){
      days.push({
        date: tds[0]?.innerText || '',
        wage: tds[1]?.innerText || tds[2]?.innerText || 0,
        food: tds[2]?.innerText || 0,
        smoke: tds[3]?.innerText || 0,
        advance: tds[4]?.innerText || 0
      });
    }
  });
  
  // اذا ما لقى أيام، حط مثال زي الصورة
  if(days.length==0) days = [{date:'31/10/2026 السبت', wage:1000, food:50, smoke:32, advance:0, payment:0}];

  printInvoice({name: workerName, job: workerJob, sakneh: workerSakneh}, days);
});
























