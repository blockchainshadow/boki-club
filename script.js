(() => {
  'use strict';
  const COUNTER_KEY = 'boki_club_support_20261023_9bd19c5d915a4da6885ae7348b4df90d';
  const COUNTER_API = 'https://countapi.mileshilliard.com/api/v1';
  const VOTE_STORAGE = `boki:vote:${COUNTER_KEY}`;
  const LANGUAGE_STORAGE = 'boki:language';
  const messages = window.BOKI_LOCALES;
  const languageMenu = document.querySelector('#language');
  const button = document.querySelector('#vote-button');
  const buttonLabel = document.querySelector('#vote-button-label');
  const buttonIcon = document.querySelector('#vote-button-icon');
  const countElement = document.querySelector('#vote-count');
  const statusElement = document.querySelector('#vote-status');
  const refreshButton = document.querySelector('#vote-refresh');
  let storageAvailable = true;
  const readStored = key => {
    try { return localStorage.getItem(key); }
    catch { storageAvailable = false; return null; }
  };
  const store = (key, value) => {
    try { localStorage.setItem(key, value); }
    catch { storageAvailable = false; }
  };
  const matchLanguage = candidate => {
    if (!candidate) return null;
    if (messages[candidate]) return candidate;
    const base = candidate.toLowerCase().split('-')[0];
    return base === 'zh' ? 'zh-CN' : messages[base] ? base : null;
  };
  let language = matchLanguage(readStored(LANGUAGE_STORAGE))
    || (navigator.languages || [navigator.language]).map(matchLanguage).find(Boolean)
    || 'en';
  let voteFlag = readStored(VOTE_STORAGE);
  let total = null;
  let busy = false;
  let readFailed = false;
  let sending = false;
  const t = key => messages[language][key];

  function renderCounter() {
    countElement.textContent = total === null ? '—' : new Intl.NumberFormat(language).format(total);
    button.classList.toggle('is-voted', voteFlag === 'yes');
    button.setAttribute('aria-busy', String(sending));
    refreshButton.disabled = busy;
    button.disabled = busy || total === null || readFailed || voteFlag === 'yes' || voteFlag === 'pending';
    let label;
    let status;
    if (sending) {
      label = 'submitting'; status = 'sending';
    } else if (voteFlag === 'pending') {
      label = 'uncertain'; status = 'uncertainStatus';
    } else if (readFailed) {
      label = voteFlag === 'yes' ? 'voted' : 'unavailable'; status = 'loadError';
    } else if (voteFlag === 'yes') {
      label = 'voted'; status = 'votedStatus';
    } else if (busy || total === null) {
      label = 'connecting'; status = 'loading';
    } else {
      label = 'voteButton'; status = 'ready';
    }
    buttonLabel.textContent = t(label);
    buttonIcon.textContent = voteFlag === 'yes' ? '✓' : '+1';
    statusElement.textContent = t(status) + (!storageAvailable ? `\n${t('storageWarning')}` : '');
    statusElement.classList.toggle('is-error', readFailed || voteFlag === 'pending' && !sending);
  }

  function setLanguage(next) {
    language = next;
    document.documentElement.lang = language;
    languageMenu.value = language;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(element => {
      element.setAttribute('aria-label', t(element.dataset.i18nLabel));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      element.alt = t(element.dataset.i18nAlt);
    });
    document.title = t('pageTitle');
    document.querySelector('meta[property="og:title"]').content = t('pageTitle');
    const description = `${t('tagline')} ${t('intro').replaceAll('\n', ' ')} ${t('voteIntro').replaceAll('\n', ' ')}`;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:description"]').content = description;
    document.querySelector('meta[property="og:image:alt"]').content = t('galleryAlt1');
    document.querySelector('meta[name="twitter:title"]').content = t('pageTitle');
    document.querySelector('meta[name="twitter:description"]').content = description;
    const structuredElement = document.querySelector('#site-structured-data');
    const structured = JSON.parse(structuredElement.textContent);
    const page = structured['@graph'].find(entry => entry['@type'] === 'WebPage');
    page.name = t('pageTitle');
    page.description = description;
    page.inLanguage = language;
    structuredElement.textContent = JSON.stringify(structured);
    renderCounter();
  }

  async function requestCount(operation) {
    const response = await fetch(`${COUNTER_API}/${operation}/${COUNTER_KEY}`, {
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Counter HTTP ${response.status}`);
    const data = await response.json();
    const value = Number(data.value);
    if ((typeof data.value !== 'string' && typeof data.value !== 'number')
      || String(data.value).trim() === '' || !Number.isSafeInteger(value) || value < 0) {
      throw new Error('Invalid counter response');
    }
    return value;
  }

  async function refreshCount() {
    if (busy) return;
    busy = true;
    renderCounter();
    try {
      total = await requestCount('get');
      readFailed = false;
    } catch {
      // Keep only a previously confirmed total, with an explicit offline warning.
      readFailed = true;
    } finally {
      busy = false;
      renderCounter();
    }
  }

  button.addEventListener('click', async () => {
    voteFlag = readStored(VOTE_STORAGE) || voteFlag;
    if (busy || total === null || readFailed || voteFlag === 'yes' || voteFlag === 'pending') {
      renderCounter();
      return;
    }
    // Persist before the non-idempotent request. Never auto-retry an uncertain increment.
    voteFlag = 'pending';
    store(VOTE_STORAGE, voteFlag);
    busy = true;
    sending = true;
    renderCounter();
    try {
      total = await requestCount('hit');
      voteFlag = 'yes';
      store(VOTE_STORAGE, voteFlag);
      readFailed = false;
      countElement.classList.remove('counted');
      requestAnimationFrame(() => countElement.classList.add('counted'));
    } catch {
      // The server may have counted a request whose response was lost. Do not claim success.
      voteFlag = 'pending';
    } finally {
      busy = false;
      sending = false;
      renderCounter();
    }
  });
  refreshButton.addEventListener('click', refreshCount);
  languageMenu.addEventListener('change', () => {
    store(LANGUAGE_STORAGE, languageMenu.value);
    setLanguage(languageMenu.value);
  });
  window.addEventListener('storage', event => {
    if (event.key === VOTE_STORAGE) {
      voteFlag = event.newValue;
      renderCounter();
      if (!busy) refreshCount();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !busy) refreshCount();
  });
  setLanguage(language);
  refreshCount();
})();
