
/* الصفحة الرئيسية - لوحة تحكم محاسبية احترافية */
;(() => {
  const { esc, btn, field, inputCls, empty, layout } = UI
  const { fmt, showDate, toNum } = Calc

  const GROUPS = ['طوبار', 'حداد', 'طراش', 'عامل']

  // بطاقة إحصائية
  const stat = (icon, label, value, sub, color, iconColor) => `
    <div class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(16,28,53,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(16,28,53,0.08)] sm:rounded-3xl sm:p-5">

      <div class="absolute -bottom-7 -left-5 h-24 w-24 rounded-full ${color} opacity-50"></div>

      <div class="relative flex items-start justify-between gap-2">

        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color} text-2xl transition-transform duration-200 group-hover:scale-110">
          ${icon}
        </div>

        <span class="max-w-[70%] break-words text-left text-xl font-black tracking-tight text-[#101c35] sm:text-2xl">
          ${value}
        </span>

      </div>

      <div class="relative mt-5">
        <div class="text-sm font-extrabold text-slate-700">
          ${label}
        </div>

        ${sub ? `
          <div class="mt-1.5 text-xs font-medium text-slate-400">
            ${sub}
          </div>
        ` : ''}
      </div>

      <div class="pointer-events-none absolute bottom-2 left-3 text-5xl opacity-[0.045]">
        ${icon}
      </div>
    </div>
  `

  // عنوان القسم
  const sectionTitle = (title, subtitle, icon) => `
    <div class="mb-4 flex items-center justify-between gap-3">

      <div class="min-w-0">
        <h2 class="text-lg font-black tracking-tight text-[#101c35] sm:text-xl">
          ${title}
        </h2>

        ${subtitle ? `
          <p class="mt-1 text-xs font-medium leading-5 text-slate-400">
            ${subtitle}
          </p>
        ` : ''}
      </div>

      ${icon ? `
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm">
          ${icon}
        </div>
      ` : ''}

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

    // بطاقات المشاريع
    const projectsHtml = projects.length
      ? `<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          ${projects.map((p) => `
            <a href="#/p/${esc(p.id)}"
              class="group relative block overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(16,28,53,0.035)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_12px_28px_rgba(16,28,53,0.08)] sm:rounded-3xl sm:p-5">

              <div class="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-blue-50/70 transition-transform duration-300 group-hover:scale-125"></div>

              <div class="relative flex items-center gap-3">

                <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100 text-2xl shadow-sm">
                  🏗️
                </div>

                <div class="min-w-0 flex-1">
                  <div class="truncate text-base font-black text-[#101c35]">
                    ${esc(p.name)}
                  </div>

                  <div class="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-400">
                    <span>📍</span>
                    <span class="truncate">${esc(p.location || 'بدون موقع')}</span>
                  </div>
                </div>

                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg text-slate-400 transition-all group-hover:bg-brand group-hover:text-white">
                  ←
                </div>

              </div>

              <div class="relative mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                <div class="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">👷</span>
                  عدد العمال
                </div>

                <span class="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2 text-sm font-black text-blue-700">
                  ${count[p.id] || 0} عامل
                </span>

              </div>

            </a>
          `).join('')}
        </div>`
      : empty({
          icon: '🏗️',
          title: 'لا توجد مشاريع بعد',
          hint: 'ابدأ بإضافة أول مشروع لتتمكن من إدارة العمال والحسابات.',
          action: btn('إضافة أول مشروع', { a: 'addProject' })
        })

    // آخر الفواتير
    const invoicesHtml = last.length
      ? `<div class="space-y-3">
          ${last.map((i) => `
            <a href="#/p/${esc(i.project_id)}?tab=invoices"
              class="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_2px_10px_rgba(16,28,53,0.025)] transition-all hover:border-blue-200 hover:shadow-md active:scale-[0.99] sm:p-4">

              ${i.image_url
                ? `<img src="${esc(i.image_url)}" alt="فاتورة"
                    loading="lazy"
                    class="h-14 w-14 shrink-0 rounded-xl border border-slate-100 bg-slate-100 object-cover">`
                : `<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-2xl">🧾</div>`}

              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-extrabold text-[#101c35] transition-colors group-hover:text-brand">
                  ${esc(nameOf(i.project_id))}
                </div>

                <div class="mt-1.5 truncate text-xs font-medium text-slate-400">
                  ${esc(i.notes || 'بدون ملاحظة')}
                </div>
              </div>

              <div class="shrink-0 text-left">
                <div class="font-black text-[#101c35]">
                  ${fmt(i.amount)} ₪
                </div>

                <div class="mt-1.5 text-[11px] font-medium text-slate-400">
                  ${showDate(i.created_at.slice(0, 10))}
                </div>
              </div>

            </a>
          `).join('')}
        </div>`
      : empty({
          icon: '🧾',
          title: 'لا توجد فواتير مرفوعة',
          hint: 'يمكنك رفع الفواتير وتوثيق المصاريف من داخل كل مشروع.'
        })

    return layout({
      title: 'لوحة التحكم',
      subtitle: 'نظام حسابات المقاولين',

      body: `
        <!-- واجهة الترحيب -->
        <div class="relative mb-7 overflow-hidden rounded-3xl border border-[#263b61] bg-[#101c35] p-5 text-white shadow-[0_14px_35px_rgba(16,28,53,0.16)] sm:p-7">

          <div class="pointer-events-none absolute -left-12 -top-16 h-52 w-52 rounded-full border-[24px] border-white/[0.035]"></div>
          <div class="pointer-events-none absolute -left-5 -top-9 h-36 w-36 rounded-full border border-white/[0.06]"></div>
          <div class="pointer-events-none absolute -bottom-16 right-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl"></div>

          <div class="relative z-10">

            <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-blue-100">
              <span class="h-2 w-2 rounded-full bg-blue-400"></span>
              المقاول أبو علي
            </div>

            <h2 class="mt-5 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
              أهلاً بك في لوحة التحكم
            </h2>

            <p class="mt-3 max-w-md text-sm leading-7 text-slate-300">
              كل مشاريعك وحسابات العمال وفواتيرك في مكان واحد، بإدارة أسهل ورؤية أوضح.
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-3">

              <div class="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                النظام جاهز للعمل
              </div>

              <div class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-slate-300">
                <span>📊</span>
                إدارة مالية متكاملة
              </div>

            </div>

          </div>

          <div class="pointer-events-none absolute bottom-3 left-5 text-8xl opacity-[0.09] sm:text-9xl">
            🏗️
          </div>

        </div>

        <!-- الإحصائيات -->
        <section class="mb-7">

          ${sectionTitle('ملخص الحسابات', 'نظرة عامة على بيانات النظام', '📊')}

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">

            ${stat(
              '🏗️',
              'إجمالي المشاريع',
              projects.length,
              'المشاريع المسجلة',
              'bg-blue-50',
              'text-blue-700'
            )}

            ${stat(
              '👷',
              'إجمالي العمال',
              workers.length,
              'جميع العمال',
              'bg-emerald-50',
              'text-emerald-700'
            )}

            ${stat(
              '💰',
              'مصروف الشهر',
              fmt(wages + inv) + ' ₪',
              'أجور وفواتير',
              'bg-amber-50',
              'text-amber-700'
            )}

            ${stat(
              '🧾',
              'عدد الفواتير',
              invoices.length,
              'الفواتير المسجلة',
              'bg-violet-50',
              'text-violet-700'
            )}

          </div>

        </section>

        <!-- الإجراءات السريعة -->
        <section class="mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(16,28,53,0.035)] sm:p-5">

          ${sectionTitle('إجراءات سريعة', 'الوصول إلى أهم أدوات النظام', '⚡')}

          <div class="grid grid-cols-2 gap-3">

            <button data-a="addProject"
              class="group flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-center transition-all hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98]">

              <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm transition-transform group-hover:scale-110">
                ➕
              </span>

              <span class="text-sm font-extrabold text-blue-800">
                إضافة مشروع
              </span>

            </button>

            <button data-a="openDailyRates"
              class="group flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-center transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]">

              <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm transition-transform group-hover:scale-110">
                ⚙️
              </span>

              <span class="text-sm font-extrabold text-slate-700">
                إعدادات اليوميات
              </span>

            </button>

          </div>

        </section>

        <!-- المشاريع -->
        <section class="mb-8">

          ${sectionTitle('المشاريع', 'اختر المشروع لإدارة العمال والحسابات', '🏗️')}

          ${projectsHtml}

        </section>

        <!-- الفواتير -->
        <section class="mb-7">

          ${sectionTitle('آخر الفواتير', 'أحدث 5 فواتير مسجلة في النظام', '🧾')}

          ${invoicesHtml}

        </section>
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
      <div class="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div class="flex items-start gap-3">
          <span class="text-xl">💡</span>
          <p class="text-sm leading-6 text-blue-800">
            حدد اليومية الافتراضية لكل مجموعة. سيتم استخدام هذه الأسعار عند إضافة العمال وتسجيل يومياتهم.
          </p>
        </div>
      </div>

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

  // فتح نموذج إضافة يوم عمل جماعي
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

      <p class="mb-4 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-500">
        سيتم تسجيل يومية كل عامل تلقائيًا حسب يوميته المحفوظة، وستظهر السجلات داخل ملف كل عامل.
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
      <div class="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-blue-800">
        أضف بيانات المشروع للبدء بإدارة العمال والمستحقات والفواتير.
      </div>

      ${field('اسم المشروع *', `<input id="pj-name" class="${inputCls}" autocomplete="off" placeholder="مثال: مشروع عمارة سكنية">`)}
      ${field('الموقع', `<input id="pj-loc" class="${inputCls}" autocomplete="off" placeholder="المدينة أو المنطقة">`)}

      <div class="flex gap-2">
        ${btn('حفظ المشروع', { a: 'saveProject', cls: 'flex-1' })}
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
