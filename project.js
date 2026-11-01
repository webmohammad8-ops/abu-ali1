
// صفحة المشروع: العمال / الفواتير / الدفعات + اليوميات والسلف الجماعية
;(() => {
  const { esc, btn, empty, layout, field, inputCls } = UI

  const TABS = [
    { id: 'workers', label: '👷 العمال' },
    { id: 'invoices', label: '🧾 الفواتير' },
    { id: 'pay', label: '💵 الدفعات' },
  ]

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
      `<button data-a="setTab" data-id="${t.id}" class="min-h-[46px] rounded-xl text-sm font-extrabold transition ${tab === t.id ? 'bg-white text-brand shadow' : 'text-gray-600'}">${t.label}</button>`
    ).join('')

    const content =
      tab === 'workers'
        ? WorkersTab.render(project)
        : tab === 'invoices'
          ? InvoicesTab.render(project)
          : GroupPayTab.render(project)

    const bulkButton = `
      <button
        data-a="openBulkEntry"
        class="mb-3 min-h-[48px] w-full rounded-xl bg-brand px-4 font-bold text-white active:opacity-80">
        📅 إضافة يوم عمل جماعي
      </button>
    `

    const bulkAdvanceButton = `
      <button
        data-a="openBulkAdvance"
        class="mb-3 min-h-[48px] w-full rounded-xl bg-green-700 px-4 font-bold text-white active:opacity-80">
        💰 إضافة سلفة جماعية
      </button>
    `

    const reportButton = `
      <button
        data-a="printProjectReport"
        data-id="${esc(project.id)}"
        class="mb-3 min-h-[46px] w-full rounded-xl bg-gray-800 px-4 font-bold text-white active:bg-gray-700">
        🖨️ تقرير المشروع PDF
      </button>
    `

    return layout({
      title: project.name,
      subtitle: project.location ? '📍 ' + project.location : '',
      back: '#/',
      actions: `<button data-a="deleteProject" data-id="${esc(project.id)}" aria-label="حذف المشروع" class="h-10 w-10 shrink-0 rounded-full bg-white/15 active:bg-white/25">🗑</button>`,
      body: `
        <div class="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-gray-200 p-1">
          ${tabs}
        </div>
        ${bulkButton}
        ${bulkAdvanceButton}
        ${reportButton}
        ${content}
      `,
    })
  }

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
      <label class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
        <input
          type="checkbox"
          name="bulk-worker"
          value="${esc(w.id)}"
          checked
          class="h-5 w-5 accent-current">

        <span class="min-w-0 flex-1">
          <span class="block font-bold">${esc(w.name)}</span>
          <span class="text-xs text-gray-500">${esc(w.group_type || '')}</span>
        </span>

        <span class="text-sm font-bold text-gray-600">
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
      <div class="mb-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
        اختر العمال الذين تريد تسجيل يوم العمل لهم.
        اليومية ستؤخذ تلقائيًا من بيانات كل عامل.
      </div>

      <div class="mb-3">
        <div class="mb-2 text-sm font-bold">نوع التسجيل</div>

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

            <span class="block cursor-pointer rounded-xl border p-3 text-center font-bold peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
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

            <span class="block cursor-pointer rounded-xl border p-3 text-center font-bold peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
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

      <div class="mb-2 mt-4 flex items-center justify-between gap-2">
        <span class="font-extrabold">العمال</span>

        <label class="flex cursor-pointer items-center gap-2 text-sm font-bold">
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

      <p class="mb-3 text-xs text-gray-500">
        الأكل والدخان والسلفة ستكون صفرًا تلقائيًا.
        ويمكنك تعديلها لاحقًا من ملف العامل.
      </p>

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
      <label class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
        <input
          type="checkbox"
          name="bulk-advance-worker"
          value="${esc(w.id)}"
          checked
          class="h-5 w-5 accent-current">

        <span class="min-w-0 flex-1">
          <span class="block font-bold">${esc(w.name)}</span>
          <span class="text-xs text-gray-500">${esc(w.group_type || '')}</span>
        </span>
      </label>
    `).join('')

    UI.openModal('💰 إضافة سلفة جماعية', `
      <div class="mb-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">
        أدخل مبلغ السلفة لكل عامل. يمكنك استثناء أي عامل من القائمة.
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

      <div class="mb-3 rounded-xl bg-gray-50 p-3 text-sm">
        <div class="font-bold">تاريخ السلفة</div>
        <div class="mt-1 text-gray-600">${Calc.todayStr()}</div>
      </div>

      <div class="mb-2 mt-4 flex items-center justify-between gap-2">
        <span class="font-extrabold">اختر العمال</span>

        <label class="flex cursor-pointer items-center gap-2 text-sm font-bold">
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

      <p class="mb-3 text-xs text-gray-500">
        ستُضاف السلفة إلى سلفة العامل الموجودة في سجل اليوم إن وُجدت،
        دون تغيير اليومية أو الأكل أو الدخان.
      </p>

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

    const date = Calc.todayStr()
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

    window.printProjectReport(project, workers, entries)
  }
})()
