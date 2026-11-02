
// صفحة المشروع: العمال / الفواتير / الدفعات + اليوميات والسلف الجماعية
;(() => {
  const { esc, btn, empty, layout, field, inputCls } = UI

  const TABS = [
    { id: 'workers', label: '👷 العمال' },
    { id: 'invoices', label: '🧾 الفواتير' },
    { id: 'pay', label: '💵 الدفعات' },
    { id: 'payments', label: '💰 استلامات الشركة' },
  ]

  // ---------- تبويب استلامات الشركة ----------

  const PaymentsTab = {
    render(project) {
      const payments = Store.get().payments
        .filter((p) => p.project_id === project.id)
        .sort((a, b) => b.date.localeCompare(a.date))

      const total = payments.reduce(
        (sum, p) => sum + Calc.toNum(p.amount),
        0
      )

      const rows = payments.length
        ? payments.map((p) => `
            <div class="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_12px_rgba(16,28,53,0.035)] transition hover:border-emerald-200 hover:shadow-md">

              <div class="flex items-center justify-between gap-3">

                <div class="flex min-w-0 items-center gap-3">

                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-xl">
                    💰
                  </div>

                  <div class="min-w-0">
                    <div class="text-lg font-black text-emerald-700">
                      ${Calc.fmt(p.amount)} ₪
                    </div>

                    <div class="mt-1 text-xs font-medium text-slate-400">
                      📅 ${esc(p.date)}
                    </div>
                  </div>

                </div>

                <div class="flex shrink-0 gap-2">

                  <button
                    data-a="editPayment"
                    data-id="${esc(p.id)}"
                    class="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100">
                    ✏️ تعديل
                  </button>

                  <button
                    data-a="deletePayment"
                    data-id="${esc(p.id)}"
                    class="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600 transition hover:bg-red-100">
                    🗑 حذف
                  </button>

                </div>

              </div>
            </div>
          `).join('')
        : empty({
            icon: '💰',
            title: 'لا توجد استلامات مسجلة',
            hint: 'سجّل المبالغ التي استلمتها الشركة من هذا المشروع.'
          })

      return `
        <div class="mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50 to-white p-4">

          <div class="flex items-center justify-between gap-3">

            <div>
              <div class="text-xs font-bold text-emerald-700">
                إجمالي استلامات الشركة
              </div>

              <div class="mt-2 text-2xl font-black tracking-tight text-emerald-800">
                ${Calc.fmt(total)} ₪
              </div>
            </div>

            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
              💰
            </div>

          </div>

          <div class="mt-3 border-t border-emerald-100 pt-3 text-xs font-medium text-emerald-700">
            عدد الاستلامات المسجلة: ${payments.length}
          </div>

        </div>

        <button
          data-a="openPayment"
          class="mb-4 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 font-extrabold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]">
          <span class="text-xl">＋</span>
          تسجيل استلام جديد
        </button>

        <div class="space-y-3">
          ${rows}
        </div>
      `
    },
  }

  // ---------- إضافة وتعديل استلام الشركة ----------

  Actions.openPayment = () => {
    const date = Calc.todayStr()

    UI.openModal('💰 تسجيل استلام من الشركة', `
      <div class="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm leading-6 text-emerald-800">
        أدخل قيمة المبلغ الذي تم استلامه من الشركة وتاريخ الاستلام.
      </div>

      <input type="hidden" id="payment-id" value="">

      ${field('المبلغ المستلم (₪)', `
        <input
          id="payment-amount"
          type="number"
          min="0.01"
          step="0.01"
          inputmode="decimal"
          class="${inputCls}"
          placeholder="أدخل المبلغ"
          autocomplete="off">
      `)}

      ${field('تاريخ الاستلام', `
        <input
          id="payment-date"
          type="date"
          class="${inputCls}"
          value="${date}">
      `)}

      <div class="flex gap-2">
        ${btn('حفظ الاستلام', {
          a: 'savePayment',
          cls: 'flex-1',
        })}

        ${btn('إلغاء', {
          a: 'modal-close',
          v: 'secondary',
          cls: 'flex-1',
        })}
      </div>
    `)
  }

  Actions.editPayment = (el) => {
    const payment = Store.get().payments.find(
      (p) => String(p.id) === String(el.dataset.id)
    )

    if (!payment) {
      return UI.toast('لم يتم العثور على الاستلام', 'err')
    }

    UI.openModal('✏️ تعديل الاستلام', `
      <input
        type="hidden"
        id="payment-id"
        value="${esc(payment.id)}">

      ${field('المبلغ المستلم (₪)', `
        <input
          id="payment-amount"
          type="number"
          min="0.01"
          step="0.01"
          inputmode="decimal"
          class="${inputCls}"
          value="${esc(payment.amount)}">
      `)}

      ${field('تاريخ الاستلام', `
        <input
          id="payment-date"
          type="date"
          class="${inputCls}"
          value="${esc(payment.date)}">
      `)}

      <div class="flex gap-2">
        ${btn('حفظ التعديلات', {
          a: 'savePayment',
          cls: 'flex-1',
        })}

        ${btn('إلغاء', {
          a: 'modal-close',
          v: 'secondary',
          cls: 'flex-1',
        })}
      </div>
    `)
  }

  // ---------- حفظ الاستلام ----------

  Actions.savePayment = (el) => {
    const projectId = App.parseRoute().pid
    const id = UI.val('payment-id')
    const amount = Calc.toNum(UI.val('payment-amount'))
    const date = UI.val('payment-date')

    if (!Number.isFinite(amount) || amount <= 0) {
      return UI.toast('أدخل مبلغًا صحيحًا أكبر من صفر', 'err')
    }

    if (!date) {
      return UI.toast('اختر تاريخ الاستلام', 'err')
    }

    const row = {
      project_id: projectId,
      amount,
      date,
    }

    UI.busy(el, async () => {
      try {
        if (id) {
          await Store.updatePayment(id, row)
        } else {
          await Store.addPayment(row)
        }

        UI.closeModal()
        UI.toast(id ? 'تم تعديل الاستلام بنجاح' : 'تم تسجيل الاستلام بنجاح')
      } catch (e) {
        UI.toast(e.message || 'تعذّر حفظ الاستلام', 'err')
      }
    })
  }

  // ---------- حذف الاستلام ----------

  Actions.deletePayment = async (el) => {
    const payment = Store.get().payments.find(
      (p) => String(p.id) === String(el.dataset.id)
    )

    if (!payment) {
      return UI.toast('لم يتم العثور على الاستلام', 'err')
    }

    if (!window.confirm(
      `حذف استلام بقيمة ${Calc.fmt(payment.amount)} ₪ بتاريخ ${payment.date}؟`
    )) return

    try {
      await Store.deletePayment(payment.id)
      UI.toast('تم حذف الاستلام')
    } catch (e) {
      UI.toast(e.message || 'تعذّر حذف الاستلام', 'err')
    }
  }

  // ---------- واجهة المشروع ----------

  Views.project = (r) => {
    const project = Store.get().projects.find((p) => p.id === r.pid)

    if (!project)
      return layout({
        title: 'مشروع غير موجود',
        back: '#/',
        body: empty({
          icon: '🔍',
          title: 'لم يتم العثور على المشروع',
          action: btn('العودة للرئيسية', { a: 'nav', id: '#/' }),
        }),
      })

    const tab = TABS.some((t) => t.id === r.q.get('tab'))
      ? r.q.get('tab')
      : 'workers'

    const tabs = TABS.map((t) =>
      `<button data-a="setTab" data-id="${t.id}" class="min-h-[48px] rounded-xl px-2 text-xs font-extrabold transition-all sm:text-sm ${tab === t.id ? 'bg-[#101c35] text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-[#101c35]'}">${t.label}</button>`
    ).join('')

    const content =
      tab === 'workers'
        ? WorkersTab.render(project)
        : tab === 'invoices'
          ? InvoicesTab.render(project)
          : tab === 'payments'
            ? PaymentsTab.render(project)
            : GroupPayTab.render(project)

    const bulkButton = `
      <button
        data-a="openBulkEntry"
        class="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-3 text-right transition-all hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98]">

        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm transition-transform group-hover:scale-110">
          📅
        </span>

        <span class="text-sm font-extrabold leading-5 text-blue-900">
          إضافة يوم عمل جماعي
        </span>
      </button>
    `

    const bulkAdvanceButton = `
      <button
        data-a="openBulkAdvance"
        class="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-right transition-all hover:border-emerald-200 hover:bg-emerald-50 active:scale-[0.98]">

        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm transition-transform group-hover:scale-110">
          💰
        </span>

        <span class="text-sm font-extrabold leading-5 text-emerald-900">
          إضافة سلفة جماعية
        </span>
      </button>
    `

    const reportButton = `
      <button
        data-a="printProjectReport"
        data-id="${esc(project.id)}"
        class="group flex min-h-[68px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-right transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]">

        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          🖨️
        </span>

        <span class="text-xs font-extrabold leading-5 text-slate-700">
          تقرير المشروع PDF
        </span>
      </button>
    `

    const whatsappButton = `
      <button
        data-a="shareProjectWhatsApp"
        data-id="${esc(project.id)}"
        class="group flex min-h-[68px] items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-3 text-right transition-all hover:border-green-200 hover:bg-green-100 active:scale-[0.98]">

        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          📲
        </span>

        <span class="text-xs font-extrabold leading-5 text-green-800">
          مشاركة الحسابات واتساب
        </span>
      </button>
    `

    return layout({
      title: project.name,
      subtitle: project.location ? '📍 ' + project.location : '',
      back: '#/',
      actions: `<button data-a="deleteProject" data-id="${esc(project.id)}" aria-label="حذف المشروع" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-lg transition hover:bg-red-500/20 active:scale-95">🗑</button>`,
      body: `

        <!-- هوية المشروع -->
        <div class="relative mb-5 overflow-hidden rounded-3xl border border-[#263b61] bg-[#101c35] p-4 text-white shadow-[0_10px_28px_rgba(16,28,53,0.12)] sm:p-5">

          <div class="pointer-events-none absolute -left-8 -top-10 h-32 w-32 rounded-full border-[18px] border-white/[0.035]"></div>

          <div class="relative flex items-center gap-3">

            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
              🏗️
            </div>

            <div class="min-w-0 flex-1">
              <div class="text-[11px] font-bold text-blue-200">
                إدارة المشروع
              </div>

              <div class="mt-1 truncate text-lg font-black">
                ${esc(project.name)}
              </div>

              ${project.location ? `
                <div class="mt-1 truncate text-xs font-medium text-slate-300">
                  📍 ${esc(project.location)}
                </div>
              ` : ''}
            </div>

            <div class="hidden rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-bold text-blue-100 sm:block">
              نظام المقاول أبو علي
            </div>

          </div>

        </div>

        <!-- تبويبات المشروع -->
        <div class="mb-5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 shadow-sm">

          <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            ${tabs}
          </div>

        </div>

        <!-- إجراءات المشروع -->
        <section class="mb-6">

          <div class="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-base font-black text-[#101c35]">
                إجراءات المشروع
              </h3>

              <p class="mt-1 text-xs font-medium text-slate-400">
                أدوات سريعة لإدارة العمل والحسابات
              </p>
            </div>

            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-lg">
              ⚡
            </span>
          </div>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            ${bulkButton}
            ${bulkAdvanceButton}
            ${reportButton}
            ${whatsappButton}
          </div>

        </section>

        <!-- محتوى التبويب -->
        <section>
          ${content}
        </section>

      `,
    })
  }

  // ---------- التنقل بين التبويبات ----------

  Actions.setTab = (el) => {
    const r = App.parseRoute()
    location.replace(`#/p/${encodeURIComponent(r.pid)}?tab=${el.dataset.id}`)
  }

  // ---------- إضافة يوم عمل جماعي ----------

  Actions.openBulkEntry = () => {
    const projectId = App.parseRoute().pid

    const workers = Store.get().workers.filter(
      (w) => w.project_id === projectId
    )

    if (!workers.length) {
      return UI.toast('لا يوجد عمال في هذا المشروع', 'err')
    }

    const workerList = workers.map((w) => `
      <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/40">

        <input
          type="checkbox"
          name="bulk-worker"
          value="${esc(w.id)}"
          checked
          class="h-5 w-5 accent-current">

        <span class="min-w-0 flex-1">
          <span class="block truncate font-extrabold text-slate-800">${esc(w.name)}</span>
          <span class="mt-1 block text-xs font-medium text-slate-400">${esc(w.group_type || '')}</span>
        </span>

        <span class="shrink-0 rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-extrabold text-blue-700">
          ${Calc.fmt(
            w.daily_wage !== null &&
            w.daily_wage !== undefined &&
            w.daily_wage !== ''
              ? w.daily_wage
              : Store.getRate(w.group_type)
          )} ₪
        </span>

      </label>
    `).join('')

    UI.openModal('📅 إضافة يوم عمل جماعي', `
      <div class="mb-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
        <div class="flex items-start gap-2">
          <span class="text-xl">💡</span>
          <p class="text-sm leading-6 text-blue-800">
            اختر العمال الذين تريد تسجيل يوم العمل لهم. سيتم أخذ اليومية تلقائيًا من بيانات كل عامل.
          </p>
        </div>
      </div>

      <div class="mb-3">
        <div class="mb-2 text-sm font-extrabold text-slate-700">نوع التسجيل</div>

        <div class="grid grid-cols-2 gap-2">
          <label>
            <input
              type="radio"
              name="bulk-mode"
              value="single"
              checked
              class="peer sr-only"
              onchange="
                document.getElementById('bulk-single').classList.remove('hidden');
                document.getElementById('bulk-range').classList.add('hidden')
              ">

            <span class="block cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-center text-sm font-extrabold text-slate-600 transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
              يوم واحد
            </span>
          </label>

          <label>
            <input
              type="radio"
              name="bulk-mode"
              value="range"
              class="peer sr-only"
              onchange="
                document.getElementById('bulk-single').classList.add('hidden');
                document.getElementById('bulk-range').classList.remove('hidden')
              ">

            <span class="block cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-center text-sm font-extrabold text-slate-600 transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
              فترة زمنية
            </span>
          </label>
        </div>
      </div>

      <div id="bulk-single">
        ${field('تاريخ يوم العمل', `
          <input
            id="bulk-date"
            type="date"
            class="${inputCls}"
            value="${Calc.todayStr()}">
        `)}
      </div>

      <div id="bulk-range" class="hidden">
        ${field('من تاريخ', `
          <input
            id="bulk-from"
            type="date"
            class="${inputCls}"
            value="${Calc.todayStr()}">
        `)}

        ${field('إلى تاريخ', `
          <input
            id="bulk-to"
            type="date"
            class="${inputCls}"
            value="${Calc.todayStr()}">
        `)}
      </div>

      <div class="mb-2 mt-4 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">

        <span class="text-sm font-extrabold text-slate-700">
          👷 اختيار العمال
        </span>

        <label class="flex cursor-pointer items-center gap-2 text-xs font-extrabold text-blue-700">
          <input
            id="bulk-select-all"
            type="checkbox"
            checked
            class="h-5 w-5 accent-current"
            onchange="
              document.querySelectorAll('input[name=bulk-worker]').forEach(
                cb => cb.checked = this.checked
              )
            ">
          تحديد الكل
        </label>

      </div>

      <div class="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-xl">
        ${workerList}
      </div>

      <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-500">
        الأكل والدخان والسلفة ستكون صفرًا تلقائيًا. ويمكنك تعديلها لاحقًا من ملف العامل.
      </div>

      <div class="flex gap-2">
        ${btn('حفظ أيام العمل', {
          a: 'saveBulkEntry',
          cls: 'flex-1',
        })}

        ${btn('إلغاء', {
          a: 'modal-close',
          v: 'secondary',
          cls: 'flex-1',
        })}
      </div>
    `)
  }

  // تحويل التاريخ إلى قائمة أيام شاملة البداية والنهاية
  function getBulkDates(from, to) {
    const start = from.split('-').map(Number)
    const end = to.split('-').map(Number)

    const current = new Date(Date.UTC(start[0], start[1] - 1, start[2]))
    const last = new Date(Date.UTC(end[0], end[1] - 1, end[2]))

    const dates = []

    while (current <= last) {
      dates.push(current.toISOString().slice(0, 10))
      current.setUTCDate(current.getUTCDate() + 1)
    }

    return dates
  }

  // حفظ أيام العمل للعمال المختارين
  Actions.saveBulkEntry = (el) => {
    const projectId = App.parseRoute().pid

    const workers = Store.get().workers.filter(
      (w) => w.project_id === projectId
    )

    const selectedIds = Array.from(
      document.querySelectorAll('input[name="bulk-worker"]:checked')
    ).map((cb) => cb.value)

    if (!selectedIds.length) {
      return UI.toast('اختر عاملًا واحدًا على الأقل', 'err')
    }

    const selectedWorkers = workers.filter(
      (w) => selectedIds.includes(w.id)
    )

    const mode = document.querySelector(
      'input[name="bulk-mode"]:checked'
    )?.value

    let from
    let to

    if (mode === 'range') {
      from = UI.val('bulk-from')
      to = UI.val('bulk-to')

      if (!from || !to) {
        return UI.toast('اختر تاريخ البداية والنهاية', 'err')
      }

      if (from > to) {
        return UI.toast('تاريخ البداية يجب أن يكون قبل النهاية', 'err')
      }
    } else {
      from = UI.val('bulk-date')
      to = from

      if (!from) {
        return UI.toast('اختر تاريخ يوم العمل', 'err')
      }
    }

    const dates = getBulkDates(from, to)

    if (dates.length > 366) {
      return UI.toast('الفترة طويلة جدًا. الحد الأقصى سنة واحدة', 'err')
    }

    const existing = Store.get().entries

    const existingKeys = new Set(
      existing.map((e) => `${e.worker_id}|${e.date}`)
    )

    const rows = []
    let skipped = 0

    selectedWorkers.forEach((worker) => {
      const wage =
        worker.daily_wage !== null &&
        worker.daily_wage !== undefined &&
        worker.daily_wage !== ''
          ? Calc.toNum(worker.daily_wage)
          : Store.getRate(worker.group_type)

      dates.forEach((date) => {
        const key = `${worker.id}|${date}`

        if (existingKeys.has(key)) {
          skipped++
          return
        }

        rows.push({
          worker_id: worker.id,
          date,
          daily_wage: Calc.toNum(wage),
          food: 0,
          smoke: 0,
          advance: 0,
          notes: null,
        })

        existingKeys.add(key)
      })
    })

    if (!rows.length) {
      return UI.toast('كل الأيام المحددة مسجلة مسبقًا لهؤلاء العمال', 'err')
    }

    const message =
      `سيتم إنشاء ${rows.length} سجل يومية لـ ${selectedWorkers.length} عامل.\n` +
      (skipped ? `سيتم تخطي ${skipped} سجل مكرر.\n` : '') +
      `\nهل تريد المتابعة؟`

    if (!window.confirm(message)) return

    UI.busy(el, async () => {
      try {
        await Store.addEntries(rows)

        UI.closeModal()

        UI.toast(
          `تم تسجيل ${rows.length} يومية بنجاح` +
          (skipped ? `، وتم تخطي ${skipped} سجل مكرر` : '')
        )
      } catch (e) {
        UI.toast(e.message || 'تعذّر حفظ أيام العمل', 'err')
      }
    })
  }

  // ---------- إضافة سلفة جماعية ----------

  Actions.openBulkAdvance = () => {
    const projectId = App.parseRoute().pid

    const workers = Store.get().workers.filter(
      (w) => w.project_id === projectId
    )

    if (!workers.length) {
      return UI.toast('لا يوجد عمال في هذا المشروع', 'err')
    }

    const workerList = workers.map((w) => `
      <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">

        <input
          type="checkbox"
          name="bulk-advance-worker"
          value="${esc(w.id)}"
          checked
          class="h-5 w-5 accent-current">

        <span class="min-w-0 flex-1">
          <span class="block truncate font-extrabold text-slate-800">${esc(w.name)}</span>
          <span class="mt-1 block text-xs font-medium text-slate-400">${esc(w.group_type || '')}</span>
        </span>

      </label>
    `).join('')

    UI.openModal('💰 إضافة سلفة جماعية', `
      <div class="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
        <div class="flex items-start gap-2">
          <span class="text-xl">💰</span>
          <p class="text-sm leading-6 text-emerald-800">
            أدخل مبلغ السلفة لكل عامل. يمكنك استثناء أي عامل من القائمة.
          </p>
        </div>
      </div>

      ${field('مبلغ السلفة لكل عامل (₪)', `
        <input
          id="bulk-advance-amount"
          type="number"
          min="0.01"
          step="0.01"
          inputmode="decimal"
          class="${inputCls}"
          placeholder="مثال: 500"
          autocomplete="off">
      `)}

      ${field('تاريخ السلفة', `
        <input
          id="bulk-advance-date"
          type="date"
          class="${inputCls}"
          value="${Calc.todayStr()}">
      `)}

      <div class="mb-2 mt-4 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">

        <span class="text-sm font-extrabold text-slate-700">
          👷 اختيار العمال
        </span>

        <label class="flex cursor-pointer items-center gap-2 text-xs font-extrabold text-emerald-700">
          <input
            id="bulk-advance-select-all"
            type="checkbox"
            checked
            class="h-5 w-5 accent-current"
            onchange="
              document.querySelectorAll('input[name=bulk-advance-worker]').forEach(
                cb => cb.checked = this.checked
              )
            ">
          تحديد الكل
        </label>

      </div>

      <div class="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-xl">
        ${workerList}
      </div>

      <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-500">
        ستُضاف السلفة إلى سلفة العامل الموجودة في سجل اليوم إن وُجدت، دون تغيير اليومية أو الأكل أو الدخان.
      </div>

      <div class="flex gap-2">
        ${btn('تسجيل السلفة', {
          a: 'saveBulkAdvance',
          cls: 'flex-1',
        })}

        ${btn('إلغاء', {
          a: 'modal-close',
          v: 'secondary',
          cls: 'flex-1',
        })}
      </div>
    `)
  }

  // حفظ السلفة الجماعية
  Actions.saveBulkAdvance = (el) => {
    const projectId = App.parseRoute().pid

    const workers = Store.get().workers.filter(
      (w) => w.project_id === projectId
    )

    const selectedIds = Array.from(
      document.querySelectorAll('input[name="bulk-advance-worker"]:checked')
    ).map((cb) => cb.value)

    if (!selectedIds.length) {
      return UI.toast('اختر عاملًا واحدًا على الأقل', 'err')
    }

    const amount = Calc.toNum(UI.val('bulk-advance-amount'))

    if (!Number.isFinite(amount) || amount <= 0) {
      return UI.toast('أدخل مبلغ سلفة صحيحًا أكبر من صفر', 'err')
    }

    const selectedWorkers = workers.filter(
      (w) => selectedIds.includes(w.id)
    )

    const date = UI.val('bulk-advance-date')

    if (!date) {
      return UI.toast('اختر تاريخ السلفة', 'err')
    }

    const entries = Store.get().entries

    const updates = []
    const inserts = []

    selectedWorkers.forEach((worker) => {
      // البحث عن سجل العامل في تاريخ اليوم
      const existing = entries.find(
        (e) => e.worker_id === worker.id && e.date === date
      )

      if (existing) {
        // إضافة السلفة إلى الموجودة مع الحفاظ على بقية البيانات
        updates.push({
          id: existing.id,
          advance: Calc.toNum(existing.advance) + amount,
        })
      } else {
        // إنشاء سجل جديد للسلفة فقط
        inserts.push({
          worker_id: worker.id,
          date,
          daily_wage: 0,
          food: 0,
          smoke: 0,
          advance: amount,
          notes: null,
        })
      }
    })

    const total = amount * selectedWorkers.length

    const message =
      `مبلغ السلفة لكل عامل: ${Calc.fmt(amount)} ₪\n` +
      `عدد العمال: ${selectedWorkers.length}\n` +
      `إجمالي السلف: ${Calc.fmt(total)} ₪\n\n` +
      `سيتم تحديث ${updates.length} سجل موجود وإنشاء ${inserts.length} سجل جديد.\n\n` +
      `هل تريد المتابعة؟`

    if (!window.confirm(message)) return

    UI.busy(el, async () => {
      try {
        // تحديث سجلات اليوم الموجودة دون المساس ببقية الحقول
        for (const item of updates) {
          await Store.updateEntry(item.id, {
            advance: item.advance,
          })
        }

        // إنشاء سجلات جديدة للعمال الذين لا يملكون سجلًا اليوم
        if (inserts.length) {
          await Store.addEntries(inserts)
        }

        UI.closeModal()

        UI.toast(
          `تم تسجيل السلفة لـ ${selectedWorkers.length} عامل بنجاح`
        )
      } catch (e) {
        UI.toast(
          e.message || 'تعذّر حفظ السلف الجماعية. تحقق من السجلات قبل إعادة المحاولة.',
          'err'
        )
      }
    })
  }

  // ---------- حذف المشروع ----------

  Actions.deleteProject = async (el) => {
    const p = Store.get().projects.find((x) => x.id === el.dataset.id)

    if (!p || !window.confirm(
      `حذف المشروع «${p.name}» مع كل عماله وفواتيره وسجلاته؟\nلا يمكن التراجع.`
    )) return

    try {
      await Store.deleteProject(p.id)
      UI.toast('تم حذف المشروع')
      App.go('#/')
    } catch (e) {
      UI.toast(e.message || 'تعذّر الحذف', 'err')
    }
  }

  // ---------- طباعة تقرير حسابات المشروع ----------

  Actions.printProjectReport = (el) => {
    const data = Store.get()

    const project = data.projects.find(
      (p) => p.id === el.dataset.id
    )

    if (!project) {
      return UI.toast('لم يتم العثور على المشروع', 'err')
    }

    if (typeof window.printProjectReport !== 'function') {
      return UI.toast('ملف تقرير المشروع غير محمّل', 'err')
    }

    const workers = data.workers.filter(
      (w) => w.project_id === project.id
    )

    const workerIds = new Set(workers.map((w) => w.id))

    const entries = data.entries.filter(
      (e) => workerIds.has(e.worker_id)
    )

    const payments = data.payments.filter(
      (p) => p.project_id === project.id
    )

    window.printProjectReport(project, workers, entries, payments)
  }

  // ---------- مشاركة حسابات المشروع عبر واتساب ----------

  Actions.shareProjectWhatsApp = (el) => {
    const data = Store.get()

    const project = data.projects.find(
      (p) => p.id === el.dataset.id
    )

    if (!project) {
      return UI.toast('لم يتم العثور على المشروع', 'err')
    }

    const workers = data.workers.filter(
      (w) => w.project_id === project.id
    )

    const workerIds = new Set(workers.map((w) => w.id))

    const entries = data.entries.filter(
      (e) => workerIds.has(e.worker_id)
    )

    const payments = (data.payments || []).filter(
      (p) => p.project_id === project.id
    )

    const sum = (list, key) =>
      list.reduce(
        (total, item) => total + Calc.toNum(item[key]),
        0
      )

    let totalWage = 0
    let totalFood = 0
    let totalSmoke = 0
    let totalAdvance = 0
    let totalNet = 0

    const workerDetails = workers.map((worker, index) => {
      const records = entries.filter(
        (e) => e.worker_id === worker.id
      )

      const wage = sum(records, 'daily_wage')
      const food = sum(records, 'food')
      const smoke = sum(records, 'smoke')
      const advance = sum(records, 'advance')
      const net = wage - food - smoke - advance

      totalWage += wage
      totalFood += food
      totalSmoke += smoke
      totalAdvance += advance
      totalNet += net

      return (
        `${index + 1}. ${worker.name}\n` +
        `   أيام العمل: ${records.length}\n` +
        `   اليومية: ${Calc.fmt(wage)} ₪\n` +
        `   الأكل: ${Calc.fmt(food)} ₪\n` +
        `   الدخان: ${Calc.fmt(smoke)} ₪\n` +
        `   السلف: ${Calc.fmt(advance)} ₪\n` +
        `   الصافي: ${Calc.fmt(net)} ₪`
      )
    })

    const totalPayments = sum(payments, 'amount')

    const message = [
      '📊 تقرير حسابات المشروع',
      '━━━━━━━━━━━━━━',
      `🏗️ المشروع: ${project.name}`,
      project.location ? `📍 الموقع: ${project.location}` : '',
      `📅 تاريخ التقرير: ${Calc.showDate(Calc.todayStr())}`,
      '',
      '👷 حسابات العمال',
      '━━━━━━━━━━━━━━',
      `عدد العمال: ${workers.length}`,
      '',
      workerDetails.length
        ? workerDetails.join('\n\n')
        : 'لا يوجد عمال مسجلون',
      '',
      '📋 الإجماليات',
      '━━━━━━━━━━━━━━',
      `إجمالي اليوميات: ${Calc.fmt(totalWage)} ₪`,
      `إجمالي الأكل: ${Calc.fmt(totalFood)} ₪`,
      `إجمالي الدخان: ${Calc.fmt(totalSmoke)} ₪`,
      `إجمالي السلف: ${Calc.fmt(totalAdvance)} ₪`,
      `صافي مستحقات العمال: ${Calc.fmt(totalNet)} ₪`,
      '',
      '💰 استلامات الشركة',
      '━━━━━━━━━━━━━━',
      `عدد الاستلامات: ${payments.length}`,
      `إجمالي الاستلامات: ${Calc.fmt(totalPayments)} ₪`,
      '',
      '━━━━━━━━━━━━━━',
      'تم إنشاء التقرير بواسطة نظام المقاول أبو علي'
    ].filter(Boolean).join('\n')

    const url =
      'https://wa.me/?text=' + encodeURIComponent(message)

    window.open(url, '_blank')
  }
})()
