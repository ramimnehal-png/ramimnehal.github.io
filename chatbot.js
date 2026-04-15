/* ============================================
   EVER AGENT — Conversational Chatbot Engine
   ============================================
   No API needed. Pattern-matched responses with
   agentic personality, typing delay, and voice.
   ============================================ */

(function () {
    'use strict';

    // ── Agent personality & knowledge base ──
    const AGENT_NAME = 'Eve';
    const TYPING_MIN = 600;
    const TYPING_MAX = 1800;

    // Conversation memory
    let conversationState = {
        userName: null,
        askedName: false,
        messageCount: 0,
        topics: [],
        lastTopic: null,
    };

    // ── Response patterns ──
    const patterns = [
        // Greetings
        {
            match: /^(hi|hello|hey|howdy|yo|sup|hola|assalamualaikum|salam|greetings)/i,
            responses: [
                () => conversationState.userName
                    ? `Hey ${conversationState.userName}! 👋 Good to see you again. What can I help you with?`
                    : `Hey there! 👋 I'm ${AGENT_NAME}, the Ever intelligence agent. I'm here to help you learn about what we're building. What's your name?`,
                () => conversationState.userName
                    ? `Welcome back, ${conversationState.userName}! What's on your mind today?`
                    : `Hello! 😊 I'm ${AGENT_NAME}. Before we dive in — what should I call you?`,
            ],
            action: () => { if (!conversationState.userName) conversationState.askedName = true; },
            followUp: () => conversationState.userName ? null : null,
        },

        // Name capture
        {
            match: /^(my name is|i'm|i am|call me|it's|its)\s+(.+)/i,
            responses: [
                (m) => { const name = m[2].trim().split(' ')[0]; return `Great to meet you, ${name}! 🤝 So, what brings you to Ever today? I can tell you about our intelligence layer, the roadmap, or how we're different from anything else out there.`; },
            ],
            action: (m) => { conversationState.userName = m[2].trim().split(' ')[0]; conversationState.askedName = false; },
            chips: ['What is Ever?', 'Show me the roadmap', 'How is it different?'],
        },

        // Catch standalone names when we asked
        {
            match: /^([a-zA-Z]{2,15})$/,
            condition: () => conversationState.askedName,
            responses: [
                (m) => `Nice to meet you, ${m[1]}! 🤝 What would you like to know about Ever?`,
            ],
            action: (m) => { conversationState.userName = m[1]; conversationState.askedName = false; },
            chips: ['What is Ever?', 'Tell me about the moat', 'How can I contact you?'],
        },

        // What is Ever
        {
            match: /what.*(is|about).*ever|tell.*about.*ever|explain.*ever|what.*do.*you.*do|what.*does.*ever/i,
            responses: [
                `Ever is an AI intelligence layer purpose-built for high-ticket retail. Think of it as the brain behind premium product conversations — it guides trust, qualification, and decision-making so buyers get truth, not guesswork.\n\nWe use RAG (Retrieval-Augmented Generation) to ground every response in real inventory data and verified business knowledge.`,
                `Great question! Ever is essentially a smart AI layer that sits on top of premium retail conversations. Instead of generic chatbot replies, Ever delivers truth-bound answers connected to actual product data, specs, and authenticity records.\n\nIt's built specifically for high-ticket markets in South Asia.`,
            ],
            chips: ['What makes it different?', 'Tell me about the roadmap', 'Who built this?'],
        },

        // Moat / differentiator
        {
            match: /moat|different|unique|special|compet|advantage|stand.*out|why.*ever/i,
            responses: [
                `Ever has four key differentiators:\n\n🔐 **Authenticity Proof** — Serial-linked validation so customers can verify products before doubt kills momentum.\n\n🎯 **Multimodal Input** — Text, image, and context-aware intake for natural interaction.\n\n📊 **RAG Truth Layer** — Grounded in real inventory and verified data.\n\n🌏 **South Asian Optimization** — Localized for mixed-language behavior and regional trust patterns.`,
                `What makes Ever special? In one line: we don't guess, we verify.\n\nMost retail AI just generates responses. Ever connects to actual product truth — serial numbers, specifications, inventory. And it's fine-tuned for South Asian premium retail behavior, which no one else is doing.`,
            ],
            chips: ['Tell me about RAG', 'What is the roadmap?', 'Contact the team'],
        },

        // RAG
        {
            match: /rag|retrieval|knowledge.*base|ground|hallucin/i,
            responses: [
                `RAG stands for Retrieval-Augmented Generation. Instead of the AI making things up, it first retrieves verified data — product specs, inventory records, authenticity certificates — and then generates a response grounded in that truth.\n\nThis is critical for high-ticket retail where a wrong answer can cost a sale worth thousands.`,
            ],
            chips: ['How does verification work?', 'Back to basics — what is Ever?'],
        },

        // Roadmap
        {
            match: /roadmap|phase|plan|future|timeline|when|launch|coming/i,
            responses: [
                `Here's our phase architecture:\n\n**Phase A: Signal Foundation**\nCollection of high-intent retail queries, product truth structuring, and defining the trust-bound response system.\n\n**Phase B: Multimodal Layer**\nExpanding from text to image and contextual product signals.\n\n**Phase C: Market Tuning**\nRegional behavior refinement, language mixing, and South Asian commerce nuance.\n\n**Phase D: Retail Operating Brain**\nThe always-on intelligence layer bridging discovery, trust, and conversion.`,
            ],
            chips: ['What phase are you in?', 'How can I get involved?', 'Contact the team'],
        },

        // Current phase
        {
            match: /current.*phase|what.*phase|where.*are|stage|progress/i,
            responses: [
                `We're currently in the early stages of Phase A — laying the signal foundation. This means collecting and structuring high-intent retail data, and building the first truth-bound response system.\n\nThe infrastructure is being built with scale in mind from day one.`,
            ],
            chips: ['What comes next?', 'How can I help?'],
        },

        // South Asia / regional
        {
            match: /south.*asia|bangladesh|dhaka|bangla|bengali|regional|local|bangla.*desh/i,
            responses: [
                `Ever is specifically optimized for South Asian premium retail. This means:\n\n• Mixed-language support (Bangla + English blending)\n• Regional trust signal understanding\n• Premium buying behavior patterns unique to the market\n• Cultural nuance in product conversations\n\nThis is an underserved market with massive high-ticket retail potential — and no one is building intelligence for it.`,
            ],
            chips: ['Tell me more about the product', 'Contact the team'],
        },

        // Contact / get in touch
        {
            match: /contact|reach|email|mail|connect|touch|talk.*team|get.*hold/i,
            responses: [
                () => `You can reach us through:\n\n📧 **Email:** contact@prachchaw.me\n📸 **Instagram:** [@prachchaw](https://www.instagram.com/prachchaw/)\n📘 **Facebook:** [Ramim Nehal](https://web.facebook.com/ramim.nehal)\n\n${conversationState.userName ? `I'll make sure the team knows you reached out, ${conversationState.userName}.` : 'Feel free to reach out anytime!'}`,
            ],
            chips: ['Back to Ever', 'Tell me about the moat'],
        },

        // Pricing
        {
            match: /price|pricing|cost|charge|fee|afford|money|budget|pay/i,
            responses: [
                `Ever is still in its foundational phase, so official pricing isn't set yet. The model will likely be tailored to high-ticket retail operators — think boutique pricing for boutique intelligence.\n\nWant to be notified when we launch? Drop us a line at contact@prachchaw.me.`,
            ],
            chips: ['What is Ever?', 'Contact the team'],
        },

        // Who built this / team
        {
            match: /who.*(built|made|created|behind|develop|founder)|team|creator/i,
            responses: [
                `Ever is being built by Ramim Nehal — a builder focused on the intersection of AI and premium commerce in South Asia. The vision is to create the definitive intelligence layer for high-ticket retail conversations.\n\nYou can connect with Ramim on [Facebook](https://web.facebook.com/ramim.nehal) or [Instagram](https://www.instagram.com/prachchaw/).`,
            ],
            chips: ['What is Ever?', 'See the roadmap'],
        },

        // How to help / invest / join
        {
            match: /help|invest|join|partner|collaborat|contribute|work.*with/i,
            responses: [
                () => `That's exciting to hear${conversationState.userName ? ', ' + conversationState.userName : ''}! 🚀\n\nThe best way to get involved right now is to reach out directly:\n📧 contact@prachchaw.me\n\nWhether it's partnership, investment, or just ideas — we're open to genuine conversations about building the future of retail intelligence.`,
            ],
            chips: ['Tell me more about Ever', 'See the roadmap'],
        },

        // Thanks / appreciation
        {
            match: /thank|thanks|thx|appreciate|helpful|great.*help|awesome/i,
            responses: [
                () => `You're welcome${conversationState.userName ? ', ' + conversationState.userName : ''}! 😊 If anything else comes to mind, I'm right here. Always happy to help.`,
                `Glad I could help! If you have more questions later, just open the chat. I'm always here. ✨`,
            ],
            chips: ['Tell me more about Ever', 'Contact the team'],
        },

        // Bye
        {
            match: /bye|goodbye|see.*you|later|gotta.*go|peace|cya/i,
            responses: [
                () => `See you around${conversationState.userName ? ', ' + conversationState.userName : ''}! 👋 The door's always open.`,
                `Take care! If you ever need anything, I'm just a click away. ✨`,
            ],
        },

        // AI / tech
        {
            match: /ai|artificial.*intell|machine.*learn|model|gpt|llm|neural|deep.*learn/i,
            responses: [
                `Ever leverages AI at its core — specifically RAG (Retrieval-Augmented Generation) to ensure truth-bound responses. Rather than relying on a generic LLM, the system grounds every answer in verified retail data.\n\nThe architecture is being designed to be model-agnostic, so we can plug in the best available intelligence as the field evolves.`,
            ],
            chips: ['What is RAG?', 'See the roadmap', 'What makes Ever different?'],
        },

        // How are you / small talk
        {
            match: /how.*are.*you|how.*doing|what's.*up|whats.*up/i,
            responses: [
                `I'm doing great — circuits humming, knowledge base loaded, ready to chat! 😄 What would you like to know about Ever?`,
                `All systems online! Thanks for asking. What can I help you explore today?`,
            ],
            chips: ['What is Ever?', 'Show me the roadmap', 'Contact info'],
        },

        // Joke / fun
        {
            match: /joke|funny|humor|laugh|entertain|bored/i,
            responses: [
                `Why did the AI go to retail school?\n\nBecause it wanted to learn the *real* value of things, not just make them up! 😄\n\n...Okay, back to business. What can I help you with?`,
            ],
            chips: ['What is Ever?', 'Tell me something cool'],
        },

        // Cool / interesting facts
        {
            match: /cool|interesting|fact|something.*cool|surprise|wow/i,
            responses: [
                `Here's something interesting: the high-ticket retail market in South Asia is expected to grow significantly, but the intelligence infrastructure for it is nearly nonexistent. That's the gap Ever is designed to fill.\n\nWe're building the brain before the body. Most startups do it the other way around.`,
            ],
            chips: ['Tell me more', 'See the roadmap'],
        },
    ];

    // Fallback responses
    const fallbacks = [
        () => `Interesting question${conversationState.userName ? ', ' + conversationState.userName : ''}! I'm best at answering things about Ever — our AI retail intelligence layer. Want me to walk you through what we do?`,
        `I'm not sure I have the perfect answer for that right now. I'm designed to help with questions about Ever — the intelligence layer for high-ticket retail. Try asking about our moat, roadmap, or what makes us different! 🤓`,
        `That's a bit outside my knowledge base at the moment. I'm Ever's agent, so I'm sharpest on topics like our product, roadmap, and how to get in touch. What would you like to explore?`,
    ];

    // ── Utility functions ──
    function randomPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getTimeString() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function typingDelay(text) {
        const base = Math.min(TYPING_MIN + text.length * 8, TYPING_MAX);
        return base + Math.random() * 400;
    }

    // ── Find matching response ──
    function getResponse(input) {
        const trimmed = input.trim();

        for (const pattern of patterns) {
            if (pattern.condition && !pattern.condition()) continue;
            const match = trimmed.match(pattern.match);
            if (match) {
                if (pattern.action) pattern.action(match);
                const resp = randomPick(pattern.responses);
                const text = typeof resp === 'function' ? resp(match) : resp;
                return { text, chips: pattern.chips || null };
            }
        }

        // Fallback
        conversationState.messageCount++;
        const resp = randomPick(fallbacks);
        return {
            text: typeof resp === 'function' ? resp() : resp,
            chips: ['What is Ever?', 'The moat', 'Roadmap', 'Contact'],
        };
    }

    // ── DOM Creation ──
    function createChatWidget() {
        // FAB Button
        const fab = document.createElement('button');
        fab.className = 'chat-fab';
        fab.id = 'chat-fab';
        fab.setAttribute('aria-label', 'Open chat');
        fab.innerHTML = `
            <svg class="fab-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <svg class="fab-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        `;

        // Chat Window
        const win = document.createElement('div');
        win.className = 'chat-window';
        win.id = 'chat-window';
        win.innerHTML = `
            <div class="chat-header">
                <div class="chat-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 8V4H8"/>
                        <rect width="16" height="12" x="4" y="8" rx="2"/>
                        <path d="M2 14h2"/>
                        <path d="M20 14h2"/>
                        <path d="M15 13v2"/>
                        <path d="M9 13v2"/>
                    </svg>
                </div>
                <div class="chat-header-info">
                    <div class="chat-agent-name">${AGENT_NAME} · Ever Agent</div>
                    <div class="chat-agent-status">
                        <span>●</span> Online now
                    </div>
                </div>
                <div class="chat-header-actions">
                    <button class="chat-header-btn" id="voice-agent-btn" aria-label="Voice agent" title="Talk to ${AGENT_NAME}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" x2="12" y1="19" y2="22"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="chat-messages" id="chat-messages"></div>

            <div class="chat-input-area">
                <button class="chat-mic-btn" id="chat-mic-btn" aria-label="Voice input" title="Hold to speak">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" x2="12" y1="19" y2="22"/>
                    </svg>
                </button>
                <textarea class="chat-input" id="chat-input" placeholder="Ask ${AGENT_NAME} anything..." rows="1"></textarea>
                <button class="chat-send-btn" id="chat-send-btn" aria-label="Send message" disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        `;

        // Voice Agent Overlay
        const overlay = document.createElement('div');
        overlay.className = 'voice-overlay';
        overlay.id = 'voice-overlay';
        overlay.innerHTML = `
            <button class="voice-close-btn" id="voice-close-btn" aria-label="Close voice agent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>

            <div class="voice-orb-container">
                <span class="voice-ring"></span>
                <span class="voice-ring"></span>
                <span class="voice-ring"></span>
                <button class="voice-orb" id="voice-orb" aria-label="Start voice conversation">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" x2="12" y1="19" y2="22"/>
                    </svg>
                </button>
            </div>

            <div class="voice-status" id="voice-status">Tap to start speaking</div>
            <div class="voice-status-sub" id="voice-status-sub">Powered by ${AGENT_NAME} · Ever Intelligence</div>
            <div class="voice-transcript" id="voice-transcript"></div>
        `;

        document.body.appendChild(fab);
        document.body.appendChild(win);
        document.body.appendChild(overlay);
    }

    // ── Chat Engine ──
    let messagesEl, inputEl, sendBtn;

    function init() {
        createChatWidget();

        const fab = document.getElementById('chat-fab');
        const chatWindow = document.getElementById('chat-window');
        messagesEl = document.getElementById('chat-messages');
        inputEl = document.getElementById('chat-input');
        sendBtn = document.getElementById('chat-send-btn');
        const micBtn = document.getElementById('chat-mic-btn');
        const voiceAgentBtn = document.getElementById('voice-agent-btn');

        // Toggle chat
        fab.addEventListener('click', () => {
            const isOpen = chatWindow.classList.toggle('is-visible');
            fab.classList.toggle('is-open', isOpen);
            fab.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');

            if (isOpen && messagesEl.children.length === 0) {
                // First open: welcome message
                setTimeout(() => {
                    addAgentMessage(`Hey! 👋 I'm ${AGENT_NAME}, the Ever intelligence agent. I can tell you about our AI retail layer, the roadmap, or answer any questions.\n\nWhat would you like to know?`);
                    showChips(['What is Ever?', 'The roadmap', 'How is it different?', 'Contact']);
                }, 400);
            }

            if (isOpen) {
                setTimeout(() => inputEl.focus(), 350);
            }
        });

        // Input handling
        inputEl.addEventListener('input', () => {
            sendBtn.disabled = inputEl.value.trim().length === 0;
            // Auto-resize
            inputEl.style.height = 'auto';
            inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
        });

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendBtn.addEventListener('click', sendMessage);

        // Voice input in chat (mic button)
        initVoiceInput(micBtn);

        // Voice agent overlay
        initVoiceAgent(voiceAgentBtn);
    }

    function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;

        addUserMessage(text);
        inputEl.value = '';
        inputEl.style.height = 'auto';
        sendBtn.disabled = true;

        // Remove old chips
        clearChips();

        // Show typing
        const typingEl = showTyping();

        const response = getResponse(text);
        conversationState.messageCount++;

        setTimeout(() => {
            removeTyping(typingEl);
            addAgentMessage(response.text);
            if (response.chips) {
                showChips(response.chips);
            }
        }, typingDelay(response.text));
    }

    function addUserMessage(text) {
        const el = document.createElement('div');
        el.className = 'chat-msg user';
        el.innerHTML = `${escapeHTML(text)}<span class="chat-msg-time">${getTimeString()}</span>`;
        messagesEl.appendChild(el);
        scrollToBottom();
    }

    function addAgentMessage(text) {
        const el = document.createElement('div');
        el.className = 'chat-msg agent';
        // Support basic markdown bold
        let html = escapeHTML(text)
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">$1</a>')
            .replace(/\n/g, '<br>');
        el.innerHTML = `${html}<span class="chat-msg-time">${getTimeString()}</span>`;
        messagesEl.appendChild(el);
        scrollToBottom();
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
        messagesEl.appendChild(el);
        scrollToBottom();
        return el;
    }

    function removeTyping(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function showChips(chips) {
        clearChips();
        const container = document.createElement('div');
        container.className = 'chat-chips';
        container.id = 'chat-chips';
        chips.forEach(label => {
            const btn = document.createElement('button');
            btn.className = 'chat-chip';
            btn.textContent = label;
            btn.addEventListener('click', () => {
                inputEl.value = label;
                sendMessage();
            });
            container.appendChild(btn);
        });
        messagesEl.appendChild(container);
        scrollToBottom();
    }

    function clearChips() {
        const existing = document.getElementById('chat-chips');
        if (existing) existing.remove();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            messagesEl.scrollTop = messagesEl.scrollHeight;
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Voice Input (in-chat mic) ──
    function initVoiceInput(micBtn) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            micBtn.style.display = 'none';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        let isListening = false;

        micBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
                return;
            }

            recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                isListening = true;
                micBtn.classList.add('is-listening');
                inputEl.placeholder = 'Listening...';
            };

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                inputEl.value = transcript;
                sendBtn.disabled = transcript.trim().length === 0;
            };

            recognition.onend = () => {
                isListening = false;
                micBtn.classList.remove('is-listening');
                inputEl.placeholder = `Ask ${AGENT_NAME} anything...`;
                // Auto-send if we got something
                if (inputEl.value.trim()) {
                    sendMessage();
                }
            };

            recognition.onerror = () => {
                isListening = false;
                micBtn.classList.remove('is-listening');
                inputEl.placeholder = `Ask ${AGENT_NAME} anything...`;
            };

            recognition.start();
        });
    }

    // ── Voice Agent (full-screen overlay) ──
    function initVoiceAgent(triggerBtn) {
        const overlay = document.getElementById('voice-overlay');
        const orb = document.getElementById('voice-orb');
        const closeBtn = document.getElementById('voice-close-btn');
        const statusEl = document.getElementById('voice-status');
        const subEl = document.getElementById('voice-status-sub');
        const transcriptEl = document.getElementById('voice-transcript');

        const hasSpeech = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
        const hasSynth = 'speechSynthesis' in window;

        if (!hasSpeech) {
            triggerBtn.style.display = 'none';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        let voiceListening = false;

        function openOverlay() {
            overlay.classList.add('is-active');
            statusEl.textContent = 'Tap the orb to start speaking';
            subEl.textContent = `Powered by ${AGENT_NAME} · Ever Intelligence`;
            transcriptEl.textContent = '';
        }

        function closeOverlay() {
            overlay.classList.remove('is-active', 'is-listening');
            if (recognition && voiceListening) {
                recognition.stop();
            }
            if (hasSynth) speechSynthesis.cancel();
        }

        function speak(text) {
            if (!hasSynth) return;
            speechSynthesis.cancel();
            const cleanText = text.replace(/\*\*/g, '').replace(/\[(.+?)\]\(.+?\)/g, '$1').replace(/[🔐🎯📊🌏📧📸📘👋🤝😊✨😄🚀🤓]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 0.95;
            utterance.pitch = 1.0;

            // Try to pick a good voice
            const voices = speechSynthesis.getVoices();
            const preferred = voices.find(v => v.name.includes('Samantha')) ||
                              voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                              voices.find(v => v.lang.startsWith('en'));
            if (preferred) utterance.voice = preferred;

            statusEl.textContent = `${AGENT_NAME} is speaking...`;
            overlay.classList.remove('is-listening');

            utterance.onend = () => {
                statusEl.textContent = 'Tap the orb to speak again';
            };

            speechSynthesis.speak(utterance);
        }

        triggerBtn.addEventListener('click', openOverlay);
        closeBtn.addEventListener('click', closeOverlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay();
        });

        orb.addEventListener('click', () => {
            if (voiceListening) {
                recognition.stop();
                return;
            }

            if (hasSynth) speechSynthesis.cancel();

            recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                voiceListening = true;
                overlay.classList.add('is-listening');
                statusEl.textContent = 'Listening...';
                transcriptEl.textContent = '';
            };

            recognition.onresult = (event) => {
                let transcript = '';
                let isFinal = false;
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                    if (event.results[i].isFinal) isFinal = true;
                }
                transcriptEl.textContent = `"${transcript}"`;
            };

            recognition.onend = () => {
                voiceListening = false;
                overlay.classList.remove('is-listening');

                const userText = transcriptEl.textContent.replace(/^"|"$/g, '').trim();
                if (userText) {
                    statusEl.textContent = `${AGENT_NAME} is thinking...`;

                    // Also add to chat
                    addUserMessage(userText);

                    const response = getResponse(userText);
                    conversationState.messageCount++;

                    setTimeout(() => {
                        addAgentMessage(response.text);
                        if (response.chips) showChips(response.chips);
                        transcriptEl.textContent = '';
                        speak(response.text);
                    }, 800);
                } else {
                    statusEl.textContent = 'Tap the orb to speak again';
                }
            };

            recognition.onerror = (e) => {
                voiceListening = false;
                overlay.classList.remove('is-listening');
                statusEl.textContent = e.error === 'no-speech'
                    ? "I didn't catch that. Try again?"
                    : 'Tap the orb to try again';
            };

            recognition.start();
        });

        // Pre-load voices
        if (hasSynth) {
            speechSynthesis.getVoices();
            speechSynthesis.addEventListener('voiceschanged', () => speechSynthesis.getVoices());
        }
    }

    // ── Boot ──
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
