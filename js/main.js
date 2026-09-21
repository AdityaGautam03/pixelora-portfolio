/* =========================================================================
   Pixelora | main.js
   Plain JavaScript, no libraries.

   1. CONFIG            your contact details, edit only this part
   2. Contact links     Instagram chat (LET'S TALK), email, social links
   3. Waveforms         generated audio bars
   4. Navigation        mobile menu, scrolled state, active tab while scrolling
   5. Work filters
   6. Video viewer      showreel and project pop-up (native <dialog>)
   7. Hover previews    short muted clip on a work tile
   8. Before / after    draggable slider
   9. Scroll reveal
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- 1. CONFIG */
  var CONFIG = {
    instagramLink: '',                      // full Instagram link or username
    instagramUsername: 'INSTAGRAM_USERNAME', // your Instagram username (without @)
    email: 'adityagautam0305@gmail.com',     // your primary contact email
    showreel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // MP4 path or YouTube/Vimeo link
    social: {
      instagram: '',                        // left blank to use https://instagram.com/{instagramUsername}
      youtube: '',
      linkedin: '',
      behance: ''
    }
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------- 0. Intro Animation */
  (function initIntro() {
    var intro = document.getElementById('pxi');
    if (!intro) return;
    var root = document.documentElement;

    /* timeline markup */
    var ROW1 = [[2, 14, 'sun'], [18, 9.9, 'cyan'], [30, 21.9, 'magenta'], [54, 8.9, 'pink'], [65, 16, 'sun'], [83, 15, 'cyan']];
    var ROW2 = [[0, 30, 'violet'], [31.5, 17.9, 'magenta'], [51, 24, 'sun'], [76.5, 11.9, 'cyan'], [90, 10, 'violet']];
    var TOTAL_FRAMES = 991;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tc(p) { var f = Math.round(p * TOTAL_FRAMES); return '00:' + pad(Math.floor(f / 1440)) + ':' + pad(Math.floor(f / 24) % 60) + ':' + pad(f % 24); }
    function row(list) { return '<div class="pxi-row">' + list.map(function (c) { return '<i class="pxi-clip c-' + c[2] + '" style="left:' + c[0] + '%;width:' + c[1] + '%"></i>'; }).join('') + '</div>'; }
    var tlIntro = $('#pxi-tl', intro);
    if (!tlIntro) return;
    tlIntro.innerHTML = '<div class="pxi-ruler"></div><div class="pxi-rows">' + row(ROW1) + row(ROW2) + '<div class="pxi-wave"></div></div><span class="pxi-line"></span><span class="pxi-pill">' + tc(0) + '</span>';
    var pillIntro = $('.pxi-pill', tlIntro);

    function seeded(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function buildWave() {
      var w = $('.pxi-wave', tlIntro); if (!w) return;
      var n = Math.max(20, Math.floor(w.clientWidth / 7)), r = seeded(7), html = '';
      for (var i = 0; i < n; i++) {
        var env = .35 + .65 * Math.abs(Math.sin(i * .11) * Math.cos(i * .037 + 1));
        html += '<b style="height:' + Math.round(4 + r() * 22 * env * 1) + 'px"></b>';
      }
      w.innerHTML = html;
    }
    buildWave();

    /* if GSAP can't load, never block the site */
    if (!window.gsap) { intro.style.display = 'none'; return; }

    var reduce = reduceMotion;
    var pixels = $$('.pxi-px', intro), cyanpx = $('#pxi-cyan', intro), ping = $('#pxi-ping', intro), word = $('#pxi-word', intro), lockup = $('#pxi-lockup', intro);
    var strips = $$('.pxi-strip', intro), skip = $('#pxi-skip', intro), master;
    var readyP = Promise.resolve(document.fonts && document.fonts.ready).catch(function () { });
    var WORD_HIDE = 'inset(-0.25em 101% -0.25em -0.06em)', WORD_SHOW = 'inset(-0.25em -2% -0.25em -0.06em)';

    function finish() {
      intro.style.display = 'none'; root.classList.remove('pxi-lock');
      try { window.dispatchEvent(new CustomEvent('pixelora:intro-end')); } catch (e) { }
    }

    function play() {
      if (master) master.kill();
      root.classList.add('pxi-lock');
      intro.style.display = 'flex';
      gsap.set(intro, { opacity: 1 });
      gsap.set(strips, { yPercent: 0 });
      gsap.set(lockup, { opacity: 1, scale: 1 });
      gsap.set(tlIntro, { opacity: 1, y: 0, '--p': 0 });
      gsap.set(skip, { opacity: 1 });
      pillIntro.textContent = tc(0);

      if (reduce) {
        gsap.set(pixels, { opacity: 1, x: 0, y: 0, scale: 1 });
        gsap.set(word, { clipPath: WORD_SHOW, x: 0 }); gsap.set(lockup, { x: 0 });
        gsap.set(tlIntro, { '--p': 1 }); pillIntro.textContent = tc(1);
        master = gsap.timeline();
        master.to(intro, { opacity: 0, duration: .5, delay: .8 }).add(finish);
        return;
      }

      var shift = (word.offsetWidth + parseFloat(getComputedStyle(lockup).columnGap || 0)) / 2;
      gsap.set(pixels, { opacity: 0, y: -220, scale: .55 });
      gsap.set(ping, { opacity: 0 });
      gsap.set(word, { clipPath: WORD_HIDE, x: -40 });
      gsap.set(lockup, { x: shift });

      var tl = master = gsap.timeline();
      // 1. nine pixels drop in and form the play button
      tl.to(pixels, { opacity: 1, duration: .12, stagger: .07 }, .25);
      tl.to(pixels, { y: 0, scale: 1, duration: .6, ease: 'back.out(1.8)', stagger: .07 }, .25);
      // 2. the cyan pixel presses play
      tl.fromTo(cyanpx, { scale: 1 }, { scale: 1.4, duration: .12, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, 1.22);
      tl.fromTo(ping, { opacity: .95, scale: 1 }, { opacity: 0, scale: 3.6, duration: .75, ease: 'power2.out', immediateRender: false }, 1.22);
      // 3. wordmark rolls out from behind the mark
      tl.to(word, { clipPath: WORD_SHOW, x: 0, duration: .95, ease: 'power4.out' }, 1.32);
      tl.to(lockup, { x: 0, duration: .95, ease: 'power4.out' }, 1.32);
      // 4. timeline sweeps across (loading bar)
      tl.fromTo(tlIntro, { '--p': 0 }, { '--p': 1, duration: 2.6, ease: 'power1.inOut', onUpdate: function () { pillIntro.textContent = tc(Number(gsap.getProperty(tlIntro, '--p')) || 0); } }, .15);
      // hold until fonts are ready
      tl.addPause(2.9, function () { readyP.then(function () { tl.resume(); }); });
      tl.addLabel('exit', 2.9);
      // 5. exit: clips lift away and the site is revealed
      tl.to([lockup, skip], { opacity: 0, scale: .94, duration: .35, ease: 'power2.in' }, 'exit');
      tl.to(tlIntro, { opacity: 0, y: 20, duration: .3, ease: 'power2.in' }, 'exit');
      tl.to(strips, { yPercent: -101, duration: .85, ease: 'power4.inOut', stagger: .06 }, 'exit+=.2');
      tl.add(finish, 'exit+=1.55');
    }

    if (skip) skip.addEventListener('click', function () { if (master) master.timeScale(3.5); });
    window.pixeloraIntro = { play: play, _master: function () { return master; } };
    play();
  })();

  /* ---------------------------------------------------- 1.1 Dynamic CMS Sync */
  function applyContentData(data) {
    if (!data) return;
    try {
      // 1. Override CONFIG if provided
      if (data.config) {
        for (var k in data.config) {
          if (data.config[k] !== undefined && data.config[k] !== '') {
            if (k === 'social' && typeof data.config.social === 'object') {
              for (var sk in data.config.social) {
                if (data.config.social[sk]) CONFIG.social[sk] = data.config.social[sk];
              }
            } else {
              CONFIG[k] = data.config[k];
            }
          }
        }
        if (typeof updateContactsAndLinks === 'function') updateContactsAndLinks();
      }

      // 2. Override Text content
      if (data.text) {
        var t = data.text;
        var pill = $('.hero .pill');
        if (pill && t.pill) pill.innerHTML = '<span class="dot" aria-hidden="true"></span>' + t.pill;
        var h1 = $('#hero-title');
        if (h1 && t.h1) h1.innerHTML = t.h1;
        var tagB = $('.hero .stage .tag b');
        if (tagB && t.author) tagB.textContent = t.author;
        var tagSpan = $('.hero .stage .tag span');
        if (tagSpan && t.role) tagSpan.textContent = t.role;

        var abTitle = $('#about-title');
        if (abTitle && t.abtitle) abTitle.innerHTML = t.abtitle;
        var abPs = $$('.ab-copy p');
        if (abPs[0] && t.abp1) abPs[0].textContent = t.abp1;
        if (abPs[1] && t.abp2) abPs[1].textContent = t.abp2;
        var chips = $$('.ab-copy .chips .chip2');
        if (chips[0] && t.chip1) chips[0].textContent = t.chip1;
        if (chips[1] && t.chip2) chips[1].textContent = t.chip2;
        if (chips[2] && t.chip3) chips[2].textContent = t.chip3;

        var ctaTitle = $('#cta-title');
        if (ctaTitle && t.ctatitle) ctaTitle.textContent = t.ctatitle;
        var tagline = $('footer .tagline');
        if (tagline && t.tagline) tagline.textContent = t.tagline;
      }

      // 3. Override Services
      if (data.services && data.services.length) {
        var svcs = $$('.sv-grid .svc');
        data.services.forEach(function(s, idx) {
          if (svcs[idx]) {
            var sh3 = $('h3', svcs[idx]);
            var sp = $('p', svcs[idx]);
            if (sh3 && s.title) sh3.textContent = s.title;
            if (sp && s.desc) sp.textContent = s.desc;
          }
        });
      }

      // 4. Override Work Tiles
      if (data.projects && data.projects.length) {
        var tiles = $$('.grid .tile');
        data.projects.forEach(function(pj, idx) {
          if (tiles[idx]) {
            var tile = tiles[idx];
            // Aspect Ratio layout
            if (pj.ratio) {
              tile.classList.remove('w2', 'h2r');
              if (pj.ratio === '16:9') tile.classList.add('w2');
              else if (pj.ratio === '9:16') tile.classList.add('h2r');
            }
            if (pj.title) {
              tile.setAttribute('data-title', pj.title);
              var th3 = $('.cap h3', tile);
              if (th3) th3.textContent = pj.title;
              var btnOpen = $('.tile-open', tile);
              if (btnOpen) btnOpen.setAttribute('aria-label', 'Open project: ' + pj.title);
            }
            if (pj.sub) {
              tile.setAttribute('data-sub', pj.sub);
              var tp = $('.cap p', tile);
              if (tp) tp.textContent = pj.sub;
            }
            if (pj.video !== undefined) tile.setAttribute('data-video', pj.video);
            if (pj.preview !== undefined) tile.setAttribute('data-preview', pj.preview);
            if (pj.cat) {
              tile.setAttribute('data-cat', pj.cat);
              var badge = $('.badge', tile);
              if (badge) badge.textContent = pj.cat.charAt(0).toUpperCase() + pj.cat.slice(1);
            }
            // Autoplay video in work tile
            var vidSrc = (pj.video !== undefined && pj.video !== '') ? pj.video : (pj.preview || tile.getAttribute('data-video') || '');
            applyTileVideo(tile, vidSrc);
          }
        });
      }

      // 5. Override Before & After Media
      if (data.beforeAfter) {
        var baTile = $('.tile .ba');
        if (baTile) {
          var beforeScene = $('.scene.before', baTile);
          var afterScene = $('.scene:not(.before)', baTile);
          function setBAMedia(scene, src) {
            if (!scene || !src) return;
            var isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src) || src.indexOf('data:video') === 0;
            var rawFallback = src.indexOf('assets/uploads/') === 0 ? 'https://raw.githubusercontent.com/AdityaGautam03/pixelora-portfolio/main/' + src : '';
            scene.innerHTML = '';
            if (isVideo) {
              var v = document.createElement('video');
              v.src = src; v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true;
              v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('loop', ''); v.setAttribute('autoplay', '');
              if (rawFallback) {
                v.onerror = function() {
                  if (!this.dataset.retried) { this.dataset.retried = '1'; this.src = rawFallback; }
                };
              }
              scene.appendChild(v);
              v.play().catch(function(){});
            } else {
              var img = document.createElement('img');
              img.src = src; img.alt = 'Comparison';
              if (rawFallback) {
                img.onerror = function() {
                  if (!this.dataset.retried) { this.dataset.retried = '1'; this.src = rawFallback; }
                };
              }
              scene.appendChild(img);
            }
          }
          if (data.beforeAfter.beforeMedia) setBAMedia(beforeScene, data.beforeAfter.beforeMedia);
          if (data.beforeAfter.afterMedia) setBAMedia(afterScene, data.beforeAfter.afterMedia);
          if (data.beforeAfter.beforeLabel) {
            var lbL = $('.lbl.l', baTile.parentElement);
            if (lbL) lbL.textContent = data.beforeAfter.beforeLabel;
          }
          if (data.beforeAfter.afterLabel) {
            var lbR = $('.lbl.r', baTile.parentElement);
            if (lbR) lbR.textContent = data.beforeAfter.afterLabel;
          }
        }
      }
    } catch (e) {
      console.warn('Could not sync dynamic content:', e);
    }
  }

  function fetchCloudContent() {
    var endpoints = [
      '/api/content?t=' + Date.now(),
      'content.json?t=' + Date.now(),
      'https://raw.githubusercontent.com/AdityaGautam03/pixelora-portfolio/main/content.json?t=' + Date.now()
    ];

    function tryNext(index) {
      if (index >= endpoints.length) return;
      fetch(endpoints[index])
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function(json) {
          if (json && (json.text || json.projects || json.config)) {
            try {
              localStorage.setItem('PIXELORA_CONTENT', JSON.stringify(json));
            } catch(e) {}
            applyContentData(json);
          } else {
            tryNext(index + 1);
          }
        })
        .catch(function() {
          tryNext(index + 1);
        });
    }

    tryNext(0);
  }

  (function dynamicContent() {
    try {
      var raw = localStorage.getItem('PIXELORA_CONTENT');
      if (raw) {
        var data = JSON.parse(raw);
        if (data) applyContentData(data);
      }
    } catch (e) {}
    fetchCloudContent();
  })();

  /* ---------------------------------------------------- 1.2 Tile Video / Photo Autoplay */
  function isImageUrl(url) {
    if (!url) return false;
    return /\.(jpg|jpeg|jpe|jfif|png|webp|gif|svg|avif|bmp)(\?.*)?$/i.test(url) || url.indexOf('data:image') === 0;
  }

  function applyTileVideo(tile, vidSrc) {
    if (!tile) return;
    if (!vidSrc) {
      tile.classList.remove('has-video');
      var oldV = tile.querySelector('.tile-video, .tile-iframe, .tile-photo');
      if (oldV) oldV.remove();
      return;
    }

    tile.classList.add('has-video');

    // 1. YouTube embed
    var ytMatch = vidSrc.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/i);
    if (ytMatch) {
      var ytId = ytMatch[1];
      var ytSrc = 'https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&mute=1&loop=1&playlist=' + ytId + '&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1';
      var existingIframe = tile.querySelector('iframe.tile-iframe');
      if (!existingIframe) {
        existingIframe = document.createElement('iframe');
        existingIframe.className = 'tile-iframe';
        existingIframe.allow = 'autoplay; fullscreen';
        existingIframe.setAttribute('tabindex', '-1');
        tile.appendChild(existingIframe);
      }
      if (existingIframe.src !== ytSrc) existingIframe.src = ytSrc;
      var oldVid = tile.querySelector('video.tile-video, img.tile-photo');
      if (oldVid) oldVid.remove();
      return;
    }

    // 2. Vimeo embed
    var vmMatch = vidSrc.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
    if (vmMatch) {
      var vmId = vmMatch[1];
      var vmSrc = 'https://player.vimeo.com/video/' + vmId + '?autoplay=1&muted=1&loop=1&background=1&autopause=0';
      var existingVimeo = tile.querySelector('iframe.tile-iframe');
      if (!existingVimeo) {
        existingVimeo = document.createElement('iframe');
        existingVimeo.className = 'tile-iframe';
        existingVimeo.allow = 'autoplay; fullscreen';
        existingVimeo.setAttribute('tabindex', '-1');
        tile.appendChild(existingVimeo);
      }
      if (existingVimeo.src !== vmSrc) existingVimeo.src = vmSrc;
      var oldVid2 = tile.querySelector('video.tile-video, img.tile-photo');
      if (oldVid2) oldVid2.remove();
      return;
    }

    var rawFallback = vidSrc.indexOf('assets/uploads/') === 0 ? 'https://raw.githubusercontent.com/AdityaGautam03/pixelora-portfolio/main/' + vidSrc : '';

    // 3. Photo / Image Artwork (Thumbnails, Posters, Graphic Design)
    if (isImageUrl(vidSrc)) {
      var img = tile.querySelector('img.tile-photo');
      if (!img) {
        img = document.createElement('img');
        img.className = 'tile-photo';
        tile.appendChild(img);
      }
      if (rawFallback) {
        img.onerror = function() {
          if (!this.dataset.retried) {
            this.dataset.retried = '1';
            this.src = rawFallback;
          }
        };
      }
      if (img.src !== vidSrc) img.src = vidSrc;
      var oldVids = tile.querySelectorAll('video.tile-video, iframe.tile-iframe');
      oldVids.forEach(function(el){ el.remove(); });
      return;
    }

    // 4. Direct MP4 / WebM / MOV / blob / data video
    var v = tile.querySelector('video.tile-video');
    if (!v) {
      v = document.createElement('video');
      v.className = 'tile-video';
      v.muted = true;
      v.defaultMuted = true;
      v.autoplay = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('loop', '');
      v.setAttribute('autoplay', '');
      tile.appendChild(v);
    }
    if (rawFallback) {
      v.onerror = function() {
        if (!this.dataset.retried) {
          this.dataset.retried = '1';
          this.src = rawFallback;
        }
      };
    }
    if (v.src !== vidSrc) v.src = vidSrc;
    v.play().catch(function(){});
    v.addEventListener('ended', function() {
      v.currentTime = 0;
      v.play().catch(function(){});
    });
    var oldIf = tile.querySelectorAll('iframe.tile-iframe, img.tile-photo');
    oldIf.forEach(function(el){ el.remove(); });
  }

  // Ensure all tiles with data-video autoplay
  $$('.grid .tile').forEach(function(tile) {
    if (!tile.classList.contains('has-video')) {
      var vid = tile.getAttribute('data-video') || tile.getAttribute('data-preview');
      if (vid) applyTileVideo(tile, vid);
    }
  });

  // IntersectionObserver to auto-play as soon as user arrives at or scrolls into Work
  if ('IntersectionObserver' in window) {
    var vidObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var vids = entry.target.querySelectorAll ? entry.target.querySelectorAll('video.tile-video') : [];
          vids.forEach(function(vid) {
            vid.play().catch(function(){});
          });
        }
      });
    }, { threshold: 0.05 });

    var workEl = document.getElementById('work');
    if (workEl) vidObserver.observe(workEl);
    $$('.grid .tile').forEach(function(t) { vidObserver.observe(t); });
  }

  // Touch and scroll listeners to ensure playback on all devices
  var playAllTileVideos = function() {
    $$('video.tile-video').forEach(function(v) {
      if (v.paused) v.play().catch(function(){});
    });
  };
  window.addEventListener('scroll', playAllTileVideos, { passive: true });
  document.addEventListener('touchstart', playAllTileVideos, { passive: true, once: true });
  document.addEventListener('click', playAllTileVideos, { passive: true, once: true });

  /* ------------------------------------------------------- 2. Contact links */
  function updateContactsAndLinks() {
    var rawIg = CONFIG.instagramLink || CONFIG.instagramUsername || 'INSTAGRAM_USERNAME';
    var igChat = '';
    var igUser = '';
    if (rawIg) {
      if (rawIg.indexOf('http') === 0) {
        igChat = rawIg;
        var match = rawIg.match(/(?:instagram\.com\/|ig\.me\/m\/)([^/?#]+)/i);
        igUser = match ? match[1] : '';
      } else {
        igUser = rawIg.replace('@', '');
        igChat = 'https://ig.me/m/' + igUser;
      }
    }
    $$('[data-ig]').forEach(function (a) {
      if (igChat) { a.href = igChat; a.target = '_blank'; a.rel = 'noopener'; }
      if (a.hasAttribute('data-ig-label')) {
        a.textContent = (igUser && igUser !== 'INSTAGRAM_USERNAME') ? 'Instagram @' + igUser : 'DM on Instagram';
      }
    });
    function showToast(msg) {
      var toast = document.getElementById('toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<span class="dot"></span><span id="toast-msg"></span>';
        document.body.appendChild(toast);
      }
      var txt = document.getElementById('toast-msg') || toast;
      txt.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(function () {
        toast.classList.remove('show');
      }, 4000);
    }

    $$('[data-email]').forEach(function (a) {
      var email = CONFIG.email || 'adityagautam0305@gmail.com';
      a.href = 'mailto:' + email;
      a.textContent = email;

      if (!a._hasEmailHandler) {
        a._hasEmailHandler = true;
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var targetEmail = CONFIG.email || 'adityagautam0305@gmail.com';
          var subject = encodeURIComponent('Video Editing Project Inquiry - Pixelora');

          // Copy to clipboard
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(targetEmail).catch(function(){});
          }

          var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = 'mailto:' + targetEmail + '?subject=' + subject;
          } else {
            // On desktop/browser: Open Gmail compose in a new tab so it always opens reliably
            var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(targetEmail) + '&su=' + subject;
            window.open(gmailUrl, '_blank', 'noopener,noreferrer');
            // Also trigger standard mailto for native mail clients (Outlook, Apple Mail, etc.)
            setTimeout(function() {
              window.location.href = 'mailto:' + targetEmail + '?subject=' + subject;
            }, 300);
          }

          showToast('Opening email for ' + targetEmail + ' (copied to clipboard!)');
        });
      }
    });
    $$('[data-social]').forEach(function (a) {
      var network = a.getAttribute('data-social');
      var url = CONFIG.social[network];
      if (!url && network === 'instagram' && (igUser || igChat)) {
        url = igUser ? ('https://instagram.com/' + igUser) : igChat;
      }
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
    });
    var reel = $('#showreel');
    if (reel && CONFIG.showreel) reel.setAttribute('data-video', CONFIG.showreel);
  }

  (function contacts() {
    updateContactsAndLinks();
    // links that still have no destination should not jump to the top of the page
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="#"]');
      if (a && !a.hasAttribute('data-email') && !a.hasAttribute('data-ig')) e.preventDefault();
    });
  })();

  /* ---------------------------------------------------------- 3. Waveforms */
  (function waves() {
    function rng(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
    $$('[data-wave]').forEach(function (el, idx) {
      var n = parseInt(el.getAttribute('data-wave'), 10);
      var r = rng(7 + idx * 13);
      var m = window.innerWidth < 860 ? Math.round(n * 0.55) : n;
      for (var i = 0; i < m; i++) {
        var env = 0.35 + 0.65 * Math.abs(Math.sin(i / (m / 16))) * (0.6 + 0.4 * Math.sin(i / 3.3));
        var h = Math.max(10, Math.round((0.22 + 0.78 * r()) * env * 100));
        var bar = document.createElement('i');
        bar.style.height = h + '%';
        el.appendChild(bar);
      }
    });
  })();

  /* ---------------------------------------------------------- 4. Navigation */
  (function navigation() {
    var nav = $('#top-nav');
    var btn = $('.menu-btn');
    var links = $$('.links a');

    function closeMenu() {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
    }
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

    // outline under the nav once the page has been scrolled
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // highlight the tab of the section that is on screen
    var ids = ['home', 'about', 'work', 'services'];
    function setActive(id) {
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('on', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ids.forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    }
  })();

  /* ------------------------------------------------------- 5. Work filters */
  (function filters() {
    var chips = $$('.chip[data-filter]');
    var tiles = $$('.tile[data-cat]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('on', on);
          c.setAttribute('aria-pressed', String(on));
        });
        tiles.forEach(function (t) {
          var cats = t.getAttribute('data-cat').split(' ');
          t.hidden = !(f === 'all' || cats.indexOf(f) > -1);
        });
      });
    });
  })();

  /* -------------------------------------------------------- 6. Video viewer */
  (function viewer() {
    var dlg = $('#viewer');
    if (!dlg || typeof dlg.showModal !== 'function') return;
    var media = $('#viewer-media');
    var title = $('#viewer-title');
    var sub = $('#viewer-sub');
    var lastFocus = null;

    function embedUrl(url) {
      var yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/i);
      if (yt) return 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0';
      var vm = url.match(/vimeo\.com\/(\d+)/);
      if (vm) return 'https://player.vimeo.com/video/' + vm[1] + '?autoplay=1';
      return '';
    }

    function open(opts) {
      lastFocus = document.activeElement;
      title.textContent = opts.title || 'Showreel';
      sub.textContent = opts.sub || '';
      media.innerHTML = '';
      var url = opts.video || '';
      var emb = url ? embedUrl(url) : '';
      if (emb) {
        var f = document.createElement('iframe');
        f.src = emb; f.title = opts.title || 'Video';
        f.allow = 'autoplay; fullscreen; picture-in-picture';
        f.allowFullscreen = true;
        media.appendChild(f);
      } else if (url) {
        var v = document.createElement('video');
        v.src = url; v.controls = true; v.autoplay = true; v.playsInline = true;
        if (opts.poster) v.poster = opts.poster;
        media.appendChild(v);
      } else {
        // HIDE OR REMOVE BEFORE LAUNCH:
        // Once real video links are added to CONFIG.showreel and data-video attributes on project tiles,
        // this fallback message won't be seen. If you want to disable or customize this placeholder message
        // entirely before launch, you can comment out or update the line below (e.g. media.innerHTML = '';).
        media.innerHTML = '<div class="viewer-ph"><div class="play"><svg aria-hidden="true"><use href="#playi"/></svg></div>' +
          '<p>Your video will play here. Add a link in js/main.js (showreel) or a data-video attribute on this project in index.html.</p></div>';
      }
      dlg.showModal();
    }
    function close() { dlg.close(); }

    dlg.addEventListener('close', function () {
      media.innerHTML = '';           // stops playback
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    $('.viewer-close', dlg).addEventListener('click', close);

    var reel = $('#showreel');
    if (reel) reel.addEventListener('click', function (e) {
      e.preventDefault();
      open({ title: 'Showreel', sub: 'Aditya Gautam, video editor and colorist', video: reel.getAttribute('data-video') });
    });
    $$('.tile-open').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.closest('.tile');
        open({ title: t.getAttribute('data-title'), sub: t.getAttribute('data-sub'), video: t.getAttribute('data-video'), poster: t.getAttribute('data-poster') });
      });
    });
  })();

  /* ------------------------------------------------------ 7. Hover previews */
  (function previews() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    $$('.tile[data-preview]').forEach(function (tile) {
      var src = tile.getAttribute('data-preview');
      if (!src) return;
      var v = null;
      tile.addEventListener('mouseenter', function () {
        v = document.createElement('video');
        v.className = 'pv'; v.src = src; v.muted = true; v.loop = true; v.playsInline = true;
        var poster = tile.getAttribute('data-poster'); if (poster) v.poster = poster;
        tile.insertBefore(v, tile.firstChild);
        v.play().catch(function () {});
      });
      tile.addEventListener('mouseleave', function () { if (v) { v.pause(); v.remove(); v = null; } });
    });
  })();

  /* ------------------------------------------------------ 8. Before / after */
  (function beforeAfter() {
    var ba = $('.ba');
    if (!ba) return;
    var handle = $('.handle', ba);
    var dragging = false;
    function set(p) {
      p = Math.max(0, Math.min(100, p));
      ba.style.setProperty('--pos', p + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(p)));
    }
    function fromPointer(e) {
      var r = ba.getBoundingClientRect();
      set((e.clientX - r.left) / r.width * 100);
    }
    ba.addEventListener('pointerdown', function (e) { dragging = true; ba.setPointerCapture(e.pointerId); fromPointer(e); });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e); });
    ba.addEventListener('pointerup', function () { dragging = false; });
    ba.addEventListener('pointercancel', function () { dragging = false; });
    handle.addEventListener('keydown', function (e) {
      var cur = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') { set(cur - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(cur + 5); e.preventDefault(); }
      if (e.key === 'Home') { set(0); e.preventDefault(); }
      if (e.key === 'End') { set(100); e.preventDefault(); }
    });
  })();

  /* -------------------------------------------------------- 9. Scroll reveal */
  (function reveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var targets = $$('.ab-wrap, .ab-copy, .ticker-wrap, .soft h2, .soft .sub, .tool, .wk-head, .tile, .more, .sv-head, .svc, .cta .wrap > div');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
  })();
})();
