/**
 * Doll Animations & Interactions
 * Drop-in file - adds hugging, floating, and click effects
 */

(function() {
    'use strict';
    
    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDollAnimations);
    } else {
        initDollAnimations();
    }
    
    function initDollAnimations() {
        console.log('🧸 Doll animations initializing...');
        
        // Use event delegation on document body
        document.body.addEventListener('click', function(e) {
            const target = e.target;
            
            // Doll avatar clicked
            if (target.id === 'dollAvatar' || target.closest('#dollAvatar')) {
                e.preventDefault();
                e.stopPropagation();
                performHug(target.closest('#dollAvatar') || target);
                return;
            }
            
            // Hug button clicked
            if (target.closest('[data-action="hug"]')) {
                e.preventDefault();
                const doll = document.getElementById('dollAvatar');
                if (doll) performHug(doll);
                return;
            }
            
            // Talk button clicked
            if (target.closest('[data-action="talk"]')) {
                e.preventDefault();
                const input = document.getElementById('innerChildInput');
                const status = document.getElementById('dollStatus');
                if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                if (status) status.textContent = "I'm listening... What does your younger self need to say?";
                return;
            }
            
            // Care button clicked
            if (target.closest('[data-action="care"]')) {
                e.preventDefault();
                performCare();
                return;
            }
        });
        
        // Add floating animation via CSS injection
        injectDollStyles();
        
        // Easter egg: random encouraging messages on doll click
        let clickCount = 0;
        const messages = [
            "You are doing better than you think.",
            "Your feelings are valid, always.",
            "It's okay to rest. You don't have to earn it.",
            "You are worthy of love exactly as you are.",
            "Your younger self is proud of you for showing up.",
            "Healing isn't linear. Be patient with yourself.",
            "You are allowed to take up space.",
            "Your boundaries are valid and necessary."
        ];
        
        function performHug(dollElement) {
            if (!dollElement) return;
            
            // Prevent double-clicks
            if (dollElement.classList.contains('hugging')) return;
            
            clickCount++;
            
            // Add hugging class for CSS animation
            dollElement.classList.add('hugging');
            dollElement.style.transform = 'scale(1.3)';
            dollElement.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            
            // Show heart effect
            showHeartEffect(dollElement);
            
            // Update status
            const status = document.getElementById('dollStatus');
            if (status) {
                status.textContent = "Sending you warmth and safety...";
                status.style.opacity = '0';
                setTimeout(() => status.style.opacity = '1', 50);
            }
            
            // Show message every 3rd click or random
            if (clickCount % 3 === 0 || Math.random() > 0.7) {
                const msg = messages[Math.floor(Math.random() * messages.length)];
                showDollMessage(msg);
            }
            
            // Reset after animation
            setTimeout(() => {
                dollElement.classList.remove('hugging');
                dollElement.style.transform = '';
                if (status) status.textContent = "Your companion is here for you";
            }, 800);
        }
        
        function performCare() {
            const doll = document.getElementById('dollAvatar');
            const status = document.getElementById('dollStatus');
            
            if (doll) {
                // Sparkle effect
                doll.style.textShadow = '0 0 20px #FFD700, 0 0 40px #FFD700';
                doll.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    doll.style.textShadow = '';
                    doll.style.transform = '';
                }, 1000);
            }
            
            if (status) {
                status.textContent = "Self-care is revolutionary. You're doing important work.";
            }
            
            showDollMessage("💝 Taking care of yourself matters. Your younger self thanks you.");
        }
        
        function showHeartEffect(element) {
            const heart = document.createElement('div');
            heart.textContent = '❤️';
            heart.style.cssText = `
                position: absolute;
                font-size: 2rem;
                pointer-events: none;
                animation: floatUp 1s ease-out forwards;
                z-index: 1000;
            `;
            
            const rect = element.getBoundingClientRect();
            heart.style.left = (rect.left + rect.width/2) + 'px';
            heart.style.top = (rect.top) + 'px';
            
            document.body.appendChild(heart);
            
            setTimeout(() => heart.remove(), 1000);
        }
        
        function showDollMessage(text) {
            const container = document.getElementById('dollMessages');
            if (!container) return;
            
            // Clear existing
            container.innerHTML = '';
            
            const msgDiv = document.createElement('div');
            msgDiv.className = 'doll-message-bubble';
            msgDiv.textContent = text;
            msgDiv.style.cssText = `
                background: linear-gradient(135deg, rgba(156,175,136,0.2), rgba(197,185,205,0.2));
                border-left: 4px solid var(--accent-sage, #9CAF88);
                padding: 1rem 1.5rem;
                border-radius: 12px;
                margin-top: 1rem;
                animation: slideInUp 0.5s ease;
                font-style: italic;
                color: var(--text-primary, #2C3E50);
            `;
            
            container.appendChild(msgDiv);
            
            // Auto-remove after 6 seconds
            setTimeout(() => {
                msgDiv.style.animation = 'fadeOut 0.5s ease forwards';
                setTimeout(() => msgDiv.remove(), 500);
            }, 6000);
        }
        
        function injectDollStyles() {
            if (document.getElementById('doll-animation-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'doll-animation-styles';
            style.textContent = `
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
                }
                
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeOut {
                    to { opacity: 0; transform: translateY(-10px); }
                }
                
                #dollAvatar {
                    cursor: pointer;
                    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    display: inline-block;
                }
                
                #dollAvatar.hugging {
                    animation: hugPulse 0.8s ease;
                }
                
                @keyframes hugPulse {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(1.2) rotate(-5deg); }
                    50% { transform: scale(1.3) rotate(5deg); }
                    75% { transform: scale(1.2) rotate(-3deg); }
                }
                
                .doll-action-btn {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .doll-action-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                .doll-action-btn:active {
                    transform: translateY(0) scale(0.95);
                }
            `;
            
            document.head.appendChild(style);
            console.log('✅ Doll animation styles injected');
        }
    }
    
    console.log('🧸 Doll animations script loaded');
})();
