
/* =====================================
   طباعة كشف حساب العامل - المقاول أبو علي
   ===================================== */

window.printInvoice = function (worker, entries) {
  const { fmt, net, total, showDate } = Calc;

  // ترتيب السجلات من الأقدم إلى الأحدث
  const records = [...entries].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  let totalWages = 0;
  let totalFood = 0;
  let totalSmoke = 0;
  let totalAdvance = 0;
  let runningBalance = 0;

  const rows = records.map((e) => {
    const wage = Number(e.daily_wage || 0);
    const food = Number(e.food || 0);
    const smoke = Number(e.smoke || 0);
    const advance = Number(e.advance || 0);
    const dailyNet = net(e);

    totalWages += wage;
    totalFood += food;
    totalSmoke += smoke;
    totalAdvance += advance;
    runningBalance += dailyNet;

    return `
      <tr>
        <td>${showDate(e.date)}</td>
        <td>${fmt(wage)}</td>
        <td>${fmt(food)}</td>
        <td>${fmt(smoke)}</td>
        <td>${fmt(advance)}</td>
        <td>${fmt(dailyNet)}</td>
        <td>${fmt(runningBalance)}</td>
        <td>${escapeHTML(e.notes || '-')}</td>
      </tr>
    `;
  }).join('');

  const finalBalance = total(entries);

  const win = window.open('', '_blank', 'width=1000,height=800');

  if (!win) {
    UI.toast('اسمح بفتح النوافذ المنبثقة للطباعة', 'err');
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>كشف حساب - ${escapeHTML(worker.name)}</title>

      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">

      <style>
        * { box-sizing: border-box; }

        body {
          font-family: Tajawal, Tahoma, Arial, sans-serif;
          padding: 25px;
          color: #111827;
          background: white;
        }

        .header {
          text-align: center;
          border-bottom: 3px solid #111827;
          padding-bottom: 15px;
        }

        .header h1 {
          margin: 0;
          font-size: 27px;
          font-weight: 800;
        }

        .header p {
          margin: 5px 0 0;
          color: #555;
        }

        .info {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          border: 1px solid #333;
          padding: 14px;
          margin-top: 18px;
          line-height: 2;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }

        th, td {
          border: 1px solid #555;
          padding: 9px 5px;
          text-align: center;
        }

        th {
          background: #e5e7eb;
          font-weight: 800;
        }

        .totals {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .box {
          border: 1px solid #555;
          padding: 12px;
          text-align: center;
        }

        .box b {
          display: block;
          font-size: 18px;
          margin-bottom: 5px;
        }

        .final {
          margin-top: 20px;
          padding: 18px;
          border: 2px solid #111;
          text-align: center;
          font-size: 20px;
          font-weight: 800;
        }

        .sign {
          display: flex;
          justify-content: space-between;
          margin-top: 55px;
        }

        .actions {
          text-align: center;
          margin-top: 25px;
        }

        .actions button {
          padding: 12px 30px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          cursor: pointer;
        }

        @media print {
          body { padding: 10px; }
          .actions { display: none; }
          tr { break-inside: avoid; }
        }
      </style>
    </head>

    <body>
      <div class="header">
        <h1>المقاول أبو علي</h1>
        <p>كشف حساب عامل</p>
      </div>

      <div class="info">
        <div>
          اسم العامل: <b>${escapeHTML(worker.name)}</b><br>
          رقم السكنة: <b>${escapeHTML(worker.sakneh || '—')}</b><br>
          نوع العمل: <b>${escapeHTML(worker.job || 'عامل')}</b>
        </div>

        <div>
          الفترة: <b>جميع الفترات</b><br>
          عدد السجلات: <b>${records.length}</b><br>
          تاريخ الطباعة: <b>${new Date().toLocaleDateString('en-GB')}</b>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>اليومية</th>
            <th>الأكل</th>
            <th>الدخان</th>
            <th>السلفة</th>
            <th>الصافي</th>
            <th>الرصيد</th>
            <th>ملاحظات</th>
          </tr>
        </thead>

        <tbody>
          ${rows || '<tr><td colspan="8">لا توجد سجلات</td></tr>'}
        </tbody>
      </table>

      <div class="totals">
        <div class="box"><b>${records.length}</b>عدد السجلات</div>
        <div class="box"><b>${fmt(totalWages)} ₪</b>إجمالي اليوميات</div>
        <div class="box"><b>${fmt(totalFood)} ₪</b>إجمالي الأكل</div>
        <div class="box"><b>${fmt(totalSmoke)} ₪</b>إجمالي الدخان</div>
        <div class="box"><b>${fmt(totalAdvance)} ₪</b>إجمالي السلف</div>
        <div class="box"><b>${fmt(totalWages - totalFood - totalSmoke - totalAdvance)} ₪</b>صافي الحساب</div>
      </div>

      <div class="final">
        الحساب النهائي:
        ${fmt(finalBalance)} شيكل
        <br>
        ${finalBalance >= 0 ? 'للعامل على المقاول' : 'للمقاول على العامل'}
      </div>

      <div class="sign">
        <span>توقيع العامل: ______________</span>
        <span>توقيع المقاول: ______________</span>
      </div>

      <div class="actions">
        <button onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
      </div>
    </body>
    </html>
  `);

  win.document.close();
};

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

// المحافظة على الاسم القديم إن كان مستخدماً
window.printKashf = window.printInvoice;


/* =====================================
   تقرير حسابات المشروع - المقاول أبو علي
   ===================================== */

window.printProjectReport = function (project, workers, entries, payments = []) {
  const { fmt, total } = Calc;

  // استلامات هذا المشروع فقط، مرتبة من الأحدث إلى الأقدم
  const projectPayments = payments
    .filter((p) => p.project_id === project.id)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const totalPayments = projectPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  let grandWages = 0;
  let grandFood = 0;
  let grandSmoke = 0;
  let grandAdvance = 0;
  let grandNet = 0;
  let grandDays = 0;

  const rows = workers.map((worker) => {
    const records = entries.filter(
      (e) => e.worker_id === worker.id
    );

    const wages = records.reduce(
      (sum, e) => sum + Number(e.daily_wage || 0), 0
    );

    const food = records.reduce(
      (sum, e) => sum + Number(e.food || 0), 0
    );

    const smoke = records.reduce(
      (sum, e) => sum + Number(e.smoke || 0), 0
    );

    const advance = records.reduce(
      (sum, e) => sum + Number(e.advance || 0), 0
    );

    const netBalance = total(records);

    grandWages += wages;
    grandFood += food;
    grandSmoke += smoke;
    grandAdvance += advance;
    grandNet += netBalance;
    grandDays += records.length;

    return `
      <tr>
        <td>${escapeHTML(worker.name)}</td>
        <td>${escapeHTML(worker.group_type || '—')}</td>
        <td>${records.length}</td>
        <td>${fmt(wages)}</td>
        <td>${fmt(food)}</td>
        <td>${fmt(smoke)}</td>
        <td>${fmt(advance)}</td>
        <td><strong>${fmt(netBalance)}</strong></td>
      </tr>
    `;
  }).join('');

  // جدول استلامات الشركة
  const paymentRows = projectPayments.length
    ? projectPayments.map((p) => `
        <tr>
          <td>${escapeHTML(Calc.showDate(p.date))}</td>
          <td><strong>${fmt(p.amount)} ₪</strong></td>
        </tr>
      `).join('')
    : '<tr><td colspan="2">لا توجد استلامات مسجلة</td></tr>';

  const win = window.open('', '_blank', 'width=1100,height=800');

  if (!win) {
    UI.toast('اسمح بفتح النوافذ المنبثقة للطباعة', 'err');
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">

      <title>تقرير المشروع - ${escapeHTML(project.name)}</title>

      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">

      <style>
        * { box-sizing: border-box; }

        body {
          font-family: Tajawal, Tahoma, Arial, sans-serif;
          padding: 25px;
          color: #111827;
          background: white;
        }

        .header {
          text-align: center;
          border-bottom: 3px solid #111827;
          padding-bottom: 15px;
        }

        .header h1 {
          margin: 0;
          font-size: 27px;
          font-weight: 800;
        }

        .header p {
          margin: 6px 0 0;
          color: #555;
        }

        .info {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          border: 1px solid #333;
          padding: 14px;
          margin-top: 18px;
          line-height: 2;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 12px;
        }

        th, td {
          border: 1px solid #555;
          padding: 10px 5px;
          text-align: center;
        }

        th {
          background: #e5e7eb;
          font-weight: 800;
        }

        .section-title {
          margin-top: 25px;
          padding: 10px;
          background: #f3f4f6;
          border-right: 4px solid #15803d;
          font-size: 17px;
          font-weight: 800;
        }

        .totals {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .box {
          border: 1px solid #555;
          padding: 12px;
          text-align: center;
        }

        .box b {
          display: block;
          font-size: 17px;
          margin-bottom: 5px;
        }

        .payment-total {
          margin-top: 12px;
          padding: 15px;
          border: 2px solid #15803d;
          background: #f0fdf4;
          color: #166534;
          text-align: center;
          font-size: 19px;
          font-weight: 800;
        }

        .final {
          margin-top: 20px;
          padding: 18px;
          border: 2px solid #111;
          text-align: center;
          font-size: 21px;
          font-weight: 800;
        }

        .sign {
          display: flex;
          justify-content: space-between;
          margin-top: 55px;
        }

        .actions {
          text-align: center;
          margin-top: 25px;
        }

        .actions button {
          padding: 12px 30px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          cursor: pointer;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          body { padding: 5px; }
          .actions { display: none; }

          tr {
            break-inside: avoid;
          }
        }
      </style>
    </head>

    <body>
      <div class="header">
        <h1>المقاول أبو علي</h1>
        <p>تقرير حسابات المشروع</p>
      </div>

      <div class="info">
        <div>
          اسم المشروع: <b>${escapeHTML(project.name)}</b><br>
          الموقع: <b>${escapeHTML(project.location || '—')}</b>
        </div>

        <div>
          عدد العمال: <b>${workers.length}</b><br>
          تاريخ الطباعة:
          <b>${new Date().toLocaleDateString('en-GB')}</b>
        </div>
      </div>

      <div class="section-title">
        👷 حسابات العمال
      </div>

      <table>
        <thead>
          <tr>
            <th>اسم العامل</th>
            <th>المهنة</th>
            <th>أيام العمل</th>
            <th>اليوميات</th>
            <th>الأكل</th>
            <th>الدخان</th>
            <th>السلف</th>
            <th>صافي الحساب</th>
          </tr>
        </thead>

        <tbody>
          ${rows || '<tr><td colspan="8">لا يوجد عمال في المشروع</td></tr>'}
        </tbody>
      </table>

      <div class="totals">
        <div class="box">
          <b>${grandDays}</b>
          إجمالي أيام العمل
        </div>

        <div class="box">
          <b>${fmt(grandWages)} ₪</b>
          إجمالي اليوميات
        </div>

        <div class="box">
          <b>${fmt(grandFood + grandSmoke)} ₪</b>
          إجمالي الأكل والدخان
        </div>

        <div class="box">
          <b>${fmt(grandAdvance)} ₪</b>
          إجمالي السلف
        </div>
      </div>

      <div class="final">
        إجمالي صافي حساب المشروع:
        ${fmt(grandNet)} شيكل
      </div>

      <div class="section-title">
        💰 استلامات الشركة
      </div>

      <table>
        <thead>
          <tr>
            <th>تاريخ الاستلام</th>
            <th>المبلغ المستلم</th>
          </tr>
        </thead>

        <tbody>
          ${paymentRows}
        </tbody>
      </table>

      <div class="payment-total">
        عدد الاستلامات: ${projectPayments.length}
        <br>
        إجمالي المبالغ المستلمة من الشركة:
        ${fmt(totalPayments)} ₪
      </div>

      <div class="sign">
        <span>توقيع المقاول: ______________</span>
        <span>التاريخ: ______________</span>
      </div>

      <div class="actions">
        <button onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
      </div>
    </body>
    </html>
  `);

  win.document.close();
};
