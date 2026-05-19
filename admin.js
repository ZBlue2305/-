document.addEventListener('DOMContentLoaded', async () => {
  // ── Auth Check ──
  if (localStorage.getItem('admin_auth') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  // ── Elements ──
  const sidebar = document.getElementById('sidebar');
  const mobileToggle = document.getElementById('mobileToggle');
  const logoutBtn = document.getElementById('logoutBtn');
  const toastContainer = document.getElementById('toastContainer');

  // ── Toast System ──
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ── Mobile Toggle ──
  mobileToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  // ── Logout ──
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('admin_auth');
    window.location.href = 'index.html';
  });

  // ── Tab Navigation ──
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(tabName) {
    navItems.forEach(n => n.classList.remove('active'));
    tabContents.forEach(t => t.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`tab-${tabName}`)?.classList.add('active');
    sidebar.classList.remove('open');
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(item.dataset.tab);
    });
  });

  // Quick action buttons
  document.querySelectorAll('.action-btn[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.goto));
  });

  // ── Firebase Status ──
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const setupBanner = document.getElementById('setupBanner');
  const statStatus = document.getElementById('statStatus');

  if (isFirebaseConfigured && fireDB) {
    statusDot.classList.add('connected');
    statusText.textContent = 'Firebase متصل ✓';
    statStatus.textContent = 'متصل ✓';
    setupBanner.style.display = 'none';
  } else {
    statusDot.classList.add('disconnected');
    statusText.textContent = 'غير متصل — يرجى إعداد Firebase';
    statStatus.textContent = 'غير متصل';
    setupBanner.style.display = 'flex';
  }

  // ── Load Media ──
  const adminImageGrid = document.getElementById('adminImageGrid');
  const adminVideoGrid = document.getElementById('adminVideoGrid');
  const imageEmptyState = document.getElementById('imageEmptyState');
  const videoEmptyState = document.getElementById('videoEmptyState');
  const statImages = document.getElementById('statImages');
  const statVideos = document.getElementById('statVideos');
  const imageCount = document.getElementById('imageCount');
  const videoCount = document.getElementById('videoCount');

  async function refreshMedia() {
    adminImageGrid.innerHTML = '';
    adminVideoGrid.innerHTML = '';

    let images = [];
    let videos = [];

    if (isFirebaseConfigured && fireDB) {
      images = await fireGetMedia('image');
      videos = await fireGetMedia('video');
    }

    statImages.textContent = images.length;
    statVideos.textContent = videos.length;
    imageCount.textContent = images.length;
    videoCount.textContent = videos.length;

    if (images.length === 0) {
      imageEmptyState.classList.add('show');
    } else {
      imageEmptyState.classList.remove('show');
      images.forEach(img => {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.innerHTML = `
          <img src="${img.url}" alt="${img.name || 'صورة'}">
          <button class="delete-btn" title="حذف">✕</button>
        `;
        div.querySelector('.delete-btn').addEventListener('click', async () => {
          if (confirm('هل أنت متأكد من الحذف؟')) {
            await fireDeleteMedia(img.id, img.storagePath);
            showToast('تم حذف الصورة');
            refreshMedia();
          }
        });
        adminImageGrid.appendChild(div);
      });
    }

    if (videos.length === 0) {
      videoEmptyState.classList.add('show');
    } else {
      videoEmptyState.classList.remove('show');
      videos.forEach(vid => {
        const div = document.createElement('div');
        div.className = 'media-item video-item-admin';
        div.innerHTML = `
          <video src="${vid.url}" controls preload="metadata"></video>
          <div class="video-rename-wrap">
            <input type="text" class="video-rename-input" value="${vid.name || ''}" placeholder="اسم الفيديو..." />
            <button class="save-name-btn" title="حفظ الاسم">💾</button>
          </div>
          <button class="delete-btn" title="حذف">✕</button>
        `;
        div.querySelector('.delete-btn').addEventListener('click', async () => {
          if (confirm('هل أنت متأكد من الحذف؟')) {
            await fireDeleteMedia(vid.id, vid.storagePath);
            showToast('تم حذف الفيديو');
            refreshMedia();
          }
        });
        
        // Rename logic
        const renameInput = div.querySelector('.video-rename-input');
        const saveNameBtn = div.querySelector('.save-name-btn');
        saveNameBtn.addEventListener('click', async () => {
          const newName = renameInput.value.trim();
          if (!newName) return;
          try {
            saveNameBtn.textContent = '⏳';
            await fireUpdateMediaName(vid.id, newName);
            showToast('تم تحديث اسم الفيديو بنجاح');
            saveNameBtn.textContent = '💾';
          } catch (err) {
            showToast('حدث خطأ أثناء التحديث', 'error');
            saveNameBtn.textContent = '💾';
          }
        });

        adminVideoGrid.appendChild(div);
      });
    }
  }

  await refreshMedia();

  // ── Upload Handlers ──
  function setupUpload(dropZoneId, inputId, btnId, progressWrapId, progressFillId, progressTextId, type) {
    const dropZone = document.getElementById(dropZoneId);
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const progressWrap = document.getElementById(progressWrapId);
    const progressFill = document.getElementById(progressFillId);
    const progressText = document.getElementById(progressTextId);

    btn.addEventListener('click', (e) => { e.stopPropagation(); input.click(); });
    dropZone.addEventListener('click', () => input.click());

    // Drag & drop
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', (e) => handleFiles(e.target.files));

    async function handleFiles(files) {
      if (!isFirebaseConfigured || !fireStorage) {
        showToast('يرجى إعداد Firebase أولاً لرفع الملفات', 'error');
        return;
      }
      if (files.length === 0) return;

      progressWrap.style.display = 'block';
      for (let i = 0; i < files.length; i++) {
        const pct = Math.round(((i) / files.length) * 100);
        progressFill.style.width = pct + '%';
        progressText.textContent = `جاري رفع ${i + 1} من ${files.length}...`;
        try {
          await fireUploadMedia(files[i], type);
        } catch (err) {
          showToast(`فشل رفع ${files[i].name}`, 'error');
          console.error(err);
        }
      }
      progressFill.style.width = '100%';
      progressText.textContent = 'تم الرفع بنجاح!';
      setTimeout(() => { progressWrap.style.display = 'none'; progressFill.style.width = '0%'; }, 1500);
      input.value = '';
      showToast(`تم رفع ${files.length} ملف بنجاح`);
      refreshMedia();
    }
  }

  setupUpload('imageDropZone', 'imageUpload', 'imageUploadBtn', 'imageProgressWrap', 'imageProgressFill', 'imageProgressText', 'image');
  setupUpload('videoDropZone', 'videoUpload', 'videoUploadBtn', 'videoProgressWrap', 'videoProgressFill', 'videoProgressText', 'video');

  // ── Text Settings & Complete Website Details ──
  const contentFields = [
    'heroLine1', 'heroLine2', 'heroLine3', 'heroQuote', 'heroHadith',
    'thanksSalutation', 'thanks1', 'thanks2', 'thanks3', 'thanksDua', 'thanksSignature',
    'footerLogo', 'footerText', 'footerQuote', 'footerCopy'
  ];

  const fieldEls = {};
  contentFields.forEach(id => {
    fieldEls[id] = document.getElementById(id);
  });

  const saveTextsBtn = document.getElementById('saveTextsBtn');
  const currentAudioText = document.getElementById('currentAudioText');

  if (isFirebaseConfigured && fireDB) {
    const settings = await fireGetSettings();
    contentFields.forEach(id => {
      if (settings[id] && fieldEls[id]) {
        fieldEls[id].value = settings[id];
      }
    });
    if (settings.mainAudioUrl) {
      currentAudioText.textContent = "يوجد ملف صوتي مرفوع وحالياً يعرض في الموقع ✓";
    }
  }

  saveTextsBtn.addEventListener('click', async () => {
    if (!isFirebaseConfigured || !fireDB) {
      showToast('يرجى إعداد Firebase أولاً', 'error');
      return;
    }
    try {
      saveTextsBtn.textContent = 'جاري الحفظ... ⏳';
      const newData = {};
      contentFields.forEach(id => {
        if (fieldEls[id]) {
          newData[id] = fieldEls[id].value;
        }
      });
      await fireSaveSettings(newData);
      showToast('تم حفظ التغييرات بنجاح');
      saveTextsBtn.textContent = 'حفظ جميع التغييرات ✓';
    } catch (err) {
      showToast('فشل الحفظ', 'error');
      console.error(err);
      saveTextsBtn.textContent = 'حفظ جميع التغييرات ✓';
    }
  });

  // ── Audio Upload Handler ──
  const audioDropZone = document.getElementById('audioDropZone');
  const audioUpload = document.getElementById('audioUpload');
  const audioUploadBtn = document.getElementById('audioUploadBtn');
  const audioProgressWrap = document.getElementById('audioProgressWrap');
  const audioProgressFill = document.getElementById('audioProgressFill');
  const audioProgressText = document.getElementById('audioProgressText');

  if(audioUploadBtn) {
    audioUploadBtn.addEventListener('click', (e) => { e.stopPropagation(); audioUpload.click(); });
    audioDropZone.addEventListener('click', () => audioUpload.click());
    
    audioUpload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!isFirebaseConfigured || !fireStorage) {
        showToast('يرجى إعداد Firebase أولاً', 'error');
        return;
      }

      audioProgressWrap.style.display = 'block';
      audioProgressFill.style.width = '50%';
      audioProgressText.textContent = 'جاري الرفع...';

      try {
        const url = await fireUploadMedia(file, 'audio');
        // Save the audio URL directly to settings instead of general media collection
        await fireSaveSettings({ mainAudioUrl: url });
        
        audioProgressFill.style.width = '100%';
        audioProgressText.textContent = 'تم رفع النشيد بنجاح!';
        setTimeout(() => { audioProgressWrap.style.display = 'none'; audioProgressFill.style.width = '0%'; }, 2000);
        currentAudioText.textContent = "تم تحديث الملف الصوتي بنجاح ✓";
        showToast('تم تحديث النشيد الرسمي بنجاح');
      } catch (err) {
        showToast('حدث خطأ أثناء الرفع', 'error');
        console.error(err);
      }
      audioUpload.value = '';
    });
  }
});
