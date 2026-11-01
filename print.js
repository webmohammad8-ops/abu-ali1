// هذا الكود النهائي - ما رح نغيره بعد اليوم
document.addEventListener('click', e => {
  let b = e.target.closest('button');
  if (b && b.innerText.includes('طباعة')) {
    e.preventDefault();
    window.print();
  }
});
