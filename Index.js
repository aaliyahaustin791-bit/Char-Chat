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
