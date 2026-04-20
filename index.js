(function () {
    'use strict';
    const MODULE_NAME = 'CharChat';

    // 1. Data Storage (Metadata)
    function getPhoneData() {
        const context = window.SillyTavern?.getContext?.();
        if (!context?.chatId) return null;
        
        // SAFEGUARD: Ensure metadata object exists
        if (!context.chatMetadata) context.chatMetadata = {};
        
        if (!context.chatMetadata.charChat) {
            context.chatMetadata.charChat = {
                messages: [],
                contactName: context.characters?.[context.characterId]?.name || 'Unknown'
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
        
        if (!data) {
            $('#charChat-contact-name').text('No Chat Active');
            return;
        }
        
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
        
        $input.val('');
        savePhoneMessage('user', userText);
        refreshPhoneUI();

        const context = window.SillyTavern.getContext();
        const charName = context.characters?.[context.characterId]?.name || 'the character';
        
        $('#charChat-messages').append(`<div id="charChat-typing" class="charChat-bubble char">Typing...</div>`);
        $('#charChat-messages').scrollTop($('#charChat-messages')[0].scrollHeight);

        let prompt = `\n\n[System Note: ${charName} is currently texting the user on a mobile phone.\n`;
        prompt += `The user just sent this SMS: "${userText}"\n`;
        prompt += `Write a short, realistic text message reply from ${charName}. DO NOT use roleplay asterisks. ONLY output the exact text message they send back.]`;

        try {
            const aiReply = await window.generateQuietPrompt(prompt);
            const cleanReply = aiReply.replace(/^["']|["']$/g, '').trim();
            
            $('#charChat-typing').remove();
            savePhoneMessage('character', cleanReply);
            refreshPhoneUI();
        } catch (error) {
            console.error(`[${MODULE_NAME}] API Error:`, error);
            $('#charChat-typing').remove();
            toastr.error('Phone AI Error! Check console.');
        }
    }

    // 4. UI Injection & Setup
    function injectUI() {
        if ($('#charChat-container').length) return;
        const phoneHtml = `
            <div id="charChat-container" style="display: none;">
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

        $('#charChat-close').on('click', () => $('#charChat-container').hide());
        $('#charChat-send').on('click', handlePhoneSend);
        $('#charChat-input').on('keypress', function (e) {
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault();
                handlePhoneSend();
            }
        });
    }

                    function initExtension() {
        injectUI();
        
        // Nuclear force: Re-inject every 2 seconds in case ST eats it
        setInterval(() => {
            if ($('#charChat-container').length === 0) {
                injectUI();
            }
        }, 2000);
        
        // EVENT DELEGATION
        $(document).off('click', '#charChat-open-btn').on('click', '#charChat-open-btn', () => {
            let $container = $('#charChat-container');
            
            // Nuclear re-injection
            if ($container.length === 0) {
                injectUI();
                $container = $('#charChat-container');
            }
            
            // FORCE IT TO EXIST
            if ($container.length === 0) {
                toastr.error("NUCLEAR FAIL: Cannot create UI!");
                return;
            }

            // DOM ANALYSIS
            toastr.info("Container found! Position: " + $container.offset().top + ", Display: " + $container.css('display'));

            // NUCLEAR FORCE VISIBLE
            $container.removeClass('charChat-hidden');
            $container.css({
                'display': 'flex',
                'z-index': '999999',
                'position': 'fixed',
                'top': '10%',
                'left': '5%',
                'width': '90%',
                'height': '80%',
                'background': 'red' // RED FLASH to prove it exists!
            });
            
            // Final safety check
            if ($container.css('display') !== 'flex') {
                toastr.error("STILL HIDDEN! Check console for CSS conflicts.");
            } else {
                toastr.success("NUCLEAR SUCCESS! Red phone should be visible!");
                refreshPhoneUI();
            }
        });

        if (window.eventSource && window.event_types) {
            window.eventSource.on(window.event_types.CHAT_CHANGED, refreshPhoneUI);
        }
                    }
    
    jQuery(document).ready(function () {
        initExtension();
    });
})();
