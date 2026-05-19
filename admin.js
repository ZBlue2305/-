// admin.js
document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
    if (localStorage.getItem('admin_auth') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('admin_auth');
        window.location.href = 'index.html';
    });

    // Navigation Active State
    const navLinks = document.querySelectorAll('.admin-nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Texts Section
    const thanks1 = document.getElementById('thanks1');
    const thanks2 = document.getElementById('thanks2');
    const thanks3 = document.getElementById('thanks3');
    const saveTextsBtn = document.getElementById('saveTextsBtn');
    const saveStatus = document.getElementById('saveStatus');

    // Load settings
    const settings = await getAllSettings();
    if (settings['thanks1']) thanks1.value = settings['thanks1'];
    if (settings['thanks2']) thanks2.value = settings['thanks2'];
    if (settings['thanks3']) thanks3.value = settings['thanks3'];

    saveTextsBtn.addEventListener('click', async () => {
        await setSetting('thanks1', thanks1.value);
        await setSetting('thanks2', thanks2.value);
        await setSetting('thanks3', thanks3.value);
        
        saveStatus.style.display = 'inline';
        setTimeout(() => saveStatus.style.display = 'none', 3000);
    });

    // Media Section
    const imageUpload = document.getElementById('imageUpload');
    const videoUpload = document.getElementById('videoUpload');
    const adminImageGrid = document.getElementById('adminImageGrid');
    const adminVideoGrid = document.getElementById('adminVideoGrid');
    const uploadProgress = document.getElementById('uploadProgress');

    async function loadMedia() {
        adminImageGrid.innerHTML = '';
        adminVideoGrid.innerHTML = '';

        const images = await getMedia('image');
        images.forEach(img => {
            const div = document.createElement('div');
            div.className = 'media-item';
            div.innerHTML = `
                <img src="${img.dataUrl}">
                <button class="delete-btn" data-id="${img.id}">✕</button>
            `;
            adminImageGrid.appendChild(div);
        });

        const videos = await getMedia('video');
        videos.forEach(vid => {
            const div = document.createElement('div');
            div.className = 'media-item';
            div.innerHTML = `
                <video src="${vid.dataUrl}" controls preload="metadata"></video>
                <button class="delete-btn" data-id="${vid.id}">✕</button>
            `;
            adminVideoGrid.appendChild(div);
        });

        // Attach delete events
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                if (confirm('هل أنت متأكد من الحذف؟')) {
                    await deleteMedia(id);
                    loadMedia();
                }
            });
        });
    }

    await loadMedia();

    // Read File as Data URL
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    // Handle Image Uploads
    imageUpload.addEventListener('change', async (e) => {
        const files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            const dataUrl = await readFileAsDataURL(files[i]);
            await addMedia('image', dataUrl);
        }
        imageUpload.value = '';
        loadMedia();
    });

    // Handle Video Uploads
    videoUpload.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) uploadProgress.style.display = 'block';
        for (let i = 0; i < files.length; i++) {
            try {
                const dataUrl = await readFileAsDataURL(files[i]);
                await addMedia('video', dataUrl);
            } catch (error) {
                alert('فشل رفع الفيديو. قد يكون حجمه كبيراً جداً.');
                console.error(error);
            }
        }
        uploadProgress.style.display = 'none';
        videoUpload.value = '';
        loadMedia();
    });
});
