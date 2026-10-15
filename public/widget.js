(function () {
  if (window.MediuswareBotWidgetLoaded || document.querySelector('.mw-widget-button')) return;
  window.MediuswareBotWidgetLoaded = true;

  const scriptTag = document.currentScript || document.querySelector('script[data-tenant-id]');
  const tenantId = scriptTag ? scriptTag.getAttribute('data-tenant-id') || '' : '';
  const rawApiHost = scriptTag ? (scriptTag.getAttribute('data-api-host') || window.location.origin) : window.location.origin;
  const apiHost = rawApiHost.replace(/\/$/, '');
  let primaryColor = scriptTag ? (scriptTag.getAttribute('data-color') || '#4F46E5') : '#4F46E5';
  let hasUserSentMessage = false;

  // Markdown & Text Helpers
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMarkdown(rawText) {
    if (!rawText) return '';
    let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Strip leading question echo if LLM repeats user's query like "How can I contact?- Contact..."
    text = text.replace(/^[^?\n]+\?\s*-\s*/, '');

    // Convert inline bullet points into separate lines for maximum readability
    text = text.replace(/([^\n])\s+-\s+([A-Z0-9])/g, '$1\n- $2');
    text = text.replace(/([.?!:\)])\s*-\s+/g, '$1\n- ');

    let escaped = escapeHtml(text);

    // Markdown Headers
    escaped = escaped.replace(/^### (.*$)/gim, '<div class="mw-md-h3">$1</div>');
    escaped = escaped.replace(/^## (.*$)/gim, '<div class="mw-md-h2">$1</div>');
    escaped = escaped.replace(/^# (.*$)/gim, '<div class="mw-md-h1">$1</div>');

    // Bold text (**text** or __text__)
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic text (*text*)
    escaped = escaped.replace(/\*([^\*\n]+)\*/g, '<em>$1</em>');

    // Combined Link Parser: matches [label](url) OR standalone https?://
    escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|(?<!href=")(https?:\/\/[^\s<]+)/g, (match, label, url, rawUrl) => {
      if (label && url) {
        const cleanUrl = url.replace(/&amp;/g, '&');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="mw-md-link">${label}</a>`;
      } else if (rawUrl) {
        const cleanUrl = rawUrl.replace(/&amp;/g, '&');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="mw-md-link">${cleanUrl}</a>`;
      }
      return match;
    });

    const lines = escaped.split('\n');
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) { html += '<ul class="mw-md-list">'; inList = true; }
        html += `<li>${line.substring(2)}</li>`;
      } else if (/^\d+\.\s+/.test(line)) {
        if (inList) { html += '</ul>'; inList = false; }
        const itemContent = line.replace(/^\d+\.\s+/, '');
        html += `<div class="mw-md-num-item"><span class="mw-md-num">${line.match(/^\d+\./)[0]}</span> ${itemContent}</div>`;
      } else if (line.startsWith('<div class="mw-md-h')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += line;
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p class="mw-md-p">${line}</p>`;
      }
    }

    if (inList) html += '</ul>';
    return html;
  }

  // Create Styles
  const style = document.createElement('style');
  style.id = 'mw-widget-styles';
  style.textContent = `
    .mw-widget-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${primaryColor};
      color: #fff;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      z-index: 999999;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .mw-widget-button:hover { 
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    }
    .mw-widget-box {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 400px;
      max-width: 92vw;
      height: 560px;
      max-height: 82vh;
      background: #0f172a;
      color: #f3f4f6;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      display: none;
      flex-direction: column;
      z-index: 999999;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .mw-widget-header {
      padding: 16px;
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
    }
    .mw-widget-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #0b1120;
    }
    .mw-msg {
      max-width: 88%;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.6;
      word-break: break-word;
    }
    .mw-msg-bot {
      background: rgba(30, 41, 59, 0.95);
      color: #e2e8f0;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }
    .mw-msg-bot p.mw-md-p {
      margin: 0 0 8px 0;
      line-height: 1.55;
    }
    .mw-msg-bot p.mw-md-p:last-child {
      margin-bottom: 0;
    }
    .mw-msg-bot strong {
      color: #ffffff;
      font-weight: 600;
    }
    .mw-msg-bot em {
      font-style: italic;
      color: #cbd5e1;
    }
    .mw-msg-bot ul.mw-md-list {
      margin: 6px 0 8px 0;
      padding-left: 18px;
      list-style-type: disc;
    }
    .mw-msg-bot ul.mw-md-list li {
      margin-bottom: 6px;
      line-height: 1.5;
    }
    .mw-msg-bot ul.mw-md-list li:last-child {
      margin-bottom: 0;
    }
    .mw-md-link {
      color: #818cf8;
      text-decoration: underline;
      text-underline-offset: 3px;
      font-weight: 500;
      word-break: break-all;
      transition: color 0.15s ease;
    }
    .mw-md-link:hover {
      color: #a5b4fc;
      text-decoration-thickness: 2px;
    }
    .mw-md-h3 {
      font-size: 13.5px;
      font-weight: 700;
      color: #f1f5f9;
      margin: 10px 0 6px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 3px;
    }
    .mw-md-num-item {
      margin-bottom: 6px;
      line-height: 1.5;
    }
    .mw-md-num {
      font-weight: 600;
      color: #818cf8;
    }
    .mw-msg-user {
      background: ${primaryColor};
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
      white-space: pre-wrap;
    }
    .mw-pills-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
      align-self: flex-start;
      max-width: 90%;
    }
    .mw-pill {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      padding: 7px 12px;
      border-radius: 12px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mw-pill:hover {
      background: rgba(79, 70, 229, 0.25);
      border-color: rgba(129, 140, 248, 0.6);
      color: #fff;
      transform: translateX(2px);
    }
    .mw-loading-dots {
      display: inline-flex;
      gap: 5px;
      align-items: center;
      padding: 6px 10px;
    }
    .mw-loading-dots span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #818cf8;
      display: inline-block;
      animation: mw-pulse 1.2s infinite ease-in-out both;
    }
    .mw-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .mw-loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes mw-pulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
      40% { transform: scale(1.15); opacity: 1; }
    }
    .mw-widget-input {
      padding: 12px;
      background: #0f172a;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      gap: 8px;
    }
    .mw-widget-input input {
      flex: 1;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 10px 12px;
      color: #fff;
      outline: none;
      font-size: 14px;
    }
    .mw-widget-input input:focus {
      border-color: ${primaryColor};
    }
    .mw-widget-input button {
      background: ${primaryColor};
      border: none;
      color: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      transition: opacity 0.2s;
    }
    .mw-widget-input button:hover {
      opacity: 0.9;
    }

    /* ============================================================
       Template Variations: modern_dark, minimal_light, sidebar_drawer
       ============================================================ */

    /* 1. modern_dark (Default Floating Bubble) */
    .mw-btn-template-modern_dark {
      width: 56px;
      height: 56px;
      border-radius: 50%;
    }
    .mw-template-modern_dark {
      bottom: 90px;
      width: 390px;
      height: 560px;
      border-radius: 16px;
      background: #0f172a;
      color: #f3f4f6;
    }

    /* 2. minimal_light (Crisp Light Theme & Pill Capsule Launcher) */
    .mw-btn-template-minimal_light {
      width: auto !important;
      height: 48px !important;
      border-radius: 28px !important;
      padding: 0 18px !important;
      gap: 8px !important;
      font-size: 13.5px !important;
      font-weight: 600 !important;
      box-shadow: 0 6px 20px rgba(0,0,0,0.18) !important;
    }
    .mw-template-minimal_light {
      bottom: 84px !important;
      width: 390px !important;
      height: 560px !important;
      border-radius: 20px !important;
      background: #ffffff !important;
      color: #1e293b !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 16px 45px rgba(0,0,0,0.15) !important;
    }
    .mw-template-minimal_light .mw-widget-header {
      background: #f8fafc !important;
      border-bottom: 1px solid #e2e8f0 !important;
      color: #0f172a !important;
    }
    .mw-template-minimal_light .mw-widget-messages {
      background: #f8fafc !important;
    }
    .mw-template-minimal_light .mw-msg-bot {
      background: #f1f5f9 !important;
      color: #0f172a !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05) !important;
    }
    .mw-template-minimal_light .mw-msg-bot strong {
      color: #0f172a !important;
    }
    .mw-template-minimal_light .mw-pill {
      background: #ffffff !important;
      border-color: #cbd5e1 !important;
      color: #334155 !important;
    }
    .mw-template-minimal_light .mw-pill:hover {
      background: #eef2ff !important;
      color: #4338ca !important;
    }
    .mw-template-minimal_light .mw-widget-input {
      background: #ffffff !important;
      border-top: 1px solid #e2e8f0 !important;
    }
    .mw-template-minimal_light .mw-widget-input input {
      background: #f8fafc !important;
      border-color: #cbd5e1 !important;
      color: #0f172a !important;
    }

    /* 3. sidebar_drawer (Edge-Docked Full Height Drawer) */
    .mw-btn-template-sidebar_drawer {
      width: auto !important;
      height: 48px !important;
      border-radius: 24px !important;
      padding: 0 18px !important;
      gap: 8px !important;
      font-size: 13.5px !important;
      font-weight: 600 !important;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
    }
    .mw-template-sidebar_drawer {
      top: 0 !important;
      bottom: 0 !important;
      height: 100vh !important;
      max-height: 100vh !important;
      width: 420px !important;
      max-width: 100vw !important;
      border-radius: 0 !important;
      box-shadow: -10px 0 40px rgba(0,0,0,0.6) !important;
      border-left: 1px solid rgba(255,255,255,0.12) !important;
      border-right: none !important;
      border-top: none !important;
      border-bottom: none !important;
    }
    .mw-template-sidebar_drawer .mw-widget-header {
      padding: 20px 18px !important;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, #1e1b4b 100%) !important;
      border-bottom: 1px solid rgba(255,255,255,0.12) !important;
    }
  `;
  document.head.appendChild(style);

  // Widget Elements
  const button = document.createElement('div');
  button.className = 'mw-widget-button';
  button.innerHTML = '💬';

  const box = document.createElement('div');
  box.className = 'mw-widget-box';
  box.innerHTML = `
    <div class="mw-widget-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
        <span id="mw-assistant-name">AI Assistant</span>
      </div>
      <span style="cursor:pointer; font-size:16px; opacity:0.7;" id="mw-close">✕</span>
    </div>
    <div class="mw-widget-messages" id="mw-msgs">
      <div class="mw-msg mw-msg-bot" id="mw-welcome-msg">Hello! How can I assist you today?</div>
      <div class="mw-pills-container" id="mw-pills"></div>
    </div>
    <div class="mw-widget-input">
      <input type="text" id="mw-input" placeholder="Ask a question..." />
      <button id="mw-send">Send</button>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(box);

  button.onclick = () => {
    const isShowing = box.style.display === 'flex';
    box.style.display = isShowing ? 'none' : 'flex';
    if (!isShowing) {
      document.getElementById('mw-input').focus();
    }
  };
  document.getElementById('mw-close').onclick = () => { box.style.display = 'none'; };

  const msgsDiv = document.getElementById('mw-msgs');
  const inputEl = document.getElementById('mw-input');
  const sendBtn = document.getElementById('mw-send');
  const welcomeEl = document.getElementById('mw-welcome-msg');
  const pillsDiv = document.getElementById('mw-pills');
  const nameEl = document.getElementById('mw-assistant-name');

  // Load tenant configuration asynchronously
  async function fetchConfig() {
    try {
      const headers = {};
      if (tenantId) headers['X-Tenant-ID'] = tenantId;

      const res = await fetch(`${apiHost}/api/v1/chat/widget-config`, { headers });
      if (!res.ok) {
        // Unauthorized domain (403), disabled, or error - keep widget completely hidden
        button.style.display = 'none';
        box.style.display = 'none';
        return;
      }
      const data = await res.json();

      // Check if widget is disabled by administrator
      if (data.is_enabled === false) {
        button.style.display = 'none';
        box.style.display = 'none';
        return;
      }

      // Widget is enabled and authorized, display button
      button.style.display = 'flex';

      // Apply chosen UI Template
      const template = data.template || 'modern_dark';
      box.className = `mw-widget-box mw-template-${template}`;
      button.className = `mw-widget-button mw-btn-template-${template}`;

      if (template === 'minimal_light') {
        button.innerHTML = '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span><span>Chat with us</span> 💬';
      } else if (template === 'sidebar_drawer') {
        button.innerHTML = '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span><span>Ask AI Assistant</span> 💬';
      } else {
        button.innerHTML = '💬';
      }

      // Screen Position
      if (template === 'sidebar_drawer') {
        if (data.position === 'bottom-left') {
          button.style.left = '24px';
          button.style.right = 'auto';
          box.style.left = '0';
          box.style.right = 'auto';
          box.style.borderRight = '1px solid rgba(255,255,255,0.12)';
          box.style.borderLeft = 'none';
        } else {
          button.style.right = '24px';
          button.style.left = 'auto';
          box.style.right = '0';
          box.style.left = 'auto';
          box.style.borderLeft = '1px solid rgba(255,255,255,0.12)';
          box.style.borderRight = 'none';
        }
      } else {
        if (data.position === 'bottom-left') {
          button.style.left = '24px';
          button.style.right = 'auto';
          box.style.left = '24px';
          box.style.right = 'auto';
        } else {
          button.style.right = '24px';
          button.style.left = 'auto';
          box.style.right = '24px';
          box.style.left = 'auto';
        }
      }

      // Brand Primary Color
      if (data.primary_color) {
        primaryColor = data.primary_color;
        button.style.background = primaryColor;
        if (sendBtn) sendBtn.style.background = primaryColor;
      }

      if (data.assistant_name && nameEl) {
        nameEl.textContent = data.assistant_name;
      }
      if (data.welcome_message && welcomeEl && !hasUserSentMessage) {
        welcomeEl.innerHTML = renderMarkdown(data.welcome_message);
      }
      if (data.suggested_questions && data.suggested_questions.length > 0 && pillsDiv && !hasUserSentMessage) {
        pillsDiv.innerHTML = '';
        data.suggested_questions.forEach(q => {
          if (!q || !q.trim()) return;
          const pill = document.createElement('button');
          pill.className = 'mw-pill';
          pill.innerHTML = `<span>💬</span> <span>${q.trim()}</span>`;
          pill.onclick = () => {
            inputEl.value = q.trim();
            sendMessage();
          };
          pillsDiv.appendChild(pill);
        });
      }
    } catch (e) {
      console.warn('Mediusware widget config fetch error:', e);
      button.style.display = 'none';
      box.style.display = 'none';
    }
  }

  fetchConfig();

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    hasUserSentMessage = true;

    // Hide suggested pills after first message
    if (pillsDiv) {
      pillsDiv.style.display = 'none';
    }

    const userMsg = document.createElement('div');
    userMsg.className = 'mw-msg mw-msg-user';
    userMsg.style.background = primaryColor;
    userMsg.textContent = text;
    msgsDiv.appendChild(userMsg);
    msgsDiv.scrollTop = msgsDiv.scrollHeight;

    const botMsg = document.createElement('div');
    botMsg.className = 'mw-msg mw-msg-bot';
    botMsg.innerHTML = '<span class="mw-loading-dots"><span></span><span></span><span></span></span>';
    msgsDiv.appendChild(botMsg);
    msgsDiv.scrollTop = msgsDiv.scrollHeight;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (tenantId) headers['X-Tenant-ID'] = tenantId;

      const response = await fetch(`${apiHost}/api/v1/chat/messages/stream`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        if (response.status === 403) {
          botMsg.textContent = 'This domain is not authorized to query this assistant.';
        } else {
          botMsg.textContent = `Server error (${response.status}). Please check API host or tenant configuration.`;
        }
        return;
      }

      if (!response.body) {
        botMsg.textContent = 'Response error.';
        return;
      }

      let fullRawText = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let hasReceivedData = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.slice(6);
            if (!hasReceivedData) {
              botMsg.innerHTML = '';
              hasReceivedData = true;
            }
            fullRawText += token;
            botMsg.innerHTML = renderMarkdown(fullRawText);
            msgsDiv.scrollTop = msgsDiv.scrollHeight;
          }
        }
      }

      if (!hasReceivedData) {
        botMsg.textContent = 'No response received. Please try again.';
      }
    } catch (err) {
      botMsg.textContent = 'Connection error. Please try again.';
    }
  }

  sendBtn.onclick = sendMessage;
  inputEl.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
})();
