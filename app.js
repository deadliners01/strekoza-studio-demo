'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const services = [
  { name: 'Индивидуальный дизайн штор', detail: 'Подбираем силуэт, пропорции и характер драпировки с учётом архитектуры окна, освещения и обстановки.', photo: 'interior' },
  { name: 'Пошив штор на заказ', detail: 'Шьём шторы по размерам вашего окна с учётом плотности и пластики выбранной ткани.', photo: 'interior' },
  { name: 'Подбор интерьерных тканей', detail: 'Сопоставляем цвет, рисунок и фактуру образцов с отделкой комнаты. Учитываем, как ткань выглядит при разном свете.', photo: 'fabric' },
  { name: 'Пошив покрывал для спальни', detail: 'Подбираем материал, размеры и отделку покрывала с учётом пропорций кровати и текстиля в спальне.', photo: 'fabric' },
  { name: 'Декоративное оформление текстиля', detail: 'Подбираем кисти, шнуры и другие детали отделки, которые поддерживают рисунок ткани и форму изделия.', photo: 'trim' },
  { name: 'Комплексное текстильное оформление интерьера', detail: 'Обсуждаем сочетание штор, покрывал и декоративного текстиля в нескольких зонах. Объём работ требует согласования со студией.', photo: 'interior' }
];
const tiers = {
  standard: { name: 'Стандарт', cost: 60000, detail: 'Аккуратное и функциональное текстильное решение.' },
  comfort: { name: 'Комфорт', cost: 110000, detail: 'Индивидуальная дизайнерская концепция с декоративными элементами.' },
  premium: { name: 'Премиум', cost: 250000, detail: 'Художественное оформление, в котором окно становится самостоятельным интерьерным арт-объектом.' }
};
const rooms = ['Гостиная', 'Спальня', 'Столовая', 'Кабинет', 'Несколько помещений', 'Другое'];
const styles = ['Пока не определились', 'Классика', 'Неоклассика', 'Современный', 'Эклектика', 'Другой'];
const designers = ['Любой специалист', 'Светлана', 'Эльмира'];
const portfolio = window.studioPortfolio || [];
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const option = (value, label, current) => '<option value="' + escape(value) + '"' + (value === current ? ' selected' : '') + '>' + escape(label) + '</option>';
const options = (values, current) => values.map(value => option(value, value, current)).join('');
const tierOptions = current => Object.entries(tiers).map(([id, tier]) => option(id, tier.name, current)).join('');
const quote = data => tiers[data.tier].cost * Number(data.windows);
const windowPlural = new Intl.PluralRules('ru-RU');
const windowsLabel = count => ({ one: 'окно', few: 'окна', many: 'окон' })[windowPlural.select(Number(count))] || 'окна';

const menu = $('.menu');
menu.addEventListener('click', () => {
  const open = $('#nav').classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
});
$$('#nav a').forEach(link => link.addEventListener('click', () => {
  $('#nav').classList.remove('open');
  menu.setAttribute('aria-expanded', false);
}));
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking || motion.matches) return;
  ticking = true;
  requestAnimationFrame(() => {
    $('.hero-frame').style.setProperty('--parallax', Math.min(scrollY * .03, 18) + 'px');
    ticking = false;
  });
}, { passive: true });

let activeService = 0;
$('#service-list').innerHTML = services.map((service, index) =>
  '<button type="button" data-service="' + index + '" aria-pressed="false">' + service.name + '</button>').join('');
function showService(index) {
  activeService = index;
  const service = services[index];
  const photo = portfolio.find(item => item.id === service.photo);
  const textile = service.photo !== 'interior';
  $('#service-photo').src = photo?.src || (textile ? './assets/textiles.jpg' : './assets/hero.jpg');
  $('#service-photo').alt = photo?.alt || (textile ? 'Лён, бархат и отделочный шнур на столе' : 'Шторы цвета шампань в историческом интерьере');
  $('#service-caption').textContent = photo?.title || 'Интерьерная иллюстрация';
  $('#service-info').innerHTML = '<h3>' + service.name + '</h3><p>' + service.detail + '</p>';
  $$('[data-service]').forEach(button => button.setAttribute('aria-pressed', Number(button.dataset.service) === index));
}
showService(0);
$('#service-list').addEventListener('click', event => {
  const button = event.target.closest('[data-service]');
  if (button) showService(Number(button.dataset.service));
});

const lightbox = $('#lightbox');
let shown = portfolio;
let photoIndex = 0;
function renderGallery(category) {
  shown = category === 'Все' ? portfolio : portfolio.filter(photo => photo.category === category);
  $('#gallery').innerHTML = shown.map((photo, index) =>
    '<button type="button" data-photo="' + index + '"><img src="' + escape(photo.src) + '" alt="' + escape(photo.alt) +
    '" width="' + photo.width + '" height="' + photo.height + '" loading="lazy"><span>' + escape(photo.title) + '</span></button>').join('');
  $$('#filters button').forEach(button => button.setAttribute('aria-pressed', button.dataset.category === category));
}
function showPhoto(index) {
  photoIndex = (index + shown.length) % shown.length;
  const photo = shown[photoIndex];
  $('#gallery-image').src = photo.src;
  $('#gallery-image').alt = photo.alt;
  $('#gallery-title').textContent = photo.title + ' · ' + (photoIndex + 1) + ' из ' + shown.length;
  $('#gallery-prev').hidden = $('#gallery-next').hidden = shown.length < 2;
}
if (portfolio.length) {
  $('#portfolio-status').hidden = true;
  $('#filters').hidden = false;
  const categories = ['Все', ...new Set(portfolio.map(photo => photo.category))];
  $('#filters').innerHTML = categories.map(category => '<button type="button" data-category="' + escape(category) + '">' + escape(category) + '</button>').join('');
  renderGallery('Все');
}
$('#filters').addEventListener('click', event => {
  if (event.target.dataset.category) renderGallery(event.target.dataset.category);
});
$('#gallery').addEventListener('click', event => {
  const button = event.target.closest('[data-photo]');
  if (!button) return;
  showPhoto(Number(button.dataset.photo));
  lightbox.showModal();
});
$('#gallery-prev').onclick = () => showPhoto(photoIndex - 1);
$('#gallery-next').onclick = () => showPhoto(photoIndex + 1);
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
});
let touchOrigin;
$('figure', lightbox).addEventListener('touchstart', event => {
  touchOrigin = event.touches.length === 1 ? [event.touches[0].clientX, event.touches[0].clientY] : null;
}, { passive: true });
$('figure', lightbox).addEventListener('touchend', event => {
  if (!touchOrigin) return;
  const [x, y] = touchOrigin;
  touchOrigin = null;
  const touch = event.changedTouches[0];
  const delta = touch.clientX - x;
  if (Math.abs(delta) > 45 && Math.abs(delta) > Math.abs(touch.clientY - y)) showPhoto(photoIndex + (delta < 0 ? 1 : -1));
}, { passive: true });
$('figure', lightbox).addEventListener('touchcancel', () => { touchOrigin = null; });

const calc = $('#calculator');
calc.elements.room.innerHTML = options(rooms, rooms[0]);
calc.elements.tier.innerHTML = tierOptions('standard');
calc.elements.style.innerHTML = options(styles, styles[0]);
function calcData() { return Object.fromEntries(new FormData(calc)); }
function showEstimate() {
  const data = calcData();
  const result = $('#estimate-result');
  if (!calc.elements.windows.validity.valid) {
    result.textContent = 'Укажите целое количество окон от 1 до 999.';
    return;
  }
  result.innerHTML = '<span class="estimate-amount">от ' + money(quote(data)) + '</span><span>' +
    data.windows + ' ' + windowsLabel(data.windows) + ' × ' + money(tiers[data.tier].cost) +
    '</span><span>' + escape([data.room, tiers[data.tier].name, data.style].join(' · ')) +
    '</span>' + (data.wishes.trim() ? '<span class="break-text">' + escape(data.wishes) + '</span>' : '') +
    '<span class="note">Предварительный минимум. Итоговую смету уточнит дизайнер.</span>';
}
calc.addEventListener('input', showEstimate);
showEstimate();
$('#tiers').innerHTML = Object.entries(tiers).map(([id, tier]) =>
  '<article class="tier"><h3>' + tier.name + '</h3><p class="price">от ' + money(tier.cost) +
  '<small>за окно</small></p><p>' + tier.detail + '</p><a class="text-link" href="#estimate" data-tier="' + id + '">Рассчитать проект</a></article>').join('');
$$('[data-tier]').forEach(link => link.addEventListener('click', () => {
  calc.elements.tier.value = link.dataset.tier;
  showEstimate();
}));

const dialog = $('#booking');
const content = $('#booking-content');
const storageKey = 'strekoza-studio:requests:v1';
const bookingNotice = 'Демонстрационная запись. Заявка не отправляется студии, время не бронируется, оплата не производится.';
const titles = ['Выберите услугу', 'Опишите проект', 'Выберите дизайнера', 'Дата и время консультации', 'Контактные данные', 'Проверьте заявку'];
const moscow = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});
const monthFormat = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const proposedTimes = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
function moscowNow() {
  const parts = Object.fromEntries(moscow.formatToParts().map(part => [part.type, part.value]));
  return { date: [parts.year, parts.month, parts.day].join('-'), time: parts.hour + ':' + parts.minute };
}
function timesFor(date) {
  const now = moscowNow();
  if (date < now.date) return [];
  return date === now.date ? proposedTimes.filter(time => time > now.time) : proposedTimes;
}
function dateLabel(date) { return date ? dateFormat.format(new Date(date + 'T12:00:00Z')) : '—'; }
function initialProject() {
  return { service: '', windows: '1', room: rooms[0], tier: 'standard', style: styles[0], wishes: '', designer: designers[0],
    date: '', time: '', name: '', phone: '', comment: '', photos: [], reference: '' };
}
let project = initialProject();
let step = 0;
let month = '';
let mode = 'welcome';
let editId = '';
let photosBusy = false;
let panelRevision = 0;
let records = [];
let activeId = '';
try {
  const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(data)) records = data.filter(record => record && typeof record.id === 'string' && record.project && tiers[record.project.tier]);
} catch { /* A blocked or damaged store does not stop the form. */ }

function saveRecords(next) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
    records = next;
    return true;
  } catch {
    status('Не удалось сохранить данные в браузере. Освободите место или уберите фотографии и повторите.');
    return false;
  }
}
function status(message) { $('#booking-status').textContent = message; }
function openDialog() { if (!dialog.open) dialog.showModal(); }
function focusHeading() { $('#booking-heading').focus({ preventScroll: true }); dialog.scrollTop = 0; }
function header(title, progress = '') {
  return progress + '<h2 id="booking-heading" tabindex="-1">' + escape(title) + '</h2><p class="booking-note">' + bookingNotice + '</p>';
}
function startBooking(prefill = {}) {
  editId = '';
  project = { ...initialProject(), ...prefill };
  step = project.service ? (prefill.windows ? 2 : 1) : 0;
  month = moscowNow().date.slice(0, 7);
  mode = 'form';
  renderStep();
  openDialog();
  focusHeading();
}
$$('[data-book]').forEach(button => button.onclick = () => {
  if (mode === 'form' && !editId) { openDialog(); focusHeading(); return; }
  startBooking();
});
$('#service-book').onclick = () => startBooking({ service: services[activeService].name });
$('#gallery-book').onclick = () => {
  const photo = shown[photoIndex];
  lightbox.close();
  startBooking({ reference: photo.title });
};
calc.addEventListener('submit', event => {
  event.preventDefault();
  startBooking(calcData());
});
$$('[data-close]').forEach(button => button.onclick = () => button.closest('dialog').close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
dialog.addEventListener('close', () => { if (mode === 'form') syncFields(); });

function fields(markup) { return '<div class="fields">' + markup + '</div>'; }
function selectField(label, name, choices, wide = false) {
  return '<label' + (wide ? ' class="wide"' : '') + '>' + label + '<select name="' + name + '" required>' + choices + '</select></label>';
}
function textareaField(label, name) {
  return '<label class="wide">' + label + '<textarea name="' + name + '" maxlength="1200" rows="3">' + escape(project[name]) + '</textarea></label>';
}
function stepMarkup() {
  switch (step) {
    case 0: return fields(selectField('Услуга', 'service', option('', 'Выберите направление', project.service) +
      options(services.map(item => item.name), project.service), true)) +
      (project.reference ? '<p class="note">Выбранный пример: ' + escape(project.reference) + '</p>' : '');
    case 1: return fields(
      '<label>Количество окон<input name="windows" type="number" min="1" max="999" step="1" required value="' + escape(project.windows) + '"></label>' +
      selectField('Тип помещения', 'room', options(rooms, project.room)) +
      selectField('Ценовая категория', 'tier', tierOptions(project.tier)) +
      selectField('Стиль оформления', 'style', options(styles, project.style)) +
      textareaField('Дополнительные пожелания', 'wishes')) + '<p id="step-quote" class="note" aria-live="polite"></p>';
    case 2: return fields(selectField('Дизайнер', 'designer', options(designers, project.designer), true));
    case 3: return '<p class="booking-note">Выберите желаемые дату и время по Москве. Доступность специалиста уточняется со студией.</p>' +
      '<div id="calendar" class="calendar"></div>' + fields(selectField('Желаемое время (МСК)', 'time', '', true));
    case 4: return fields(
      '<label>Имя<input name="name" autocomplete="given-name" maxlength="100" required value="' + escape(project.name) + '"></label>' +
      '<label>Телефон<input name="phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" maxlength="30" required value="' + escape(project.phone) + '"></label>' +
      textareaField('Комментарий к проекту', 'comment') +
      '<label class="wide">Фотографии интерьера<input id="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="photo-help"></label>' +
      '<div class="wide"><p id="photo-help" class="booking-note">До 4 фотографий в JPEG, PNG или WebP. Файлы уменьшаются и хранятся в браузере.</p><div id="photo-list" class="photo-list"></div></div>');
    default: return summaryMarkup(project);
  }
}
function renderStep() {
  ++panelRevision;
  photosBusy = false;
  mode = 'form';
  const progress = '<div class="booking-meta"><progress value="' + (step + 1) + '" max="7" aria-label="Этап оформления"></progress><span>Этап ' + (step + 1) + ' из 7</span></div>';
  content.innerHTML = header(titles[step], progress) +
    '<form id="booking-form"><div class="booking-body">' + stepMarkup() + '</div><p id="booking-status" class="status" role="status"></p>' +
    '<div class="booking-actions">' + (step ? '<button type="button" class="button outline" id="back">Назад</button>' : '<button type="button" class="button outline" data-exit>Закрыть</button>') +
    '<button type="submit" class="button" id="next">' + (step === 5 ? (editId ? 'Сохранить изменения' : 'Подтвердить демозаявку') : 'Продолжить') + '</button></div></form>';
  if (step === 1) renderStepQuote();
  if (step === 3) renderCalendar();
  if (step === 4) renderPhotos();
}
function syncFields() {
  const form = $('#booking-form');
  if (form) Object.assign(project, Object.fromEntries(new FormData(form)));
}
function renderStepQuote() {
  const windows = $('#booking-form').elements.windows;
  $('#step-quote').textContent = windows.validity.valid ? 'Предварительная стоимость · от ' + money(quote(project)) : '';
}
function renderCalendar(focusDate) {
  const [year, number] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const empty = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const today = moscowNow().date;
  const heading = monthFormat.format(first);
  const max = today.slice(0, 7).split('-').map(Number);
  const maxMonth = new Date(Date.UTC(max[0], max[1] + 10, 1)).toISOString().slice(0, 7);
  const weekday = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => '<span>' + day + '</span>').join('');
  const blanks = '<span aria-hidden="true"></span>'.repeat(empty);
  const dates = Array.from({ length: days }, (_, index) => {
    const date = month + '-' + String(index + 1).padStart(2, '0');
    return '<button type="button" data-date="' + date + '" aria-label="' + escape(dateLabel(date)) + '" aria-pressed="' +
      (project.date === date) + '"' + (!timesFor(date).length ? ' disabled' : '') + '>' + (index + 1) + '</button>';
  }).join('');
  $('#calendar').innerHTML = '<div class="calendar-head"><button type="button" data-month="-1" aria-label="Предыдущий месяц"' +
    (month <= today.slice(0, 7) ? ' disabled' : '') + '>‹</button><strong aria-live="polite">' + escape(heading) +
    '</strong><button type="button" data-month="1" aria-label="Следующий месяц"' +
    (month >= maxMonth ? ' disabled' : '') + '>›</button></div><div class="calendar-grid">' + weekday + blanks + dates + '</div>';
  const time = $('#booking-form').elements.time;
  time.innerHTML = option('', 'Выберите время', project.time) + options(timesFor(project.date), project.time);
  time.disabled = !project.date || !timesFor(project.date).length;
  if (focusDate) $('[data-date="' + focusDate + '"]')?.focus();
}

function normalizePhone(raw) {
  if (!/^\+?[\d\s().-]+$/.test(raw.trim())) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && !raw.trim().startsWith('+')) return '+7' + digits;
  if (/^[78]\d{10}$/.test(digits)) return '+7' + digits.slice(1);
  if (raw.trim().startsWith('+') && /^[1-9]\d{9,14}$/.test(digits)) return '+' + digits;
  return '';
}
function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15000000) {
    return Promise.reject(new Error('Нужен JPEG, PNG или WebP размером до 15 МБ.'));
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Файл не удалось открыть.'));
    };
    image.onload = () => {
      try {
        const scale = Math.min(1, 720 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({ name: file.name, data: canvas.toDataURL('image/jpeg', .68) });
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.src = url;
  });
}
function photoMarkup(photos, editable = false) {
  return (photos || []).filter(photo => /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo.data)).map((photo, index) =>
    '<div><img src="' + photo.data + '" alt=""><span>' + escape(photo.name) + '</span>' +
    (editable ? '<button type="button" data-remove-photo="' + index + '" aria-label="Удалить ' + escape(photo.name) + '">Удалить</button>' : '') + '</div>').join('');
}
function renderPhotos() { $('#photo-list').innerHTML = photoMarkup(project.photos, true); }
content.addEventListener('input', event => {
  if (mode !== 'form' || event.target.type === 'file') return;
  event.target.setCustomValidity?.('');
  syncFields();
  if (step === 1) renderStepQuote();
});
content.addEventListener('change', async event => {
  if (event.target.id !== 'photos') return;
  const files = [...event.target.files];
  event.target.value = '';
  if (photosBusy || !files.length) return;
  const remaining = 4 - project.photos.length;
  if (files.length > remaining) { status('В заявку можно добавить до 4 фотографий.'); return; }
  const revision = panelRevision;
  photosBusy = true;
  $('#next').disabled = true;
  status('Подготавливаем фотографии…');
  const results = [];
  for (const file of files) {
    try { results.push(await preparePhoto(file)); }
    catch { results.push(null); }
    if (revision !== panelRevision) return;
  }
  project.photos.push(...results.filter(Boolean));
  photosBusy = false;
  $('#next').disabled = false;
  renderPhotos();
  status(results.includes(null) ? 'Часть файлов не открылась. Используйте JPEG, PNG или WebP до 15 МБ.' : 'Фотографии добавлены.');
});

function summaryRows(data) {
  return [
    ['Услуга', data.service], ['Помещение', data.room], ['Количество окон', data.windows], ['Категория', tiers[data.tier].name],
    ['Стиль', data.style], ['Предварительный минимум', 'от ' + money(quote(data))], ['Пожелания', data.wishes],
    ['Пример из портфолио', data.reference], ['Дизайнер', data.designer], ['Желаемая дата', dateLabel(data.date)],
    ['Желаемое время (МСК)', data.time], ['Имя', data.name], ['Телефон', data.phone], ['Комментарий', data.comment]
  ].filter(([, value]) => value);
}
function summaryMarkup(data) {
  return '<dl class="summary">' + summaryRows(data).map(([label, value]) =>
    '<div><dt>' + escape(label) + '</dt><dd>' + escape(value) + '</dd></div>').join('') +
    '</dl>' + (data.photos?.length ? '<div class="photo-list">' + photoMarkup(data.photos) + '</div>' : '');
}
function persistProject() {
  const previous = records.find(record => record.id === editId);
  const id = editId || 'ST-' + Array.from(crypto.getRandomValues(new Uint8Array(5)),
    byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  const record = { id, project, cancelled: previous?.cancelled || false };
  const next = previous ? records.map(item => item.id === id ? record : item) : [...records, record];
  if (saveRecords(next)) showRecord(id, previous ? 'Изменения сохранены' : 'Демозаявка оформлена');
}
content.addEventListener('submit', event => {
  if (event.target.id !== 'booking-form') return;
  event.preventDefault();
  if (photosBusy) return;
  syncFields();
  const form = event.target;
  if (step === 3 && !timesFor(project.date).includes(project.time)) {
    status('Выберите будущую дату и время консультации.');
    return;
  }
  if (step === 4) {
    const name = form.elements.name;
    const phone = form.elements.phone;
    name.setCustomValidity(project.name.trim() ? '' : 'Введите имя.');
    const normalized = normalizePhone(project.phone);
    phone.setCustomValidity(normalized ? '' : 'Введите корректный номер, например +7 (900) 123-45-67.');
    if (!form.reportValidity()) return;
    project.name = project.name.trim();
    project.phone = normalized;
  }
  if (step === 5) {
    if (!timesFor(project.date).includes(project.time)) {
      step = 3;
      month = moscowNow().date.slice(0, 7);
      renderStep();
      focusHeading();
      status('Выберите новое время консультации.');
      return;
    }
    persistProject();
    return;
  }
  step++;
  renderStep();
  focusHeading();
});

function panel(title, body, newMode, progress = '') {
  ++panelRevision;
  mode = newMode;
  content.innerHTML = header(title, progress) + body + '<p id="booking-status" class="status" role="status"></p>';
  openDialog();
  focusHeading();
}
function button(label, action, value = '') {
  return '<button type="button" class="button outline" data-action="' + action + '" data-value="' + escape(value) + '">' + label + '</button>';
}
function showList() {
  const list = records.length ? '<div class="manage-actions">' + records.map(record =>
    button(escape(record.id) + (record.cancelled ? ' · отменена' : ''), 'view', record.id)).join('') + '</div>' :
    '<p>В этом браузере пока нет сохранённых заявок.</p>';
  panel('Мои заявки', list + '<div class="manage-actions">' + button('Новая заявка', 'new') +
    (records.length ? button('Удалить все сохранённые данные', 'purge') : '') + '</div>', 'list');
}
function showRecord(id, title = 'Демозаявка') {
  const record = records.find(item => item.id === id);
  if (!record) { showList(); return; }
  activeId = id;
  panel(title, '<p class="overline">Обращение ' + escape(id) + (record.cancelled ? ' · отменено' : '') + '</p>' +
    summaryMarkup(record.project) + '<div class="manage-actions">' +
    (record.cancelled ? '' : button('Изменить дату и время', 'edit', '3') + button('Изменить параметры', 'edit', '0') + button('Отменить заявку', 'cancel')) +
    button('Копировать резюме', 'copy') + button('Скачать резюме', 'download') + button('Все заявки', 'list') + '</div>', 'record',
    title === 'Демозаявка оформлена' ? '<div class="booking-meta"><progress value="7" max="7" aria-label="Этап оформления"></progress><span>Этап 7 из 7</span></div>' : '');
}
function editRecord(record, at) {
  project = { ...record.project, photos: [...(record.project.photos || [])] };
  editId = record.id;
  step = at;
  const now = moscowNow().date.slice(0, 7);
  month = project.date && project.date.slice(0, 7) > now ? project.date.slice(0, 7) : now;
  renderStep();
  focusHeading();
}
function resumeText(record) {
  return ['СТРЕКОЗА · ' + record.id + (record.cancelled ? ' · отменена' : ''), bookingNotice,
    ...summaryRows(record.project).map(([label, value]) => label + ': ' + value)].join('\n');
}
function downloadResume(record) {
  const url = URL.createObjectURL(new Blob(['\ufeff' + resumeText(record)], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = record.id + '.txt';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
async function copyResume(record) {
  const current = panelRevision;
  const value = resumeText(record);
  try {
    await navigator.clipboard.writeText(value);
    if (current === panelRevision) status('Резюме скопировано.');
  } catch {
    if (current !== panelRevision) return;
    const area = document.createElement('textarea');
    area.value = value;
    area.readOnly = true;
    area.setAttribute('aria-label', 'Резюме для копирования');
    $('#booking-status').after(area);
    area.focus();
    area.select();
    const copied = document.execCommand('copy');
    if (copied) area.remove();
    status(copied ? 'Резюме скопировано.' : 'Резюме выделено. Скопируйте его или скачайте файл.');
  }
}
$('#manage').onclick = showList;
content.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.hasAttribute('data-exit')) {
    if (editId) showRecord(editId);
    else dialog.close();
  } else if (target.id === 'back') {
    syncFields();
    step--;
    renderStep();
    focusHeading();
  } else if (target.dataset.date) {
    if (project.date !== target.dataset.date) project.time = '';
    project.date = target.dataset.date;
    renderCalendar(project.date);
    status('');
  } else if (target.dataset.month) {
    const [year, number] = month.split('-').map(Number);
    const direction = target.dataset.month;
    month = new Date(Date.UTC(year, number - 1 + Number(direction), 1)).toISOString().slice(0, 7);
    renderCalendar();
    const next = $('[data-month="' + direction + '"]:not(:disabled)') || $('#calendar [data-month]:not(:disabled)');
    next?.focus();
  } else if ('removePhoto' in target.dataset) {
    project.photos.splice(Number(target.dataset.removePhoto), 1);
    renderPhotos();
    $('#photos').focus();
    status('Фотография удалена.');
  } else if (target.dataset.action) {
    const record = records.find(item => item.id === activeId);
    switch (target.dataset.action) {
      case 'new': startBooking(); break;
      case 'list': showList(); break;
      case 'view': showRecord(target.dataset.value); break;
      case 'edit': if (record && !record.cancelled) editRecord(record, Number(target.dataset.value)); break;
      case 'copy': if (record) copyResume(record); break;
      case 'download': if (record) downloadResume(record); break;
      case 'cancel':
        panel('Отменить демозаявку?', '<p>Заявка останется в списке со статусом «отменено».</p><div class="manage-actions">' +
          button('Вернуться к заявке', 'view', activeId) + button('Подтвердить отмену', 'confirm-cancel') + '</div>', 'confirm');
        break;
      case 'confirm-cancel':
        if (record && saveRecords(records.map(item => item.id === activeId ? { ...item, cancelled: true } : item))) {
          showRecord(activeId, 'Демозаявка отменена');
        }
        break;
      case 'purge':
        panel('Удалить данные?', '<p>Все заявки и приложенные фотографии будут удалены из этого браузера.</p><div class="manage-actions">' +
          button('Вернуться к списку', 'list') + button('Удалить данные', 'confirm-purge') + '</div>', 'confirm');
        break;
      case 'confirm-purge':
        try {
          localStorage.removeItem(storageKey);
          records = [];
          project = initialProject();
          editId = activeId = '';
          showList();
          status('Сохранённые данные удалены.');
        } catch { status('Браузер заблокировал удаление данных.'); }
        break;
    }
  }
});
