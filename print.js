function printWorkerInvoice(name, project, amount, date) {
  const w = window.open('', '_blank');
  w.document.write(`
    <html dir="rtl"><head><title>فاتورة ${name}</title>
    <style>body{font-family:Arial;padding:20px;direction:rtl}
    .box{border:2px solid #000;padding:20px;max-width:600px;margin:auto}
    .row{display:flex;justify-content:space-between;margin:12px 0;font-size:18px}
    .sign{margin-top:60px;display:flex;justify-content:space-between}
    button{padding:10px 20px;font-size:18px}</style></head>
    <body><div class="box">
    <h2 style="text-align:center">فاتورة يومية - مقاول أبو علي</h2>
    <div class="row"><span>العامل:</span><b>${name}</b></div>
    <div class="row"><span>المشروع:</span><b>${project}</b></div>
    <div class="row"><span>المبلغ:</span><b>${amount} شيكل</b></div>
    <div class="row"><span>التاريخ:</span><b>${date}</b></div>
    <div class="sign"><span>توقيع العامل: _______</span><span>توقيع المقاول: _______</span></div>
    <br><center><button onclick="window.print()">🖨️ طباعة / حفظ PDF</button></center>
    </div></body></html>
  `);
  w.document.close();
}
