
// تاب العمال - تصميم احترافي متناسق مع النظام
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

    // فلاتر المهن
    const chips = allGroups.map((g) => `
      <button
        data-a="workerFilter"
        data-id="${esc(g)}"
        class="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition active:scale-[0.97] ${
          S.filter === g
            ? 'border-[#315ee8] bg-[#315ee8] text-white shadow-md shadow-blue-900/10'
            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
        }">
        ${esc(g)}
        <span class="rounded-lg px-2 py-0.5 text-xs ${
          S.filter === g
            ? 'bg-white/20 text-white'
            : 'bg-slate-100 text-slate-500'
        }">${count(g)}</span>
      </button>
    `).join('')

    let cards

    if (!list.length) {
      cards = `
        <div class="overflow-hidden rounded-3xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50 to-white px-5 py-10 text-center">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm ring-1 ring-blue-100">
            👷
          </div>

          <h3 class="mt-5 text-lg font-extrabold text-[#101c35]">
            لا يوجد عمال في هذا المشروع
          </h3>

          <p class="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
            أضف العمال لتبدأ بمتابعة اليوميات والسلف والحسابات الخاصة بهم.
          </p>

          <button
            data-a="addWorker"
            class="mt-5 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#315ee8] px-6 text-sm font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-700 active:scale-[0.97]">
            <span class="text-xl">＋</span>
            إضافة أول عامل
          </button>
        </div>
      `
    } else if (!shown.length) {
      cards = `
        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-9 text-center shadow-sm">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
            🔎
          </div>

          <h3 class="mt-3 font-extrabold text-[#101c35]">
            لا يوجد عمال في مجموعة «${esc(S.filter)}»
          </h3>

          <p class="mt-1 text-xs text-slate-400">
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
          <article class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md">

            <!-- رأس بطاقة العامل -->
            <div class="p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 flex-1 items-center gap-3">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-2xl ring-1 ring-blue-100">
                    👷
                  </div>

                  <div class="min-w-0 flex-1">
                    <h3 class="truncate text-base font-extrabold text-[#101c35]">
                      ${esc(w.name)}
                    </h3>

                    <div class="mt-1.5 flex flex-wrap items-center gap-2">
                      <span class="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                        ${esc(w.group_type || 'بدون مهنة')}
                      </span>

                      <span class="text-xs font-medium text-slate-400">
                        🏠 ${esc(w.sukneh_number || 'بدون رقم سكنة')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  data-a="editWorker"
                  data-id="${esc(w.id)}"
                  aria-label="تعديل العامل"
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95">
                  ✎
                </button>
              </div>

              <!-- بيانات اليومية -->
              <div class="mt-4 grid grid-cols-2 gap-2">
                <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div class="text-xs font-bold text-slate-500">
                    اليومية
                  </div>

                  <div class="mt-1.5 flex items-baseline gap-1">
                    <span class="text-xl font-extrabold tabular-nums text-[#101c35]">
                      ${fmt(effectiveRate)}
                    </span>
                    <span class="text-xs font-bold text-slate-500">₪</span>
                  </div>

                  <div class="mt-2">
                    ${
                      workerRate !== null
                        ? `<span class="inline-flex rounded-md bg-blue-100 px-2 py-1 text-[10px] font-extrabold text-blue-700">يومية خاصة</span>`
                        : `<span class="inline-flex rounded-md bg-slate-200 px-2 py-1 text-[10px] font-extrabold text-slate-600">يومية المجموعة</span>`
                    }
                  </div>
                </div>

                <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <div class="text-xs font-bold text-emerald-800/70">
                    إجمالي حساب العامل
                  </div>

                  <div class="mt-1.5 min-w-0">
                    ${balance(Calc.total(by[w.id] || []), true)}
                  </div>

                  <div class="mt-2 text-[10px] font-bold text-emerald-700">
                    الرصيد حسب السجلات
                  </div>
                </div>
              </div>
            </div>

            <!-- إجراءات العامل -->
            <div class="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 p-3">
              <button
                data-a="printWorkerStatement"
                data-id="${esc(w.id)}"
                class="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-sm font-extrabold text-[#263753] transition hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]">
                <span>🖨️</span>
                كشف PDF
              </button>

              <a
                href="#/p/${esc(project.id)}/w/${esc(w.id)}"
                class="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#101c35] px-2 text-sm font-extrabold text-white transition hover:bg-[#1b3157] active:scale-[0.98]">
                <span>📂</span>
                أرشيف العامل
                <span class="text-xs">←</span>
              </a>
            </div>
          </article>
        `
      }).join('<div class="h-3"></div>')
    }

    return `
      <!-- أزرار الإضافة -->
      <div class="grid grid-cols-2 gap-3">
        <button
          data-a="addWorker"
          class="flex min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-[#315ee8] px-2 text-sm font-extrabold text-white shadow-md shadow-blue-900/10 transition hover:bg-blue-700 active:scale-[0.98]">
          <span class="text-2xl">＋</span>
          إضافة عامل
        </button>

        <button
          data-a="addWorkerGroup"
          class="flex min-h-[60px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 text-sm font-extrabold text-[#263753] shadow-sm transition hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98]">
          <span class="text-2xl">👥</span>
          إضافة مجموعة
        </button>
      </div>

      <!-- ملخص عدد العمال -->
      <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between gap-3 p-4">
          <div>
            <div class="text-xs font-bold text-slate-500">
              إجمالي عمال المشروع
            </div>

            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-3xl font-extrabold tabular-nums text-[#101c35]">
                ${list.length}
              </span>
              <span class="text-sm font-bold text-slate-500">عامل</span>
            </div>
          </div>

          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl ring-1 ring-blue-100">
            👷
          </div>
        </div>

        <div class="h-1 bg-gradient-to-l from-[#315ee8] via-blue-400 to-blue-100"></div>
      </div>

      <!-- تصنيف العمال -->
      <div class="mt-5">
        <div class="mb-3 flex items-center justify-between gap-2">
          <div>
            <h3 class="text-sm font-extrabold text-[#101c35]">
              تصنيف العمال
            </h3>
            <p class="mt-1 text-xs text-slate-400">
              اختر المهنة لعرض عمالها
            </p>
          </div>

          <span class="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">
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
        <input
          type="radio"
          name="wk-group"
          value="${esc(item.value)}"
          class="peer sr-only"
          onchange="document.getElementById('wk-custom-wrap').classList.toggle('hidden', this.value !== '__other__')"
          ${selectedGroup === item.value ? 'checked' : ''}>

        <span class="flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition peer-checked:border-[#315ee8] peer-checked:bg-[#315ee8] peer-checked:text-white">
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
      <div class="mb-4 rounded-2xl bg-blue-50/70 p-3">
        <div class="flex items-center gap-2 text-sm font-extrabold text-[#263f75]">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white">👷</span>
          بيانات العامل
        </div>
        <p class="mt-1 text-xs leading-5 text-slate-500">
          أدخل المعلومات الأساسية للعامل واختر مهنته.
        </p>
      </div>

      ${field(
        'اسم العامل *',
        `<input
          id="wk-name"
          class="${inputCls}"
          autocomplete="off"
          placeholder="اكتب اسم العامل"
          value="${esc(w.name || '')}">`
      )}

      ${field(
        'رقم السكنة',
        `<input
          id="wk-suk"
          class="${inputCls}"
          inputmode="numeric"
          autocomplete="off"
          placeholder="رقم السكنة"
          value="${esc(w.sukneh_number || '')}">`
      )}

      <div class="mb-4">
        <span class="mb-2 block text-sm font-extrabold text-[#263753]">
          المجموعة / المهنة
        </span>

        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          ${radios}
        </div>
      </div>

      <div
        id="wk-custom-wrap"
        class="${isCustom ? '' : 'hidden'} mb-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
        ${field(
          'اكتب مهنة العامل *',
          `<input
            id="wk-custom-job"
            class="${inputCls}"
            autocomplete="off"
            placeholder="مثال: كهربجي، سبّاك، نجّار..."
            value="${esc(isCustom ? w.group_type : '')}">`
        )}
      </div>

      <div class="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div class="mb-2 flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg">💰</span>
          <div>
            <div class="text-sm font-extrabold text-[#263753]">
              إعداد اليومية
            </div>
            <div class="text-xs text-slate-400">
              يمكنك اعتماد يومية المجموعة أو تحديد يومية خاصة
            </div>
          </div>
        </div>

        ${field(
          'اليومية الخاصة للعامل (₪) - اختياري',
          `<input
            id="wk-wage"
            class="${inputCls}"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            placeholder="اتركه فارغًا لاستخدام يومية المجموعة"
            value="${esc(privateRate)}">`
        )}

        <div class="mt-2 rounded-xl bg-white px-3 py-2 text-xs leading-5 text-slate-500">
          ${
            isCustom
              ? 'هذه مهنة مخصصة، يرجى تحديد اليومية الخاصة بها.'
              : `يومية المجموعة الحالية: <strong class="text-[#315ee8]">${fmt(groupRate)} ₪</strong>. إذا تركت الحقل فارغًا سيعتمد العامل عليها تلقائيًا.`
          }
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        ${btn('حفظ البيانات', {
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
        <input
          type="radio"
          name="wkg-group"
          value="${esc(item.value)}"
          class="peer sr-only"
          onchange="document.getElementById('wkg-custom-wrap').classList.toggle('hidden', this.value !== '__other__')"
          ${item.value === 'عامل' ? 'checked' : ''}>

        <span class="flex min-h-[46px] cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition peer-checked:border-[#315ee8] peer-checked:bg-[#315ee8] peer-checked:text-white">
          ${esc(item.label)}
        </span>
      </label>
    `).join('')

    return `
      <div class="mb-4 rounded-2xl bg-blue-50/70 p-3">
        <div class="flex items-center gap-2 text-sm font-extrabold text-[#263f75]">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white">👥</span>
          إضافة عدة عمال دفعة واحدة
        </div>
        <p class="mt-1 text-xs leading-5 text-slate-500">
          اكتب اسم كل عامل في سطر منفصل، وسيتم إنشاء حساب مستقل لكل واحد.
        </p>
      </div>

      ${field(
        'أسماء العمال (كل اسم في سطر)',
        `<textarea
          id="wkg-names"
          class="${inputCls}"
          rows="6"
          placeholder="محمد أحمد&#10;أحمد محمود&#10;خالد علي"></textarea>`
      )}

      <div class="mb-4">
        <span class="mb-2 block text-sm font-extrabold text-[#263753]">
          المهنة
        </span>
        <div class="grid grid-cols-2 gap-2">
          ${radios}
        </div>
      </div>

      <div id="wkg-custom-wrap" class="hidden mb-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
        ${field(
          'اسم المهنة',
          `<input
            id="wkg-custom-job"
            class="${inputCls}"
            placeholder="مثال: كهربجي أو سباك">`
        )}
      </div>

      ${field(
        'اليومية الموحدة لجميع العمال (₪)',
        `<input
          id="wkg-wage"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          class="${inputCls}"
          placeholder="مثال: 100">`
      )}

      <div class="mb-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        سيتم إضافة جميع العمال بنفس المهنة واليومية المحددة.
      </div>

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
