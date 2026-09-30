// scroll progress + header state
const header = document.getElementById('siteHeader');
const progress = document.getElementById('progress');
function onScroll(){
  const h = document.documentElement;
  const scrolled = h.scrollTop || document.body.scrollTop;
  const height = h.scrollHeight - h.clientHeight;
  if(progress) progress.style.width = (height>0 ? (scrolled/height)*100 : 0) + '%';
  if(header){ if(scrolled>10) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
}
document.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// mobile menu
const burger = document.getElementById('burgerBtn');
const mmenu = document.getElementById('mobileMenu');
const closeBtn = document.getElementById('closeMenuBtn');
if(burger){ burger.addEventListener('click', ()=> mmenu.classList.add('open')); }
if(closeBtn){ closeBtn.addEventListener('click', ()=> mmenu.classList.remove('open')); }
if(mmenu){ mmenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mmenu.classList.remove('open'))); }

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// animated counters
function animateCounter(el){
  const target = parseFloat(el.dataset.count);
  const decimals = el.dataset.count.includes('.') ? el.dataset.count.split('.')[1].length : 0;
  const suffix = el.dataset.suffix || '';
  const dur = 1400; let start=null;
  function step(ts){
    if(!start) start=ts;
    const p = Math.min((ts-start)/dur,1);
    const eased = 1 - Math.pow(1-p,3);
    el.textContent = (target*eased).toFixed(decimals) + suffix;
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// custom cursor (desktop only)
if(window.matchMedia('(hover:hover)').matches && !reduceMotion){
  const dot = document.createElement('div'); dot.className='cursor-dot';
  const ring = document.createElement('div'); ring.className='cursor-ring';
  document.body.append(dot,ring);
  window.__dot = dot; window.__ring = ring;
  let rx=0, ry=0, tx=0, ty=0;
  window.addEventListener('mousemove', e=>{
    dot.style.left=e.clientX+'px'; dot.style.top=e.clientY+'px';
    tx=e.clientX; ty=e.clientY;
  });
  function loop(){ rx += (tx-rx)*0.18; ry += (ty-ry)*0.18; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); }
  loop();
}

// cookie consent
function openCookiePrefs(){ document.getElementById('cookieBanner')?.classList.add('show'); }
(function(){
  const banner = document.getElementById('cookieBanner');
  if(!banner) return;
  let consent;
  try{ consent = JSON.parse(localStorage.getItem('mfx_cookie_consent')||'null'); }catch(e){ consent=null; }
  if(!consent){ setTimeout(()=>banner.classList.add('show'), 600); }
  function save(v){ try{ localStorage.setItem('mfx_cookie_consent', JSON.stringify(v)); }catch(e){} banner.classList.remove('show'); }
  document.getElementById('cookieAcceptAll')?.addEventListener('click', ()=>save({necessary:true,analytics:true,marketing:true,preferences:true}));
  document.getElementById('cookieRejectAll')?.addEventListener('click', ()=>save({necessary:true,analytics:false,marketing:false,preferences:false}));
  document.getElementById('cookieManage')?.addEventListener('click', ()=>save({necessary:true,analytics:false,marketing:false,preferences:true}));
})();


const PAGE_META = {"home":{"title":"Professional Forex Trading & Automated EA Solutions","description":"Structured forex account management and automated FX EA trading, built on disciplined risk management and transparent, verifiable performance tracking."},"account-management":{"title":"Forex Account Management","description":"Professional forex account management under a defined risk mandate \u2014 transparent custody, authorization and reporting explained."},"fx-ea":{"title":"FX EA \u2014 Automated Trading Software","description":"A rule-based Expert Advisor for MT4/MT5 with configurable risk management, position sizing and drawdown controls."},"performance":{"title":"Trading Performance Dashboard","description":"Transparent trading performance: equity curve, drawdown, trading statistics and full trade history."},"pricing":{"title":"Pricing","description":"Account management fees and FX EA license plans \u2014 disclosed clearly, with no promised returns."},"about":{"title":"About Us","description":"Our company, founder, trading philosophy, technology and values."},"faq":{"title":"FAQ","description":"Answers to common questions about account management, FX EA, performance and risk."},"contact":{"title":"Contact","description":"Get in touch or book a consultation with our team."},"get-started":{"title":"Get Started","description":"Apply for forex account management or an FX EA license in a few short steps."},"login":{"title":"Client Login","description":"Log in to your client portal."},"dashboard":{"title":"Client Dashboard","description":"Your account performance, trades and documents."}};
const DEFAULT_ROUTE = "home";
function parseHash(){
  const h = location.hash;
  if(!h.startsWith('#/')) return null;
  const parts = h.slice(2).split('/');
  return { route: parts[0] || DEFAULT_ROUTE, anchor: parts[1] || null };
}
function setActiveNav(route){
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a=>{
    const r = (a.getAttribute('href')||'').replace('#/','').split('/')[0];
    a.classList.toggle('active', r===route);
  });
}
function runActivator(route){
  if(route==="home"){ 
(function(){
  const panel = document.getElementById('liveChartPanel');
  const chart = document.getElementById('tradingviewChart');
  if(!panel || !chart) return;

  const SYMBOLS = {
    EURUSD: 'OANDA:EURUSD',
    USDJPY: 'OANDA:USDJPY',
    XAUUSD: 'OANDA:XAUUSD',
    AUDUSD: 'OANDA:AUDUSD'
  };
  const LABELS = {EURUSD:'EUR/USD',USDJPY:'USD/JPY',XAUUSD:'XAU/USD',AUDUSD:'AUD/USD'};

  function loadTradingView(symbolKey){
    const symbol=SYMBOLS[symbolKey];
    if(!symbol) return;
    document.querySelectorAll('.phone-row').forEach(row=>{
      row.classList.toggle('active',row.dataset.symbol===symbolKey);
    });
    const label=document.getElementById('lcpSymbolLabel');
    if(label) label.textContent=LABELS[symbolKey] || symbolKey;
    chart.innerHTML='';
    const script=document.createElement('script');
    script.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type='text/javascript';
    script.async=true;
    script.textContent=JSON.stringify({
      autosize:true,symbol,interval:'15',timezone:'Etc/UTC',theme:'dark',style:'1',
      locale:'en',allow_symbol_change:false,hide_top_toolbar:false,hide_legend:false,
      hide_side_toolbar:true,save_image:false,calendar:false,hide_volume:true,
      support_host:'https://www.tradingview.com'
    });
    chart.appendChild(script);
    const source=document.getElementById('lcpSourceTag');
    const meta=document.getElementById('lcpMeta');
    const price=document.getElementById('lcpChartPrice');
    const change=document.getElementById('lcpChartChange');
    if(source) source.textContent='Live market chart';
    if(meta) meta.textContent='TradingView · live feed';
    if(price) price.textContent='LIVE';
    if(change){change.textContent='';change.className='lcp-change na';}
  }
  document.querySelectorAll('.phone-row').forEach(row=>{
    row.addEventListener('click',()=>loadTradingView(row.dataset.symbol));
  });
  loadTradingView('EURUSD');
})();
// ---- Testimonial carousel ----
(function(){
  const root = document.getElementById('testimonialCarousel');
  if(!root) return;
  const track = document.getElementById('testimonialSlides');
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById('carDots');
  let i = 0;
  slides.forEach((_, idx) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to testimonial ' + (idx + 1));
    d.addEventListener('click', () => go(idx));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.children);
  function go(idx){
    i = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('active', k === i));
  }
  document.getElementById('carPrev').addEventListener('click', () => go(i - 1));
  document.getElementById('carNext').addEventListener('click', () => go(i + 1));
  if(window.__testimonialTimer) clearInterval(window.__testimonialTimer);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion){ window.__testimonialTimer = setInterval(() => go(i + 1), 6000); }
})();
 } else if(route==="performance"){ 
(function(){
  const el = document.getElementById('equityChart');
  if(!el || !window.LightweightCharts) return;
  const chart = LightweightCharts.createChart(el, {
    height: 340,
    layout:{ background:{color:'transparent'}, textColor:'#A9BEE8', fontFamily:'Inter, sans-serif' },
    grid:{ vertLines:{color:'#1B3868'}, horzLines:{color:'#1B3868'} },
    rightPriceScale:{ borderColor:'#234176' },
    timeScale:{ borderColor:'#234176' },
    crosshair:{ mode:1 },
  });
  const series = chart.addAreaSeries({
    lineColor:'#2F80FF', topColor:'rgba(61,123,245,0.28)', bottomColor:'rgba(61,123,245,0.0)', lineWidth:2
  });
  function genData(n, vol){
    let v = 20000; const out=[]; const now = new Date('2026-09-20');
    for(let i=n;i>=0;i--){
      const d = new Date(now); d.setDate(d.getDate()-i);
      v += (Math.sin(i/6)*vol) + (Math.random()-0.35)*vol;
      out.push({ time: d.toISOString().slice(0,10), value: Math.round(v) });
    }
    return out;
  }
  const sets = { '1D': genData(1,20), '1W': genData(7,60), '1M': genData(30,90), '3M': genData(90,140), '6M': genData(180,180), '1Y': genData(365,220), 'ALL': genData(500,260) };
  series.setData(sets['ALL']);
  chart.timeScale().fitContent();
  document.querySelectorAll('#tfButtons .filter-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#tfButtons .filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      series.setData(sets[btn.dataset.tf]);
      chart.timeScale().fitContent();
    });
  });
  window.addEventListener('resize', ()=> chart.applyOptions({ width: el.clientWidth }));
})();

function drawBars(canvasId, values, colorFn){
  const c = document.getElementById(canvasId); if(!c) return;
  const ctx = c.getContext('2d');
  function draw(){
    const dpr = window.devicePixelRatio||1;
    const w = c.parentElement.clientWidth, h = c.parentElement.clientHeight;
    c.width=w*dpr; c.height=h*dpr; c.style.width=w+'px'; c.style.height=h+'px'; ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);
    const max = Math.max(...values.map(Math.abs));
    const bw = w/values.length;
    const zero = h/2;
    ctx.strokeStyle='#234176'; ctx.beginPath(); ctx.moveTo(0,zero); ctx.lineTo(w,zero); ctx.stroke();
    values.forEach((v,i)=>{
      const bh = (Math.abs(v)/max) * (h/2-10);
      const x = i*bw + bw*0.2;
      ctx.fillStyle = colorFn(v);
      if(v>=0) ctx.fillRect(x, zero-bh, bw*0.6, bh);
      else ctx.fillRect(x, zero, bw*0.6, bh);
    });
  }
  draw(); window.addEventListener('resize', draw);
}
drawBars('ddChart', [-1,-2,-1.5,-3,-2.2,-4,-3.1,-5.5,-4.8,-6.2,-5,-3.6], ()=> '#ef5350');
drawBars('monthChart', [2.1,1.4,-0.8,3.2,1.9,-1.1,2.6,0.9,3.8,-0.5,2.2,1.6], v=> v>=0 ? '#22c55e' : '#ef5350');

// trade search
document.getElementById('tradeSearch')?.addEventListener('input', function(){
  const q = this.value.toLowerCase();
  document.querySelectorAll('#tradeTable tbody tr').forEach(row=>{
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  });
});
 } else if(route==="get-started"){ 
(function(){
  const steps = Array.from(document.querySelectorAll('.gs-step'));
  const chips = Array.from(document.querySelectorAll('.step-chip'));
  let cur = 0;
  function render(){
    steps.forEach((s,i)=> s.classList.toggle('active', i===cur));
    chips.forEach((c,i)=>{
      c.classList.toggle('active', i===cur);
      c.classList.toggle('done', i<cur);
    });
    document.getElementById('gsNav').style.display = cur===steps.length-1 ? 'none' : 'flex';
    document.getElementById('gsPrev').style.visibility = cur===0 ? 'hidden' : 'visible';
    document.getElementById('gsNext').textContent = cur===steps.length-2 ? 'Submit application' : 'Continue';
  }
  document.getElementById('gsNext').addEventListener('click', ()=>{ if(cur<steps.length-1){ cur++; render(); window.scrollTo({top:0,behavior:'smooth'}); }});
  document.getElementById('gsPrev').addEventListener('click', ()=>{ if(cur>0){ cur--; render(); }});
  chips.forEach((c,i)=> c.addEventListener('click', ()=>{ if(i<=cur){ cur=i; render(); }}));
  render();
})();
 } else if(route==="dashboard"){ 
(function(){
  const c = document.getElementById('dashChart'); if(!c) return;
  const ctx = c.getContext('2d');
  function draw(){
    const dpr = window.devicePixelRatio||1, w=c.parentElement.clientWidth, h=c.parentElement.clientHeight;
    c.width=w*dpr; c.height=h*dpr; c.style.width=w+'px'; c.style.height=h+'px'; ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);
    const data=[20800,21100,20950,21400,21800,21600,22100,22400,22200,22900,23300,23100,23700,24180];
    const max=Math.max(...data), min=Math.min(...data)-200;
    ctx.strokeStyle='#234176'; for(let i=0;i<=3;i++){ const y=(h-16)*(i/3)+8; ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke(); }
    ctx.beginPath();
    data.forEach((v,i)=>{ const x=(w/(data.length-1))*i; const y=8+(h-16)*(1-(v-min)/(max-min)); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    const grad=ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0,'rgba(25,195,173,0.3)'); grad.addColorStop(1,'rgba(25,195,173,0)');
    ctx.strokeStyle='#4FC3FF'; ctx.lineWidth=2; ctx.stroke();
    ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
  }
  draw(); window.addEventListener('resize',draw);
})();
 }
}
function initDynamic(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    },{threshold:0.15});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
    const cio = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ animateCounter(e.target); cio.unobserve(e.target);} });
    },{threshold:0.4});
    document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
    document.querySelectorAll('[data-count]').forEach(el=>animateCounter(el));
  }
  document.querySelectorAll('.accordion-item > button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = btn.parentElement;
      const panel = item.querySelector('.accordion-panel');
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i=>{
        i.classList.remove('open'); i.querySelector('.accordion-panel').style.maxHeight = null;
      });
      if(!isOpen){ item.classList.add('open'); panel.style.maxHeight = panel.scrollHeight + 'px'; }
    });
  });
  document.querySelectorAll('.filters').forEach(group=>{
    group.querySelectorAll('.filter-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        group.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        const targetSel = group.dataset.target || '.filterable';
        document.querySelectorAll(targetSel).forEach(card=>{
          const match = cat==='all' || card.dataset.cat===cat;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  });
  if(window.matchMedia('(hover:hover)').matches && !reduceMotion){
    document.querySelectorAll('a,button,.card,.svc-card,.price-card,input,textarea').forEach(el=>{
      el.addEventListener('mouseenter', ()=>window.__ring && window.__ring.classList.add('hover'));
      el.addEventListener('mouseleave', ()=>window.__ring && window.__ring.classList.remove('hover'));
    });
  }
}
function navigate(){
  const parsed = parseHash();
  if(!parsed) return; // not an app route (e.g. same-page anchor) — let the browser handle it natively
  const route = parsed.route;
  const tpl = document.getElementById('page-' + route);
  const app = document.getElementById('app');
  if(!tpl){ app.innerHTML = '<section class="section" style="padding-top:170px;text-align:center"><h1 class="h1">404</h1><p class="lede" style="margin:16px auto">We couldn\'t find that page.</p><a href="#/home" class="btn btn-primary" style="margin-top:20px">Back to home</a></section>'; return; }
  app.innerHTML = '';
  app.appendChild(tpl.content.cloneNode(true));
  const meta = PAGE_META[route];
  if(meta){ document.title = meta.title + ' | BayFxEA'; const d = document.querySelector('meta[name=description]'); if(d) d.setAttribute('content', meta.description); }
  document.getElementById('mobileMenu').classList.remove('open');
  setActiveNav(route);
  initDynamic();
  runActivator(route);
  if(parsed.anchor){
    const target = document.getElementById(parsed.anchor);
    if(target){ requestAnimationFrame(()=> requestAnimationFrame(()=> target.scrollIntoView({behavior:'smooth', block:'start'}))); }
    else window.scrollTo({top:0});
  } else {
    window.scrollTo({top:0});
  }
}
window.addEventListener('hashchange', navigate);
document.addEventListener('DOMContentLoaded', ()=>{
  if(!location.hash || !location.hash.startsWith('#/')) location.hash = '#/' + DEFAULT_ROUTE;
  else navigate();
});
