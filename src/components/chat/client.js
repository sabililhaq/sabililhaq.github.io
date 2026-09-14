import { censorMessage } from './filter.ts';

let WS_URL = (() => {
	try {
		const stored = localStorage.getItem('chat_ws_url');
		if (stored) return stored;
		const host = location.hostname;
		if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
			return 'ws://127.0.0.1:8080';
		}
		return 'wss://ws.sabililhaq.com';
	} catch {
		return 'wss://ws.sabililhaq.com';
	}
})();

const nicknameEl = document.getElementById('nickname');
const presenceEl = document.getElementById('presence');
const infoToggle = document.getElementById('info-toggle');
const infoPanel = document.getElementById('info-panel');
const configToggle = document.getElementById('config-toggle');
const configPanel = document.getElementById('config-panel');
const wsUrlInput = document.getElementById('ws-url-input');
const wsUrlSave = document.getElementById('ws-url-save');
const expirationEl = document.getElementById('expiration-seconds');
const messagesEl = document.getElementById('messages');
const emptyEl = document.getElementById('messages-empty');
const composer = document.getElementById('composer');
const input = document.getElementById('message-input');
const sendButton = composer?.querySelector('button');
const statusEl = document.getElementById('status');

let expirationSeconds = 30;
let selfNickname = '';
let lastNickname = '';
let ws = null;
let isConnected = false;
const widgetEl = document.querySelector('.chat-widget');
let connectTimer = null;
let retryTimer = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 8;
let permanentlyDisabled = false;

function setPresence(count) {
	if (!presenceEl) return;
	if (typeof count !== 'number' || !Number.isFinite(count) || count < 1) {
		presenceEl.hidden = true;
		presenceEl.textContent = '';
		return;
	}
	const n = Math.floor(count);
	presenceEl.textContent = n === 1 ? '1 online' : `${n} online`;
	presenceEl.hidden = false;
}

function clearPresence() {
	setPresence(0);
}

if (configToggle && configPanel) {
	configToggle.addEventListener('click', () => {
		const expanded = configToggle.getAttribute('aria-expanded') === 'true';
		configToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
		if (expanded) {
			configPanel.hidden = true;
		} else {
			configPanel.hidden = false;
			if (infoPanel) {
				infoPanel.hidden = true;
				if (infoToggle) infoToggle.setAttribute('aria-expanded', 'false');
			}
			if (wsUrlInput) wsUrlInput.value = WS_URL;
		}
	});
}

if (wsUrlSave && wsUrlInput) {
	wsUrlSave.addEventListener('click', () => {
		const newUrl = wsUrlInput.value.trim();
		if (newUrl) {
			WS_URL = newUrl;
			try { localStorage.setItem('chat_ws_url', newUrl); } catch (e) {}

			permanentlyDisabled = false;
			reconnectAttempts = 0;
			if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }

			if (ws) {
				ws.close();
				ws = null;
			}
			connect();

			configPanel.hidden = true;
			configToggle.setAttribute('aria-expanded', 'false');
		}
	});
}

// Wire info-panel toggle behavior: keep `aria-expanded` and `hidden` in sync.
if (infoToggle && infoPanel) {
	infoToggle.addEventListener('click', () => {
		const expanded = infoToggle.getAttribute('aria-expanded') === 'true';
		infoToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
		if (expanded) {
			infoPanel.hidden = true;
		} else {
			infoPanel.hidden = false;
			if (configPanel) {
				configPanel.hidden = true;
				if (configToggle) configToggle.setAttribute('aria-expanded', 'false');
			}
		}
	});
}

function setStatus(message, kind = 'info') {
	if (!statusEl) return;
	statusEl.textContent = message;
	if (!message) {
		delete statusEl.dataset.kind;
		return;
	}
	statusEl.dataset.kind = kind;
}

function syncEmptyState() {
	const hasMessages = Boolean(messagesEl?.children.length);
	if (emptyEl) emptyEl.hidden = hasMessages;
	if (messagesEl) messagesEl.hidden = !hasMessages;
}

function isOwnMessage(msg) {
	return Boolean(selfNickname && msg.nickname === selfNickname);
}

function whoLabel(msg) {
	if (msg.local) return 'you (local): ';
	return isOwnMessage(msg) ? `${msg.nickname} (you): ` : `${msg.nickname}: `;
}

function renderMessage(msg) {
	const li = document.createElement('li');
	li.dataset.ts = String(msg.ts);
	li.dataset.id = msg.id;
	if (isOwnMessage(msg) || msg.local) li.classList.add('mine');
	if (msg.local) li.classList.add('local');

	const who = document.createElement('span');
	who.className = 'who';
	who.textContent = whoLabel(msg);

	const text = document.createElement('span');
	text.className = 'text';
	text.textContent = msg.text;

	li.append(who, text);
	messagesEl.appendChild(li);
	syncEmptyState();
	messagesEl.scrollTop = messagesEl.scrollHeight;
}

function upsertMessage(msg) {
	// Deduplicate by message id: replace existing, otherwise append.
	const existing = messagesEl.querySelector(`li[data-id="${msg.id}"]`);
	if (existing) {
		existing.dataset.ts = String(msg.ts);
		existing.classList.toggle('mine', isOwnMessage(msg));
		const who = existing.querySelector('.who');
		const text = existing.querySelector('.text');
		if (who) who.textContent = whoLabel(msg);
		if (text) text.textContent = msg.text;
		return;
	}
	renderMessage(msg);
}

function sweepExpired() {
	const cutoff = Date.now() - expirationSeconds * 1000;
	for (const li of Array.from(messagesEl.children)) {
		if (Number(li.dataset.ts) < cutoff) li.remove();
	}
	syncEmptyState();
}
setInterval(sweepExpired, 1000);

function connect() {
	if (permanentlyDisabled) return;
	// Prevent creating multiple sockets simultaneously.
	if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
	setStatus('Connecting…');
	clearPresence();
	isConnected = false;
	widgetEl?.classList.add('inactive');
	if (connectTimer) clearTimeout(connectTimer);
	if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
	widgetEl?.classList.remove('offline');
	connectTimer = setTimeout(() => {
		if (!isConnected) {
			setStatus('Offline mode, you can still chat.', 'offline');
			widgetEl?.classList.remove('inactive');
			widgetEl?.classList.add('offline');
		}
	}, 5000);
	ws = new WebSocket(WS_URL);
	let socketHandled = false;

	ws.addEventListener('open', () => {
		isConnected = true;
		reconnectAttempts = 0;
		permanentlyDisabled = false;
		if (connectTimer) { clearTimeout(connectTimer); connectTimer = null; }
		widgetEl?.classList.remove('inactive');
		widgetEl?.classList.remove('offline');
		setStatus('');
		if (input) input.disabled = false;
		if (sendButton) {
			sendButton.disabled = false;
			sendButton.classList.remove('sending');
		}
	});

	ws.addEventListener('message', (event) => {
		const data = JSON.parse(event.data);

		switch (data.type) {
			case 'welcome':
				selfNickname = data.nickname;
				if (lastNickname && data.nickname && lastNickname !== data.nickname) {
					setStatus(`Rejoined as ${data.nickname}.`);
				}
				lastNickname = data.nickname;
				if (nicknameEl) {
					nicknameEl.textContent = data.nickname;
				}
				expirationSeconds = data.config.expirationSeconds;
				if (expirationEl) {
					expirationEl.textContent = String(expirationSeconds);
				}
				break;

			case 'backlog':
				if (Array.isArray(data.messages)) {
					for (const msg of data.messages) {
						upsertMessage(msg);
					}
				}
				break;

			case 'presence':
				setPresence(data.count);
				break;

			case 'ping':
				ws.send(JSON.stringify({ type: 'pong' }));
				break;

			case 'message':
				upsertMessage(data.message);
				break;

			case 'error':
				// Surface server-side rejection reason to users in the widget.
				setStatus(String(data.reason ?? 'Server error'), 'error');
				break;

			default:
				console.warn('[chat] unknown message type:', data);
		}
	});

	ws.addEventListener('close', (event) => {
		if (socketHandled) return; socketHandled = true;
		console.warn('[chat] closed:', event);
		ws = null;
		isConnected = false;
		clearPresence();
		if (connectTimer) { clearTimeout(connectTimer); connectTimer = null; }
		widgetEl?.classList.add('inactive');

		reconnectAttempts += 1;
		if (reconnectAttempts >= maxReconnectAttempts) {
			permanentlyDisabled = true;
			if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
			widgetEl?.classList.remove('offline');
			setStatus('Chat unavailable, server appears disabled.', 'error');
			if (input) input.disabled = true;
			if (sendButton) sendButton.disabled = true;
			return;
		}

		setStatus('Disconnected. Reconnecting…');
		if (retryTimer) { clearTimeout(retryTimer); }
		retryTimer = setTimeout(connect, 5000);
	});

	ws.addEventListener('error', (error) => {
		if (socketHandled) return; socketHandled = true;
		console.error('[chat] error:', error);
		isConnected = false;
		clearPresence();
		if (connectTimer) { clearTimeout(connectTimer); connectTimer = null; }
		widgetEl?.classList.add('inactive');

		reconnectAttempts += 1;
		if (reconnectAttempts >= maxReconnectAttempts) {
			permanentlyDisabled = true;
			if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
			widgetEl?.classList.remove('offline');
			setStatus('Chat unavailable, server appears disabled.', 'error');
			if (input) input.disabled = true;
			if (sendButton) sendButton.disabled = true;
			return;
		}

		setStatus('Error. Reconnecting…');
		if (retryTimer) { clearTimeout(retryTimer); }
		retryTimer = setTimeout(connect, 5000);
	});
}

composer.addEventListener('submit', (event) => {
	event.preventDefault();

	const text = input.value.trim();
	if (!text || permanentlyDisabled) return;

	const { censored } = censorMessage(text);
	setStatus('');
	const message = { type: 'message', text: censored };
	if (ws && ws.readyState === WebSocket.OPEN) {
		if (sendButton) sendButton.classList.add('sending');
		ws.send(JSON.stringify(message));
		input.value = '';
		setTimeout(() => {
			if (sendButton) sendButton.classList.remove('sending');
		}, 300);
	} else {
		const localMsg = {
			id: 'local-' + Math.random().toString(36).slice(2, 9),
			ts: Date.now(),
			nickname: selfNickname || (nicknameEl && nicknameEl.textContent) || 'You',
			text: censored,
			local: true,
		};
		renderMessage(localMsg);
		setStatus('Not connected, message shown locally.', 'offline');
		input.value = '';
	}
});

syncEmptyState();
connect();
