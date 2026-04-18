// Char Chat - Custom Phone Extension
// Built using the global context pattern to avoid vanishing bugs

(function () {
    'use strict';

    const MODULE_NAME = 'CharChat';

    // Safely get extension base URL
    const scripts = document.querySelectorAll('script[src*="index.js"]');
    let BASE_URL = '';
    for (const script of scripts) {
        if (script.src.includes('CharChat') || script.src.includes('char-chat')) {
            try {
                const urlObj = new URL(script.src, window.location.href);
                BASE_URL = urlObj.origin + urlObj.pathname.split('/').slice(0, -1).join('/');
            } catch (e) {
                BASE_URL = script.src.split('?')[0].split('/').slice(0, -1).join('/');
            }
            break;
        }
    }
    if (!BASE_URL) {
        // Fallback assuming standard installation path
        BASE_URL = '/scripts/extensions/third-party/CharChat';
    }

    console.log(`[${MODULE_NAME}] Initializing from ${BASE_URL}`);

    // Main initialization function
    async function initExtension() {
        // Access SillyTavern's global context securely
        // window.SillyTavern is the safest way to get ST internals in an IIFE
        const context = window.SillyTavern?.getContext?.();
        if (!context) {
            console.error(`[${MODULE_NAME}] Failed to get SillyTavern context!`);
            return;
        }

        console.log(`[${MODULE_NAME}] Context loaded successfully.`, context);
        
        // Example: Add a button to the extensions menu
        /*
        const button = $(`<div id="charChatBtn" class="fa-solid fa-mobile-screen-button menu_button" title="Char Chat"></div>`);
        button.on('click', () => {
            console.log('Phone UI Opened!');
        });
        $('#extensions_settings').append(button);
        */
    }

    // Wait for SillyTavern to finish loading DOM
    jQuery(document).ready(function () {
        initExtension();
    });

})();

function getPhoneData() {
    const context = window.SillyTavern.getContext();
    
    // If no chat is active, return null
    if (!context.chatId) return null;

    // Initialize our extension's namespace in this chat's metadata
    if (!context.chatMetadata.charChat) {
        context.chatMetadata.charChat = {
            messages: [],
            unreadCount: 0,
            contactName: context.characters[context.characterId]?.name || 'Unknown'
        };
    }
    return context.chatMetadata.charChat;
}

function savePhoneMessage(senderRole, text) {
    const context = window.SillyTavern.getContext();
    const data = getPhoneData();
    if (!data) return;

    // Add the new text message
    data.messages.push({
        id: Date.now(),
        role: senderRole, // 'user' or 'character'
        text: text,
        timestamp: new Date().toISOString()
    });

    // Force SillyTavern to write the updated metadata to disk
    if (typeof context.saveChat === 'function') {
        context.saveChat();
    }
}

function refreshPhoneUI() {
    const data = getPhoneData(); // From our previous step
    if (!data) {
        // Hide or clear phone screen, no chat active
        $('#charChat-message-container').empty();
        return;
    }
    
    // Render the messages
    console.log(`[CharChat] Loaded ${data.messages.length} messages for ${data.contactName}`);
    // ... UI rendering logic here ...
}

// Register listeners during your initExtension() function
function registerListeners() {
    // window.eventSource and window.event_types are standard ST globals
    const eventSource = window.eventSource;
    const event_types = window.event_types;

    if (eventSource && event_types) {
        // Refresh when switching characters/chats
        eventSource.on(event_types.CHAT_CHANGED, refreshPhoneUI);
        
        // Optional: Listen to standard chat messages to trigger phone events
        // eventSource.on(event_types.MESSAGE_RECEIVED, handleMainChatMessage);
    } else {
        console.error("[CharChat] Event source not found!");
    }
}
