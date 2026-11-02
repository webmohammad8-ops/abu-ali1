
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
    'w-full min-h-[50px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand focus:bg-white focus:ring-4 focus:ring-blue-100'

  // ألوان الأزرار
  const VARIANTS = {
    primary:
      'bg-brand text-white shadow-[0_5px_14px_rgba(49,94,232,0.20)] hover:bg-brand-dark hover:shadow-[0_8px_20px_rgba(49,94,232,0.25)] active:scale-[0.98] disabled:bg-blue-300 disabled:shadow-none',

    secondary:
      'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:text-slate-400',

    danger:
      'border border-red-100 bg-red-50 text-red-600 hover:border-red-200 hover:bg-red-100 active:scale-[0.98]',

  }

  // زر
  function btn(label, o = {}) {
    const size =
      o.size === 'lg'
        ? 'min-h-[56px] text-lg px-6'
        : o.size === 'sm'
          ? 'min-h-[40px] text-sm px-3'
          : 'min-h-[48px] text-base px-5'

    return `<button
      type="button"
      ${o.a ? `data-a="${o.a}"` : ''}
      ${o.id != null ? `data-id="${esc(o.id)}"` : ''}
      ${o.attrs || ''}
      ${o.disabled ? 'disabled' : ''}
      class="inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed ${size} ${VARIANTS[o.v || 'primary']} ${o.cls || ''}">
      ${label}
    </button>`
  }

  // عنوان الحقل ومحتواه
  const field = (label, inner, hint) =>
    `<label class="mb-5 block">
      <span class="mb-2 block text-sm font-extrabold text-slate-700">${label}</span>
      ${inner}
      ${
        hint
          ? `<span class="mt-2 block text-xs leading-6 text-slate-500">${hint}</span>`
          : ''
      }
    </label>`

  // البطاقات
  const card = (inner, cls = '') =>
    `<div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(16,28,53,0.035)] transition-all duration-200 hover:border-slate-300/90 hover:shadow-[0_8px_24px_rgba(16,28,53,0.065)] sm:rounded-3xl sm:p-5 ${cls}">
      ${inner}
    </div>`

  // مؤشر التحميل
  const spinner = (cls = '') =>
    `<span
      class="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand ${cls}"
      role="status"
      aria-label="جارٍ التحميل">
    </span>`

  // شاشة التحميل
  const pageLoader = (text = 'جارٍ التحميل…') =>
    `<div class="flex min-h-[55vh] flex-col items-center justify-center gap-5 text-slate-500">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
        ${spinner('h-9 w-9')}
      </div>
      <span class="text-sm font-extrabold">${text}</span>
      <span class="text-xs text-slate-400">يرجى الانتظار قليلًا</span>
    </div>`

  // حالة عدم وجود بيانات
  const empty = (o) =>
    `<div class="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
      <div class="mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-4xl">
        ${o.icon || '📭'}
      </div>
      <div class="font-extrabold text-slate-800 text-lg">${o.title}</div>
      ${
        o.hint
          ? `<div class="mt-2 max-w-xs text-sm leading-7 text-slate-500">${o.hint}</div>`
          : ''
      }
      ${o.action ? `<div class="mt-6">${o.action}</div>` : ''}
    </div>`

  // رصيد العامل
  // أخضر = للعامل، أحمر = على العامل
  function balance(value, big) {
    const cls =
      value > 0
        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
        : value < 0
          ? 'text-red-700 bg-red-50 border border-red-200'
          : 'text-slate-600 bg-slate-100 border border-slate-200'

    const n = Math.abs(value).toLocaleString('en-US', {
      maximumFractionDigits: 2
    })

    return `<span
      dir="ltr"
      class="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-2 font-extrabold ${big ? 'text-xl' : 'text-sm'} ${cls}">
      ${value < 0 ? '-' : ''}${n} ₪
    </span>`
  }

  // الهيكل العام للصفحة
  function layout({ title, subtitle = '', back = '', actions = '', body = '' }) {
    const live = Store.get().live

    return `<div class="mx-auto min-h-screen w-full max-w-5xl bg-[#f3f6fb] pb-20">

      <!-- رأس التطبيق -->
      <header class="sticky top-0 z-30 overflow-hidden border-b border-white/10 bg-[#101c35] px-4 pb-4 pt-4 text-white shadow-[0_8px_25px_rgba(10,20,40,0.16)] sm:px-6">

        <div class="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full border border-white/[0.045]"></div>
        <div class="pointer-events-none absolute -left-8 -top-16 h-36 w-36 rounded-full border border-white/[0.045]"></div>
        <div class="pointer-events-none absolute bottom-0 right-0 h-1 w-full bg-gradient-to-l from-blue-400 via-brand to-transparent opacity-80"></div>

        <div class="relative flex items-center gap-3">

          ${
            back
              ? `<button
                  data-a="nav"
                  data-id="${esc(back)}"
                  aria-label="رجوع"
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-xl text-white transition hover:border-white/20 hover:bg-white/[0.14] active:scale-95">
                  →
                </button>`
              : `<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-xl shadow-inner">
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21h18"/>
                    <path d="M5 21V7l8-4v18"/>
                    <path d="M19 21V11l-6-4"/>
                    <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
                    <path d="M16 13v.01M16 16v.01M16 19v.01"/>
                  </svg>
                </div>`
          }

          <div class="min-w-0 flex-1">

            <a href="#/" class="block truncate text-lg font-extrabold leading-tight tracking-tight sm:text-xl">
              ${esc(title)}
            </a>

            ${
              subtitle
                ? `<div class="mt-1 truncate text-xs font-medium text-slate-300 sm:text-sm">${esc(subtitle)}</div>`
                : `<div class="mt-1 text-[11px] font-medium text-slate-400">نظام إدارة حسابات المقاولين</div>`
            }

          </div>

          <div class="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-2">

            <span
              title="${live ? 'متصل — التحديث فوري' : 'غير متصل بالتحديث الفوري'}"
              class="h-2.5 w-2.5 rounded-full ${live ? 'bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.75)]' : 'bg-amber-400 animate-pulse'}">
            </span>

            <span class="hidden text-[11px] font-bold text-slate-200 sm:inline">
              ${live ? 'متصل' : 'غير متصل'}
            </span>

          </div>

          ${actions}

        </div>
      </header>

      <!-- محتوى الصفحة -->
      <main class="mx-auto w-full px-3 pt-5 sm:px-6 sm:pt-7">
        ${body}
      </main>

      <footer class="mx-auto mt-10 max-w-5xl px-4 pb-5 text-center text-[11px] font-medium text-slate-400">
        نظام حسابات المقاولين
      </footer>

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
        class="fixed inset-0 z-50 flex items-end justify-center bg-[#071226]/65 p-0 backdrop-blur-[4px] sm:items-center sm:p-4">

        <div
          class="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white p-5 pb-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:rounded-3xl sm:p-7"
          role="dialog"
          aria-modal="true">

          <div class="sticky top-0 z-10 -mx-5 -mt-5 mb-6 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 pb-4 pt-5 backdrop-blur sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7">

            <div class="flex min-w-0 items-center gap-3">

              <div class="h-8 w-1 shrink-0 rounded-full bg-brand"></div>

              <h3 class="truncate text-lg font-extrabold text-[#101c35]">
                ${title}
              </h3>

            </div>

            <button
              data-a="modal-close"
              aria-label="إغلاق"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95">
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
        class="fixed bottom-5 left-1/2 z-[60] flex max-w-[92%] -translate-x-1/2 items-center gap-3 rounded-2xl border px-5 py-4 text-center text-sm font-extrabold text-white shadow-[0_12px_35px_rgba(0,0,0,0.2)] ${
          type === 'err'
            ? 'border-red-500 bg-[#b92e43]'
            : 'border-emerald-500 bg-[#087d60]'
        }">

        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-base">
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
