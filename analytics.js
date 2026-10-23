(() => {
  'use strict';
  if (!['boki.club', 'www.boki.club'].includes(location.hostname)
    || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  const endpoint = 'https://boki-analytics.xyxcliff.workers.dev/collect';
  function recordPageView() {
    let referrer = '';
    try {
      if (document.referrer) referrer = new URL(document.referrer).origin;
    } catch {
      return;
    }
    const event = { id: crypto.randomUUID(), path: location.pathname, referrer };
    // No cookies, query strings, persistent browser IDs or raw IP lookup.
    // The edge service derives its own trusted, non-reversible IP identifier.
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(event),
      keepalive: true
    }).catch(() => { /* Optional analytics must not interrupt the public page. */ });
  }
  recordPageView();
  window.addEventListener('pageshow', event => {
    if (event.persisted) recordPageView();
  });
})();
