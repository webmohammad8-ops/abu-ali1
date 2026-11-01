function printWorkerFullStatement() {
  // بنطبع نفس الجدول اللي شايفه بالصورة
  const original = document.body.innerHTML;
  
  // بناخد قسم الكشف كله
  const content = document.querySelector('main') || document.body;
  
  // ستايل للطباعة
  const style = `
    <style>
      @media print {
        body * { visibility: hidden; }
        .print-area, .print-area * { visibility: visible; }
        .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        button { display: none !important; }
      }
    </style>
  `;
  
  // حط كلاس للطباعة
  document.body.classList.add('print-area');
  document.head.insertAdjacentHTML('beforeend', style);
  
  // اطبع
  window.print();
  
  // رجع الصفحة زي ما كانت
  setTimeout(() => {
    document.body.classList.remove('print-area');
  }, 500);
}

// نسخة ثانية بتطبع كشف عامل واحد بالتفصيل
function doPrint() {
  printWorkerFullStatement();
}
