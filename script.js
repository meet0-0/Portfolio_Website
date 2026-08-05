/* ============================================================
   BOOT SEQUENCE
   ============================================================ */
(function boot(){
  const bootEl = document.getElementById('boot');
  const log = document.getElementById('bootLog');
  const fill = document.getElementById('bootFill');
  const traceEl = document.getElementById('bootTrace');

  const lines = [
    '> initializing hardware...',
    '> loading fpga modules...',
    '> mounting linux kernel...',
    '> connecting github...',
    '> starting portfolio...'
  ];

  let i = 0;
  const step = 100 / lines.length;

  // animate a little scope trace behind the boot log
  let t = 0;
  function drawBootTrace(){
    let pts = [];
    for(let x = 0; x <= 300; x += 6){
      const y = 40 + Math.sin((x * 0.08) + t) * 14 * Math.min(1, i / lines.length + 0.2);
      pts.push(x + ',' + y.toFixed(1));
    }
    traceEl.setAttribute('points', pts.join(' '));
    t += 0.12;
  }
  const traceInterval = setInterval(drawBootTrace, 40);

  const interval = setInterval(() => {
    if(i < lines.length){
      const div = document.createElement('div');
      div.textContent = lines[i];
      log.appendChild(div);
      fill.style.width = ((i + 1) * step) + '%';
      i++;
    } else {
      clearInterval(interval);
      clearInterval(traceInterval);
      setTimeout(() => {
        bootEl.classList.add('done');
        document.body.style.overflow = '';
      }, 350);
    }
  }, 320);

  // Skip boot on repeat visits within session for convenience
  document.body.style.overflow = 'hidden';
})();

/* ============================================================
   AMBIENT BACKGROUND: grid + drifting signal traces
   ============================================================ */
(function ambientBackground(){
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const traces = Array.from({length: 3}).map((_, idx) => ({
    y: 0.2 + idx * 0.3,
    amp: 18 + idx * 6,
    freq: 0.004 + idx * 0.0012,
    speed: 0.0006 + idx * 0.0003,
    phase: Math.random() * 100,
    color: ['87,232,166', '79,168,224', '242,169,59'][idx]
  }));

  let time = 0;
  function draw(){
    ctx.clearRect(0, 0, w, h);

    // faint grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    const gap = 44 * dpr;
    for(let x = 0; x < w; x += gap){
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for(let y = 0; y < h; y += gap){
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // drifting sine traces
    traces.forEach(tr => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${tr.color},0.05)`;
      ctx.lineWidth = 1.4 * dpr;
      const baseY = h * tr.y;
      for(let x = 0; x <= w; x += 4 * dpr){
        const y = baseY + Math.sin(x * tr.freq + time * tr.speed * 60 + tr.phase) * tr.amp * dpr;
        if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    time++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   HERO OSCILLOSCOPE
   ============================================================ */
(function scope(){
  const canvas = document.getElementById('scopeCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const channels = [
    { color: '#57E8A6', amp: 34, freq: 0.045, speed: 0.05, offsetY: 55,  shape: 'sine' },
    { color: '#4FA8E0', amp: 26, freq: 0.09,  speed: 0.08, offsetY: 120, shape: 'square' },
    { color: '#F2A93B', amp: 22, freq: 0.06,  speed: 0.03, offsetY: 185, shape: 'sawtooth' },
    { color: '#C792E8', amp: 18, freq: 0.03,  speed: 0.06, offsetY: 245, shape: 'sine' }
  ];

  function wave(shape, x, t, freq){
    const p = x * freq + t;
    switch(shape){
      case 'square': return Math.sign(Math.sin(p));
      case 'sawtooth': return (2 * (p / (Math.PI * 2) - Math.floor(p / (Math.PI * 2) + 0.5)));
      default: return Math.sin(p);
    }
  }

  let t = 0;
  function draw(){
    ctx.clearRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = 'rgba(87,232,166,0.06)';
    ctx.lineWidth = 1;
    for(let x = 0; x < W; x += 26){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y = 0; y < H; y += 26){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    channels.forEach(ch => {
      ctx.beginPath();
      ctx.strokeStyle = ch.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = ch.color;
      ctx.shadowBlur = 6;
      for(let x = 0; x <= W; x += 3){
        const y = ch.offsetY + wave(ch.shape, x, t * ch.speed, ch.freq) * ch.amp;
        if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   TYPING EFFECT (hero teaser line)
   ============================================================ */
(function typeEffect(){
  const el = document.getElementById('typeTarget');
  if(!el) return;
  const phrases = [
    'boot --engineer',
    'load linux embedded fpga robotics',
    'status: ready for summer 2027'
  ];
  let p = 0, c = 0, deleting = false;

  function tick(){
    const current = phrases[p];
    if(!deleting){
      c++;
      el.textContent = current.slice(0, c);
      if(c === current.length){
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      c--;
      el.textContent = current.slice(0, c);
      if(c === 0){
        deleting = false;
        p = (p + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 28 : 48);
  }
  tick();
})();

/* ============================================================
   WAVE DIVIDERS (animated sine paths between sections)
   ============================================================ */
(function waveDividers(){
  const dividers = document.querySelectorAll('.wave-divider');
  let t = 0;

  function buildPath(amp, phase){
    const w = 1200, h = 60, mid = h / 2;
    let d = `M0,${mid}`;
    for(let x = 0; x <= w; x += 20){
      const y = mid + Math.sin((x * 0.012) + phase) * amp;
      d += ` L${x},${y.toFixed(1)}`;
    }
    return d;
  }

  function animate(){
    dividers.forEach((div, i) => {
      const path = div.querySelector('path');
      const amp = parseFloat(div.dataset.amp) || 10;
      path.setAttribute('d', buildPath(amp, t + i * 1.4));
    });
    t += 0.012;
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function scrollReveal(){
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
})();

/* ============================================================
   SKILL BARS animate width on reveal
   ============================================================ */
(function skillBars(){
  const bars = document.querySelectorAll('.bar i');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const w = entry.target.style.getPropertyValue('--w');
        entry.target.style.width = w;
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => io.observe(b));
})();

/* ============================================================
   GITHUB CONTRIBUTION GRAPH (deterministic pseudo-random)
   ============================================================ */
(function githubGraph(){
  const grid = document.getElementById('ghGraph');
  if(!grid) return;
  let seed = 42;
  function rand(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  const cells = 52 * 7;
  for(let i = 0; i < cells; i++){
    const r = rand();
    const level = r > 0.86 ? 4 : r > 0.7 ? 3 : r > 0.5 ? 2 : r > 0.32 ? 1 : 0;
    const i2 = document.createElement('i');
    if(level > 0){
      const opacities = [0.25, 0.45, 0.7, 1];
      i2.style.background = `rgba(87,232,166,${opacities[level - 1]})`;
    }
    grid.appendChild(i2);
  }
})();

/* ============================================================
   INTERACTIVE TERMINAL
   ============================================================ */
(function terminal(){
  const input = document.getElementById('termInput');
  const output = document.getElementById('termOutput');
  if(!input) return;

  const commands = {
    help: () => [
      'available commands:',
      '  about        - who is meet patel',
      '  projects     - list featured builds',
      '  experience   - work & leadership history',
      '  skills       - core technologies',
      '  resume       - open resume',
      '  github       - open github profile',
      '  linkedin     - open linkedin profile',
      '  contact      - get in touch',
      '  clear        - clear the terminal'
    ].join('\n'),
    about: () => 'Computer Engineering student building FPGA systems, embedded applications, and robotics. Seeking Summer 2027 Embedded Engineering internships.',
    projects: () => [
      'combat robot        - embedded control + motor drivers',
      'digital stopwatch    - 6 modules, 4 state machines, VHDL',
      'traffic controller  - 5-state FSM, pedestrian override',
      'pomodoro timer      - offline focus timer, python'
    ].join('\n'),
    experience: () => [
      'may 2026   - july 2026        bose - mcintosh laboratory  - hardware analyst intern',
      'jan 2026   -  may 2026        watson combat robot league  - team leader',
      'april 2024 - june 2025        ekochingmun                 - director general'
    ].join('\n'),
    skills: () => 'C, C++, VHDL, Linux, FPGA, Git, Vivado, Fusion 360',
    resume: () => { window.open('Meet_Patel_Resume.pdf', '_blank'); return 'opening resume...'; },
    github: () => { window.open('https://github.com/meet0-0', '_blank'); return 'opening github.com/meet0-0 ...'; },
    linkedin: () => { window.open('https://linkedin.com/in/meetpatel-tech', '_blank'); return 'opening linkedin ...'; },
    contact: () => 'reach out: meetpatel27105@gmail.com',
    whoami: () => 'guest',
    'sudo make coffee': () => 'permission denied: this is a portfolio, not a kitchen.',
  };

  function print(text, isCmd){
    const div = document.createElement('div');
    if(isCmd){ div.className = 'cmd-echo'; div.textContent = text; }
    else { div.textContent = text; }
    output.appendChild(div);
    output.parentElement.scrollTop = output.parentElement.scrollHeight;
  }

  print('welcome to meetpatel@portfolio. type "help" to begin.');

  input.addEventListener('keydown', (e) => {
    if(e.key !== 'Enter') return;
    const raw = input.value.trim();
    if(!raw) return;
    print(raw, true);

    if(raw === 'clear'){
      output.innerHTML = '';
      input.value = '';
      return;
    }

    const handler = commands[raw.toLowerCase()];
    if(handler){
      print(handler());
    } else {
      print(`command not found: ${raw}  (type "help")`);
    }
    input.value = '';
  });
})();
