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

  // ░░░ 6. DYNAMIC MEDIA LOADER (IMAGES & VIDEOS) ░░░
  // Since we don't have a backend, we'll try to load files sequentially 
  // until we hit a 404 error (or simulate this behavior).
  
  const MAX_ATTEMPTS = 30; // Max number of files to try loading
  
  // --- Gallery Logic ---
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryEmpty = document.getElementById('galleryEmpty');
  const galleryCountBadge = document.getElementById('galleryCountBadge');
  const galleryImages = []; // Store loaded image URLs

  async function loadImages() {
    let consecutiveFails = 0;
    let index = 1;

    // Simulate checking files: 1.jpeg, 2.jpeg...
    while (consecutiveFails < 2 && index <= MAX_ATTEMPTS) {
      const url = `images/${index}.jpeg`;
      const exists = await checkFileExists(url);
      
      if (exists) {
        galleryImages.push(url);
        renderGalleryItem(url, index - 1);
        consecutiveFails = 0;
      } else {
        // Try jpg just in case
        const jpgUrl = `images/${index}.jpg`;
        const jpgExists = await checkFileExists(jpgUrl);
        if (jpgExists) {
          galleryImages.push(jpgUrl);
          renderGalleryItem(jpgUrl, index - 1);
          consecutiveFails = 0;
        } else {
          consecutiveFails++;
        }
      }
      index++;
    }

    if (galleryImages.length === 0) {
      galleryEmpty.classList.add('show');
    } else {
      galleryCountBadge.textContent = `${galleryImages.length} صورة`;
    }
  }

  function renderGalleryItem(url, index) {
    const div = document.createElement('div');
    div.className = 'gallery-item fade-on-scroll visible'; // Already visible to skip scroll logic if loaded late
    div.innerHTML = `
      <img src="${url}" alt="صورة ${index + 1}" loading="lazy">
      <div class="gallery-overlay">
        <span class="gallery-icon">🔍</span>
      </div>
    `;
    
    // Add lightbox click event
    div.addEventListener('click', () => openLightbox(index));
    
    galleryGrid.appendChild(div);
  }

  // --- Video Logic ---
  const videoGrid = document.getElementById('videoGrid');
  const videoEmpty = document.getElementById('videoEmpty');

  async function loadVideos() {
    let consecutiveFails = 0;
    let index = 1;
    let loadedCount = 0;

    while (consecutiveFails < 2 && index <= MAX_ATTEMPTS) {
      const url = `videos/${index}.mp4`;
      const exists = await checkFileExists(url);
      
      if (exists) {
        renderVideoItem(url, index);
        loadedCount++;
        consecutiveFails = 0;
      } else {
        consecutiveFails++;
      }
      index++;
    }

    if (loadedCount === 0) {
      videoEmpty.classList.add('show');
    }
  }

  function renderVideoItem(url, index) {
    const div = document.createElement('div');
    div.className = 'video-item fade-on-scroll visible';
    div.innerHTML = `
      <div class="video-wrapper">
        <video controls preload="metadata" poster="">
          <source src="${url}" type="video/mp4">
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      </div>
      <div class="video-info">
        <h3 class="video-title">مقطع مرئي ${index}</h3>
      </div>
    `;
    videoGrid.appendChild(div);
  }

  // Helper function to check if a file exists using fetch HEAD request
  async function checkFileExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false; // CORS or network error usually means we can't load it anyway
    }
  }

  // Start loading media
  loadImages();
  loadVideos();

  // ░░░ 7. LIGHTBOX LOGIC ░░░
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  
  let currentImageIndex = 0;

  function openLightbox(index) {
    if (galleryImages.length === 0) return;
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    lightboxImg.src = galleryImages[currentImageIndex];
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
  }

  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
  }

  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  // Lightbox Event Listeners
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', nextImage); // Next in RTL means left visually, but logic is +1
  lightboxPrev.addEventListener('click', prevImage);
  
  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') nextImage(); // Left arrow goes to next in RTL
    if (e.key === 'ArrowRight') prevImage(); // Right arrow goes to prev in RTL
  });

});
