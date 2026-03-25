/**
 * Voice Recorder Functionality
 * Drop-in file - adds working audio recording and playback
 */

(function() {
    'use strict';
    
    let mediaRecorder = null;
    let audioChunks = [];
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationId = null;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVoiceRecorder);
    } else {
        initVoiceRecorder();
    }
    
    function initVoiceRecorder() {
        console.log('🎙️ Voice recorder initializing...');
        
        // Inject styles first
        injectRecorderStyles();
        
        // Event delegation for all voice-related clicks
        document.body.addEventListener('click', function(e) {
            const target = e.target;
            
            // Voice button clicked - toggle recorder visibility
            if (target.closest('[data-action="voice"]')) {
                e.preventDefault();
                toggleRecorder();
                return;
            }
            
            // Start recording button
            if (target.id === 'startRecord' || target.closest('#startRecord')) {
                e.preventDefault();
                startRecording();
                return;
            }
            
            // Stop recording button
            if (target.id === 'stopRecord' || target.closest('#stopRecord')) {
                e.preventDefault();
                stopRecording();
                return;
            }
            
            // Delete recording button
            if (target.classList.contains('delete-recording')) {
                e.preventDefault();
                const id = target.dataset.id;
                if (id) deleteRecording(id);
                return;
            }
            
            // Play recording button (visual feedback)
            if (target.classList.contains('play-recording')) {
                target.classList.add('playing');
                setTimeout(() => target.classList.remove('playing'), 300);
            }
        });
        
        // Load existing recordings on init
        loadRecordings();
    }
    
    function toggleRecorder() {
        const recorder = document.getElementById('voiceRecorder');
        const status = document.getElementById('dollStatus');
        
        if (!recorder) {
            console.error('Voice recorder element not found');
            return;
        }
        
        const isHidden = recorder.style.display === 'none' || !recorder.style.display || recorder.classList.contains('hidden');
        
        if (isHidden) {
            recorder.style.display = 'block';
            recorder.classList.remove('hidden');
            recorder.classList.add('active');
            if (status) status.textContent = "Speak from your heart. Your voice matters.";
        } else {
            recorder.style.display = 'none';
            recorder.classList.add('hidden');
            recorder.classList.remove('active');
            if (status) status.textContent = "Your companion is here for you";
        }
    }
    
    async function startRecording() {
        const startBtn = document.getElementById('startRecord');
        const stopBtn = document.getElementById('stopRecord');
        const indicator = document.getElementById('recordingIndicator');
        const status = document.getElementById('dollStatus');
        
        try {
            // Check for browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Your browser does not support audio recording. Please use Chrome, Firefox, or Edge.');
                return;
            }
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            
            // Create media recorder with preferred mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 
                            MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 
                            'audio/ogg';
            
            mediaRecorder = new MediaRecorder(stream, { mimeType });
            audioChunks = [];
            
            // Collect data
            mediaRecorder.ondataavailable = function(e) {
                if (e.data && e.data.size > 0) {
                    audioChunks.push(e.data);
                }
            };
            
            // When recording stops
            mediaRecorder.onstop = function() {
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                const audioUrl = URL.createObjectURL(audioBlob);
                saveRecording(audioUrl, audioBlob.size);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };
            
            // Handle errors
            mediaRecorder.onerror = function(e) {
                console.error('Recording error:', e);
                alert('Recording error occurred. Please try again.');
                resetRecordingUI();
            };
            
            // Start recording
            mediaRecorder.start(100); // Collect data every 100ms
            
            // Update UI
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.textContent = '⏺ Recording...';
            }
            if (stopBtn) stopBtn.disabled = false;
            if (indicator) indicator.classList.add('active');
            if (status) status.textContent = "Recording... Speak your truth.";
            
            // Visualizer effect (if we can get audio context)
            setupVisualizer(stream);
            
            console.log('Recording started');
            
        } catch (err) {
            console.error('Microphone access error:', err);
            
            if (err.name === 'NotAllowedError') {
                alert('Microphone access denied. Please allow microphone access in your browser settings and refresh the page.');
            } else if (err.name === 'NotFoundError') {
                alert('No microphone found. Please connect a microphone and try again.');
            } else {
                alert('Could not start recording: ' + err.message);
            }
        }
    }
    
    function stopRecording() {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            console.log('No active recording to stop');
            return;
        }
        
        mediaRecorder.stop();
        resetRecordingUI();
        
        console.log('Recording stopped');
    }
    
    function resetRecordingUI() {
        const startBtn = document.getElementById('startRecord');
        const stopBtn = document.getElementById('stopRecord');
        const indicator = document.getElementById('recordingIndicator');
        const status = document.getElementById('dollStatus');
        
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = '⏺ Start Recording';
        }
        if (stopBtn) stopBtn.disabled = true;
        if (indicator) indicator.classList.remove('active');
        if (status) status.textContent = "Recording saved. Your voice is heard.";
        
        // Stop visualizer
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    function setupVisualizer(stream) {
        // Simple visualizer using audio level detection
        const indicator = document.getElementById('recordingIndicator');
        if (!indicator) return;
        
        // Create audio context for visualization
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            function visualize() {
                if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
                
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                
                // Pulse effect based on audio level
                const scale = 1 + (average / 255) * 0.5;
                const dot = indicator.querySelector('.recording-dot');
                if (dot) {
                    dot.style.transform = `scale(${scale})`;
                }
                
                animationId = requestAnimationFrame(visualize);
            }
            
            visualize();
            
        } catch (e) {
            console.log('Visualizer not supported, continuing without it');
        }
    }
    
    function saveRecording(url, size) {
        const recordings = getRecordings();
        const newRecording = {
            id: Date.now().toString(),
            url: url,
            blobSize: size,
            date: new Date().toISOString(),
            duration: '0:00' // Would need actual duration tracking
        };
        
        recordings.push(newRecording);
        localStorage.setItem('healingSpace_recordings', JSON.stringify(recordings));
        
        loadRecordings();
        
        // Show success message
        const dollMsg = document.getElementById('dollMessages');
        if (dollMsg) {
            dollMsg.innerHTML = '<div style="padding: 1rem; background: rgba(156,175,136,0.2); border-radius: 8px; animation: slideIn 0.5s;">🎙️ Voice note saved for your younger self</div>';
            setTimeout(() => dollMsg.innerHTML = '', 4000);
        }
    }
    
    function getRecordings() {
        try {
            return JSON.parse(localStorage.getItem('healingSpace_recordings')) || [];
        } catch (e) {
            return [];
        }
    }
    
    function deleteRecording(id) {
        if (!confirm('Delete this voice note?')) return;
        
        let recordings = getRecordings();
        const recording = recordings.find(r => r.id === id);
        
        // Revoke object URL to free memory
        if (recording && recording.url) {
            URL.revokeObjectURL(recording.url);
        }
        
        recordings = recordings.filter(r => r.id !== id);
        localStorage.setItem('healingSpace_recordings', JSON.stringify(recordings));
        
        loadRecordings();
    }
    
    function loadRecordings() {
        const container = document.getElementById('recordingsList');
        if (!container) return;
        
        const recordings = getRecordings();
        
        if (recordings.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic; padding: 1rem;">No recordings yet. Your first voice note awaits.</p>';
            return;
        }
        
        container.innerHTML = recordings.map(rec => {
            const date = new Date(rec.date).toLocaleString();
            const sizeMB = (rec.blobSize / 1024 / 1024).toFixed(2);
            
            return `
                <div class="recording-item" style="
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 12px;
                    margin-bottom: 0.75rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    animation: slideIn 0.3s ease;
                ">
                    <button class="play-recording" style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: var(--accent-sage, #9CAF88);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2rem;
                        transition: transform 0.2s;
                    ">▶</button>
                    
                    <audio controls src="${rec.url}" style="flex: 1; height: 40px; min-width: 150px;"></audio>
                    
                    <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: right; min-width: 80px;">
                        <div>${date.split(',')[0]}</div>
                        <div>${sizeMB} MB</div>
                    </div>
                    
                    <button class="delete-recording" data-id="${rec.id}" style="
                        background: none;
                        border: none;
                        color: #e74c3c;
                        cursor: pointer;
                        font-size: 1.2rem;
                        padding: 0.25rem;
                        transition: transform 0.2s;
                    " title="Delete">🗑️</button>
                </div>
            `;
        }).join('');
    }
    
    function injectRecorderStyles() {
        if (document.getElementById('voice-recorder-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'voice-recorder-styles';
        style.textContent = `
            .voice-recorder {
                background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(253,248,243,0.9));
                border: 2px solid var(--border-color, #E8E4E0);
                border-radius: 16px;
                padding: 1.5rem;
                margin-top: 1rem;
                animation: expandIn 0.4s ease;
            }
            
            @keyframes expandIn {
                from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            
            .recording-indicator {
                display: none;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 1rem;
                color: #e74c3c;
                font-weight: 600;
            }
            
            .recording-indicator.active {
                display: flex;
                animation: pulse 2s infinite;
            }
            
            .recording-dot {
                width: 16px;
                height: 16px;
                background: #e74c3c;
                border-radius: 50%;
                box-shadow: 0 0 10px #e74c3c;
                transition: transform 0.1s;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .recording-controls {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .recording-controls button {
                flex: 1;
                padding: 0.875rem;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            #startRecord {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
            }
            
            #startRecord:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
            }
            
            #startRecord:disabled {
                background: #95a5a6;
                cursor: not-allowed;
            }
            
            #stopRecord {
                background: var(--bg-secondary, #FDF8F3);
                color: var(--text-primary, #2C3E50);
                border: 2px solid var(--border-color, #E8E4E0);
            }
            
            #stopRecord:hover:not(:disabled) {
                background: #e74c3c;
                color: white;
                border-color: #e74c3c;
            }
            
            #stopRecord:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .play-recording:hover {
                transform: scale(1.1);
            }
            
            .play-recording.playing {
                animation: pulse 0.3s;
            }
            
            .delete-recording:hover {
                transform: scale(1.2);
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Voice recorder styles injected');
    }
    
    // Make functions globally accessible for onclick handlers if needed
    window.VoiceRecorder = {
        toggle: toggleRecorder,
        start: startRecording,
        stop: stopRecording,
        load: loadRecordings
    };
    
    console.log('🎙️ Voice recorder script loaded');
})();
