/**
 * FEATURE: Inner Child Doll Companion
 * 
 * WHAT IT DOES:
 * - Animated doll avatar that responds to clicks
 * - Hug, talk, voice notes, comfort actions
 * - Journal messages to younger self
 * 
 * AUTO-INITIALIZES: Yes, on DOMContentLoaded
 * REQUIRES: Element with id="innerChildContainer" in your HTML
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        containerId: 'innerChildContainer',
        dollEmoji: '🧸',
        messages: [
            "You are worthy of love exactly as you are.",
            "Your younger self feels held right now.",
            "It's okay to need comfort. Everyone does.",
            "You are doing better than you think.",
            "Your feelings are valid, always.",
            "You don't have to be perfect to be loved."
        ]
    };
    
    // State
    let recorder = null;
    let audioChunks = [];
    
    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        const container = document.getElementById(CONFIG.containerId);
        if (!container) {
            console.log('InnerChild: Container not found, skipping');
            return;
        }
        
        // Build HTML structure
        container.innerHTML = `
            <div class="doll-wrapper" style="text-align:center;padding:2rem;background:#f8f9fa;border-radius:16px;">
                <div class="doll-avatar" id="hs-doll" style="font-size:6rem;cursor:pointer;transition:transform 0.3s;display:inline-block;animation:hs-float 3s ease-in-out infinite;">${CONFIG.dollEmoji}</div>
                <div class="doll-status" id="hs-doll-status" style="margin:1rem 0;font-style:italic;color:#666;min-height:1.5em;">Click me or the buttons below</div>
                
                <div class="doll-actions" style="display:flex;gap:1rem;justify-content:center;margin:1.5rem 0;flex-wrap:wrap;">
                    <button class="hs-doll-btn" data-action="hug" style="padding:1rem;border:2px solid #ddd;background:white;border-radius:12px;cursor:pointer;min-width:100px;">
                        <div style="font-size:1.5rem;">🤗</div>
                        <small>Hug</small>
                    </button>
                    <button class="hs-doll-btn" data-action="talk" style="padding:1rem;border:2px solid #ddd;background:white;border-radius:12px;cursor:pointer;min-width:100px;">
                        <div style="font-size:1.5rem;">💬</div>
                        <small>Talk</small>
                    </button>
                    <button class="hs-doll-btn" data-action="voice" style="padding:1rem;border:2px solid #ddd;background:white;border-radius:12px;cursor:pointer;min-width:100px;">
                        <div style="font-size:1.5rem;">🎙️</div>
                        <small>Voice</small>
                    </button>
                    <button class="hs-doll-btn" data-action="comfort" style="padding:1rem;border:2px solid #ddd;background:white;border-radius:12px;cursor:pointer;min-width:100px;">
                        <div style="font-size:1.5rem;">💝</div>
                        <small>Comfort</small>
                    </button>
                </div>
                
                <div class="doll-message" id="hs-doll-message" style="display:none;padding:1rem;background:rgba(156,175,136,0.1);border-radius:8px;margin:1rem 0;animation:hs-fadeIn 0.5s;"></div>
                
                <div class="voice-panel" id="hs-voice-panel" style="display:none;background:white;padding:1rem;border-radius:12px;margin:1rem 0;">
                    <div class="recording-indicator" id="hs-rec-indicator" style="display:none;color:#e74c3c;align-items:center;gap:0.5rem;margin-bottom:1rem;">
                        <span style="width:12px;height:12px;background:#e74c3c;border-radius:50%;animation:hs-pulse 1s infinite;"></span>
                        <span>Recording...</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;justify-content:center;">
                        <button id="hs-start-rec" class="btn-primary" style="padding:0.5rem 1rem;background:#9CAF88;color:white;border:none;border-radius:20px;cursor:pointer;">Start</button>
                        <button id="hs-stop-rec" class="btn-secondary" style="padding:0.5rem 1rem;background:white;color:#9CAF88;border:2px solid #9CAF88;border-radius:20px;cursor:pointer;" disabled>Stop</button>
                    </div>
                    <div id="hs-recordings-list" style="margin-top:1rem;"></div>
                </div>
                
                <div class="journal-section" style="margin-top:2rem;text-align:left;">
                    <h3 style="margin-bottom:0.5rem;">Write to Your Younger Self</h3>
                    <textarea id="hs-child-input" placeholder="What do they need to hear today?" style="width:100%;padding:0.75rem;border:2px solid #ddd;border-radius:8px;min-height:80px;resize:vertical;font-family:inherit;"></textarea>
                    <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
                        <button id="hs-save-message" style="padding:0.5rem 1rem;background:#9CAF88;color:white;border:none;border-radius:20px;cursor:pointer;">Save Message</button>
                        <button id="hs-view-messages" style="padding:0.5rem 1rem;background:white;color:#9CAF88;border:2px solid #9CAF88;border-radius:20px;cursor:pointer;">View Past</button>
                    </div>
                    <div id="hs-messages-list" style="margin-top:1rem;"></div>
                </div>
            </div>
            
            <style>
                @keyframes hs-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
                @keyframes hs-pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
                @keyframes hs-fadeIn { from{opacity:0;transform:translateY(-10px);} to{opacity:1;transform:translateY(0);} }
                .hs-doll-btn:hover { border-color:#9CAF88 !important; transform:translateY(-2px); }
                #hs-doll:hover { transform:scale(1.1); }
                #hs-doll.hugging { animation:hs-hug 0.5s ease; }
                @keyframes hs-hug { 50%{transform:scale(1.3);} }
            </style>
        `;
        
        // Attach events
        document.getElementById('hs-doll').addEventListener('click', () => doAction('hug'));
        
        document.querySelectorAll('.hs-doll-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                doAction(action);
            });
        });
        
        document.getElementById('hs-start-rec').addEventListener('click', startRecording);
        document.getElementById('hs-stop-rec').addEventListener('click', stopRecording);
        document.getElementById('hs-save-message').addEventListener('click', saveMessage);
        document.getElementById('hs-view-messages').addEventListener('click', viewMessages);
        
        // Load existing data
        loadRecordings();
        viewMessages();
    }
    
    function doAction(action) {
        const doll = document.getElementById('hs-doll');
        const status = document.getElementById('hs-doll-status');
        const msgDiv = document.getElementById('hs-doll-message');
        
        switch(action) {
            case 'hug':
                doll.classList.add('hugging');
                status.textContent = "Sending you warmth...";
                showMessage(CONFIG.messages[Math.floor(Math.random() * CONFIG.messages.length)]);
                setTimeout(() => doll.classList.remove('hugging'), 500);
                break;
                
            case 'talk':
                document.getElementById('hs-child-input').focus();
                status.textContent = "I'm listening. What does your younger self want to say?";
                break;
                
            case 'voice':
                const panel = document.getElementById('hs-voice-panel');
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                status.textContent = panel.style.display === 'none' ? "Your companion is here" : "Speak from your heart...";
                break;
                
            case 'comfort':
