(function () {
  if (window.MediuswareBotWidgetLoaded || document.querySelector('.mw-widget-button')) return;
  window.MediuswareBotWidgetLoaded = true;

  const scriptTag = document.currentScript || document.querySelector('script[data-tenant-id]');
  const tenantId = scriptTag ? scriptTag.getAttribute('data-tenant-id') || '' : '';
  const rawApiHost = scriptTag ? (scriptTag.getAttribute('data-api-host') || window.location.origin) : window.location.origin;
  const apiHost = rawApiHost.replace(/\/$/, '');
  let primaryColor = scriptTag ? (scriptTag.getAttribute('data-color') || '#4F46E5') : '#4F46E5';
  let hasUserSentMessage = false;

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
      width: 380px;
      max-width: 90vw;
      height: 540px;
      max-height: 80vh;
      background: #0f172a;
      color: #f3f4f6;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      display: none;
      flex-direction: column;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .mw-widget-header {
      padding: 16px;
      background: rgba(30, 41, 59, 0.8);
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
      gap: 12px;
      background: #0b1120;
    }
    .mw-msg {
      max-width: 84%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .mw-msg-bot {
      background: rgba(30, 41, 59, 0.9);
      color: #e2e8f0;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .mw-msg-user {
      background: ${primaryColor};
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .mw-pills-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
      align-self: flex-start;
      max-width: 88%;
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
      gap: 3px;
      align-items: center;
      padding: 2px 4px;
    }
    .mw-loading-dots span {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #94a3b8;
      display: inline-block;
      animation: mw-pulse 1.4s infinite ease-in-out both;
    }
    .mw-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .mw-loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes mw-pulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1.1); opacity: 1; }
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
        // Fallback display if request fails
        button.style.display = 'flex';
        return;
      }
      const data = await res.json();

      // Check if widget is disabled by administrator
      if (data.is_enabled === false) {
        button.style.display = 'none';
        box.style.display = 'none';
        return;
      }

      // Widget is enabled, display button
      button.style.display = 'flex';

      // Screen Position
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
        welcomeEl.textContent = data.welcome_message;
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
      button.style.display = 'flex';
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
        botMsg.textContent = `Server error (${response.status}). Please check API host or tenant configuration.`;
        return;
      }

      if (!response.body) {
        botMsg.textContent = 'Response error.';
        return;
      }

      botMsg.textContent = '';
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
            botMsg.textContent += line.slice(6);
            hasReceivedData = true;
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
