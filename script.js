/**
 * HealingSpace - Main JavaScript File
 * Handles mood tracking, journal entries, grounding tools, and daily prompts
 * All data stored in localStorage for privacy
 */

// ============================================
// DATA & CONFIGURATION
// ============================================

// Array of 15+ reflective prompts for daily reflection
const dailyPrompts = [
    "What emotion is asking for your attention right now? Can you name it without judgment?",
    "If your younger self could see you today, what would they be proud of?",
    "What does your body need right now? Rest, movement, nourishment, or something else?",
    "Think of a time you felt safe. What made that moment feel secure?",
    "What would you say to a friend who was feeling exactly how you feel now?",
    "What boundary do you need to set or honor today to protect your peace?",
    "What is one small act of kindness you can offer yourself today?",
    "If your emotions could speak, what would they be trying to tell you?",
    "What part of yourself have you been neglecting? What does that part need?",
    "Think of a challenge you've overcome. What strength did you discover in yourself?",
    "What does 'feeling safe' mean to you? What helps you feel grounded?",
    "If you could hold your younger self's hand right now, what would you want them to know?",
    "What are you carrying that isn't yours to carry? Can you set it down, even for a moment?",
    "What makes you feel most like yourself? How can you invite more of that into your life?",
    "What is one truth you know deep down, even if your mind tries to convince you otherwise?",
    "What would healing look like for you today, not in the future, but right now?",
    "What do you need to forgive yourself for? Can you offer yourself that forgiveness today?",
    "When was the last time you felt truly at peace? What elements created that feeling?"
];

// Encouraging messages for each mood selection
const moodResponses = {
    overwhelmed: "It's okay to feel overwhelmed. Take five slow breaths. You don't have to figure everything out right now.",
    anxious: "Anxiety is your body trying to protect you. Thank it, then remind yourself: you are safe in this moment.",
    sad: "Sadness is valid. Allow yourself to feel it without rushing to fix it. You're allowed to have heavy days.",
    numb: "Numbness is often protection. Your body is taking a break from feeling. Be patient as you reconnect.",
    tired: "Rest is productive. Your body is asking for care. Listen to it without guilt.",
    okay: "'Okay' is a valid place to be. Not every day needs to be extraordinary. You're doing enough.",
    hopeful: "Hope is brave. Hold onto it gently. You're allowed to believe things can get better.",
    calm: "Notice this calm. Breathe it in. You can return to this feeling whenever you need it."
};

// Grounding tool instructions
const groundingTools = {
    breathing: {
        title: "🫁 Box Breathing",
        content: `
            <div class="breathing-visual">🫁</div>
            <p style="text-align: center; margin-bottom: 1.5rem; color: var(--soft-gray);">Follow the circle's rhythm</p>
            <ol class="modal-steps">
                <li class="modal-step">
                    <strong>Inhale</strong>
                    Breathe in slowly through your nose for 4 counts. Feel your belly expand.
                </li>
                <li class="modal-step">
                    <strong>Hold</strong>
                    Hold your breath gently for 4 counts. Don't strain, just pause.
                </li>
                <li class="modal-step">
                    <strong>Exhale</strong>
                    Release slowly through your mouth for 4 counts. Let your shoulders drop.
                </li>
                <li class="modal-step">
                    <strong>Hold</strong>
                    Pause empty for 4 counts. Notice the stillness.
                </li>
            </ol>
            <p style="margin-top: 1.5rem; text-align: center; font-style: italic; color: var(--soft-gray);">
                Repeat for 4 cycles or until you feel your heart rate slow.
            </p>
        `
    },
    senses: {
        title: "👁️ 5-4-3-2-1 Grounding",
        content: `
            <p style="margin-bottom: 1.5rem; color: var(--charcoal);">
                This technique anchors you in the present by engaging your five senses. 
                Take your time with each step.
            </p>
            <ol class="modal-steps">
                <li class="modal-step">
                    <strong>5 Things You Can See</strong>
                    Look around. Name 5 things you see. Notice colors, shapes, light, shadows.
                </li>
                <li class="modal-step">
                    <strong>4 Things You Can Touch</strong>
                    Feel your feet on the floor, clothes on your skin, or touch something nearby. Describe the texture.
                </li>
                <li class="modal-step">
                    <strong>3 Things You Can Hear</strong>
                    Listen. Maybe it's traffic, birds, a clock, or your own breathing.
                </li>
                <li class="modal-step">
                    <strong>2 Things You Can Smell</strong>
                    Notice any scents. If you can't smell anything, move to find a scent or recall a favorite one.
                </li>
                <li class="modal-step">
                    <strong>1 Thing You Can Taste</strong>
                    Notice the taste in your mouth, or take a sip of water, or name your favorite taste.
                </li>
            </ol>
            <p style="margin-top: 1.5rem; text-align: center; font-style: italic; color: var(--soft-gray);">
                You are here. You are present. You are safe in this moment.
            </p>
        `
    },
    bodyscan: {
        title: "🧘 Body Scan Relaxation",
        content: `
            <p style="margin-bottom: 1.5rem; color: var(--charcoal);">
                A body scan helps release tension you might not know you're holding. 
                Go slowly. There's no rush.
            </p>
            <ol class="modal-steps">
                <li class="modal-step">
                    <strong>Find Your Position</strong>
                    Sit comfortably or lie down. Close your eyes if that feels safe.
                </li>
                <li class="modal-step">
                    <strong>Start at the Top</strong>
                    Bring attention to your forehead. Notice any tension. Let it soften.
                </li>
                <li class="modal-step">
                    <strong>Move Down</strong>
                    Travel to your jaw, neck, shoulders. If you find tightness, breathe into it.
                </li>
                <li class="modal-step">
                    <strong>Continue the Journey</strong>
                    Move through your chest, belly, hands, legs, feet. Pause wherever needs attention.
                </li>
                <li class="modal-step">
                    <strong>Full Body Awareness</strong>
                    Feel your whole body supported by the surface beneath you. Rest here.
                </li>
            </ol>
            <p style="margin-top: 1.5rem; text-align: center; font-style: italic; color: var(--soft-gray);">
                Your body carries you through everything. Thank it for its work.
            </p>
        `
    },
    coldwater: {
        title: "💧 Cold Water Grounding",
        content: `
            <p style="margin-bottom: 1.5rem; color: var(--charcoal);">
                Temperature change can quickly activate your dive reflex, slowing your heart rate 
                and calming your nervous system.
            </p>
            <ol class="modal-steps">
                <li class="modal-step">
                    <strong>Find Cold Water</strong>
                    Go to a sink, or hold an ice cube, or splash cool water on your face.
                </li>
                <li class="modal-step">
                    <strong>Splash Your Face</strong>
                    Cup cold water and splash it on your face, especially around your eyes and cheeks.
                </li>
                <li class="modal-step">
                    <strong>Hold an Ice Cube</strong>
                    If available, hold ice in your hand. Focus on the sensation. Notice how it changes.
                </li>
                <li class="modal-step">
                    <strong>Drink Cold Water</strong>
                    Sip very cold water slowly. Feel it travel down your throat.
                </li>
                <li class="modal-step">
                    <strong>Notice the Shift</strong>
                    Pay attention to how your body responds. The shock brings you to the present.
                </li>
            </ol>
            <p style="margin-top: 1.5rem; text-align: center; font-style: italic; color: var(--soft-gray);">
                This is a powerful tool for intense moments. Use it whenever you need a reset.
            </p>
        `
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get current timestamp in readable format
 * @returns {string} Formatted date string
 */
function getTimestamp() {
    const now = new Date();
    return now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generate a unique ID for journal entries
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Show temporary confirmation message
 * @param {string} elementId - ID of element to show message in
 * @param {string} message - Message to display
 * @param {number} duration - How long to show message (ms)
 */
function showConfirmation(elementId, message, duration = 3000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.classList.add('visible');
    
    setTimeout(() => {
        element.classList.remove('visible');
    }, duration);
}

// ============================================
// MOOD TRACKER FUNCTIONS
// ============================================

/**
 * Initialize mood tracker functionality
 * Sets up event listeners for mood buttons and loads saved mood
 */
function initMoodTracker() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const moodMessage = document.getElementById('moodMessage');
    const moodHistory = document.getElementById('moodHistory');
    
    // Load and display last mood if exists
    const savedMood = localStorage.getItem('healingSpace_currentMood');
    const savedMoodTime = localStorage.getItem('healingSpace_moodTime');
    
    if (savedMood && savedMoodTime) {
        // Highlight the saved mood button
        moodButtons.forEach(btn => {
            if (btn.dataset.mood === savedMood) {
                btn.classList.add('selected');
            }
        });
        
        // Show when last checked in
        moodHistory.textContent = `Last check-in: ${savedMood} (${savedMoodTime})`;
        
        // Update progress indicator
        updateProgressIndicator();
    }
    
    // Add click listeners to mood buttons
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.dataset.mood;
            
            // Remove selected class from all buttons
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            button.classList.add('selected');
            
            // Save to localStorage
            const timestamp = getTimestamp();
            localStorage.setItem('healingSpace_currentMood', mood);
            localStorage.setItem('healingSpace_moodTime', timestamp);
            
            // Save to mood history array
            saveMoodToHistory(mood, timestamp);
            
            // Display encouraging message
            moodMessage.textContent = moodResponses[mood] || "Thank you for checking in with yourself.";
            moodMessage.classList.add('visible');
            
            // Update history display
            moodHistory.textContent = `Last check-in: ${mood} (${timestamp})`;
            
            // Update progress
            updateProgressIndicator();
            
            // Animate the selection
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = '';
            }, 200);
        });
    });
}

/**
 * Save mood to history array in localStorage
 * @param {string} mood - The selected mood
 * @param {string} timestamp - When it was selected
 */
function saveMoodToHistory(mood, timestamp) {
    let history = JSON.parse(localStorage.getItem('healingSpace_moodHistory') || '[]');
    
    // Add new entry
    history.push({ mood, timestamp });
    
    // Keep only last 30 entries to prevent storage issues
    if (history.length > 30) {
        history = history.slice(-30);
    }
    
    localStorage.setItem('healingSpace_moodHistory', JSON.stringify(history));
}

/**
 * Update the progress indicator in hero section based on activity
 */
function updateProgressIndicator() {
    const progressIcon = document.querySelector('.progress-icon');
    const progressText = document.querySelector('.progress-text');
    
    // Get counts of activities
    const moodHistory = JSON.parse(localStorage.getItem('healingSpace_moodHistory') || '[]');
    const journalEntries = JSON.parse(localStorage.getItem('healingSpace_journal') || '[]');
    
    const totalActivities = moodHistory.length + journalEntries.length;
    
    // Update icon and text based on progress
    if (totalActivities === 0) {
        progressIcon.textContent = '🌱';
        progressText.textContent = 'Your healing journey begins';
    } else if (totalActivities < 5) {
        progressIcon.textContent = '🌿';
        progressText.textContent = 'Taking root';
    } else if (totalActivities < 10) {
        progressIcon.textContent = '🌷';
        progressText.textContent = 'Growing stronger';
    } else if (totalActivities < 20) {
        progressIcon.textContent = '🌳';
        progressText.textContent = 'Deepening your practice';
    } else {
        progressIcon.textContent = '🌻';
        progressText.textContent = 'Blooming in your healing';
    }
    
    // Add animation class
    progressIcon.classList.add('growing');
    setTimeout(() => progressIcon.classList.remove('growing'), 600);
}

// ============================================
// DAILY PROMPT FUNCTIONS
// ============================================

/**
 * Initialize daily prompt functionality
 * Displays random prompt on load and sets up refresh button
 */
function initDailyPrompt() {
    const promptText = document.getElementById('promptText');
    const refreshBtn = document.getElementById('refreshPromptBtn');
    
    // Display initial prompt
    displayRandomPrompt(promptText);
    
    // Set up refresh button
    refreshBtn.addEventListener('click', () => {
        // Fade out
        promptText.style.opacity = '0';
        
        setTimeout(() => {
            // Change text and fade in
            displayRandomPrompt(promptText);
            promptText.style.opacity = '1';
        }, 300);
    });
}

/**
 * Display a random prompt that hasn't been shown recently
 * @param {HTMLElement} element - Element to display prompt in
 */
function displayRandomPrompt(element) {
    // Get recently shown prompts from storage
    let recentPrompts = JSON.parse(localStorage.getItem('healingSpace_recentPrompts') || '[]');
    
    // Filter out recent prompts
    let availablePrompts = dailyPrompts.filter(p => !recentPrompts.includes(p));
    
    // If all prompts were recent, reset
    if (availablePrompts.length === 0) {
        availablePrompts = dailyPrompts;
        recentPrompts = [];
    }
    
    // Select random prompt
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    const selectedPrompt = availablePrompts[randomIndex];
    
    // Update recent prompts (keep last 5)
    recentPrompts.push(selectedPrompt);
    if (recentPrompts.length > 5) {
        recentPrompts.shift();
    }
    localStorage.setItem('healingSpace_recentPrompts', JSON.stringify(recentPrompts));
    
    // Display with animation
    element.textContent = selectedPrompt;
}

// ============================================
// INNER CHILD JOURNAL FUNCTIONS
// ============================================

/**
 * Initialize inner child journal functionality
 * Sets up save, view, clear, and export features
 */
function initInnerChildJournal() {
    const input = document.getElementById('innerChildInput');
    const saveBtn = document.getElementById('saveMessageBtn');
    const viewBtn = document.getElementById('viewPastBtn');
    const clearBtn = document.getElementById('clearJournalBtn');
    const exportBtn = document.getElementById('exportJournalBtn');
    const pastContainer = document.getElementById('pastMessagesContainer');
    const pastList = document.getElementById('pastMessagesList');
    
    // Save message functionality
    saveBtn.addEventListener('click', () => {
        const message = input.value.trim();
        
        if (!message) {
            showConfirmation('saveConfirmation', 'Please write something before saving.', 3000);
            return;
        }
        
        // Create entry object
        const entry = {
            id: generateId(),
            text: message,
            timestamp: getTimestamp()
        };
        
        // Get existing entries
        let entries = JSON.parse(localStorage.getItem('healingSpace_journal') || '[]');
        
        // Add new entry to beginning
        entries.unshift(entry);
        
        // Save to localStorage
        localStorage.setItem('healingSpace_journal', JSON.stringify(entries));
        
        // Clear input
        input.value = '';
        
        // Show confirmation
        showConfirmation('saveConfirmation', 'Your message has been saved safely. 💚', 3000);
        
        // Update progress
        updateProgressIndicator();
        
        // If past messages are visible, refresh them
        if (pastContainer.style.display !== 'none') {
            displayPastMessages(pastList);
        }
    });
    
    // View past messages functionality
    viewBtn.addEventListener('click', () => {
        const isVisible = pastContainer.style.display !== 'none';
        
        if (isVisible) {
            pastContainer.style.display = 'none';
            viewBtn.innerHTML = '<span>📖</span> View Past Messages';
        } else {
            displayPastMessages(pastList);
            pastContainer.style.display = 'block';
            viewBtn.innerHTML = '<span>👁️</span> Hide Past Messages';
            
            // Scroll to messages
            pastContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
    
    // Clear journal functionality
    clearBtn.addEventListener('click', () => {
        const entries = JSON.parse(localStorage.getItem('healingSpace_journal') || '[]');
        
        if (entries.length === 0) {
            showConfirmation('saveConfirmation', 'Your journal is already empty.', 3000);
            return;
        }
        
        // Confirm before clearing
        if (confirm('Are you sure you want to clear all journal entries? This cannot be undone.')) {
            localStorage.removeItem('healingSpace_journal');
            pastList.innerHTML = '';
            pastContainer.style.display = 'none';
            viewBtn.innerHTML = '<span>📖</span> View Past Messages';
            showConfirmation('saveConfirmation', 'Journal cleared. Fresh start. 🌱', 3000);
            updateProgressIndicator();
        }
    });
    
    // Export journal functionality
    exportBtn.addEventListener('click', exportJournal);
}

/**
 * Display past journal messages in the list
 * @param {HTMLElement} container - Container to display messages in
 */
function displayPastMessages(container) {
    const entries = JSON.parse(localStorage.getItem('healingSpace_journal') || '[]');
    
    if (entries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--soft-gray); font-style: italic;">No messages yet. Your first entry awaits.</p>';
        return;
    }
    
    // Build HTML for entries
    container.innerHTML = entries.map(entry => `
        <div class="past-message-item" data-id="${entry.id}">
            <div class="past-message-date">${entry.timestamp}</div>
            <div class="past-message-text">${escapeHtml(entry.text)}</div>
        </div>
    `).join('');
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Export journal entries as .txt file
 */
function exportJournal() {
    const entries = JSON.parse(localStorage.getItem('healingSpace_journal') || '[]');
    
    if (entries.length === 0) {
        showConfirmation('saveConfirmation', 'Nothing to export yet. Write something first.', 3000);
        return;
    }
    
    // Build text content
    let content = 'MY HEALINGSPACE JOURNAL\n';
    content += '========================\n\n';
    content += `Exported on: ${getTimestamp()}\n`;
    content += `Total entries: ${entries.length}\n\n`;
    content += '========================\n\n';
    
    entries.forEach((entry, index) => {
        content += `Entry #${entries.length - index}\n`;
        content += `Date: ${entry.timestamp}\n`;
        content += '---\n';
        content += `${entry.text}\n`;
        content += '\n========================\n\n';
    });
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healingspace-journal-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showConfirmation('saveConfirmation', 'Journal exported successfully. 📄', 3000);
}

// ============================================
// GROUNDING TOOLS FUNCTIONS
// ============================================

/**
 * Initialize grounding tools modal functionality
 */
function initGroundingTools() {
    const modal = document.getElementById('groundingModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const toolButtons = document.querySelectorAll('.grounding-btn');
    
    // Open modal when tool button clicked
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toolKey = button.dataset.tool;
            const tool = groundingTools[toolKey];
            
            if (tool) {
                modalBody.innerHTML = `
                    <h3 class="modal-title">${tool.title}</h3>
                    ${tool.content}
                `;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });
    
    // Close modal functions
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modalBody.innerHTML = ''; // Clear content
    };
    
    modalClose.addEventListener('click', closeModal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

// ============================================
// NAVIGATION & UI FUNCTIONS
// ============================================

/**
 * Initialize smooth scrolling for navigation links
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize navbar background on scroll
 */
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add shadow on scroll
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Main initialization function
 * Runs when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initMoodTracker();
    initDailyPrompt();
    initInnerChildJournal();
    initGroundingTools();
    initNavigation();
    initScrollEffects();
    
    // Update progress on load
    updateProgressIndicator();
    
    // Log welcome message in console
    console.log('%c🌿 Welcome to HealingSpace', 'color: #9CAF88; font-size: 20px; font-weight: bold;');
    console.log('%cYour safe place to heal. All data stays on your device.', 'color: #7A7A7A; font-size: 12px;');
});

// Handle visibility change (when user returns to tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Refresh prompt when user returns (optional - can be removed if preferred)
        // This gives a fresh prompt for a new session
    }
});
