document.addEventListener('DOMContentLoaded', () => {
  // ░░░ 1. NAVBAR SCROLL & MOBILE TOGGLE ░░░
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  const mobileLinks = navMobile.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.add('scrolled'); // Force scrolled style if desired, or remove to revert
      // Let's actually toggle it properly based on scroll:
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  navToggle.addEventListener('click', () => {
    navMobile.classList.toggle('active');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMobile.classList.remove('active');
    });
  });

  // ░░░ 2. SCROLL ANIMATIONS (FADE IN) ░░░
  const fadeElements = document.querySelectorAll('.fade-on-scroll');

  const fadeObserverOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add a slight delay if specified in data-delay
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, fadeObserverOptions);

  fadeElements.forEach(el => {
    fadeObserver.observe(el);
  });

  // ░░░ 3. HERO PARTICLES ░░░
  const particlesContainer = document.getElementById('heroParticles');
  if (particlesContainer) {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      // Random properties
      const size = Math.random() * 8 + 2; // 2px to 10px
      const left = Math.random() * 100; // 0% to 100%
      const duration = Math.random() * 4 + 3; // 3s to 7s
      const delay = Math.random() * 5; // 0s to 5s

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}%`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;

      particlesContainer.appendChild(particle);
    }
  }



  // ░░░ 5. AUDIO PLAYER LOGIC ░░░
  const audioPlayer = document.getElementById('audioPlayer');
  const btnPlay = document.getElementById('btnPlay');
  const playIcon = document.getElementById('playIcon');
  const btnRestart = document.getElementById('btnRestart');
  const btnRewind = document.getElementById('btnRewind');
  const btnForward = document.getElementById('btnForward');
  const btnLoop = document.getElementById('btnLoop');
  const volumeSlider = document.getElementById('volumeSlider');

  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');

  const playerArtInner = document.querySelector('.player-art-inner');
  const playerArtIcon = document.getElementById('playerArtIcon');

  let isPlaying = false;
  let isLooping = false;

  // Format time (seconds to m:ss)
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Load metadata
  audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
  });

  // Since local files might load instantly, check if duration is already available
  if (audioPlayer.readyState >= 1) {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
  } else {
    // If it fails to load immediately, set a fallback or wait
    audioPlayer.addEventListener('error', () => {
      console.log("Audio file not found or couldn't be loaded.");
      totalTimeEl.textContent = "0:00";
    });
  }

  // Play / Pause
  btnPlay.addEventListener('click', () => {
    if (isPlaying) {
      audioPlayer.pause();
      playIcon.textContent = "▶";
      playerArtInner.classList.remove('playing');
    } else {
      audioPlayer.play().catch(e => console.log("Audio play error:", e));
      playIcon.textContent = "⏸";
      playerArtInner.classList.add('playing');
    }
    isPlaying = !isPlaying;
    btnPlay.classList.toggle('is-playing', isPlaying);
  });

  // Update progress
  audioPlayer.addEventListener('timeupdate', () => {
    const current = audioPlayer.currentTime;
    const total = audioPlayer.duration;

    if (!isNaN(total)) {
      const percent = (current / total) * 100;
      progressFill.style.width = `${percent}%`;
      progressThumb.style.left = `${percent}%`;
      currentTimeEl.textContent = formatTime(current);
    }
  });

  // Click on progress bar
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = pos * audioPlayer.duration;
  });

  // Controls
  btnRestart.addEventListener('click', () => {
    audioPlayer.currentTime = 0;
    if (!isPlaying) btnPlay.click();
  });

  btnRewind.addEventListener('click', () => {
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
  });

  btnForward.addEventListener('click', () => {
    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
  });

  btnLoop.addEventListener('click', () => {
    isLooping = !isLooping;
    audioPlayer.loop = isLooping;
    btnLoop.classList.toggle('active', isLooping);
  });

  // Volume
  volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
  });

  // Auto reset when ended
  audioPlayer.addEventListener('ended', () => {
    if (!isLooping) {
      isPlaying = false;
      playIcon.textContent = "▶";
      btnPlay.classList.remove('is-playing');
      playerArtInner.classList.remove('playing');
      audioPlayer.currentTime = 0;
    }
  });

  // ░░░ 6. DYNAMIC MEDIA LOADER & SLIDERS ░░░

  // --- Gallery Logic ---
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryEmpty = document.getElementById('galleryEmpty');
  const galleryCountBadge = document.getElementById('galleryCountBadge');

  let galleryImages = [];
  
  // Slider Controls
  const galleryPrev = document.getElementById('gallerySliderPrev');
  const galleryNext = document.getElementById('gallerySliderNext');
  
  if (galleryPrev && galleryNext && galleryGrid) {
    galleryPrev.addEventListener('click', () => {
      galleryGrid.scrollBy({ left: 300, behavior: 'smooth' }); // left is positive in RTL
    });
    galleryNext.addEventListener('click', () => {
      galleryGrid.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }

  // --- Video Logic ---
  const videoGrid = document.getElementById('videoGrid');
  const videoEmpty = document.getElementById('videoEmpty');
  
  let videoFiles = [];

  const videoPrev = document.getElementById('videoSliderPrev');
  const videoNext = document.getElementById('videoSliderNext');

  if (videoPrev && videoNext && videoGrid) {
    videoPrev.addEventListener('click', () => {
      videoGrid.scrollBy({ left: 320, behavior: 'smooth' });
    });
    videoNext.addEventListener('click', () => {
      videoGrid.scrollBy({ left: -320, behavior: 'smooth' });
    });
  }

  // Load Media from Firebase or Local
  async function loadMedia() {
    if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured && fireDB) {
      // Fetch from Firebase
      const fireImages = await fireGetMedia('image');
      galleryImages = fireImages.map(img => img.url);

      const fireVideos = await fireGetMedia('video');
      videoFiles = fireVideos;
    } else {
      // Local fallback
      galleryImages = [
        'images/1.jpeg', 'images/2.jpeg', 'images/2.1.jpeg', 'images/3.jpeg',
        'images/4.jpeg', 'images/5.jpeg', 'images/6.jpeg', 'images/7.jpeg'
      ];
      videoFiles = [
        { url: 'videos/1.mp4', name: 'مقطع مرئي 1' },
        { url: 'videos/2.mp4', name: 'مقطع مرئي 2' }
      ];
    }

    renderGallery();
    renderVideos();
  }

  function renderGallery() {
    galleryGrid.innerHTML = '';
    if (galleryImages.length === 0) {
      galleryEmpty.classList.add('show');
      galleryCountBadge.textContent = '0 صورة';
    } else {
      galleryEmpty.classList.remove('show');
      galleryCountBadge.textContent = `${galleryImages.length} صورة`;
      galleryImages.forEach((url, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item fade-on-scroll visible';
        div.innerHTML = `
          <img src="${url}" alt="صورة ${index + 1}">
          <div class="gallery-overlay">
            <span class="gallery-icon">🔍</span>
          </div>
        `;
        div.addEventListener('click', () => openLightbox(index));
        galleryGrid.appendChild(div);
      });
    }
  }

  function renderVideos() {
    videoGrid.innerHTML = '';
    if (videoFiles.length === 0) {
      videoEmpty.classList.add('show');
    } else {
      videoEmpty.classList.remove('show');
      videoFiles.forEach((vid, index) => {
        const div = document.createElement('div');
        div.className = 'video-item fade-on-scroll visible';
        const vidName = vid.name || `مقطع مرئي ${index + 1}`;
        const vidUrl = vid.url || vid;
        div.innerHTML = `
          <div class="video-wrapper">
            <video controls preload="metadata" poster="">
              <source src="${vidUrl}" type="video/mp4">
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
          </div>
          <div class="video-info">
            <h3 class="video-title">${vidName}</h3>
          </div>
        `;
        videoGrid.appendChild(div);
      });
    }
  }

  // --- Dynamic Content & Settings Loader ---
  async function loadSettings() {
    if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured && fireDB) {
      const settings = await fireGetSettings();
      
      const contentFields = [
        { id: 'elHeroLine1', key: 'heroLine1' },
        { id: 'elHeroLine2', key: 'heroLine2' },
        { id: 'elHeroLine3', key: 'heroLine3' },
        { id: 'elHeroQuote', key: 'heroQuote' },
        { id: 'elHeroHadith', key: 'heroHadith' },
        { id: 'elThanksSalutation', key: 'thanksSalutation' },
        { id: 'elThanks1', key: 'thanks1' },
        { id: 'elThanks2', key: 'thanks2' },
        { id: 'elThanks3', key: 'thanks3' },
        { id: 'elThanksDua', key: 'thanksDua' },
        { id: 'elThanksSignature', key: 'thanksSignature' },
        { id: 'elFooterLogo', key: 'footerLogo' },
        { id: 'elFooterText', key: 'footerText' },
        { id: 'elFooterQuote', key: 'footerQuote' },
        { id: 'elFooterCopy', key: 'footerCopy' }
      ];

      contentFields.forEach(field => {
        if (settings[field.key]) {
          const el = document.getElementById(field.id);
          if (el) el.textContent = settings[field.key];
        }
      });

      // Update audio source if exists
      if (settings.mainAudioUrl) {
        const audioEl = document.getElementById('audioPlayer');
        if (audioEl) {
          audioEl.src = settings.mainAudioUrl;
          audioEl.load();
        }
      }
    }
  }

  loadMedia();
  loadSettings();

  // ░░░ VISITOR UPLOAD ░░░
  const visitorImageUpload = document.getElementById('visitorImageUpload');
  const visitorImageBtn = document.getElementById('visitorImageBtn');
  const visitorVideoUpload = document.getElementById('visitorVideoUpload');
  const visitorVideoBtn = document.getElementById('visitorVideoBtn');

  function setupVisitorUpload(btn, input, type) {
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured) {
        input.click();
      } else {
        alert('ميزة المشاركة غير مفعلة حالياً. (تحتاج إعداد Firebase)');
      }
    });

    input.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files.length) return;
      
      btn.textContent = 'جاري الرفع... ⏳';
      btn.disabled = true;

      try {
        for (let i = 0; i < files.length; i++) {
          await fireUploadMedia(files[i], type);
        }
        alert('شكراً لمشاركتك! تم رفع الملفات بنجاح. 🌸');
        await loadMedia();
      } catch (err) {
        alert('حدث خطأ أثناء الرفع.');
        console.error(err);
      } finally {
        btn.textContent = type === 'image' ? '📸 شاركي صورتك' : '🎥 شاركي فيديو';
        btn.disabled = false;
        input.value = '';
      }
    });
  }

  setupVisitorUpload(visitorImageBtn, visitorImageUpload, 'image');
  setupVisitorUpload(visitorVideoBtn, visitorVideoUpload, 'video');


  // ░░░ 7. LIGHTBOX LOGIC ░░░
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');

  const lightboxLoader = document.createElement('div');
  lightboxLoader.className = 'lightbox-loader';
  lightbox.appendChild(lightboxLoader);

  let currentImageIndex = 0;

  function openLightbox(index) {
    if (galleryImages.length === 0) return;
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    lightboxLoader.style.display = 'block';
    lightboxImg.style.opacity = '0';

    lightboxImg.src = galleryImages[currentImageIndex];
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;

    if (lightboxImg.complete) {
      lightboxLoader.style.display = 'none';
      lightboxImg.style.opacity = '1';
    }
  }

  lightboxImg.onload = () => {
    lightboxLoader.style.display = 'none';
    lightboxImg.style.opacity = '1';
  };

  lightboxImg.onerror = () => {
    lightboxLoader.style.display = 'none';
  };

  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
  }

  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', nextImage);
  lightboxPrev.addEventListener('click', prevImage);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') nextImage(); 
    if (e.key === 'ArrowRight') prevImage(); 
  });

});
