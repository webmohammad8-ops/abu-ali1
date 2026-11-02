
// أدوات الواجهة: قوالب HTML + نوافذ + إشعارات
const Views = {}
const Actions = {}

const UI = (() => {
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]))

  // حقول الإدخال
  const inputCls =
    'w-full min-h-[48px] rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-800 outline-none transition duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-brand focus:ring-4 focus:ring-blue-100'

  // ألوان الأزرار
  const VARIANTS = {
    primary:
      'bg-brand text-white shadow-sm hover:bg-brand-dark hover:shadow-md active:scale-[0.98] disabled:bg-blue-300',

    secondary:
      'border border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100 active:scale-[0.98] disabled:text-gray-400',

    danger:
      'border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 active:scale-[0.98]',

  }

  // زر
  function btn(label, o = {}) {
    const size =
      o.size === 'lg'
        ? 'min-h-[56px] text-lg px-5'
        : o.size === 'sm'
          ? 'min-h-[40px] text-sm px-3'
          : 'min-h-[48px] text-base px-4'

    return `<button
      type="button"
      ${o.a ? `data-a="${o.a}"` : ''}
      ${o.id != null ? `data-id="${esc(o.id)}"` : ''}
      ${o.attrs || ''}
      ${o.disabled ? 'disabled' : ''}
      class="inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed ${size} ${VARIANTS[o.v || 'primary']} ${o.cls || ''}">
      ${label}
    </button>`
  }

  // عنوان الحقل ومحتواه
  const field = (label, inner, hint) =>
    `<label class="mb-4 block">
      <span class="mb-2 block text-sm font-bold text-gray-700">${label}</span>
      ${inner}
      ${
        hint
          ? `<span class="mt-2 block text-xs leading-5 text-gray-500">${hint}</span>`
          : ''
      }
    </label>`

  // البطاقات
  const card = (inner, cls = '') =>
    `<div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${cls}">
      ${inner}
    </div>`

  // مؤشر التحميل
  const spinner = (cls = '') =>
    `<span
      class="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-gray-200 border-t-brand ${cls}"
      role="status"
      aria-label="جارٍ التحميل">
    </span>`

  // شاشة التحميل
  const pageLoader = (text = 'جارٍ التحميل…') =>
    `<div class="flex flex-col items-center justify-center gap-4 py-24 text-gray-500">
      ${spinner('h-10 w-10')}
      <span class="text-sm font-bold">${text}</span>
    </div>`

  // حالة عدم وجود بيانات
  const empty = (o) =>
    `<div class="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-4xl">
        ${o.icon || '📭'}
      </div>
      <div class="font-extrabold text-gray-800">${o.title}</div>
      ${
        o.hint
          ? `<div class="mt-2 max-w-xs text-sm leading-6 text-gray-500">${o.hint}</div>`
          : ''
      }
      ${o.action ? `<div class="mt-5">${o.action}</div>` : ''}
    </div>`

  // رصيد العامل
  // أخضر = للعامل، أحمر = على العامل
  function balance(value, big) {
    const cls =
      value > 0
        ? 'text-green-700 bg-green-50 border border-green-100'
        : value < 0
          ? 'text-red-700 bg-red-50 border border-red-100'
          : 'text-gray-600 bg-gray-100 border border-gray-200'

    const n = Math.abs(value).toLocaleString('en-US', {
      maximumFractionDigits: 2
    })

    return `<span
      dir="ltr"
      class="inline-block whitespace-nowrap rounded-full px-3 py-1.5 font-extrabold ${big ? 'text-lg' : 'text-sm'} ${cls}">
      ${value < 0 ? '-' : ''}${n} ₪
    </span>`
  }

  // الهيكل العام للصفحة
  function layout({ title, subtitle = '', back = '', actions = '', body = '' }) {
    const live = Store.get().live

    return `<div class="mx-auto min-h-screen max-w-3xl bg-gray-50 pb-16">

      <header class="sticky top-0 z-30 border-b border-blue-700/20 bg-gradient-to-l from-blue-700 via-blue-600 to-brand px-4 pb-4 pt-4 text-white shadow-md">

        <div class="flex items-center gap-3">

          ${
            back
              ? `<button
                  data-a="nav"
                  data-id="${esc(back)}"
                  aria-label="رجوع"
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl transition hover:bg-white/20 active:scale-95">
                  →
                </button>`
              : ''
          }

          <div class="min-w-0 flex-1">

            <a href="#/" class="block truncate text-xl font-extrabold leading-tight tracking-tight">
              ${esc(title)}
            </a>

            ${
              subtitle
                ? `<div class="mt-1 truncate text-sm font-medium text-blue-100">${esc(subtitle)}</div>`
                : ''
            }

          </div>

          <span
            title="${live ? 'متصل — التحديث فوري' : 'غير متصل بالتحديث الفوري'}"
            class="h-3 w-3 shrink-0 rounded-full border-2 border-white/30 ${live ? 'bg-green-400' : 'bg-yellow-300 animate-pulse'}">
          </span>

          ${actions}

        </div>
      </header>

      <main class="px-4 pt-5">
        ${body}
      </main>

    </div>`
  }

  // ---------- النوافذ المنبثقة ----------
  const root = () => document.getElementById('modal-root')
  let prevOverflow = ''

  function closeModal() {
    if (!root().innerHTML) return

    root().innerHTML = ''
    document.body.style.overflow = prevOverflow
  }

  function openModal(title, bodyHtml, onMount) {
    closeModal()

    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    root().innerHTML = `
      <div
        id="modal-backdrop"
        class="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">

        <div
          class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-gray-100 bg-white p-5 pb-7 shadow-2xl sm:rounded-3xl"
          role="dialog"
          aria-modal="true">

          <div class="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">

            <h3 class="text-lg font-extrabold text-gray-900">
              ${title}
            </h3>

            <button
              data-a="modal-close"
              aria-label="إغلاق"
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 active:scale-95">
              ✕
            </button>

          </div>

          ${bodyHtml}

        </div>
      </div>`

    if (onMount) onMount(root())
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
  })

  // ---------- الإشعارات ----------
  let timer

  function toast(msg, type) {
    const r = document.getElementById('toast-root')

    r.innerHTML = `
      <div
        role="status"
        class="fixed bottom-6 left-1/2 z-[60] flex max-w-[90%] -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-4 text-center text-sm font-bold text-white shadow-xl ${
          type === 'err'
            ? 'bg-red-600'
            : 'bg-green-600'
        }">

        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
          ${type === 'err' ? '!' : '✓'}
        </span>

        <span>${esc(msg)}</span>

      </div>`

    clearTimeout(timer)

    timer = setTimeout(() => {
      r.innerHTML = ''
    }, 3200)
  }

  // أدوات مساعدة
  const $ = (id) => document.getElementById(id)

  const val = (id) => ($(id) ? $(id).value : '')

  // تعطيل الزر أثناء الحفظ
  async function busy(btnEl, fn) {
    const old = btnEl.textContent

    btnEl.disabled = true
    btnEl.textContent = 'جارٍ الحفظ…'

    try {
      return await fn()
    } finally {
      btnEl.disabled = false
      btnEl.textContent = old
    }
  }

  return {
    esc,
    inputCls,
    btn,
    field,
    card,
    spinner,
    pageLoader,
    empty,
    balance,
    layout,
    openModal,
    closeModal,
    toast,
    $,
    val,
    busy
  }
})()
