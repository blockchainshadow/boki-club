(() => {
  'use strict';
  const messages = window.BOKI_LOCALES;
  const menu = document.querySelector('#language');
  const storageKey = 'boki:language';
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Language switching works without storage. */ }
  // The crawlable guide defaults to its static Chinese content, not browser locale.
  let language = messages[saved] ? saved : 'zh-CN';
  function render() {
    const t = key => messages[language][key];
    document.documentElement.lang = language;
    menu.value = language;
    document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll('[data-i18n-label]').forEach(element => { element.setAttribute('aria-label', t(element.dataset.i18nLabel)); });
    document.title = t('guidePageTitle');
    document.querySelector('meta[name="description"]').content = t('seoDescription');
    document.querySelector('meta[property="og:title"]').content = t('guidePageTitle');
    document.querySelector('meta[property="og:description"]').content = t('seoDescription');
    document.querySelector('meta[name="twitter:title"]').content = t('guidePageTitle');
    document.querySelector('meta[name="twitter:description"]').content = t('seoDescription');
    const element = document.querySelector('#site-structured-data');
    const data = JSON.parse(element.textContent);
    const page = data['@graph'].find(entry => entry['@type'] === 'WebPage');
    page.name = t('guidePageTitle');
    page.description = t('seoDescription');
    page.inLanguage = language;
    element.textContent = JSON.stringify(data);
  }
  menu.addEventListener('change', () => {
    language = menu.value;
    try { localStorage.setItem(storageKey, language); } catch { /* Optional preference only. */ }
    render();
  });
  render();
})();
