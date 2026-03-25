/**
 * Gallery Image Uploader
 * Drop-in file - adds drag-drop and click upload with preview
 */

(function() {
    'use strict';
    
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGalleryUploader);
    } else {
        initGalleryUploader();
    }
    
    function initGalleryUploader() {
        console.log('🖼️ Gallery uploader initializing...');
        
        injectGalleryStyles();
        setupEventListeners();
        loadGallery();
    }
    
    function setupEventListeners() {
        // Use event delegation for all gallery interactions
        document.body.addEventListener('click', function(e) {
            // Upload zone clicked
            if (e.target.closest('#uploadZone')) {
                const input = document.getElementById('galleryInput');
                if (input) input.click();
                return;
            }
            
            // Gallery item clicked - view full size
            if (e.target.closest('.gallery-item')) {
                const item = e.target.closest('.gallery-item');
                const img = item.querySelector('img');
                if (img) openImageModal(img.src, item.dataset.category);
                return;
            }
            
            // Delete image button
            if (e.target.classList.contains('gallery-delete-btn')) {
                e.stopPropagation();
                const id = e.target.dataset.id;
                if (id) deleteImage(id);
                return;
            }
            
            // Filter buttons
            if (e.target.classList.contains('gallery-filter-btn')) {
                document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                loadGallery(e.target.dataset.filter);
                return;
            }
        });
        
        // File input change
        const fileInput = document.getElementById('galleryInput');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
        
        // Drag and drop on upload zone
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadZone.addEventListener(eventName, preventDefaults, false);
            });
            
            uploadZone.addEventListener('dragenter', highlightZone, false);
            uploadZone.addEventListener('dragover', highlightZone, false);
            uploadZone.addEventListener('dragleave', unhighlightZone, false);
            uploadZone.addEventListener('drop', handleDrop, false);
        }
    }
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlightZone(e) {
        const zone = e.target.closest('#uploadZone');
        if (zone) zone.classList.add('drag-active');
    }
    
    function unhighlightZone(e) {
        const zone = e.target.closest('#uploadZone');
        if (zone) zone.classList.remove('drag-active');
    }
    
    function handleDrop(e) {
        const zone = e.target.closest('#uploadZone');
        if (zone) zone.classList.remove('drag-active');
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    }
    
    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
        
        // Reset input so same file can be selected again
        e.target.value = '';
    }
    
    function handleFiles(files) {
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                alert(`Skipping ${file.name}: Only JPG, PNG, GIF, WebP images allowed`);
                return;
            }
            
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                alert(`Skipping ${file.name}: File too large (max 5MB)`);
                return;
            }
            
            // Read and process file
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Compress large images
                    const compressed = compressImage(img, file.type);
                    showCategoryModal(compressed, file.name);
                };
                img.src = e.target.result;
            };
            
            reader.onerror = function() {
                alert(`Error reading ${file.name}`);
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    function compressImage(img, type) {
        // If image is reasonably small, use as-is
        if (img.width <= 1200 && img.height <= 1200) {
            return img.src;
        }
        
        // Compress large images
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        
        // Max dimensions
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Return compressed data URL
        const quality = type === 'image/jpeg' ? 0.85 : 0.9;
        return canvas.toDataURL(type, quality);
    }
    
    function showCategoryModal(imageData, filename) {
        const modal = document.createElement('div');
        modal.className = 'gallery-modal';
        modal.innerHTML = `
            <div class="gallery-modal-content" style="
                background: white;
                padding: 2rem;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                animation: modalPop 0.3s ease;
            ">
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Add to Gallery</h3>
                
                <div style="
                    max-height: 300px;
                    overflow: hidden;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                ">
                    <img src="${imageData}" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                
                <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    ${filename}
                </p>
                
                <p style="margin-bottom: 1rem; font-weight: 500;">Choose a category:</p>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
                    <button class="category-btn" data-cat="comfort" style="
                        padding: 1rem;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <div style="font-size: 1.5rem;">🤗</div>
                        <div style="font-size: 0.9rem; margin-top: 0.25rem;">Comfort</div>
                    </button>
                    
                    <button class="category-btn" data-cat="inspiration" style="
                        padding: 1rem;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <div style="font-size: 1.5rem;">✨</div>
                        <div style="font-size: 0.9rem; margin-top: 0.25rem;">Inspiration</div>
                    </button>
                    
                    <button class="category-btn" data-cat="memories" style="
                        padding: 1rem;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <div style="font-size: 1.5rem;">📸</div>
                        <div style="font-size: 0.9rem; margin-top: 0.25rem;">Memories</div>
                    </button>
                    
                    <button class="category-btn" data-cat="art" style="
                        padding: 1rem;
                        border: 2px solid var(--border-color);
                        border-radius: 12px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <div style="font-size: 1.5rem;">🎨</div>
                        <div style="font-size: 0.9rem; margin-top: 0.25rem;">My Art</div>
                    </button>
                </div>
                
                <button class="cancel-upload" style="
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                ">Cancel</button>
            </div>
        `;
        
        // Backdrop
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
        `;
        
        document.body.appendChild(modal);
        
        // Category selection
        modal.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.cat;
                saveImage(imageData, filename, category);
                modal.remove();
            });
            
            // Hover effects
            btn.addEventListener('mouseenter', function() {
                this.style.borderColor = 'var(--accent-sage)';
                this.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.borderColor = 'var(--border-color)';
                this.style.transform = '';
            });
        });
        
        // Cancel
        modal.querySelector('.cancel-upload').addEventListener('click', () => modal.remove());
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    function saveImage(data, filename, category) {
        const images = getStoredImages();
        
        // Check storage limit (rough estimate)
        const currentSize = images.reduce((acc, img) => acc + (img.data.length * 0.75), 0);
        const newSize = data.length * 0.75;
        
        if (currentSize + newSize > 4.5 * 1024 * 1024) { // 4.5MB limit
            alert('Gallery storage is full. Please delete some images first.');
            return;
        }
        
        const newImage = {
            id: Date.now().toString(),
            data: data,
            filename: filename,
            category: category,
            dateAdded: new Date().toISOString()
        };
        
        images.push(newImage);
        localStorage.setItem('healingSpace_gallery', JSON.stringify(images));
        
        loadGallery();
        
        // Show success
        showNotification('Image saved to ' + category);
    }
    
    function getStoredImages() {
        try {
            return JSON.parse(localStorage.getItem('healingSpace_gallery')) || [];
        } catch (e) {
            return [];
        }
    }
    
    function deleteImage(id) {
        if (!confirm('Delete this image permanently?')) return;
        
        let images = getStoredImages();
        images = images.filter(img => img.id !== id);
        localStorage.setItem('healingSpace_gallery', JSON.stringify(images));
        
        loadGallery();
        showNotification('Image deleted');
    }
    
    function loadGallery(filter = 'all') {
        const grid = document.getElementById('galleryGrid');
        const empty = document.getElementById('galleryEmpty');
        
        if (!grid) return;
        
        let images = getStoredImages();
        
        if (images.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        
        if (empty) empty.style.display = 'none';
        
        // Apply filter
        if (filter !== 'all') {
            images = images.filter(img => img.category === filter);
        }
        
        // Sort by date (newest first)
        images.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        
        grid.innerHTML = images.map(img => {
            const date = new Date(img.dateAdded).toLocaleDateString();
            const categoryEmojis = {
                comfort: '🤗',
                inspiration: '✨',
                memories: '📸',
                art: '🎨'
            };
            
            return `
                <div class="gallery-item" data-category="${img.category}" style="
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transition: transform 0.3s, box-shadow 0.3s;
                ">
                    <img src="${img.data}" alt="${img.filename}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s;
                    ">
                    
                    <div class="gallery-overlay" style="
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: linear-gradient(transparent, rgba(0,0,0,0.7));
                        color: white;
                        padding: 1rem;
                        opacity: 0;
                        transition: opacity 0.3s;
                    ">
                        <div style="font-size: 1.2rem;">${categoryEmojis[img.category] || '🖼️'} ${img.category}</div>
                        <div style="font-size: 0.8rem; opacity: 0.9;">${date}</div>
                    </div>
                    
                    <button class="gallery-delete-btn" data-id="${img.id}" style="
                        position: absolute;
                        top: 0.5rem;
                        right: 0.5rem;
                        background: rgba(231, 76, 60, 0.9);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 32px;
                        height: 32px;
                        cursor: pointer;
                        opacity: 0;
                        transition: opacity 0.3s, transform 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1rem;
                    ">×</button>
                </div>
            `;
        }).join('');
        
        // Add hover effects via JS since we're injecting HTML
        grid.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                this.querySelector('.gallery-overlay').style.opacity = '1';
                this.querySelector('.gallery-delete-btn').style.opacity = '1';
                this.querySelector('img').style.transform = 'scale(1.1)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
                this.querySelector('.gallery-overlay').style.opacity = '0';
                this.querySelector('.gallery-delete-btn').style.opacity = '0';
                this.querySelector('img').style.transform = '';
            });
        });
    }
    
    function openImageModal(src, category) {
        const modal = document.createElement('div');
        modal.className = 'image-viewer-modal';
        modal.innerHTML = `
            <div style="
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
            ">
                <img src="${src}" style="
                    max-width: 90vw;
                    max-height: 90vh;
                    object-fit: contain;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                ">
                <button class="close-viewer" style="
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            animation: fadeIn 0.3s;
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-viewer').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    function showNotification(text) {
        const notif = document.createElement('div');
        notif.textContent = text;
        notif.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-sage, #9CAF88);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 5000;
            animation: slideUp 0.4s ease;
            font-weight: 500;
        `;
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideDown 0.4s ease forwards';
            setTimeout(() => notif.remove(), 400);
        }, 3000);
    }
    
    function injectGalleryStyles() {
        if (document.getElementById('gallery-uploader-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gallery-uploader-styles';
        style.textContent = `
            @keyframes modalPop {
                from { opacity: 0; transform: scale(0.9) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            
            @keyframes slideDown {
                to { opacity: 0; transform: translateX(-50%) translateY(20px); }
            }
            
            #uploadZone {
                transition: all 0.3s ease;
            }
            
            #uploadZone.drag-active {
                border-color: var(--accent-sage, #9CAF88) !important;
                background: rgba(156, 175, 136, 0.1) !important;
                transform: scale(1.02);
            }
            
            .gallery-filter-btn {
                padding: 0.5rem 1rem;
                border: 2px solid var(--border-color, #E8E4E0);
                background: white;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .gallery-filter-btn.active,
            .gallery-filter-btn:hover {
                background: var(--accent-sage, #9CAF88);
                color: white;
                border-color: var(--accent-sage, #9CAF88);
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Gallery uploader styles injected');
    }
    
    // Global access
    window.GalleryUploader = {
        refresh: loadGallery,
        delete: deleteImage
    };
    
    console.log('🖼️ Gallery uploader script loaded');
})();
