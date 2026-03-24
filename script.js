/**
 * HealingSpace - Main Controller
 * Coordinates all modules and handles core functionality
 */

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Initialize core features
    initNavigation();
    initThemeToggle();
    initTabs();
    initMoodTracker();
    initDailyPrompts();
    initHeroStats();
    initDataManagement();
    
    // Initialize all feature modules
    if (window.InnerChildModule) InnerChildModule.init();
    if (window.TimelineModule) TimelineModule.init();
    if (window.SafePeopleModule) SafePeopleModule.init();
    if (window.BodyCheckModule) BodyCheckModule.init();
    if (window.FutureLetterModule) FutureLetterModule.init();
    if (window.HealingGalleryModule) HealingGalleryModule.init();
    if (window.PatternTrackerModule) PatternTrackerModule.init();
    if (window.ResourcesModule) ResourcesModule.init();
    
    console.log('🌿 HealingSpace initialized. Welcome to your sanctuary.');
}

// Navigation
function initNavigation() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                window.scrollTo({
                    top: target.offsetTop - navHeight - 20,
                    behavior: 'smooth'
                });
                navLinks.classList.remove('active');
            }
        });
    });
}

// Theme Toggle
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const stylesheet = document.getElementById('theme-stylesheet');
    const icon = toggle.querySelector('.theme-icon');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('healingSpace_theme') || 'light';
    setTheme(savedTheme);
    
    toggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('healingSpace_theme', newTheme);
    });
    
    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        stylesheet.href = theme === 'dark' ? 'style-dark.css' : 'style-light.css';
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Tab System
function initTabs() {
    document.querySelectorAll('.checkin-tabs, .resources-tabs, .letters-tabs').forEach(tabContainer => {
        const buttons = tabContainer.querySelectorAll('.tab-btn');
        const contents = tabContainer.parentElement.querySelectorAll('.tab-content');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                
                buttons.forEach(b => b.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const targetContent = document.getElementById(tabId + 'Tab');
                if (targetContent) targetContent.classList.add('active');
            });
        });
    });
}

// Mood Tracker
function initMoodTracker() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const moodMessage = document.getElementById('moodMessage');
    
    const moodResponses = {
        overwhelmed: "It's okay to feel overwhelmed. Take five slow breaths. You don't have to figure everything out right now.",
        anxious: "Anxiety is your body trying to protect you. Thank it, then remind yourself: you are safe in this moment.",
        sad: "Sadness is valid. Allow yourself to feel it without rushing to fix it. You're allowed to have heavy days.",
        angry: "Anger often protects something vulnerable. What is it protecting? You don't have to act on it, just listen.",
        numb: "Numbness is often protection. Your body is taking a break from feeling. Be patient as you reconnect.",
        tired: "Rest is productive. Your body is asking for care. Listen to it without guilt.",
        okay: "'Okay' is a valid place to be. Not every day needs to be extraordinary.",
        hopeful: "Hope is brave. Hold onto it gently. You're allowed to believe things can get better.",
        calm: "Notice this calm. Breathe it in. You can return to this feeling whenever you need it.",
        grateful: "Gratitude in healing is powerful. Thank yourself for showing up today."
    };
    
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.dataset.mood;
            
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            
            // Save to storage
            UserData.save('currentMood', {
                mood: mood,
                timestamp: new Date().toISOString()
            });
            
            UserData.addToArray('moodHistory', {
                mood: mood,
                date: new Date().toISOString()
            });
            
            // Show message
            moodMessage.textContent = moodResponses[mood];
            moodMessage.classList.add('visible');
            
            // Update stats
            updateHeroStats();
        });
    });
    
    // Load saved mood
    const saved = UserData.get('currentMood');
    if (saved) {
        const btn = document.querySelector(`[data-mood="${saved.mood}"]`);
        if (btn) btn.classList.add('selected');
    }
}

// Daily Prompts
function initDailyPrompts() {
    const prompts = [
        "What emotion is asking for your attention right now?",
        "If your younger self could see you today, what would they be proud of?",
        "What does your body need right now?",
        "What boundary do you need to honor today?",
        "What would you say to a friend feeling how you feel?",
        "What makes you feel most like yourself?",
        "What are you carrying that isn't yours to carry?",
        "When did you feel safe recently? What created that safety?",
        "What does your inner child need to hear today?",
        "What pattern are you ready to notice without judgment?",
        "Who has seen you fully? How did that feel?",
        "What would healing look like today, not someday?",
        "What truth do you know deep down?",
        "What do you need to forgive yourself for?",
        "How have you grown that you haven't acknowledged?"
    ];
    
    const promptText = document.getElementById('promptText');
    const refreshBtn = document.getElementById('refreshPromptBtn');
    
    function showRandomPrompt() {
        const random = prompts[Math.floor(Math.random() * prompts.length)];
        promptText.style.opacity = 0;
        setTimeout(() => {
            promptText.textContent = random;
            promptText.style.opacity = 1;
        }, 300);
    }
    
    refreshBtn.addEventListener('click', showRandomPrompt);
    showRandomPrompt();
}

// Hero Statistics
function initHeroStats() {
    updateHeroStats();
}

function updateHeroStats() {
    // Days active
    const firstVisit = UserData.get('firstVisit');
    if (!firstVisit) {
        UserData.save('firstVisit', new Date().toISOString());
    }
    const days = firstVisit ? Math.floor((new Date() - new Date(firstVisit)) / (1000 * 60 * 60 * 24)) + 1 : 1;
    document.getElementById('daysActive').textContent = days;
    
    // Total check-ins
    const moodHistory = UserData.get('moodHistory') || [];
    document.getElementById('totalCheckins').textContent = moodHistory.length;
    
    // Patterns broken
    const patterns = UserData.get('patternEntries') || [];
    const broken = patterns.filter(p => p.action === 'broken').length;
    document.getElementById('patternsBroken').textContent = broken;
}

// Data Management
function initDataManagement() {
    // Export all data
    document.getElementById('exportAllData')?.addEventListener('click', () => {
        const allData = UserData.exportAll();
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healingspace-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // Clear all data
    document.getElementById('clearAllData')?.addEventListener('click', () => {
        if (confirm('Are you sure? This will delete all your healing data permanently.')) {
            localStorage.removeItem('healingSpace');
            location.reload();
        }
    });
}

// Utility: Modal
window.showModal = function(content) {
    const modal = document.getElementById('mainModal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = content;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('mainModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'mainModal') closeModal();
});

function closeModal() {
    document.getElementById('mainModal').style.display = 'none';
    document.body.style.overflow = '';
}

// Utility: Format date
window.formatDate = function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
};
