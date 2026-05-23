// Vibestream Main Application Controller
// Manages state, chat generation bots, user interactions, and Creator Studio dashboards.

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Channels Database
  const channels = [
    {
      id: 'neon_rider',
      name: 'NeonRider',
      title: '🔴 RETRO GRID HIGH-SCORE ATTEMPT! 🕹️ [Synthwave Chill]',
      category: 'Gaming',
      viewers: 1420,
      uptime: '02:45:12',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&h=80&q=80',
      streamType: 'retro-gaming',
      tags: ['Retro', 'Synthwave', 'NoBackseat', 'English']
    },
    {
      id: 'lofi_dreamer',
      name: 'LofiChillDreamer',
      title: '📚 Lofi Beats to Code/Study to ☕ [Regn & Kattmys]',
      category: 'Music',
      viewers: 3840,
      uptime: '24:12:05',
      avatar: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=80&h=80&q=80',
      streamType: 'chill-lofi',
      tags: ['Relax', 'Study', 'Chilled', 'Coding']
    },
    {
      id: 'matrix_ninja',
      name: 'MatrixNinja',
      title: '💻 Building a custom live-streaming app from scratch in Vanilla JS!',
      category: 'Creative',
      viewers: 320,
      uptime: '00:54:19',
      avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=80&h=80&q=80',
      streamType: 'creative-coding',
      tags: ['Coding', 'WebDev', 'Interactive', 'JavaScript']
    },
    {
      id: 'nature_asmr',
      name: 'SoftNatureASMR',
      title: '🍃 Relaxing Forest Sounds & Rain Whispers [Tingly Audio]',
      category: 'ASMR',
      viewers: 950,
      uptime: '01:32:44',
      avatar: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=80&h=80&q=80',
      streamType: 'asmr',
      tags: ['ASMR', 'Relaxing', 'Sleepy', 'Tingles']
    }
  ];

  // 2. Chat message templates matching channel vibes
  const chatTemplates = {
    'retro-gaming': [
      'OMG that dodge was insane! 🔥',
      'This synthwave track is such a banger',
      'What score are we aiming for today?',
      'PogChamp! Unbelievable run',
      'What controller are you using?',
      'Whaaat?! How did you survive that?',
      'Can you go faster? 🚀',
      'LUL classic death',
      'Love the retro graphics!',
      'Vibe check: Excellent'
    ],
    'chill-lofi': [
      'Studying for my biology exam, this is perfect',
      'So cozy... ☕',
      'Greeting from Sweden! 🇸🇪',
      'Is that cat tail moving to the beat? Cute!',
      'This loop is extremely relaxing',
      'Perfect soundtrack for my coding project',
      'I could listen to this for hours...',
      'Is it raining for real inside the stream?',
      'What playlist is this track from?',
      'Just vibes today. Have a good evening everyone! ✨'
    ],
    'creative-coding': [
      'Which editor theme is that? Looks clean.',
      'Wait, why did you use a let instead of const on line 23?',
      'Javascript is so fun when you build custom visualizers',
      'Forgot the semicolon there haha',
      'This canvas animation is running so smoothly!',
      'How does the projected cube rotation math work?',
      'clean code structure, respect!',
      'console.log("hello world")',
      'Can you explain the scale factor again?',
      'Will this project be uploaded on Github later?'
    ],
    'asmr': [
      'This sound is giving me massive tingles 💤',
      'Using headphones, the stereo effect is perfect',
      'So relaxing, about to fall asleep...',
      'Goodnight chat! 🌙',
      'The ripple sound effect is beautiful',
      'ASMR streams help me study so much',
      'Can we get some tapping sounds next?',
      'Extremely soothing voice overlay'
    ]
  };

  const chattersList = [
    { name: 'SwedeVibe', color: '#ff007f', isSub: true, isMod: false, isVip: false },
    { name: 'RetroPixel', color: '#00f5d4', isSub: false, isMod: true, isVip: false },
    { name: 'LofiCoder', color: '#c77dff', isSub: true, isMod: false, isVip: true },
    { name: 'CoffeeBean', color: '#ffbe0b', isSub: false, isMod: false, isVip: false },
    { name: 'CodeNinja99', color: '#3a86c8', isSub: true, isMod: false, isVip: false },
    { name: 'WhisperingTingles', color: '#8338ec', isSub: true, isMod: false, isVip: true },
    { name: 'NordicLight', color: '#38b000', isSub: false, isMod: false, isVip: false },
    { name: 'CyberGlow', color: '#fb5607', isSub: false, isMod: false, isVip: false }
  ];

  const emotesMap = {
    'PogChamp': '😲',
    'LUL': '😂',
    'Hype': '⚡',
    'Heart': '💖',
    'Kappa': '😏',
    'Sparkles': '✨',
    'Zzz': '💤',
    'Flame': '🔥'
  };

  // 3. Application State Variables
  let currentChannel = channels[0];
  let botChatEnabled = true; // Enables/disables simulated bot chat
  let chatChannel;
  let socket;
  let chatSettings = {};
  let creatorStreamActive = false;
  let creatorUptimeInterval = null;
  let creatorUptimeSeconds = 0;
  let chartTimer = null;

  // User Authentication State
  let currentUser = {
    username: 'Gäst',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
    points: 450,
    isLoggedIn: false
  };
  
  // Create instances of stream engines
  const streamEngine = new StreamEngine();
  let dashboardChart = null;

  // 4. Cache DOM Elements
  const el = {
    appContainer: document.getElementById('app-root'),
    channelList: document.getElementById('sidebar-channel-list'),
    searchBarInput: document.getElementById('search-input'),
    sidebarCollapseBtn: document.getElementById('btn-collapse-sidebar'),
    
    // Player
    canvas: document.getElementById('stream-canvas'),
    playerContainer: document.querySelector('.player-container'),
    streamTitle: document.getElementById('stream-title'),
    streamerName: document.getElementById('streamer-name'),
    streamerAvatar: document.getElementById('streamer-avatar'),
    streamCategory: document.getElementById('stream-category'),
    streamTags: document.getElementById('stream-tags'),
    viewerCount: document.getElementById('viewer-count'),
    uptimeVal: document.getElementById('uptime-val'),
    
    // Player controls
    btnPlay: document.getElementById('btn-play'),
    btnVolume: document.getElementById('btn-volume'),
    volumeSlider: document.getElementById('volume-slider'),
    btnTheater: document.getElementById('btn-theater'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    reactionsOverlay: document.querySelector('.reactions-overlay'),
    
    // Chat
    chatMessagesBox: document.getElementById('chat-msg-box'),
    chatTextarea: document.getElementById('chat-textarea'),
    btnSendChat: document.getElementById('btn-send-chat'),
    chatEmoteBtn: document.getElementById('btn-chat-emote'),
    emoteDrawer: document.getElementById('emote-drawer'),
    btnToggleChat: document.getElementById('btn-toggle-chat'),
    pointsValue: document.getElementById('points-val'),
    
    // Creator Studio
    btnCreatorStudio: document.getElementById('btn-creator-studio'),
    creatorDashboard: document.getElementById('creator-dashboard'),
    btnDashboardBack: document.getElementById('btn-dashboard-back'),
    btnGoLive: document.getElementById('btn-go-live'),
    previewCanvas: document.getElementById('preview-canvas'),
    chartCanvas: document.getElementById('chart-canvas'),
    formStreamTitle: document.getElementById('dashboard-stream-title'),
    formStreamCategory: document.getElementById('dashboard-stream-category'),
    dashboardUptime: document.getElementById('dashboard-uptime'),
    dashboardViewers: document.getElementById('dashboard-viewers'),
    dashboardBitrate: document.getElementById('dashboard-bitrate'),
    dashboardFps: document.getElementById('dashboard-fps'),

    // Auth Modal
    authModal: document.getElementById('auth-modal'),
    btnAuthClose: document.getElementById('btn-auth-close'),
    tabLogin: document.getElementById('tab-login'),
    tabRegister: document.getElementById('tab-register'),
    formLogin: document.getElementById('form-login'),
    formRegister: document.getElementById('form-register'),
    loginError: document.getElementById('login-error'),
    registerError: document.getElementById('register-error'),
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    registerUsername: document.getElementById('register-username'),
    registerPassword: document.getElementById('register-password'),
    avatarPickerGrid: document.getElementById('avatar-picker-grid'),

    // Profile Dropdown
    btnUserProfile: document.getElementById('btn-user-profile'),
    headerUserAvatar: document.getElementById('header-user-avatar'),
    userDropdown: document.getElementById('user-dropdown'),
    dropdownUsername: document.getElementById('dropdown-username'),
    btnDropdownProfile: document.getElementById('btn-dropdown-profile'),
    btnDropdownCreator: document.getElementById('btn-dropdown-creator'),
    btnDropdownAuth: document.getElementById('btn-dropdown-auth'),
    userProfileContainer: document.getElementById('user-profile-container'),
    btnHeaderLogin: document.getElementById('btn-header-login'),
    btnBotToggle: document.getElementById('btn-bot-toggle'),

    // Chat block
    chatLockOverlay: document.getElementById('chat-lock-overlay'),
    btnChatLockLogin: document.getElementById('btn-chat-lock-login')
  };

  // 5. Setup Point accrual clock
  setInterval(() => {
    if (streamEngine.canvas) { // watch points accrue if stream canvas is running
      points += 10;
      el.pointsValue.textContent = points.toLocaleString();
      showPointsNotification(10);
      
      // Persist points
      if (currentUser.isLoggedIn) {
        currentUser.points = points;
        saveUserPoints();
      } else {
        localStorage.setItem('vibestream_guest_points', points);
      }
    }
  }, 10000); // Trigger every 10 seconds for visual excitement!

  // 6. Setup Bot Chat Simulator
  let botChatTimeout = null;
  
  function triggerBotChatLoop() {
    const minDelay = 1200;
    const maxDelay = 3500;
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    if (!botChatEnabled) return; // Stop bot chat if disabled
    botChatTimeout = setTimeout(() => {
      if (!creatorStreamActive) {
        simulateIncomingBotChat();
      } else {
        simulateIncomingCreatorBotChat();
      }
      triggerBotChatLoop();
    }, delay);
  }

  // 7. Database & Session Helper Functions
  function initDatabase() {
    const users = JSON.parse(localStorage.getItem('vibestream_users')) || {};
    if (!users['viber']) {
      users['viber'] = {
        username: 'Viber',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=80&h=80&q=80',
        points: 1500
      };
      localStorage.setItem('vibestream_users', JSON.stringify(users));
    }
  }

  function loadSession() {
    const username = localStorage.getItem('vibestream_current_user');
    if (username) {
      const users = JSON.parse(localStorage.getItem('vibestream_users')) || {};
      const user = users[username.toLowerCase()];
      if (user) {
        currentUser = {
          username: user.username,
          avatar: user.avatar,
          points: user.points,
          isLoggedIn: true
        };
      }
    } else {
      currentUser = {
        username: 'Gäst',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
        points: parseInt(localStorage.getItem('vibestream_guest_points')) || 450,
        isLoggedIn: false
      };
    }
    updateAuthStateUI();
  }

  function updateAuthStateUI() {
    if (currentUser.isLoggedIn) {
      el.headerUserAvatar.src = currentUser.avatar;
      el.dropdownUsername.textContent = currentUser.username;
      el.btnDropdownAuth.innerHTML = '<span>🔑</span> Logga ut';
      el.chatLockOverlay.style.display = 'none';
      el.chatTextarea.disabled = false;
      el.chatTextarea.placeholder = 'Skicka ett meddelande...';
      
      if (el.userProfileContainer) el.userProfileContainer.style.display = 'block';
      if (el.btnHeaderLogin) el.btnHeaderLogin.style.display = 'none';
      
      points = currentUser.points;
      el.pointsValue.textContent = points.toLocaleString();
    } else {
      el.headerUserAvatar.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80';
      el.dropdownUsername.textContent = 'Gäst';
      el.btnDropdownAuth.innerHTML = '<span>🔑</span> Logga in';
      el.chatLockOverlay.style.display = 'flex';
      el.chatTextarea.disabled = true;
      el.chatTextarea.placeholder = 'Logga in för att chatta...';
      
      if (el.userProfileContainer) el.userProfileContainer.style.display = 'none';
      if (el.btnHeaderLogin) el.btnHeaderLogin.style.display = 'flex';
      
      points = parseInt(localStorage.getItem('vibestream_guest_points')) || 450;
      el.pointsValue.textContent = points.toLocaleString();
    }
  }

  function saveUserPoints() {
    if (currentUser.isLoggedIn) {
      const users = JSON.parse(localStorage.getItem('vibestream_users')) || {};
      const key = currentUser.username.toLowerCase();
      if (users[key]) {
        users[key].points = points;
        localStorage.setItem('vibestream_users', JSON.stringify(users));
      }
    }
  }

  function openAuthModal() {
    el.loginError.style.display = 'none';
    el.registerError.style.display = 'none';
    el.loginUsername.value = '';
    el.loginPassword.value = '';
    el.registerUsername.value = '';
    el.registerPassword.value = '';
    
    switchAuthTab('login');
    el.authModal.classList.add('active');
  }

  function closeAuthModal() {
    el.authModal.classList.remove('active');
  }

  function switchAuthTab(tab) {
    if (tab === 'login') {
      el.tabLogin.classList.add('active');
      el.tabRegister.classList.remove('active');
      el.formLogin.classList.add('active');
      el.formRegister.classList.remove('active');
    } else {
      el.tabRegister.classList.add('active');
      el.tabLogin.classList.remove('active');
      el.formRegister.classList.add('active');
      el.formLogin.classList.remove('active');
    }
    el.loginError.style.display = 'none';
    el.registerError.style.display = 'none';
  }

  function handleLogin(e) {
    e.preventDefault();
    const username = el.loginUsername.value.trim();
    const password = el.loginPassword.value;
    
    const users = JSON.parse(localStorage.getItem('vibestream_users')) || {};
    const user = users[username.toLowerCase()];
    
    if (user && user.password === password) {
      currentUser = {
        username: user.username,
        avatar: user.avatar,
        points: user.points,
        isLoggedIn: true
      };
      
      localStorage.setItem('vibestream_current_user', user.username);
      updateAuthStateUI();
      closeAuthModal();
      showWelcomeToast(user.username);
      
      // System message
      const systemMsg = document.createElement('div');
      systemMsg.className = 'chat-msg chat-msg-system';
      const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${getFormattedTime()}</span>` : '';
      systemMsg.innerHTML = `
        <div class="chat-msg-header">
          ${timestampStr}
          <span class="chat-badge badge-mod">SYSTEM</span>
          <span class="chat-username" style="color: #9d4edd">VibeBot</span>
        </div>
        <div class="chat-text">Välkommen tillbaka, <strong style="color: var(--secondary)">${user.username}</strong>! Din sändningssession har laddats. 💎</div>
      `;
      el.chatMessagesBox.appendChild(systemMsg);
      scrollToBottomChat();
    } else {
      el.loginError.style.display = 'block';
    }
  }

  function handleRegister(e) {
    e.preventDefault();
    const username = el.registerUsername.value.trim();
    const password = el.registerPassword.value;
    
    if (username.length < 3 || username.length > 15) {
      el.registerError.textContent = 'Användarnamnet måste vara mellan 3 och 15 tecken.';
      el.registerError.style.display = 'block';
      return;
    }
    if (password.length < 6) {
      el.registerError.textContent = 'Lösenordet måste vara minst 6 tecken.';
      el.registerError.style.display = 'block';
      return;
    }

    const users = JSON.parse(localStorage.getItem('vibestream_users')) || {};
    if (users[username.toLowerCase()]) {
      el.registerError.textContent = 'Användarnamnet är redan upptaget.';
      el.registerError.style.display = 'block';
      return;
    }
    
    const selectedOpt = el.avatarPickerGrid.querySelector('.avatar-option.selected');
    const avatarUrl = selectedOpt ? selectedOpt.dataset.avatarUrl : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&h=80&q=80';
    
    const startingPoints = parseInt(localStorage.getItem('vibestream_guest_points')) || points;
    const newUser = {
      username: username,
      password: password,
      avatar: avatarUrl,
      points: startingPoints
    };
    
    users[username.toLowerCase()] = newUser;
    localStorage.setItem('vibestream_users', JSON.stringify(users));
    
    currentUser = {
      username: username,
      avatar: avatarUrl,
      points: startingPoints,
      isLoggedIn: true
    };
    localStorage.setItem('vibestream_current_user', username);
    
    updateAuthStateUI();
    closeAuthModal();
    showWelcomeToast(username);
    
    const systemMsg = document.createElement('div');
    systemMsg.className = 'chat-msg chat-msg-highlight';
    const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${getFormattedTime()}</span>` : '';
    systemMsg.innerHTML = `
      <div class="chat-msg-header">
        ${timestampStr}
        <span class="chat-badge badge-vip">VIBES</span>
        <span class="chat-username" style="color: #00f5d4">VibeBot</span>
      </div>
      <div class="chat-text">Välkomna vår nyaste medlem <strong style="color: var(--secondary)">${username}</strong> till Vibestream-familjen! 🎉</div>
    `;
    el.chatMessagesBox.appendChild(systemMsg);
    scrollToBottomChat();
  }

  function handleLogout() {
    saveUserPoints();
    localStorage.removeItem('vibestream_current_user');
    
    currentUser = {
      username: 'Gäst',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
      points: 450,
      isLoggedIn: false
    };
    localStorage.setItem('vibestream_guest_points', 450);
    el.userDropdown.classList.remove('active');
    
    if (creatorStreamActive || el.creatorDashboard.style.display === 'flex') {
      stopCreatorStream();
      el.creatorDashboard.style.display = 'none';
      const currentSidebarItem = el.channelList.querySelector(`[data-id="${currentChannel.id}"]`);
      if (currentSidebarItem) currentSidebarItem.classList.add('active');
      loadChannel(currentChannel);
    }
    
    updateAuthStateUI();
    
    const systemMsg = document.createElement('div');
    systemMsg.className = 'chat-msg chat-msg-system';
    const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${getFormattedTime()}</span>` : '';
    systemMsg.innerHTML = `
      <div class="chat-msg-header">
        ${timestampStr}
        <span class="chat-badge badge-mod">SYSTEM</span>
        <span class="chat-username" style="color: #9d4edd">VibeBot</span>
      </div>
      <div class="chat-text">Du har loggat ut. Logga in igen för att delta i chatten.</div>
    `;
    el.chatMessagesBox.appendChild(systemMsg);
    scrollToBottomChat();
  }

  function showWelcomeToast(username) {
    const toast = document.createElement('div');
    toast.className = 'points-notification';
    toast.style.borderColor = 'var(--primary)';
    toast.style.boxShadow = '0 10px 30px rgba(157, 78, 221, 0.2)';
    
    toast.innerHTML = `
      <span class="notif-icon">👋</span>
      <div>
        <div style="font-weight: 700; font-size: 13px; color: var(--primary-bright)">VÄLKOMMEN, ${username.toUpperCase()}!</div>
        <div style="font-size: 11px; color: var(--text-muted)">Du är nu inloggad på Vibestream.</div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // 8. Initialise UI & Event Listeners
  function init() {
    initDatabase();
    loadSession();
    renderChannelsList(channels);
    loadChannel(currentChannel);
    setupEventListeners();
    triggerBotChatLoop();
  }

  function setupEventListeners() {
    // Sidebar search filtering
    el.searchBarInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = channels.filter(ch => 
        ch.name.toLowerCase().includes(query) || 
        ch.category.toLowerCase().includes(query) ||
        ch.title.toLowerCase().includes(query)
      );
      renderChannelsList(filtered);
    });

    // Collapse Sidebar
    el.sidebarCollapseBtn.addEventListener('click', () => {
      el.appContainer.classList.toggle('sidebar-collapsed');
    });

    // Send Chat message
    el.btnSendChat.addEventListener('click', postUserMessage);
    el.chatTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        postUserMessage();
      }
    });

    // Emote drawer toggles
    el.chatEmoteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = el.emoteDrawer.style.display === 'flex';
      el.emoteDrawer.style.display = isVisible ? 'none' : 'flex';
    });

    document.addEventListener('click', () => {
      el.emoteDrawer.style.display = 'none';
    });

    el.emoteDrawer.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Render emotes list inside drawer
    const emoteGrid = el.emoteDrawer.querySelector('.emote-grid');
    Object.entries(emotesMap).forEach(([code, emoji]) => {
      const btn = document.createElement('span');
      btn.className = 'emote-item';
      btn.textContent = emoji;
      btn.title = code;
      btn.addEventListener('click', () => {
        el.chatTextarea.value += ` ${code} `;
        el.chatTextarea.focus();
        el.emoteDrawer.style.display = 'none';
      });
      emoteGrid.appendChild(btn);
    });

    // Toggle Chat sidebar collapse
    el.btnToggleChat.addEventListener('click', () => {
      el.appContainer.classList.toggle('chat-collapsed');
    });

    // Player control bar events
    let isPlaying = true;
    el.btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        streamEngine.start(el.canvas, currentChannel.streamType);
        el.btnPlay.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
        el.playerContainer.classList.add('streaming-active');
      } else {
        streamEngine.stop();
        el.btnPlay.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
        el.playerContainer.classList.remove('streaming-active');
        
        // Draw black screen with pause text
        const ctx = el.canvas.getContext('2d');
        ctx.fillStyle = '#07070b';
        ctx.fillRect(0, 0, el.canvas.width, el.canvas.height);
        ctx.fillStyle = '#9595b0';
        ctx.font = '500 18px "Outfit"';
        ctx.textAlign = 'center';
        ctx.fillText('STREAM PAUSED', el.canvas.width/ (2 * window.devicePixelRatio), el.canvas.height / (2 * window.devicePixelRatio));
        ctx.textAlign = 'left';
      }
    });

    // Volume controllers
    el.volumeSlider.addEventListener('input', (e) => {
      const vol = e.target.value;
      if (vol == 0) {
        el.btnVolume.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM3 9v6h4l5 5V4L7 9H3z"/></svg>`;
      } else if (vol < 50) {
        el.btnVolume.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`;
      } else {
        el.btnVolume.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
      }
    });

    // Theater and Fullscreen mockup toggles
    el.btnTheater.addEventListener('click', () => {
      const mainPane = document.querySelector('main');
      mainPane.classList.toggle('theater-mode');
      if (mainPane.classList.contains('theater-mode')) {
        document.querySelector('.app-container').style.gridTemplateColumns = '0px 1fr var(--chat-width)';
      } else {
        document.querySelector('.app-container').style.gridTemplateColumns = 'var(--sidebar-width) 1fr var(--chat-width)';
      }
    });

    el.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        el.playerContainer.requestFullscreen().catch(err => {
          alert(`Error attempting to enable full-screen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // Floating reaction triggers
    el.reactionsOverlay.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-reaction-float');
      if (!btn) return;
      
      const icon = btn.textContent;
      spawnFloatingReaction(icon);
      
      // Also post user emotion text to chat periodically
      postReactionToChat(icon);
    });

    // Creator Studio Panels
    el.btnCreatorStudio.addEventListener('click', toggleCreatorDashboard);
    el.btnDashboardBack.addEventListener('click', toggleCreatorDashboard);
    
    el.btnGoLive.addEventListener('click', toggleCreatorStream);

    // Apply Creator profile details live
    el.formStreamTitle.addEventListener('change', updateCreatorDashboardMeta);
    el.formStreamCategory.addEventListener('change', updateCreatorDashboardMeta);

    // Toggle profile dropdown menu
    el.btnUserProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      el.userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      el.userDropdown.classList.remove('active');
    });

    el.userDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Profile Dropdown items click
    el.btnDropdownProfile.addEventListener('click', () => {
      el.userDropdown.classList.remove('active');
      if (!currentUser.isLoggedIn) {
        openAuthModal();
        return;
      }
      
      // Print user profile summary in chat
      const msg = document.createElement('div');
      msg.className = 'chat-msg chat-msg-highlight';
      const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${getFormattedTime()}</span>` : '';
      msg.innerHTML = `
        <div class="chat-msg-header">
          ${timestampStr}
          <span class="chat-badge badge-vip">PROFIL</span>
          <span class="chat-username" style="color: #ff007f">${currentUser.username}</span>
        </div>
        <div class="chat-text">
          <strong style="color: var(--secondary)">Användarprofil:</strong><br>
          • Namn: ${currentUser.username}<br>
          • Poäng: ${points.toLocaleString()} VP 💎<br>
          • Status: Inloggad 🟢
        </div>
      `;
      el.chatMessagesBox.appendChild(msg);
      scrollToBottomChat();
    });

    el.btnDropdownCreator.addEventListener('click', () => {
      el.userDropdown.classList.remove('active');
      toggleCreatorDashboard();
    });

    el.btnDropdownAuth.addEventListener('click', () => {
      el.userDropdown.classList.remove('active');
      if (currentUser.isLoggedIn) {
        handleLogout();
      } else {
        openAuthModal();
      }
    });

    // Chat Lock Log In button click
    el.btnChatLockLogin.addEventListener('click', openAuthModal);

    // Header Log In button click
    if (el.btnHeaderLogin) {
      el.btnHeaderLogin.addEventListener('click', openAuthModal);
    }
    // Bot chat toggle button click
    if (el.btnBotToggle) {
      el.btnBotToggle.addEventListener('click', () => {
        botChatEnabled = !botChatEnabled;
        el.btnBotToggle.classList.toggle('active', botChatEnabled);
      });
    }

    // Initialize BroadcastChannel for cross‑tab chat sync
    chatChannel = new BroadcastChannel('vibestream_chat');
    chatChannel.onmessage = (e) => {
        if (e.data && e.data.type === 'chat') {
            const msg = document.createElement('div');
            msg.className = e.data.highlight ? 'chat-msg chat-msg-highlight' : 'chat-msg';
            const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${e.data.time}</span>` : '';
            const badgeHTML = e.data.badge ? `<span class="chat-badge ${e.data.badgeClass}">${e.data.badge}</span>` : '';
            msg.innerHTML = `
                <div class="chat-msg-header">
                    ${timestampStr}
                    ${badgeHTML}
                    <span class="chat-username" style="color: ${e.data.color}">${e.data.username}</span>
                </div>
                <div class="chat-text">${e.data.text}</div>
            `;
            el.chatMessagesBox.appendChild(msg);
            scrollToBottomChat();
        }
    };

    // Initialize WebSocket for server sync (fallback if available)
    try {
        socket = new WebSocket('ws://localhost:8080');
        socket.addEventListener('open', () => console.log('WebSocket connected'));
        socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data && data.type === 'chat') {
                    // Reuse same rendering logic as BroadcastChannel
                    const msg = document.createElement('div');
                    msg.className = data.highlight ? 'chat-msg chat-msg-highlight' : 'chat-msg';
                    const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${data.time}</span>` : '';
                    const badgeHTML = data.badge ? `<span class="chat-badge ${data.badgeClass}">${data.badge}</span>` : '';
                    msg.innerHTML = `
                        <div class="chat-msg-header">
                            ${timestampStr}
                            ${badgeHTML}
                            <span class="chat-username" style="color: ${data.color}">${data.username}</span>
                        </div>
                        <div class="chat-text">${data.text}</div>
                    `;
                    el.chatMessagesBox.appendChild(msg);
                    scrollToBottomChat();
                }
            } catch (e) { console.error('WS parse error', e); }
        });
        window.addEventListener('beforeunload', () => { socket.close(); chatChannel.close(); });
    } catch (e) { console.warn('WebSocket init failed', e); }

    // Auth Modal close button
    el.btnAuthClose.addEventListener('click', closeAuthModal);

    // Click backdrop to close auth modal
    el.authModal.addEventListener('click', (e) => {
      if (e.target === el.authModal) {
        closeAuthModal();
      }
    });

    // Avatar grid selection
    const avatarOpts = el.avatarPickerGrid.querySelectorAll('.avatar-option');
    avatarOpts.forEach(opt => {
      opt.addEventListener('click', () => {
        avatarOpts.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // Form Submissions
    el.formLogin.addEventListener('submit', handleLogin);
    el.formRegister.addEventListener('submit', handleRegister);
    el.tabLogin.addEventListener('click', () => switchAuthTab('login'));
    el.tabRegister.addEventListener('click', () => switchAuthTab('register'));
  }

  // 8. Render Side Menu Channel entries
  function renderChannelsList(channelData) {
    el.channelList.innerHTML = '';
    
    channelData.forEach(ch => {
      const li = document.createElement('li');
      li.className = `channel-item ${ch.id === currentChannel.id && !creatorStreamActive ? 'active' : ''}`;
      li.dataset.id = ch.id;
      
      li.innerHTML = `
        <div class="channel-details">
          <div class="channel-avatar-wrapper">
            <img class="channel-avatar" src="${ch.avatar}" alt="${ch.name}">
            <div class="status-dot"></div>
          </div>
          <div class="channel-meta">
            <span class="channel-name">${ch.name}</span>
            <span class="channel-category">${ch.category}</span>
          </div>
        </div>
        <div class="channel-stats">
          <svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          <span>${formatNumber(ch.viewers)}</span>
        </div>
      `;

      li.addEventListener('click', () => {
        // Deactivate active states
        document.querySelectorAll('.channel-item').forEach(item => item.classList.remove('active'));
        li.classList.add('active');
        
        // If coming back from Creator dashboard
        if (creatorStreamActive || el.creatorDashboard.style.display === 'flex') {
          stopCreatorStream();
          el.creatorDashboard.style.display = 'none';
        }
        
        const selected = channels.find(c => c.id === ch.id);
        loadChannel(selected);
      });

      el.channelList.appendChild(li);
    });
  }

  // 9. Load Channel state & start graphics loop
  function loadChannel(channel) {
    currentChannel = channel;
    
    // Update player text
    el.streamTitle.textContent = channel.title;
    el.streamerName.textContent = channel.name;
    el.streamerAvatar.src = channel.avatar;
    el.streamCategory.textContent = channel.category;
    el.viewerCount.textContent = formatNumber(channel.viewers);
    el.uptimeVal.textContent = channel.uptime;
    
    // Set Tags
    el.streamTags.innerHTML = '';
    channel.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'stream-tag';
      span.textContent = `#${tag}`;
      el.streamTags.appendChild(span);
    });
    
    // Setup Chat history clear and greetings
    el.chatMessagesBox.innerHTML = '';
    
    const systemMsg = document.createElement('div');
    systemMsg.className = 'chat-msg chat-msg-system';
    systemMsg.innerHTML = `
      <div class="chat-msg-header">
        <span class="chat-badge badge-mod">SYSTEM</span>
        <span class="chat-username" style="color: #9d4edd">VibeBot</span>
      </div>
      <div class="chat-text">Välkommen till ${channel.name}s kanalchatt! Håll god ton och sprid härliga vibbar. 🎉</div>
    `;
    el.chatMessagesBox.appendChild(systemMsg);
    
    // Load canvas graphics animation
    streamEngine.start(el.canvas, channel.streamType);
    el.playerContainer.classList.add('streaming-active');
  }

  // 10. User Text Messages logic
  function postUserMessage() {
    if (!currentUser.isLoggedIn) {
      openAuthModal();
      return;
    }
    const text = el.chatTextarea.value.trim();
    if (!text) return;
    
    el.chatTextarea.value = '';
    
    // Parse text emotes code
    let parsedText = text;
    Object.entries(emotesMap).forEach(([code, emoji]) => {
      const reg = new RegExp(`\\b${code}\\b`, 'g');
      parsedText = parsedText.replace(reg, `<span class="emote" title="${code}">${emoji}</span>`);
    });

    const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${getFormattedTime()}</span>' : '';
    // Build chat payload
    const payload = {
        type: 'chat',
        time: getFormattedTime(),
        username: currentUser.username,
        color: '#00f5d4',
        text: parsedText,
        badge: 'WATCHER',
        badgeClass: 'badge-sub',
        highlight: false
    };

    // Render locally
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `
        <div class="chat-msg-header">
            ${timestampStr}
            <span class="chat-badge badge-sub">WATCHER</span>
            <span class="chat-username" style="color: #00f5d4">${currentUser.username}</span>
        </div>
        <div class="chat-text">${parsedText}</div>
    `;
    el.chatMessagesBox.appendChild(msg);
    scrollToBottomChat();

    // Broadcast to other tabs
    if (typeof chatChannel !== 'undefined') {
        chatChannel.postMessage(payload);
    }
    // Send via WebSocket if available
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
    }
    
    // Trigger floating animations if certain phrases are typed
    if (text.toLowerCase().includes('heart') || text.includes('💖')) {
        spawnFloatingReaction('💖');
    }
  }

  function postReactionToChat(icon) {
    if (!currentUser.isLoggedIn) {
      return;
    }
    // Generate text message for clicks
    const textOptions = {
      '💖': 'sent a heart! 💖',
      '🔥': 'feels the heat! 🔥',
      '✨': 'sends magic sparkles ✨',
      '💤': 'is taking a nap 💤'
    };
    
    const text = textOptions[icon] || `reacted with ${icon}`;
    
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg-highlight';
    
    const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${getFormattedTime()}</span>` : '';
    
    msg.innerHTML = `
      <div class="chat-msg-header">
        ${timestampStr}
        <span class="chat-badge badge-vip">VIBES</span>
        <span class="chat-username" style="color: #ff007f">${currentUser.username}</span>
      </div>
      <div class="chat-text"><em>${text}</em></div>
    `;
    el.chatMessagesBox.appendChild(msg);
    scrollToBottomChat();
  }

  // 11. Bot Chat Simulation Logic
  function simulateIncomingBotChat() {
    const chatter = chattersList[Math.floor(Math.random() * chattersList.length)];
    const channelVibe = currentChannel.streamType;
    const phrases = chatTemplates[channelVibe];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    
    const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${getFormattedTime()}</span>' : '';
    
    // Random badges
    let badgeHTML = '';
    if (chatter.isMod) badgeHTML += '<span class="chat-badge badge-mod">MOD</span>';
    else if (chatter.isVip) badgeHTML += '<span class="chat-badge badge-vip">VIP</span>';
    else if (chatter.isSub) badgeHTML += '<span class="chat-badge badge-sub">SUB</span>';
    
    // Replace text emoji codes if present in bot comments
    let parsedText = phrase;
    Object.entries(emotesMap).forEach(([code, emoji]) => {
      const reg = new RegExp(`\\b${code}\\b`, 'g');
      parsedText = parsedText.replace(reg, `<span class="emote" title="${code}">${emoji}</span>`);
    });

    msg.innerHTML = `
      <div class="chat-msg-header">
        ${timestampStr}
        ${badgeHTML}
        <span class="chat-username" style="color: ${chatter.color}">${chatter.name}</span>
      </div>
      <div class="chat-text">${parsedText}</div>
    `;
    
    el.chatMessagesBox.appendChild(msg);
    
    // Keep max messages count tidy
    const messages = el.chatMessagesBox.querySelectorAll('.chat-msg');
    if (messages.length > 80) {
      messages[0].remove();
    }
    
    scrollToBottomChat();
  }

  // Creator streaming chat inputs
  function simulateIncomingCreatorBotChat() {
    const chatter = chattersList[Math.floor(Math.random() * chattersList.length)];
    const creatorPhrases = [
      'Wow, the custom dashboard looks neat! ⚙️',
      'Välkommen live, streamer! Let\'s go!',
      'Are you streaming from Stockholm?',
      'Awesome webcam stream quality! ⚡',
      'Hype! Stream is running super smoothly',
      'What are you programming right now?',
      'PogChamp! Insane frame counts.',
      'Love the vibes here! 💖',
      'Vibe Points multipliers active today?',
      'Let\'s double the bitrates!'
    ];
    const phrase = creatorPhrases[Math.floor(Math.random() * creatorPhrases.length)];
    
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    const timestampStr = chatSettings.timestamps ? `<span class="chat-timestamp">${getFormattedTime()}</span>` : '';
    
    let badgeHTML = chatter.isMod ? '<span class="chat-badge badge-mod">MOD</span>' : '<span class="chat-badge badge-sub">CHAT</span>';
    
    msg.innerHTML = `
      <div class="chat-msg-header">
        ${timestampStr}
        ${badgeHTML}
        <span class="chat-username" style="color: ${chatter.color}">${chatter.name}</span>
      </div>
      <div class="chat-text">${phrase}</div>
    `;
    
    el.chatMessagesBox.appendChild(msg);
    scrollToBottomChat();
  }

  // Scroll support
  function scrollToBottomChat() {
    el.chatMessagesBox.scrollTop = el.chatMessagesBox.scrollHeight;
  }

  // 12. Floating Heart overlay visualizers
  function spawnFloatingReaction(icon) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = icon;
    
    // Random position within player container
    const width = el.playerContainer.clientWidth;
    const startX = Math.random() * (width - 40) + 20;
    
    heart.style.left = `${startX}px`;
    heart.style.bottom = '80px';
    
    el.playerContainer.appendChild(heart);
    
    // Automatically sweep elements after animation
    setTimeout(() => {
      heart.remove();
    }, 2000);
  }

  // 13. Creator Studio Dashboard Toggle Action
  function toggleCreatorDashboard() {
    if (!currentUser.isLoggedIn) {
      openAuthModal();
      return;
    }
    const isVisible = el.creatorDashboard.style.display === 'flex';
    
    if (!isVisible) {
      // Deactivate sidebar channel highlighted states
      document.querySelectorAll('.channel-item').forEach(item => item.classList.remove('active'));
      
      // Stop viewer stream loops
      streamEngine.stop();
      
      // Open dashboard panel
      el.creatorDashboard.style.display = 'flex';
      
      // Start mock dashboard camera preview (Canvas)
      streamEngine.start(el.previewCanvas, 'creator-camera');
      
      // Initialize charts
      dashboardChart = new DashboardChart(el.chartCanvas);
      dashboardChart.draw();
      
      // Load current inputs
      el.formStreamTitle.value = creatorStreamActive ? currentChannel.title : "Mitt Live Äventyr! 🚀";
    } else {
      // Going back to normal channels
      el.creatorDashboard.style.display = 'none';
      streamEngine.stop();
      
      // Reactivate current channel
      const currentSidebarItem = el.channelList.querySelector(`[data-id="${currentChannel.id}"]`);
      if (currentSidebarItem) currentSidebarItem.classList.add('active');
      
      loadChannel(currentChannel);
    }
  }

  // 14. Start / Stop User Streaming Simulation
  function toggleCreatorStream() {
    creatorStreamActive = !creatorStreamActive;
    
    if (creatorStreamActive) {
      el.btnGoLive.textContent = 'STOP STREAM';
      el.btnGoLive.classList.add('streaming');
      
      // Reset uptime counts
      creatorUptimeSeconds = 0;
      el.dashboardUptime.textContent = '00:00:00';
      el.dashboardViewers.textContent = '1';
      
      // Setup UI Stream text updates
      currentChannel = {
        id: 'user_live_channel',
        name: `${currentUser.username} (You)`,
        title: el.formStreamTitle.value.trim() || 'Simulerad Live Stream',
        category: el.formStreamCategory.value,
        viewers: 1,
        uptime: '00:00:00',
        avatar: currentUser.avatar,
        streamType: 'creator-camera',
        tags: ['SelfLive', 'Creator', 'Swe']
      };
      
      // Clear chat messages and post notification
      el.chatMessagesBox.innerHTML = '';
      const systemMsg = document.createElement('div');
      systemMsg.className = 'chat-msg chat-msg-system';
      systemMsg.innerHTML = `
        <div class="chat-msg-header">
          <span class="chat-badge badge-mod">SYSTEM</span>
          <span class="chat-username" style="color: #9d4edd">VibeBot</span>
        </div>
        <div class="chat-text">Ditt livesändningsflöde har startats! Dina följare har notifierats. 🚀</div>
      `;
      el.chatMessagesBox.appendChild(systemMsg);
      
      // Start metrics tick updates
      creatorUptimeInterval = setInterval(() => {
        creatorUptimeSeconds++;
        const hrs = Math.floor(creatorUptimeSeconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((creatorUptimeSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (creatorUptimeSeconds % 60).toString().padStart(2, '0');
        const formatted = `${hrs}:${mins}:${secs}`;
        
        el.dashboardUptime.textContent = formatted;
        
        // Randomly simulate viewers going up/down
        let currentViews = parseInt(el.dashboardViewers.textContent);
        currentViews += Math.floor(Math.random() * 5) - 2;
        if (currentViews < 1) currentViews = 1;
        el.dashboardViewers.textContent = currentViews;
      }, 1000);
      
      // Bitrate chart metrics simulator ticker
      chartTimer = setInterval(() => {
        const randBitrate = 2200 + Math.random() * 700;
        const randFps = Math.floor(58 + Math.random() * 3);
        
        el.dashboardBitrate.textContent = `${Math.round(randBitrate)} kbps`;
        el.dashboardFps.textContent = `${randFps} FPS`;
        
        if (dashboardChart) {
          dashboardChart.update(randBitrate);
        }
      }, 1500);
      
    } else {
      stopCreatorStream();
    }
  }

  function stopCreatorStream() {
    creatorStreamActive = false;
    el.btnGoLive.textContent = 'GO LIVE';
    el.btnGoLive.classList.remove('streaming');
    
    // Clear intervals
    clearInterval(creatorUptimeInterval);
    clearInterval(chartTimer);
    
    el.dashboardUptime.textContent = 'OFFLINE';
    el.dashboardViewers.textContent = '0';
    el.dashboardBitrate.textContent = '0 kbps';
    el.dashboardFps.textContent = '0 FPS';
    
    // Go back to standard user channels database reference
    currentChannel = channels[0];
  }

  function updateCreatorDashboardMeta() {
    if (creatorStreamActive) {
      currentChannel.title = el.formStreamTitle.value;
      currentChannel.category = el.formStreamCategory.value;
    }
  }

  // 15. Watch reward toast popup notifier helper
  function showPointsNotification(amount) {
    // Spawns a beautiful toast badge in bottom left
    const toast = document.createElement('div');
    toast.className = 'points-notification';
    
    toast.innerHTML = `
      <span class="notif-icon">💎</span>
      <div>
        <div style="font-weight: 700; font-size: 13px; color: var(--secondary)">+${amount} VIBE POINTS</div>
        <div style="font-size: 11px; color: var(--text-muted)">Du fick poäng för att du tittar!</div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Slide out and remove
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Helper Utility: Number Formatter
  function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  }

  // Helper Utility: Time Getter
  function getFormattedTime() {
    const d = new Date();
    const hrs = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  }

  // Run initial loading
  init();
});
