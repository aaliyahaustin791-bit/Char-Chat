(function () {
    'use strict';
    const MODULE_NAME = 'CharChat';

    // 1. Data Storage (Metadata)
    function getPhoneData() {
        const context = window.SillyTavern?.getContext?.();
        if (!context?.chatId) return null;
        
        if (!context.chatMetadata.charChat) {
            context.chatMetadata.charChat = {
                messages: [],
                contactName: context.characters[context.characterId]?.name || 'Unknown'
            };
        }
        return context.chatMetadata.charChat;
    }

    function savePhoneMessage(role, text) {
        const context = window.SillyTavern.getContext();
        const data = getPhoneData();
        if (!data) return;
        
        data.messages.push({ role, text, timestamp: new Date().toISOString() });
        if (typeof context.saveChat === 'function') context.saveChat();
    }

    // 2. UI Updates
    function refreshPhoneUI() {
        const data = getPhoneData();
        const $messages = $('#charChat-messages');
        $messages.empty();
        if (!data) return;
        
        $('#charChat-contact-name').text(data.contactName);
        data.messages.forEach(msg => {
            const cssClass = msg.role === 'user' ? 'user' : 'char';
            $messages.append(`<div class="charChat-bubble ${cssClass}">${msg.text}</div>`);
        });
        $messages.scrollTop($messages[0].scrollHeight);
    }

    // 3. AI Generation Logic
    async function handlePhoneSend() {
        const $input = $('#charChat-input');
        const userText = $input.val().trim();
        if (!userText) return;
        
        $input.val(''); // Clear input
        savePhoneMessage('user', userText);
        refreshPhoneUI();

        const context = window.SillyTavern.getContext();
        const charName = context.characters[context.characterId]?.name || 'the character';
        
        // Show fake typing indicator
        $('#charChat-messages').append(`<div id="charChat-typing" class="charChat-bubble char">Typing...</div>`);
        $('#charChat-messages').scrollTop($('#charChat-messages')[0].scrollHeight);

        // Build prompt for API
        let prompt = `\n\n[System Note: ${charName} is currently texting the user on a mobile phone.\n`;
        prompt += `The user just sent this SMS: "${userText}"\n`;
        prompt += `Write a short, realistic text message reply from ${charName}. DO NOT use roleplay asterisks. ONLY output the exact text message they send back.]`;

        try {
            // Silent generation
            const aiReply = await window.generateQuietPrompt(prompt);
            const cleanReply = aiReply.replace(/^["']|["']$/g, '').trim(); // Remove quotes
            
            $('#charChat-typing').remove();
            savePhoneMessage('character', cleanReply);
            refreshPhoneUI();
        } catch (error) {
            console.error(`[${MODULE_NAME}] API Error:`, error);
            $('#charChat-typing').remove();
        }
    }

    // 4. UI Injection & Setup
    function injectUI() {
        if ($('#charChat-container').length) return;
        const phoneHtml = `
            <div id="charChat-container">
                <div class="charChat-header">
                    <span id="charChat-contact-name">Contact</span>
                    <i id="charChat-close" class="fa-solid fa-xmark" style="cursor:pointer; float:right;"></i>
                </div>
                <div id="charChat-messages"></div>
                <div class="charChat-input-area">
                    <textarea id="charChat-input" placeholder="Text message..."></textarea>
                    <div id="charChat-send" class="menu_button"><i class="fa-solid fa-paper-plane"></i></div>
                </div>
            </div>
        `;
        $('body').append(phoneHtml);

        // Bind UI Events
        $('#charChat-close').on('click', () => $('#charChat-container').hide());
        $('#charChat-send').on('click', handlePhoneSend);
        $('#charChat-input').on('keypress', function (e) {
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault();
                handlePhoneSend();
            }
        });
    }

    // 5. Extension Init
    function initExtension() {
        injectUI();
        
        // Add toggle button to ST extensions menu
        const btnHtml = `<div id="charChat-open-btn" class="menu_button fa-solid fa-mobile-screen-button" title="Open Char Chat"></div>`;
        $('#extensions_settings').append(btnHtml);
        $('#charChat-open-btn').on('click', () => {
            $('#charChat-container').toggle();
            refreshPhoneUI();
        });

        // Listen for chat changes to refresh data
        if (window.eventSource && window.event_types) {
            window.eventSource.on(window.event_types.CHAT_CHANGED, refreshPhoneUI);
        }
    }

    // Wait for ST to load
    jQuery(document).ready(function () {
        initExtension();
    });
})();
