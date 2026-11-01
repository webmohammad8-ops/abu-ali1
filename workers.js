
// تاب العمال
const WorkersTab = (() => {
  const { esc, card, btn, field, inputCls, empty, balance } = UI
  const { GROUPS, toNum, fmt } = Calc

  const S = { pid: null, filter: 'الكل' }

  function render(project) {
    if (S.pid !== project.id) {
      S.pid = project.id
      S.filter = 'الكل'
    }

    const { workers, entries } = Store.get()

    const list = workers
      .filter((w) => w.project_id === project.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))

    const by = {}
    entries.forEach((e) => {
      (by[e.worker_id] = by[e.worker_id] || []).push(e)
    })

    // إضافة المهن الجديدة تلقائيًا إلى الفلاتر
    const customGroups = [...new Set(
      list
        .map((w) => w.group_type)
        .filter((g) => g && !GROUPS.includes(g))
    )]

    const allGroups = ['الكل', ...GROUPS, ...customGroups]

    const shown = S.filter === 'الكل'
      ? list
      : list.filter((w) => w.group_type === S.filter)

    const count = (g) =>
      g === 'الكل'
        ? list.length
        : list.filter((w) => w.group_type === g).length

    const chips = allGroups.map((g) =>
      `<button data-a="workerFilter" data-id="${esc(g)}"
        class="min-h-[42px] shrink-0 rounded-xl border px-4 text-sm font-bold transition ${
          S.filter === g
            ? 'border-brand bg-brand text-white shadow-sm'
            : 'border-gray-200 bg-white text-gray-600 active:bg-gray-100'
        }">${esc(g)} <span class="opacity-70">(${count(g)})</span></button>`
    ).join('')

    let cards

    if (!list.length) {
      cards = empty({
        icon: '👷',
        title: 'لا يوجد عمال في هذا المشروع',
        hint: 'اضغط «إضافة عامل» للبدء',
      })
    } else if (!shown.length) {
      cards = empty({
        icon: '🔎',
        title: `لا يوجد عمال في مجموعة «${esc(S.filter)}»`,
      })
    } else {
      cards = shown.map((w) => {
        const groupRate = Store.getRate(w.group_type)

        const workerRate =
          w.daily_wage === null ||
          w.daily_wage === undefined ||
          w.daily_wage === ''
            ? null
            : toNum(w.daily_wage)

        const effectiveRate =
          workerRate === null ? groupRate : workerRate

        return card(`
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="truncate text-lg font-extrabold text-gray-900">
                ${esc(w.name)}
              </div>

              <div class="mt-2 flex flex-wrap gap-2 text-xs">
                <span class="rounded-lg bg-gray-100 px-3 py-1.5 font-bold text-gray-600">
                  🏠 السكنة: ${esc(w.sukneh_number || '—')}
                </span>

                <span class="rounded-lg bg-brand-light px-3 py-1.5 font-bold text-brand">
                  👷 ${esc(w.group_type)}
                </span>
              </div>
            </div>

            <button data-a="editWorker" data-id="${esc(w.id)}"
              aria-label="تعديل العامل"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-700 active:bg-gray-200">
              ✎
            </button>
          </div>

          <div class="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3">
            <div>
              <div class="text-xs text-gray-500">اليومية</div>
              <div class="mt-1 text-base font-extrabold text-gray-900">
                ${fmt(effectiveRate)} ₪
              </div>
            </div>

            <div class="text-left">
              ${
                workerRate !== null
                  ? '<span class="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">يومية خاصة</span>'
                  : '<span class="rounded-lg bg-gray-200 px-2 py-1 text-xs font-bold text-gray-600">يومية المجموعة</span>'
              }
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between gap-2">
            <div>
              <div class="text-xs text-gray-500">إجمالي حسابه</div>
              <div class="mt-1">
                ${balance(Calc.total(by[w.id] || []), true)}
              </div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <button data-a="printWorkerStatement"
              data-id="${esc(w.id)}"
              class="flex min-h-[46px] items-center justify-center rounded-xl bg-gray-800 px-2 text-sm font-bold text-white active:bg-gray-700">
              🖨️ كشف PDF
            </button>

            <a href="#/p/${esc(project.id)}/w/${esc(w.id)}"
              class="flex min-h-[46px] items-center justify-center rounded-xl bg-brand px-2 text-sm font-bold text-white active:opacity-80">
              📂 أرشيفه ←
            </a>
          </div>
        `)
      }).join('<div class="h-3"></div>')
    }

    return `
      <div class="grid grid-cols-2 gap-2">
        ${btn('＋ إضافة عامل', {
          a: 'addWorker',
          size: 'lg',
          cls: 'min-h-[52px] w-full',
        })}

        ${btn('👥 إضافة مجموعة', {
          a: 'addWorkerGroup',
          size: 'lg',
          cls: 'min-h-[52px] w-full',
          v: 'secondary',
        })}
      </div>

      <div class="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2">
        ${chips}
      </div>

      <div class="mt-3">
        ${cards}
      </div>
    `
  }

  // نموذج إضافة وتعديل العامل
  function form(w) {
    const isCustom = !GROUPS.includes(w.group_type) && !!w.group_type

    const selectedGroup = isCustom
      ? '__other__'
      : (w.group_type || 'عامل')

    const radios = [
      ...GROUPS.map((g) => ({ value: g, label: g })),
      { value: '__other__', label: 'أخرى' }
    ].map((item) => `
      <label class="block">
        <input type="radio"
          name="wk-group"
          value="${esc(item.value)}"
          class="peer sr-only"
          onchange="document.getElementById('wk-custom-wrap').classList.toggle('hidden', this.value !== '__other__')"
          ${selectedGroup === item.value ? 'checked' : ''}>

        <span class="flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-bold peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
          ${esc(item.label)}
        </span>
      </label>
    `).join('')

    const groupRate = isCustom
      ? 0
      : Store.getRate(w.group_type || 'عامل')

    const privateRate =
      w.daily_wage === null ||
      w.daily_wage === undefined
        ? ''
        : w.daily_wage

    return `
      ${field(
        'الاسم *',
        `<input id="wk-name" class="${inputCls}"
          autocomplete="off"
          value="${esc(w.name || '')}">`
      )}

      ${field(
        'رقم السكنة',
        `<input id="wk-suk" class="${inputCls}"
          inputmode="numeric"
          autocomplete="off"
          value="${esc(w.sukneh_number || '')}">`
      )}

      <div class="mb-3">
        <span class="mb-1 block text-sm font-bold text-gray-700">
          المجموعة / المهنة
        </span>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          ${radios}
        </div>
      </div>

      <div id="wk-custom-wrap" class="${isCustom ? '' : 'hidden'} mb-3">
        ${field(
          'اكتب مهنة العامل *',
          `<input id="wk-custom-job"
            class="${inputCls}"
            autocomplete="off"
            placeholder="مثال: كهربجي، سبّاك، نجّار..."
            value="${esc(isCustom ? w.group_type : '')}">`
        )}
      </div>

      ${field(
        'اليومية الخاصة للعامل (₪) - اختياري',
        `<input id="wk-wage"
          class="${inputCls}"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          placeholder="اكتب اليومية الخاصة بالعامل"
          value="${esc(privateRate)}">`
      )}

      <p class="mb-3 -mt-2 text-xs text-gray-500">
        ${
          isCustom
            ? 'هذه مهنة مخصصة، يرجى تحديد اليومية الخاصة بها.'
            : `يومية المجموعة الحالية: ${fmt(groupRate)} ₪. إذا تركت الحقل فارغًا سيعتمد العامل عليها تلقائيًا.`
        }
      </p>

      <div class="mt-2 flex gap-2">
        ${btn('حفظ', {
          a: 'saveWorker',
          id: w.id || '',
          cls: 'flex-1',
        })}

        ${btn('إلغاء', {
          a: 'modal-close',
          v: 'secondary',
          cls: 'flex-1',
        })}
      </div>

      ${
        w.id
          ? btn('🗑 حذف العامل', {
              a: 'deleteWorker',
              id: w.id,
              v: 'danger',
              cls: 'mt-2 w-full',
            })
          : ''
      }
    `
  }

  // نموذج إضافة مجموعة عمال
  function groupForm() {
    const radios = [
      ...GROUPS.map((g) => ({ value: g, label: g })),
      { value: '__other__', label: 'أخرى' }
    ].map((item) => `
      <label class="block">
        <input type="radio"
          name="wkg-group"
          value="${esc(item.value)}"
          class="peer sr-only"
          onchange="document.getElementById('wkg-custom-wrap').classList.toggle('hidden', this.value !== '__other__')"
          ${item.value === 'عامل' ? 'checked' : ''}>

        <span class="flex min-h-[46px] cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-bold peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white">
          ${esc(item.label)}
        </span>
      </label>
    `).join('')

    return `
      ${field(
        'أسماء العمال (كل اسم في سطر)',
        `<textarea id="wkg-names"
          class="${inputCls}"
          rows="6"
          placeholder="محمد أحمد&#10;أحمد محمود&#10;خالد علي"></textarea>`
      )}

      <div class="mb-3">
        <span class="mb-2 block text-sm font-bold text-gray-700">المهنة</span>
        <div class="grid grid-cols-2 gap-2">${radios}</div>
      </div>

      <div id="wkg-custom-wrap" class="hidden mb-3">
        ${field(
          'اسم المهنة',
          `<input id="wkg-custom-job"
            class="${inputCls}"
            placeholder="مثال: كهربجي أو سباك">`
        )}
      </div>

      ${field(
        'اليومية الموحدة لجميع العمال (₪)',
        `<input id="wkg-wage"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          class="${inputCls}"
          placeholder="مثال: 100">`
      )}

      <p class="mb-3 text-xs text-gray-500">
        سيتم إضافة جميع العمال بنفس المهنة واليومية المحددة.
      </p>

      <div class="flex gap-2">
        ${btn('حفظ مجموعة العمال', {
          a: 'saveWorkerGroup',
          cls: 'flex-1',
        })}

        ${btn('إلغاء', {
          a: 'modal-close',
          v: 'secondary',
          cls: 'flex-1',
        })}
      </div>
    `
  }

  // فتح نموذج المجموعة
  Actions.addWorkerGroup = () => {
    UI.openModal(
      'إضافة مجموعة عمال',
      groupForm(),
      () => UI.$('wkg-names').focus()
    )
  }

  // حفظ جميع العمال دفعة واحدة
  Actions.saveWorkerGroup = (el) => {
    const names = UI.val('wkg-names')
      .split('\n')
      .map((name) => name.trim())
      .filter(Boolean)

    if (!names.length) {
      return UI.toast('اكتب أسماء العمال أولاً', 'err')
    }

    const selected = document.querySelector(
      'input[name="wkg-group"]:checked'
    )

    if (!selected) {
      return UI.toast('اختر المهنة', 'err')
    }

    const isCustom = selected.value === '__other__'

    const customJob = isCustom
      ? UI.val('wkg-custom-job').trim()
      : ''

    if (isCustom && !customJob) {
      return UI.toast('اكتب اسم المهنة', 'err')
    }

    const wage = UI.val('wkg-wage').trim()

    if (wage === '' || !Number.isFinite(Number(wage)) || Number(wage) < 0) {
      return UI.toast('اكتب اليومية الموحدة بشكل صحيح', 'err')
    }

    const groupType = isCustom ? customJob : selected.value

    const rows = names.map((name) => ({
      name,
      sukneh_number: null,
      group_type: groupType,
      daily_wage: toNum(wage),
      project_id: App.parseRoute().pid,
    }))

    if (!window.confirm(
      `سيتم إضافة ${rows.length} عامل بمهنة «${groupType}» ويومية ${fmt(toNum(wage))} ₪ لكل عامل.\nهل تريد المتابعة؟`
    )) return

    UI.busy(el, async () => {
      try {
        await Store.addWorkers(rows)

        UI.closeModal()
        UI.toast(`تمت إضافة ${rows.length} عامل بنجاح ✓`)
      } catch (e) {
        UI.toast(e.message || 'تعذرت إضافة مجموعة العمال', 'err')
      }
    })
  }

  // تصفية العمال حسب المجموعة
  Actions.workerFilter = (el) => {
    S.filter = el.dataset.id
    App.render(true)
  }

  // إضافة عامل
  Actions.addWorker = () =>
    UI.openModal(
      'عامل جديد',
      form({
        name: '',
        sukneh_number: '',
        group_type: 'عامل',
        daily_wage: null,
      }),
      () => UI.$('wk-name').focus()
    )

  // تعديل عامل
  Actions.editWorker = (el) => {
    const w = Store.get().workers.find(
      (x) => x.id === el.dataset.id
    )

    if (w) UI.openModal('تعديل عامل', form(w))
  }

  // حفظ العامل
  Actions.saveWorker = (el) => {
    const name = UI.val('wk-name').trim()

    if (!name) {
      return UI.toast('اكتب اسم العامل', 'err')
    }

    const g = document.querySelector(
      'input[name="wk-group"]:checked'
    )

    const isCustom = g && g.value === '__other__'

    const customJob = isCustom
      ? UI.val('wk-custom-job').trim()
      : ''

    if (isCustom && !customJob) {
      return UI.toast('اكتب مهنة العامل', 'err')
    }

    const wageValue = UI.val('wk-wage').trim()

    if (
      wageValue !== '' &&
      (!Number.isFinite(Number(wageValue)) ||
        Number(wageValue) < 0)
    ) {
      return UI.toast(
        'اكتب يومية صحيحة أو اترك الحقل فارغًا',
        'err'
      )
    }

    // المهنة المخصصة تحتاج إلى يومية خاصة
    if (isCustom && wageValue === '') {
      return UI.toast(
        'حدد اليومية الخاصة للعامل صاحب المهنة الأخرى',
        'err'
      )
    }

    const row = {
      name,
      sukneh_number: UI.val('wk-suk').trim() || null,
      group_type: isCustom
        ? customJob
        : (g ? g.value : 'عامل'),
      daily_wage: wageValue === '' ? null : toNum(wageValue),
    }

    const id = el.dataset.id

    UI.busy(el, async () => {
      try {
        if (id) {
          await Store.updateWorker(id, row)
        } else {
          await Store.addWorker({
            ...row,
            project_id: App.parseRoute().pid,
          })
        }

        UI.closeModal()
        UI.toast(id ? 'تم التعديل' : 'تمت إضافة العامل')
      } catch (e) {
        UI.toast(e.message || 'تعذّر الحفظ', 'err')
      }
    })
  }

  // حذف العامل
  Actions.deleteWorker = async (el) => {
    const w = Store.get().workers.find(
      (x) => x.id === el.dataset.id
    )

    if (
      !w ||
      !window.confirm(`حذف العامل «${w.name}» وكل سجلاته؟`)
    ) return

    try {
      await Store.deleteWorker(w.id)
      UI.closeModal()
      UI.toast('تم الحذف')
    } catch (e) {
      UI.toast(e.message || 'تعذّر الحذف', 'err')
    }
  }

  // طباعة كشف حساب العامل PDF
  Actions.printWorkerStatement = (el) => {
    const data = Store.get()

    const worker = data.workers.find(
      (w) => w.id === el.dataset.id
    )

    if (!worker) {
      return UI.toast('لم يتم العثور على العامل', 'err')
    }

    if (typeof window.printInvoice !== 'function') {
      return UI.toast('ملف الطباعة غير محمّل', 'err')
    }

    const workerEntries = data.entries.filter(
      (e) => e.worker_id === worker.id
    )

    window.printInvoice({
      name: worker.name,
      sakneh: worker.sukneh_number,
      job: worker.group_type
    }, workerEntries)
  }

  return { render }
})()
