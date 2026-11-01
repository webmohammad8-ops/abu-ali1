
// الصفحة الرئيسية
;(() => {
  const { esc, card, btn, field, inputCls, empty, layout } = UI
  const { fmt, showDate, toNum } = Calc

  const GROUPS = ['طوبار', 'حداد', 'طراش', 'عامل']

  const stat = (label, value, sub) =>
    card(`<div class="text-2xl font-extrabold text-brand">${value}</div>
      <div class="text-sm font-bold text-gray-700">${label}</div>
      ${sub ? `<div class="text-xs text-gray-400">${sub}</div>` : ''}`, 'text-center')

  Views.dashboard = () => {
    const { projects, workers, entries, invoices } = Store.get()

    const m = Calc.monthRange()
    const wages = entries.filter((e) => Calc.inRange(e.date, m)).reduce((s, e) => s + toNum(e.daily_wage), 0)
    const inv = invoices.filter((i) => Calc.inRange(i.created_at.slice(0, 10), m)).reduce((s, i) => s + toNum(i.amount), 0)

    const count = {}
    workers.forEach((w) => (count[w.project_id] = (count[w.project_id] || 0) + 1))
    const nameOf = (id) => (projects.find((p) => p.id === id) || {}).name || '—'
    const last = [...invoices].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5)

    const projectsHtml = projects.length
      ? `<div class="space-y-3">${projects.map((p) => `
          <a href="#/p/${esc(p.id)}" class="block">
            ${card(`<div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-lg font-extrabold">${esc(p.name)}</div>
                <div class="truncate text-sm text-gray-500">📍 ${esc(p.location || 'بدون موقع')}</div>
              </div>
              <div class="shrink-0 rounded-xl bg-brand-light px-3 py-2 text-center text-brand">
                <div class="text-lg font-extrabold leading-none">${count[p.id] || 0}</div><div class="text-xs">عامل</div>
              </div></div>`, 'active:bg-gray-50')}
          </a>`).join('')}</div>`
      : empty({ icon: '🏗️', title: 'لا توجد مشاريع بعد', hint: 'ابدأ بإضافة أول مشروع' })

    const invoicesHtml = last.length
      ? `<div class="space-y-2">${last.map((i) => `
          <a href="#/p/${esc(i.project_id)}?tab=invoices" class="block">
            ${card(`<div class="flex items-center gap-3">
              ${i.image_url
                ? `<img src="${esc(i.image_url)}" alt="" loading="lazy" class="h-14 w-14 shrink-0 rounded-lg bg-gray-100 object-cover">`
                : `<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl">🧾</div>`}
              <div class="min-w-0 flex-1">
                <div class="truncate font-bold">${esc(nameOf(i.project_id))}</div>
                <div class="truncate text-sm text-gray-500">${esc(i.notes || 'بدون ملاحظة')}</div>
              </div>
              <div class="shrink-0 text-end">
                <div class="font-extrabold">${fmt(i.amount)} ₪</div>
                <div class="text-xs text-gray-400">${showDate(i.created_at.slice(0, 10))}</div>
              </div></div>`, 'p-3 active:bg-gray-50')}
          </a>`).join('')}</div>`
      : empty({ icon: '🧾', title: 'لا توجد فواتير مرفوعة', hint: 'ارفع الفواتير من داخل أي مشروع' })

    return layout({
      title: 'نظام حسابات المقاولين',
      subtitle: `عدد المشاريع: ${projects.length}`,
      body: `
        <div class="grid grid-cols-2 gap-3">
          ${stat('إجمالي المشاريع', projects.length)}
          ${stat('إجمالي العمال', workers.length)}
          ${stat('مصروف الشهر', fmt(wages + inv) + ' ₪', 'أجور + فواتير')}
          ${stat('عدد الفواتير', invoices.length)}
        </div>

        ${btn('⚙️ إعدادات اليوميات', { a: 'openDailyRates', cls: 'mt-4 w-full', size: 'lg', v: 'secondary' })}

        ${btn('＋ إضافة مشروع جديد', { a: 'addProject', size: 'lg', cls: 'mt-3 w-full' })}
        <h2 class="mb-2 mt-6 text-lg font-extrabold">المشاريع</h2>${projectsHtml}
        <h2 class="mb-2 mt-6 text-lg font-extrabold">آخر 5 فواتير</h2>${invoicesHtml}`,
    })
  }

  // فتح إعدادات اليوميات
  Actions.openDailyRates = () => {
    const inputs = GROUPS.map((group, i) => `
      ${field(`يومية ${group} (₪)`,
        `<input id="rate-${i}" class="${inputCls}" type="number" min="0" step="0.01" inputmode="decimal" placeholder="أدخل اليومية" value="${esc(Store.getRate(group))}">`
      )}
    `).join('')

    UI.openModal('⚙️ إعدادات اليوميات', `
      <p class="mb-3 text-sm text-gray-500">
        حدد اليومية الافتراضية لكل مجموعة. سيتم استخدام هذه الأسعار في جميع المشاريع.
      </p>
      ${inputs}
      <div class="flex gap-2">
        ${btn('حفظ الأسعار', { a: 'saveDailyRates', cls: 'flex-1' })}
        ${btn('إلغاء', { a: 'modal-close', v: 'secondary', cls: 'flex-1' })}
      </div>
    `)
  }

  // حفظ أسعار المجموعات في Supabase
  Actions.saveDailyRates = (el) => {
    const values = GROUPS.map((group, i) => ({
      group,
      price: UI.val(`rate-${i}`).trim(),
    }))

    for (const item of values) {
      if (item.price === '' || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
        return UI.toast(`تأكد من إدخال يومية صحيحة لمجموعة ${item.group}`, 'err')
      }
    }

    UI.busy(el, async () => {
      try {
        for (const item of values) {
          await Store.saveRate(item.group, toNum(item.price))
        }

        UI.closeModal()
        UI.toast('تم حفظ أسعار اليوميات بنجاح')
      } catch (e) {
        UI.toast(e.message || 'تعذّر حفظ أسعار اليوميات', 'err')
      }
    })
  }

  // فتح نموذج إضافة يوم عمل جماعي - محفوظ كما هو
  Actions.openBulkEntry = () => {
    const projects = Store.get().projects

    if (!projects.length) {
      return UI.toast('أضف مشروعًا أولًا', 'err')
    }

    const options = projects.map((p) => `
      <option value="${esc(p.id)}">${esc(p.name)}</option>
    `).join('')

    UI.openModal('📅 إضافة يوم عمل جماعي', `
      ${field('اختر المشروع', `
        <select id="bulk-project" class="${inputCls}">
          ${options}
        </select>
      `)}

      <div class="mb-3">
        <div class="mb-2 text-sm font-bold">نوع التسجيل</div>

        <div class="grid grid-cols-2 gap-2">
          <label>
            <input type="radio" name="bulk-mode"
              value="single" checked
              class="peer sr-only"
              onchange="document.getElementById('bulk-single').classList.remove('hidden'); document.getElementById('bulk-range').classList.add('hidden')">

            <span class="block rounded-xl border p-3 text-center font-bold peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
              يوم واحد
            </span>
          </label>

          <label>
            <input type="radio" name="bulk-mode"
              value="range"
              class="peer sr-only"
              onchange="document.getElementById('bulk-single').classList.add('hidden'); document.getElementById('bulk-range').classList.remove('hidden')">

            <span class="block rounded-xl border p-3 text-center font-bold peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
              فترة زمنية
            </span>
          </label>
        </div>
      </div>

      <div id="bulk-single">
        ${field('تاريخ يوم العمل', `
          <input id="bulk-date" type="date"
            class="${inputCls}"
            value="${Calc.todayStr()}">
        `)}
      </div>

      <div id="bulk-range" class="hidden">
        ${field('من تاريخ', `
          <input id="bulk-from" type="date"
            class="${inputCls}"
            value="${Calc.todayStr()}">
        `)}

        ${field('إلى تاريخ', `
          <input id="bulk-to" type="date"
            class="${inputCls}"
            value="${Calc.todayStr()}">
        `)}
      </div>

      <p class="mb-3 text-xs text-gray-500">
        سيتم تسجيل يومية كل عامل تلقائيًا حسب يوميته المحفوظة،
        وستظهر السجلات داخل ملف كل عامل.
      </p>

      <div class="flex gap-2">
        ${btn('متابعة', {
          a: 'bulkEntryNext',
          cls: 'flex-1'
        })}

        ${btn('إلغاء', {
          a: 'modal-close',
          v: 'secondary',
          cls: 'flex-1'
        })}
      </div>
    `)
  }

  Actions.addProject = () => {
    UI.openModal('مشروع جديد', `
      ${field('اسم المشروع *', `<input id="pj-name" class="${inputCls}" autocomplete="off">`)}
      ${field('الموقع', `<input id="pj-loc" class="${inputCls}" autocomplete="off">`)}
      <div class="flex gap-2">${btn('حفظ', { a: 'saveProject', cls: 'flex-1' })}${btn('إلغاء', { a: 'modal-close', v: 'secondary', cls: 'flex-1' })}</div>`,
      () => UI.$('pj-name').focus())
  }

  Actions.saveProject = (el) => {
    const name = UI.val('pj-name').trim()
    if (!name) return UI.toast('اكتب اسم المشروع', 'err')
    UI.busy(el, async () => {
      try {
        await Store.addProject({ name, location: UI.val('pj-loc').trim() || null })
        UI.closeModal()
        UI.toast('تمت إضافة المشروع')
      } catch (e) {
        UI.toast(e.message || 'تعذّر الحفظ', 'err')
      }
    })
  }
})()
