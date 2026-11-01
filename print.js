
function printWorkerTable(btn){ window.print(); }
document.addEventListener('click', e=>{
  let b=e.target.closest('button');
  if(b && b.textContent.includes('طباعة الكشف')) window.print();
});
