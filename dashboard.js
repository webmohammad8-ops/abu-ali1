
// الصفحة الرئيسية - تصميم جديد
;(() => {
  const { esc, card, btn, field, inputCls, empty, layout } = UI
  const { fmt, showDate, toNum } = Calc

  const GROUPS = ['طوبار', 'حداد', 'طراش', 'عامل']

  // بطاقة إحصائية
  const stat = (icon, label, value, sub, color) => `
    <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between gap-2">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl ${color} text-xl">
          ${icon}
        </div>
        <span class="text-2xl font-extrabold text-gray-900">${value}</span>
      </div>
      <div class="mt-3 text-sm font-extrabold text-gray-800">${label}</div>
      ${sub ? `<div class="mt-1 text-xs text-gray-400">${sub}</div>` : ''}
    </div>
  `

  // عنوان القسم
  const sectionTitle = (title, subtitle, icon) => `
    <div class="mb-3 flex items-center justify-between gap-2">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">${title}</h2>
        ${subtitle ? `<p class="mt-1 text-xs text-gray-400">${subtitle}</p>` : ''}
      </div>
      ${icon ? `<span class="text-xl">${icon}</span>` : ''}
    </div>
  `

  Views.dashboard = () => {
    const { projects, workers, entries, invoices } = Store.get()

    const m = Calc.monthRange()

    const wages = entries
      .filter((e) => Calc.inRange(e.date, m))
      .reduce((s, e) => s + toNum(e.daily_wage), 0)

    const inv = invoices
      .filter((i) => Calc.inRange(i.created_at.slice(0, 10), m))
      .reduce((s, i) => s + toNum(i.amount), 0)

    const count = {}

    workers.forEach((w) => {
      count[w.project_id] = (count[w.project_id] || 0) + 1
    })

    const nameOf = (id) =>
      (projects.find((p) => p.id === id) || {}).name || '—'

    const last = [...invoices]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5)

    // المشاريع
    const projectsHtml = projects.length
      ? `<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          ${projects.map((p) => `
            <a href="#/p/${esc(p.id)}"
              class="group block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition active:scale-[0.99]">

              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🏗️
                </div>

                <div class="min-w-0 flex-1">
                  <div class="truncate text-base font-extrabold text-gray-900">
                    ${esc(p.name)}
                  </div>
                  <div class="mt-1 truncate text-xs text-gray-500">
                    📍 ${esc(p.location || 'بدون موقع')}
                  </div>
                </div>

                <span class="text-gray-400 transition group-hover:text-blue-600">←</span>
              </div>

              <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span class="text-xs font-bold text-gray-500">عدد العمال</span>
                <span class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-extrabold text-blue-700">
                  ${count[p.id] || 0} عامل
                </span>
              </div>
            </a>
          `).join('')}
        </div>`
      : empty({
          icon: '🏗️',
          title: 'لا توجد مشاريع بعد',
          hint: 'ابدأ بإضافة أول مشروع'
        })

    // آخر الفواتير
    const invoicesHtml = last.length
      ? `<div class="space-y-2">
          ${last.map((i) => `
            <a href="#/p/${esc(i.project_id)}?tab=invoices"
              class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition active:bg-gray-50">

              ${i.image_url
                ? `<img src="${esc(i.image_url)}" alt="فاتورة"
                    loading="lazy"
                    class="h-14 w-14 shrink-0 rounded-xl bg-gray-100 object-cover">`
                : `<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl">🧾</div>`}

              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-extrabold text-gray-900">
                  ${esc(nameOf(i.project_id))}
                </div>
                <div class="mt-1 truncate text-xs text-gray-500">
                  ${esc(i.notes || 'بدون ملاحظة')}
                </div>
              </div>

              <div class="shrink-0 text-left">
                <div class="font-extrabold text-gray-900">
                  ${fmt(i.amount)} ₪
                </div>
                <div class="mt-1 text-xs text-gray-400">
                  ${showDate(i.created_at.slice(0, 10))}
                </div>
              </div>
            </a>
          `).join('')}
        </div>`
      : empty({
          icon: '🧾',
          title: 'لا توجد فواتير مرفوعة',
          hint: 'يمكنك رفع الفواتير من داخل المشروع'
        })

    return layout({
      title: 'لوحة التحكم',
      subtitle: 'نظام حسابات المقاولين',

      body: `
        <!-- رأس الصفحة -->
        <div class="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-l from-blue-800 to-blue-600 p-5 text-white shadow-lg">
          <div class="relative z-10">
            <div class="flex items-center gap-2 text-sm font-bold text-blue-100">
              <span>🏗️</span>
              المقاول أبو علي
            </div>

            <h2 class="mt-3 text-2xl font-extrabold">
              أهلاً بك في لوحة التحكم
            </h2>

            <p class="mt-2 text-sm text-blue-100">
              تابع مشاريعك وحسابات العمال من مكان واحد
            </p>

            <div class="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold">
              <span class="h-2 w-2 rounded-full bg-green-400"></span>
              النظام جاهز للعمل
            </div>
          </div>

          <div class="pointer-events-none absolute -bottom-12 -left-8 text-9xl opacity-10">
            🏗️
          </div>
        </div>

        <!-- الإحصائيات -->
        ${sectionTitle('ملخص الحسابات', 'نظرة عامة على بيانات النظام', '📊')}

        <div class="grid grid-cols-2 gap-3">
          ${stat('🏗️', 'إجمالي المشاريع', projects.length, 'المشاريع المسجلة', 'bg-blue-50')}
          ${stat('👷', 'إجمالي العمال', workers.length, 'جميع العمال', 'bg-indigo-50')}
          ${stat('💰', 'مصروف الشهر', fmt(wages + inv) + ' ₪', 'أجور وفواتير', 'bg-emerald-50')}
          ${stat('🧾', 'عدد الفواتير', invoices.length, 'الفواتير المسجلة', 'bg-orange-50')}
        </div>

        <!-- الإجراءات السريعة -->
        <div class="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          ${sectionTitle('إجراءات سريعة', 'الوصول إلى أهم أدوات النظام', '⚡')}

          <div class="grid grid-cols-2 gap-3">
            <button data-a="addProject"
              class="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-center transition active:scale-[0.98]">
              <span class="text-2xl">➕</span>
              <span class="text-sm font-extrabold text-blue-800">إضافة مشروع</span>
            </button>

            <button data-a="openDailyRates"
              class="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-center transition active:scale-[0.98]">
              <span class="text-2xl">⚙️</span>
              <span class="text-sm font-extrabold text-gray-700">إعدادات اليوميات</span>
            </button>
          </div>
        </div>

        <!-- المشاريع -->
        <div class="mt-6">
          ${sectionTitle('المشاريع', 'اختر المشروع لإدارة العمال والحسابات', '🏗️')}

          ${projectsHtml}
        </div>

        <!-- الفواتير -->
        <div class="mt-6">
          ${sectionTitle('آخر الفواتير', 'أحدث 5 فواتير مسجلة في النظام', '🧾')}

          ${invoicesHtml}
        </div>

        <!-- إعدادات إضافية -->
        <div class="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
              ⚙️
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-extrabold text-gray-800">إعدادات النظام</div>
              <div class="mt-1 text-xs text-gray-500">
                تعديل اليوميات الافتراضية للمجموعات
              </div>
            </div>
            <button data-a="openDailyRates"
              class="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 active:bg-gray-200">
              فتح
            </button>
          </div>
        </div>
      `
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

  // إضافة مشروع
  Actions.addProject = () => {
    UI.openModal('مشروع جديد', `
      ${field('اسم المشروع *', `<input id="pj-name" class="${inputCls}" autocomplete="off">`)}
      ${field('الموقع', `<input id="pj-loc" class="${inputCls}" autocomplete="off">`)}

      <div class="flex gap-2">
        ${btn('حفظ', { a: 'saveProject', cls: 'flex-1' })}
        ${btn('إلغاء', { a: 'modal-close', v: 'secondary', cls: 'flex-1' })}
      </div>
    `,
      () => UI.$('pj-name').focus())
  }

  // حفظ المشروع
  Actions.saveProject = (el) => {
    const name = UI.val('pj-name').trim()

    if (!name) {
      return UI.toast('اكتب اسم المشروع', 'err')
    }

    UI.busy(el, async () => {
      try {
        await Store.addProject({
          name,
          location: UI.val('pj-loc').trim() || null
        })

        UI.closeModal()
        UI.toast('تمت إضافة المشروع')
      } catch (e) {
        UI.toast(e.message || 'تعذّر الحفظ', 'err')
      }
    })
  }
})()
