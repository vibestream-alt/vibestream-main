// Vibestream Stream Rendering Engine
// Handles simulated live video feeds and dashboard statistics plots on Canvas elements.

class StreamEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;
    this.activeType = null;
    this.startTime = null;
    
    // Animation states
    this.state = {};
    
    // Bind methods
    this.loop = this.loop.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  start(canvas, type) {
    this.stop();
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.activeType = type;
    this.startTime = Date.now();
    this.state = {};
    
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    
    // Initialize specific animation states
    this.initAnimationState(type);
    
    // Start loop
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop camera stream if active
    if (this.state.webcamStream) {
      this.state.webcamStream.getTracks().forEach(track => track.stop());
    }
    if (this.state.webcamVideo) {
      this.state.webcamVideo.pause();
      this.state.webcamVideo = null;
    }
    
    window.removeEventListener('resize', this.handleResize);
    this.canvas = null;
    this.ctx = null;
    this.activeType = null;
  }

  handleResize() {
    if (!this.canvas) return;
    
    // Set canvas dimensions to display size scaled for crispness
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    // Store scale-independent width and height
    this.width = rect.width;
    this.height = rect.height;
  }

  initAnimationState(type) {
    const w = this.width || 800;
    const h = this.height || 450;
    
    switch (type) {
      case 'retro-gaming':
        this.state = {
          stars: Array.from({ length: 40 }, () => ({
            x: Math.random() * w,
            y: Math.random() * (h * 0.6),
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 2 + 0.5
          })),
          gridOffset: 0,
          playerY: h * 0.75,
          playerTargetY: h * 0.75,
          score: 12400,
          obstacles: [],
          nextObstacleTime: 0,
          particles: []
        };
        break;
        
      case 'chill-lofi':
        // Equalizer bands
        this.state = {
          barsCount: 32,
          frequencies: Array.from({ length: 32 }, () => Math.random() * 30 + 10),
          targets: Array.from({ length: 32 }, () => Math.random() * 30 + 10),
          rainDrops: Array.from({ length: 60 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            length: Math.random() * 15 + 10,
            speed: Math.random() * 4 + 6
          })),
          ambientHue: 280,
          catPulse: 0
        };
        break;
        
      case 'creative-coding':
        // Matrix rain character drops
        const columns = Math.floor(w / 16);
        this.state = {
          columns: columns,
          drops: Array.from({ length: columns }, () => Math.random() * -100),
          symbols: '010110010101010101011011001100010101ABCDEF{}[];+=<>/',
          cubeRotationX: 0,
          cubeRotationY: 0,
          consoleLines: [
            'initializing stream modules...',
            'vibe-buffer loaded [100%]',
            'socket connected to client_ch4',
            'chat feed listening...'
          ],
          consoleTime: Date.now()
        };
        break;
        
      case 'asmr':
        // Soft glowing floating nodes
        this.state = {
          particles: Array.from({ length: 25 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 40 + 20,
            color: `hsla(${200 + Math.random() * 140}, 85%, 65%, 0.15)`
          })),
          ripples: []
        };
        
        // Add click ripple support
        this.canvas.onclick = (e) => {
          const rect = this.canvas.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;
          this.state.ripples.push({
            x: clickX,
            y: clickY,
            radius: 5,
            maxRadius: 80,
            opacity: 0.8
          });
        };
        break;
        
      case 'creator-camera':
        this.state = {
          cameraAllowed: false,
          webcamVideo: null,
          webcamStream: null,
          pulse: 0,
          scanningY: 0,
          soundBars: Array.from({ length: 15 }, () => Math.random() * 20 + 5)
        };
        
        // Try accessing user camera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
              if (this.activeType !== 'creator-camera') {
                // If user switched channels while granting permission
                stream.getTracks().forEach(t => t.stop());
                return;
              }
              const video = document.createElement('video');
              video.srcObject = stream;
              video.autoplay = true;
              video.playsInline = true;
              video.onloadedmetadata = () => {
                video.play();
                this.state.cameraAllowed = true;
                this.state.webcamVideo = video;
                this.state.webcamStream = stream;
              };
            })
            .catch(err => {
              console.warn("Camera access denied or unavailable: ", err);
              this.state.cameraAllowed = false;
            });
        }
        break;
    }
  }

  loop() {
    if (!this.canvas || !this.ctx) return;
    
    // Clear canvas
    this.ctx.fillStyle = '#07070b';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Execute specific render loop
    switch (this.activeType) {
      case 'retro-gaming':
        this.renderRetroGaming();
        break;
      case 'chill-lofi':
        this.renderChillLofi();
        break;
      case 'creative-coding':
        this.renderCreativeCoding();
        break;
      case 'asmr':
        this.renderASMR();
        break;
      case 'creator-camera':
        this.renderCreatorCamera();
        break;
    }
    
    // Queue next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  // 1. Retro Gaming Channel Animation
  renderRetroGaming() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const state = this.state;
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    // Update Score
    state.score += Math.random() > 0.8 ? 10 : 0;
    
    // Render Stars in space
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    state.stars.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
      star.x -= star.speed;
      if (star.x < 0) {
        star.x = w;
        star.y = Math.random() * (h * 0.6);
      }
    });
    
    // Sun graphic in background
    const sunY = h * 0.45;
    const sunRadius = 75;
    const gradient = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    gradient.addColorStop(0, '#ff007f');
    gradient.addColorStop(0.5, '#ff5d8f');
    gradient.addColorStop(1, '#ff9e00');
    
    ctx.beginPath();
    ctx.arc(w / 2, sunY, sunRadius, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Sun horizontal scanline gaps (synthwave style)
    ctx.fillStyle = '#07070b';
    for (let sy = sunY - sunRadius; sy < sunY; sy += 8) {
      const gap = Math.min(4, (sunY - sy) * 0.1);
      ctx.fillRect(w/2 - sunRadius - 10, sy, sunRadius * 2 + 20, gap);
    }
    
    // Ground Grid Line
    const horizon = h * 0.6;
    ctx.strokeStyle = '#9d4edd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();
    
    // Vanishing perspective Grid
    state.gridOffset = (state.gridOffset + 3) % 40;
    const lines = 12;
    ctx.strokeStyle = 'rgba(157, 78, 221, 0.4)';
    ctx.lineWidth = 1.5;
    
    // Vertical perspective lines
    for (let i = 0; i <= lines; i++) {
      const xHorizon = w/2 + (i - lines/2) * (w * 0.05);
      const xBottom = w/2 + (i - lines/2) * (w * 0.25);
      ctx.beginPath();
      ctx.moveTo(xHorizon, horizon);
      ctx.lineTo(xBottom, h);
      ctx.stroke();
    }
    
    // Horizontal moving grid lines
    for (let y = horizon; y <= h; y += 15) {
      // Perspective compression factor
      const k = (y - horizon) / (h - horizon);
      const gridY = horizon + Math.pow(k, 1.5) * (h - horizon) + (state.gridOffset * k);
      if (gridY <= h) {
        ctx.beginPath();
        ctx.moveTo(0, gridY);
        ctx.lineTo(w, gridY);
        ctx.stroke();
      }
    }
    
    // Obstacle logic
    if (Date.now() > state.nextObstacleTime) {
      state.obstacles.push({
        x: w,
        y: horizon + (h - horizon) * 0.6 + (Math.random() - 0.5) * 20,
        size: Math.random() * 15 + 10,
        color: Math.random() > 0.5 ? '#00f5d4' : '#ff007f',
        passed: false
      });
      state.nextObstacleTime = Date.now() + Math.random() * 2000 + 1500;
    }
    
    // Update and draw obstacles
    state.obstacles.forEach((obs, index) => {
      obs.x -= 4;
      
      // Draw neon obstacle
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = obs.color;
      ctx.fillRect(obs.x, obs.y, obs.size, obs.size);
      ctx.shadowBlur = 0;
      
      // Check collision / trigger score points
      if (obs.x + obs.size < 0) {
        state.obstacles.splice(index, 1);
      }
      
      // Spaceship particles trail
      if (Math.random() > 0.6) {
        state.particles.push({
          x: obs.x + obs.size/2,
          y: obs.y + obs.size/2,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 2 - 1,
          size: Math.random() * 3 + 1,
          color: obs.color,
          alpha: 1
        });
      }
    });
    
    // Hovering Spaceship (Player)
    state.playerTargetY = horizon + (h - horizon) * 0.5 + Math.sin(elapsed * 4) * 20;
    state.playerY += (state.playerTargetY - state.playerY) * 0.1;
    const playerX = w * 0.15;
    
    // Draw player ship
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00f5d4';
    ctx.beginPath();
    ctx.moveTo(playerX + 30, state.playerY);
    ctx.lineTo(playerX, state.playerY - 12);
    ctx.lineTo(playerX - 10, state.playerY - 6);
    ctx.lineTo(playerX - 10, state.playerY + 6);
    ctx.lineTo(playerX, state.playerY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Thruster engine flame
    const flameGrad = ctx.createLinearGradient(playerX - 25, state.playerY, playerX - 10, state.playerY);
    flameGrad.addColorStop(0, 'rgba(255, 0, 127, 0)');
    flameGrad.addColorStop(1, '#ff007f');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(playerX - 10, state.playerY - 5);
    ctx.lineTo(playerX - 25 - Math.random() * 10, state.playerY);
    ctx.lineTo(playerX - 10, state.playerY + 5);
    ctx.closePath();
    ctx.fill();
    
    // Draw particles
    state.particles.forEach((p, idx) => {
      p.x += p.vx - 2;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        state.particles.splice(idx, 1);
      } else {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
      }
    });
    
    // HUD Text overlays
    ctx.font = 'bold 12px "JetBrains Mono"';
    ctx.fillStyle = '#f3f3f7';
    ctx.fillText(`SCORE: ${state.score}`, 20, h - 20);
    ctx.fillText('SPEED: 180 KM/H', 150, h - 20);
    ctx.fillText('STAGE: RETRO DRIVE', w - 160, h - 20);
  }

  // 2. Chill Lofi Channel Animation
  renderChillLofi() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const state = this.state;
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    // Background gradient (cozy sunset bedroom vibes)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#100b21');
    bgGrad.addColorStop(0.5, '#24143a');
    bgGrad.addColorStop(1, '#47124f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Giant stylized sun/moon in background
    ctx.fillStyle = 'rgba(255, 93, 143, 0.15)';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 120 + Math.sin(elapsed) * 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Sound Visualizer bars (bottom centered)
    const barWidth = 6;
    const gap = 3;
    const startX = w / 2 - (state.barsCount * (barWidth + gap)) / 2;
    
    for (let i = 0; i < state.barsCount; i++) {
      // Smooth frequency updates towards random targets
      if (Math.random() > 0.9) {
        state.targets[i] = Math.random() * (h * 0.3) + 10;
      }
      state.frequencies[i] += (state.targets[i] - state.frequencies[i]) * 0.12;
      
      const barHeight = state.frequencies[i];
      const x = startX + i * (barWidth + gap);
      const y = h * 0.85 - barHeight;
      
      // Color gradient for the bars
      const barGrad = ctx.createLinearGradient(x, y, x, h * 0.85);
      barGrad.addColorStop(0, '#00f5d4');
      barGrad.addColorStop(1, '#9d4edd');
      
      ctx.fillStyle = barGrad;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Top dot reflection
      ctx.fillStyle = '#00f5d4';
      ctx.fillRect(x, y - 3, barWidth, 2);
    }
    
    // Draw Cozy Cat outline chilling in front of window
    const catX = w * 0.2;
    const catY = h * 0.85;
    ctx.fillStyle = '#0a0815';
    
    // Table/ledge
    ctx.fillRect(0, catY, w, h - catY);
    
    // Sleepy Cat silhouette
    ctx.beginPath();
    ctx.ellipse(catX, catY - 20, 25, 18, 0, 0, Math.PI * 2); // body
    ctx.ellipse(catX + 18, catY - 32, 14, 14, 0, 0, Math.PI * 2); // head
    ctx.fill();
    
    // Ears
    ctx.beginPath();
    ctx.moveTo(catX + 10, catY - 40);
    ctx.lineTo(catX + 12, catY - 50);
    ctx.lineTo(catX + 19, catY - 44);
    ctx.closePath();
    ctx.moveTo(catX + 18, catY - 44);
    ctx.lineTo(catX + 26, catY - 48);
    ctx.lineTo(catX + 25, catY - 38);
    ctx.closePath();
    ctx.fillStyle = '#0a0815';
    ctx.fill();
    
    // Tail twitch
    ctx.strokeStyle = '#0a0815';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(catX - 20, catY - 15);
    ctx.quadraticCurveTo(
      catX - 35, 
      catY - 20 + Math.sin(elapsed * 2) * 5, 
      catX - 40 + Math.cos(elapsed * 2) * 3, 
      catY - 5 + Math.sin(elapsed * 2) * 3
    );
    ctx.stroke();
    
    // Rain falling effect outside window
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    state.rainDrops.forEach(drop => {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 1, drop.y + drop.length);
      ctx.stroke();
      
      drop.y += drop.speed;
      if (drop.y > h * 0.85) {
        drop.y = -20;
        drop.x = Math.random() * w;
      }
    });
    
    // Overlay lofi titles
    ctx.font = '600 13px "Outfit"';
    ctx.fillStyle = '#9595b0';
    ctx.fillText('Now Playing: 1 A.M. Night Coding Session', w - 280, 40);
    ctx.font = '400 11px "JetBrains Mono"';
    ctx.fillStyle = '#00f5d4';
    ctx.fillText('LO-FI FILTER: ON', w - 130, 60);
  }

  // 3. Creative Coding Channel Animation
  renderCreativeCoding() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const state = this.state;
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    // Digital matrix background
    ctx.fillStyle = 'rgba(7, 7, 11, 0.12)'; // trailing effect
    ctx.fillRect(0, 0, w, h);
    
    // Matrix Falling character rain
    ctx.font = '12px "JetBrains Mono"';
    ctx.fillStyle = '#00f5d4';
    
    for (let i = 0; i < state.columns; i++) {
      const char = state.symbols[Math.floor(Math.random() * state.symbols.length)];
      const x = i * 16;
      const y = state.drops[i];
      
      // Randomly change color to purple/cyan for aesthetic mix
      ctx.fillStyle = i % 7 === 0 ? '#9d4edd' : '#00f5d4';
      ctx.fillText(char, x, y);
      
      state.drops[i] += 4;
      if (state.drops[i] > h && Math.random() > 0.98) {
        state.drops[i] = 0;
      }
    }
    
    // Floating Wireframe 3D Cube (Creative Coding)
    ctx.strokeStyle = '#c77dff';
    ctx.lineWidth = 1.5;
    
    state.cubeRotationX += 0.01;
    state.cubeRotationY += 0.015;
    
    // Simple 3D projection math
    const scale = 70 + Math.sin(elapsed) * 10;
    const cx = w * 0.75;
    const cy = h * 0.5;
    
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ];
    
    const projected = vertices.map(v => {
      // X rotation
      let y1 = v[1] * Math.cos(state.cubeRotationX) - v[2] * Math.sin(state.cubeRotationX);
      let z1 = v[1] * Math.sin(state.cubeRotationX) + v[2] * Math.cos(state.cubeRotationX);
      
      // Y rotation
      let x2 = v[0] * Math.cos(state.cubeRotationY) + z1 * Math.sin(state.cubeRotationY);
      let z2 = -v[0] * Math.sin(state.cubeRotationY) + z1 * Math.cos(state.cubeRotationY);
      
      // Perspective scaling
      const distance = 3;
      const zoom = scale / (distance - z2 / 2);
      
      return [cx + x2 * zoom, cy + y1 * zoom];
    });
    
    // Draw cube edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back
      [4, 5], [5, 6], [6, 7], [7, 4], // front
      [0, 4], [1, 5], [2, 6], [3, 7]  // connectors
    ];
    
    // Neon glow effect for cube edges
    ctx.shadowColor = '#9d4edd';
    ctx.shadowBlur = 10;
    
    edges.forEach(e => {
      ctx.beginPath();
      ctx.moveTo(projected[e[0]][0], projected[e[0]][1]);
      ctx.lineTo(projected[e[1]][0], projected[e[1]][1]);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
    
    // Left console window overlay (terminal logs)
    ctx.fillStyle = 'rgba(13, 13, 21, 0.85)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(30, 30, 280, 160, 10);
    ctx.fill();
    ctx.stroke();
    
    // Terminal title bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(30, 30, 280, 28, [10, 10, 0, 0]);
    ctx.fill();
    
    // Dots
    ctx.fillStyle = '#ff007f'; ctx.beginPath(); ctx.arc(45, 44, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff9e00'; ctx.beginPath(); ctx.arc(57, 44, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00f5d4'; ctx.beginPath(); ctx.arc(69, 44, 4, 0, Math.PI*2); ctx.fill();
    
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillStyle = '#9595b0';
    ctx.fillText('vibe-compiler-terminal v1.0.4', 90, 47);
    
    // Console output text simulation
    if (Date.now() - state.consoleTime > 2500) {
      const words = [
        'fetching user logs...',
        'compiling UI shaders...',
        'success: compiled in 32ms',
        'checking frame latency...',
        'rendering active vectors...',
        'garbage collection ran [740KB cleared]',
        'websocket heartbeat ping [6ms]'
      ];
      state.consoleLines.push(words[Math.floor(Math.random() * words.length)]);
      if (state.consoleLines.length > 7) state.consoleLines.shift();
      state.consoleTime = Date.now();
    }
    
    ctx.font = '11px "JetBrains Mono"';
    state.consoleLines.forEach((line, index) => {
      ctx.fillStyle = line.startsWith('success') ? '#00f5d4' : line.startsWith('error') ? '#ff007f' : '#f3f3f7';
      ctx.fillText(`$ ${line}`, 45, 80 + index * 16);
    });
  }

  // 4. ASMR Nature Channel Animation
  renderASMR() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const state = this.state;
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    // Dark deep cyan & forest background gradients
    const grad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w*0.7);
    grad.addColorStop(0, '#0a1a20');
    grad.addColorStop(0.6, '#060f14');
    grad.addColorStop(1, '#020508');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    
    // Slow drifting auroral glowing light bands (background math)
    ctx.fillStyle = 'rgba(0, 245, 212, 0.02)';
    ctx.beginPath();
    ctx.ellipse(w/2 + Math.sin(elapsed*0.5)*100, h/2, w*0.3, h*0.2 + Math.cos(elapsed)*20, elapsed*0.1, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(157, 78, 221, 0.02)';
    ctx.beginPath();
    ctx.ellipse(w/2 - Math.cos(elapsed*0.4)*120, h/2 + 20, w*0.3, h*0.2 - Math.sin(elapsed)*15, -elapsed*0.08, 0, Math.PI*2);
    ctx.fill();
    
    // Interactive mouse ripples logic
    state.ripples.forEach((rip, idx) => {
      ctx.strokeStyle = `rgba(0, 245, 212, ${rip.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      rip.radius += 2.5;
      rip.opacity -= 0.025;
      
      if (rip.opacity <= 0) {
        state.ripples.splice(idx, 1);
      }
    });
    
    // Glow nodes drifting
    state.particles.forEach(p => {
      // Update coordinates
      p.x += p.vx;
      p.y += p.vy;
      
      // Floating offset
      const floatX = Math.sin(elapsed + p.x) * 0.1;
      const floatY = Math.cos(elapsed + p.y) * 0.1;
      p.x += floatX;
      p.y += floatY;
      
      // Boundary checks
      if (p.x < -50) p.x = w + 50;
      if (p.x > w + 50) p.x = -50;
      if (p.y < -50) p.y = h + 50;
      if (p.y > h + 50) p.y = -50;
      
      // Draw radial gradient particle (feathered glow)
      const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      pGrad.addColorStop(0, p.color);
      pGrad.addColorStop(0.3, p.color.replace('0.15', '0.08'));
      pGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner glowing core
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Bottom visual overlay
    ctx.font = 'italic 12px "Outfit"';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('🔉 Click anywhere on stream to trigger calming sound waves', 30, h - 30);
  }

  // 5. Streamer Camera Mode (Go Live)
  renderCreatorCamera() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const state = this.state;
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    state.pulse += 0.05;
    
    if (state.cameraAllowed && state.webcamVideo) {
      // Draw the video frame directly onto the canvas
      ctx.drawImage(state.webcamVideo, 0, 0, w, h);
      
      // Apply neon color filter overlay to fit platform aesthetic
      ctx.fillStyle = 'rgba(157, 78, 221, 0.12)';
      ctx.fillRect(0, 0, w, h);
      
      // Grid lines scanning
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.07)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else {
      // Default: Camera Denied or Loading fallback avatar loop
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0d0d15');
      bgGrad.addColorStop(0.5, '#18122b');
      bgGrad.addColorStop(1, '#0d0d15');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
      
      // Dynamic scanning laser lines
      state.scanningY = (state.scanningY + 2.5) % h;
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, state.scanningY);
      ctx.lineTo(w, state.scanningY);
      ctx.stroke();
      
      // Neon horizontal glow overlay
      const scanGrad = ctx.createLinearGradient(0, state.scanningY - 15, 0, state.scanningY + 15);
      scanGrad.addColorStop(0, 'rgba(0,245,212,0)');
      scanGrad.addColorStop(0.5, 'rgba(0,245,212,0.1)');
      scanGrad.addColorStop(1, 'rgba(0,245,212,0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, state.scanningY - 15, w, 30);
      
      // Floating placeholder avatar logo
      const avatarX = w / 2;
      const avatarY = h / 2 - 20;
      
      // Outer neon shadow circles
      ctx.shadowColor = '#9d4edd';
      ctx.shadowBlur = 15 + Math.sin(state.pulse) * 8;
      ctx.strokeStyle = '#9d4edd';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Floating head icon
      ctx.fillStyle = '#1c1c30';
      ctx.beginPath();
      ctx.arc(avatarX, avatarY - 5, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY + 40, 42, Math.PI, 0, false);
      ctx.fill();
      
      // Stream Status labels
      ctx.font = 'bold 15px "Outfit"';
      ctx.fillStyle = '#f3f3f7';
      ctx.textAlign = 'center';
      ctx.fillText('CAMERA STANDBY', w/2, h/2 + 75);
      
      ctx.font = '500 11px "JetBrains Mono"';
      ctx.fillStyle = '#ff007f';
      ctx.fillText('NO CAM SOURCE DETECTED - SIMULATOR ON', w/2, h/2 + 95);
      ctx.textAlign = 'left'; // reset text align
    }
    
    // Draw neon camera brackets on edges
    const margin = 20;
    const bracketLen = 25;
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2.5;
    
    // Top Left
    ctx.beginPath();
    ctx.moveTo(margin, margin + bracketLen);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + bracketLen, margin);
    ctx.stroke();
    
    // Top Right
    ctx.beginPath();
    ctx.moveTo(w - margin, margin + bracketLen);
    ctx.lineTo(w - margin, margin);
    ctx.lineTo(w - margin - bracketLen, margin);
    ctx.stroke();
    
    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(margin, h - margin - bracketLen);
    ctx.lineTo(margin, h - margin);
    ctx.lineTo(margin + bracketLen, h - margin);
    ctx.stroke();
    
    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(w - margin, h - margin - bracketLen);
    ctx.lineTo(w - margin, h - margin);
    ctx.lineTo(w - margin - bracketLen, h - margin);
    ctx.stroke();
    
    // Red REC blinking indicator
    if (Math.floor(elapsed) % 2 === 0) {
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(45, 45, 6, 0, Math.PI*2);
      ctx.fill();
      
      ctx.font = 'bold 12px "JetBrains Mono"';
      ctx.fillStyle = '#f3f3f7';
      ctx.fillText('REC', 60, 49);
    }
    
    // Audio levels sidebar display
    const barsX = w - 45;
    const barsStartY = h / 2 - 60;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(barsX - 4, barsStartY - 10, 20, 140);
    
    state.soundBars.forEach((height, i) => {
      // Target height calculation
      const target = Math.random() * 25 + 2;
      state.soundBars[i] += (target - state.soundBars[i]) * 0.2;
      const hVal = state.soundBars[i];
      
      // Color selector based on sound peak height
      ctx.fillStyle = hVal > 20 ? '#ff007f' : hVal > 12 ? '#ff9e00' : '#00f5d4';
      ctx.fillRect(barsX, barsStartY + (i * 8), 12, 5);
    });
  }
}

// 6. Dashboard performance statistics plotter helper
class DashboardChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.history = Array.from({ length: 40 }, () => 2000 + Math.random() * 800); // simulated bitrates
    this.historyLimit = 40;
    
    // Resize chart
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.width = rect.width;
    this.height = rect.height;
  }

  update(newBitrate) {
    this.history.push(newBitrate);
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += w / 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += h / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    // Chart Line Drawing
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    const stepX = w / (this.historyLimit - 1);
    const maxVal = 4000;
    const minVal = 0;
    
    this.history.forEach((val, idx) => {
      const x = idx * stepX;
      // Normalizing to chart height
      const normY = h - ((val - minVal) / (maxVal - minVal)) * (h - 20) - 10;
      
      if (idx === 0) {
        ctx.moveTo(x, normY);
      } else {
        ctx.lineTo(x, normY);
      }
    });
    ctx.stroke();
    
    // Fade Area fill underneath the line
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, 0, 0, h);
    areaGrad.addColorStop(0, 'rgba(0, 245, 212, 0.15)');
    areaGrad.addColorStop(1, 'rgba(0, 245, 212, 0.0)');
    ctx.fillStyle = areaGrad;
    ctx.fill();
    
    // Display current metric textual value
    const latest = Math.round(this.history[this.history.length - 1]);
    ctx.font = 'bold 11px "JetBrains Mono"';
    ctx.fillStyle = '#00f5d4';
    ctx.fillText(`${latest} kbps`, w - 85, 20);
  }
}

// Make globally available
window.StreamEngine = StreamEngine;
window.DashboardChart = DashboardChart;
