(() => {
  'use strict';
  const read = () => { try { return localStorage.getItem('agentx-language') || 'zh'; } catch { return 'zh'; } };
  let language = read() === 'en' ? 'en' : 'zh';
  function apply() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.body.classList.toggle('lang-zh', language === 'zh');
    const button = document.querySelector('[data-language]');
    button.textContent = language === 'zh' ? 'EN' : '中文';
    button.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
  }
  document.querySelector('[data-language]').addEventListener('click', () => {
    language = language === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('agentx-language', language); } catch {}
    apply();
  });
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const panel = button.closest('.code-panel');
    const text = panel.querySelector('code').textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea');
        area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.append(area); area.select();
        const success = document.execCommand('copy'); area.remove();
        if (!success) throw new Error('COPY_UNAVAILABLE');
      }
      panel.querySelector('.copy-status').textContent = language === 'zh' ? '已复制命令。请先完成部署前置。' : 'Commands copied. Complete deployment prerequisites first.';
    } catch {
      panel.querySelector('.copy-status').textContent = language === 'zh' ? '复制不可用，请选择上方命令复制。' : 'Copy unavailable. Select the commands above to copy.';
    }
  }));
  apply();
})();
