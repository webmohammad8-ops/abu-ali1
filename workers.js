
// تاب العمال - تصميم حديث
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

    const chips = allGroups.map((g) => `
      <button data-a="workerFilter" data-id="${esc(g)}"
        class="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition active:scale-[0.97] ${
          S.filter === g
            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100'
            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200'
        }">
        ${esc(g)}
        <span class="rounded-lg px-2 py-0.5 text-xs ${
          S.filter === g
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 text-gray-500'
        }">${count(g)}</span>
      </button>
    `).join('')

    let cards

    if (!list.length) {
      cards = `
        <div class="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-10 text-center">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm">
            👷
          </div>

          <h3 class="mt-5 text-lg font-extrabold text-gray-900">
            لا يوجد عمال في هذا المشروع
          </h3>

          <p class="mt-2 text-sm text-gray-500">
            ابدأ بإضافة العمال لإدارة يومياتهم وحساباتهم
          </p>

          <button data-a="addWorker"
            class="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white shadow-md shadow-blue-100 transition active:scale-[0.97]">
            <span class="text-xl">＋</span>
            إضافة أول عامل
          </button>
        </div>
      `
    } else if (!shown.length) {
      cards = `
        <div class="rounded-2xl border border-gray-100 bg-white px-4 py-8 text-center shadow-sm">
          <div class="text-3xl">🔎</div>
          <h3 class="mt-3 font-extrabold text-gray-800">
            لا يوجد عمال في مجموعة «${esc(S.filter)}»
          </h3>
          <p class="mt-1 text-xs text-gray-400">
            جرّب اختيار مجموعة أخرى
          </p>
        </div>
      `
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

        return `
          <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">

            <!-- اسم العامل والمهنة -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  👷
                </div>

                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-base font-extrabold text-gray-900">
                    ${esc(w.name)}
                  </h3>

                  <div class="mt-1 flex flex-wrap items-center gap-2">
                    <span class="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      ${esc(w.group_type)}
                    </span>

                    <span class="text-xs text-gray-400">
                      🏠 ${esc(w.sukneh_number || 'بدون رقم سكنة')}
                    </span>
                  </div>
                </div>
              </div>

              <button data-a="editWorker" data-id="${esc(w.id)}"
                aria-label="تعديل العامل"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 active:scale-95">
                ✎
              </button>
            </div>

            <!-- اليومية -->
            <div class="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-3">
              <div>
                <div class="text-xs font-medium text-gray-500">
                  اليومية
                </div>

                <div class="mt-1 text-lg font-extrabold text-gray-900">
                  ${fmt(effectiveRate)} ₪
                </div>
              </div>

              ${
                workerRate !== null
                  ? `<span class="rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-bold text-blue-700">يومية خاصة</span>`
                  : `<span class="rounded-lg bg-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-600">يومية المجموعة</span>`
              }
            </div>

            <!-- الرصيد -->
            <div class="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
              <div>
                <div class="text-xs font-bold text-gray-500">
                  إجمالي حساب العامل
                </div>
                <div class="mt-1">
                  ${balance(Calc.total(by[w.id] || []), true)}
                </div>
              </div>

              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg">
                💰
              </div>
            </div>

            <!-- الإجراءات -->
            <div class="mt-3 grid grid-cols-2 gap-2">
              <button data-a="printWorkerStatement"
                data-id="${esc(w.id)}"
                class="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gray-800 px-2 text-sm font-extrabold text-white transition hover:bg-gray-700 active:scale-[0.98]">
                🖨️ كشف PDF
              </button>

              <a href="#/p/${esc(project.id)}/w/${esc(w.id)}"
                class="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-2 text-sm font-extrabold text-white transition hover:bg-blue-700 active:scale-[0.98]">
                📂 أرشيفه ←
              </a>
            </div>
          </div>
        `
      }).join('<div class="h-3"></div>')
    }

    return `
      <!-- أزرار الإضافة -->
      <div class="grid grid-cols-2 gap-3">

        <button data-a="addWorker"
          class="flex min-h-[62px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-2 text-sm font-extrabold text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 active:scale-[0.98]">
          <span class="text-2xl">＋</span>
          إضافة عامل
        </button>

        <button data-a="addWorkerGroup"
          class="flex min-h-[62px] items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 text-sm font-extrabold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]">
          <span class="text-2xl">👥</span>
          إضافة مجموعة
        </button>

      </div>

      <!-- ملخص عدد العمال -->
      <div class="mt-5 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div>
          <div class="text-xs font-medium text-gray-500">
            إجمالي عمال المشروع
          </div>
          <div class="mt-1 text-xl font-extrabold text-gray-900">
            ${list.length}
            <span class="text-sm font-bold text-gray-500">عامل</span>
          </div>
        </div>

        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          👷
        </div>
      </div>

      <!-- فلاتر المهن -->
      <div class="mt-5">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-extrabold text-gray-800">
            تصنيف العمال
          </h3>
          <span class="text-xs text-gray-400">
            ${shown.length} من ${list.length}
          </span>
        </div>

        <div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          ${chips}
        </div>
      </div>

      <!-- قائمة العمال -->
      <div class="mt-4">
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

        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
