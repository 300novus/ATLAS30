// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════
const BUILTIN_CATS = {
  food:     {label:'Еда и рестораны',icon:'🍽',color:'#f97316',builtin:true},
  coffee:   {label:'Кофейни',icon:'☕',color:'#f59e0b',builtin:true},
  shop:     {label:'Магазины',icon:'🛍',color:'#3b82f6',builtin:true},
  hotel:    {label:'Отели',icon:'🏨',color:'#8b5cf6',builtin:true},
  culture:  {label:'Культура',icon:'🏛',color:'#6366f1',builtin:true},
  park:     {label:'Парки',icon:'🌿',color:'#22c55e',builtin:true},
  health:   {label:'Медицина',icon:'🏥',color:'#14b8a6',builtin:true},
  edu:      {label:'Образование',icon:'📚',color:'#06b6d4',builtin:true},
  sport:    {label:'Спорт',icon:'⚽',color:'#ef4444',builtin:true},
  transport:{label:'Транспорт',icon:'🚇',color:'#64748b',builtin:true},
  fun:      {label:'Развлечения',icon:'🎉',color:'#ec4899',builtin:true},
  other:    {label:'Другое',icon:'📌',color:'#94a3b8',builtin:true},
};
const COLORS=['#3b82f6','#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#22c55e','#14b8a6','#06b6d4','#f97316','#64748b','#a3e635'];
const EMOJIS=['📍','☕','🍕','🍣','🏪','🏨','🌳','🏛','🎭','🏥','📚','⚽','🚇','🎉','🛍','🍔','🎸','💊','🏋','🎬','🌺','🔧','🏦','🍦','🎯','⭐','🔥','💎','🎪','🏖','🚀','🦋'];

// ═══════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════
let APP = {
  role: null, // null=guest, 'admin'
  page: 'map',
  selectedId: null,
  editingId: null,
  filterCat: 'all',
  addingMode: false,
  adminPass: localStorage.getItem('ga_pass') || 'admin2024',
};
let places  = JSON.parse(localStorage.getItem('ga_places')  || '[]');
let userCats = JSON.parse(localStorage.getItem('ga_cats') || '[]');
let mapImages = JSON.parse(localStorage.getItem('ga_mapimages') || '[]');
// mapImages item: {id, name, src(dataUrl), lat, lng, size(16|32|64), zLevel(1-5), createdAt}

function getCats(){ return {...BUILTIN_CATS, ...Object.fromEntries(userCats.map(c=>[c.id,c]))}; }
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}
function saveAll(){
  localStorage.setItem('ga_places',JSON.stringify(places));
  localStorage.setItem('ga_cats',JSON.stringify(userCats));
  localStorage.setItem('ga_mapimages',JSON.stringify(mapImages));
}
if(!places.length){
  places=[
    {id:uid(),name:'Центральный парк',category:'park',icon:'🌳',iconType:'emoji',iconData:null,color:'#22c55e',descHtml:'<b>Большой городской парк</b> с озером и тенистыми аллеями.',lat:51.18,lng:71.46,images:[],createdAt:Date.now()-86400000*3},
    {id:uid(),name:'Кофейня «Арома»',category:'coffee',icon:'☕',iconType:'emoji',iconData:null,color:'#f59e0b',descHtml:'Уютное место с <u>авторским кофе</u> и домашней выпечкой.',lat:51.22,lng:71.49,images:[],createdAt:Date.now()-86400000*2},
    {id:uid(),name:'Городской музей',category:'culture',icon:'🏛',iconType:'emoji',iconData:null,color:'#6366f1',descHtml:'Исторические <b>экспозиции</b> и временные выставки.',lat:51.19,lng:71.44,images:[],createdAt:Date.now()-86400000},
    {id:uid(),name:'Стадион «Олимп»',category:'sport',icon:'⚽',iconType:'emoji',iconData:null,color:'#ef4444',descHtml:'Главный спортивный объект. Вместимость <b style="color:#ef4444">30 000</b> человек.',lat:51.17,lng:71.52,images:[],createdAt:Date.now()-3600000*5},
    {id:uid(),name:'ТЦ «Мегаплаза»',category:'shop',icon:'🛍',iconType:'emoji',iconData:null,color:'#3b82f6',descHtml:'Крупный торговый центр с <b>300+</b> магазинами.',lat:51.23,lng:71.42,images:[],createdAt:Date.now()-3600000*2},
    {id:uid(),name:'Больница №1',category:'health',icon:'🏥',iconType:'emoji',iconData:null,color:'#14b8a6',descHtml:'Круглосуточная скорая помощь и стационар.',lat:51.20,lng:71.55,images:[],createdAt:Date.now()-3600000},
  ];
  saveAll();
}

// ═══════════════════════════════════════════
//  ROUTING
// ═══════════════════════════════════════════
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  APP.page=id;
  if(id==='map') initMapIfNeeded();
}

function enterAsGuest(){
  APP.role=null;
  showPage('map');
  updateHeaderForRole();
  renderAll();
}
function enterAsAdmin(){
  APP.role='admin';
  showPage('map');
  updateHeaderForRole();
  renderAll();
}
function logout(){
  APP.role=null;
  showPage('login');
}
function updateHeaderForRole(){
  const isAdmin=APP.role==='admin';
  document.getElementById('btn-open-admin').style.display=isAdmin?'':'none';
  document.getElementById('btn-map-logout').style.display=isAdmin?'':'none';
  document.getElementById('btn-map-login').style.display=isAdmin?'none':'';
  document.getElementById('admin-bar').classList.toggle('show', isAdmin);
  if(isAdmin){
    document.getElementById('chip-icon').textContent='🔑';
    document.getElementById('chip-name').textContent='Администратор';
    document.getElementById('chip-role').textContent='ADMIN';
  } else {
    document.getElementById('chip-icon').textContent='👤';
    document.getElementById('chip-name').textContent='Гость';
    document.getElementById('chip-role').textContent='';
  }
}

// ── Login/Logout bindings ──
document.getElementById('go-to-map-link').addEventListener('click', enterAsGuest);
document.getElementById('btn-login').addEventListener('click', doAdminLogin);
document.getElementById('login-pass').addEventListener('keydown', e=>{ if(e.key==='Enter') doAdminLogin(); });
document.getElementById('pass-eye').addEventListener('click', ()=>{
  const i=document.getElementById('login-pass'); i.type=i.type==='password'?'text':'password';
});
document.getElementById('btn-map-login').addEventListener('click', ()=>showPage('login'));
document.getElementById('btn-map-logout').addEventListener('click', ()=>{ logout(); });
document.getElementById('btn-adm-logout').addEventListener('click', ()=>{ logout(); });
document.getElementById('btn-open-admin').addEventListener('click', ()=>{ showPage('admin'); renderAdminDashboard(); renderAdminTable(); renderCatsManager(); });
document.getElementById('btn-adm-to-map').addEventListener('click', ()=>{ showPage('map'); renderAll(); });

function doAdminLogin(){
  const pass=document.getElementById('login-pass').value;
  document.getElementById('login-error').classList.toggle('show', pass!==APP.adminPass);
  if(pass===APP.adminPass){ document.getElementById('login-pass').value=''; enterAsAdmin(); }
}

// ═══════════════════════════════════════════
//  MAP ENGINE
// ═══════════════════════════════════════════
const canvas=document.getElementById('map-canvas');
const ctx=canvas.getContext('2d');
const mapCon=document.getElementById('map-container');
// ── TILE CONFIG ─────────────────────────────────────────────────
// Папка tiles/ должна лежать рядом с этим HTML файлом.
// Структура: tiles/{z}/{x}/{y}.png  (z=0..8, тайлы 256×256 px)
// Исходная карта: 50 000×50 000 px → нарезается командой:
//   gdal2tiles.py --zoom=0-8 --tile-size=256 your_map.png ./tiles/
//
// Если файла тайлов нет — рисуется встроенная заглушка (векторная карта).
const TILE_DIR  = 'tiles';    // папка тайлов рядом с HTML
const TILE_SIZE = 256;        // размер тайла px
const TILE_EXT  = '.jpg';     // vips даёт .jpg; если .png — поменяйте здесь
// vips --layout google: папки 0..8, где 0=весь мир, 8=максимум детализации
// Карта 50000px / 256px = ~195 → ceil(log2(195))=8 уровней → папки 0..8
const VIPS_TOTAL = 9;         // количество папок (0,1,2...8) = 9 штук
const ZOOM_MIN   = 0;
const ZOOM_MAX   = VIPS_TOTAL - 1;  // = 8
const USE_TILES  = true;      // true=тайлы | false=встроенная векторная карта

// ── MAP STATE ───────────────────────────────────────────────────
// MAP.z — «визуальный» масштаб (1 = исходный, 2 = вдвое крупнее)
// zoomTarget — куда плавно движется зум (анимируется через requestAnimationFrame)
const MAP={ox:0,oy:0,z:1,drag:false,lx:0,ly:0};
let zoomTarget=1, zoomAnimId=null;
let mapReady=false;

// Объявляем здесь — используются в mousedown handler до секции MAP IMAGES
const Z_BASE = 14;
let selectedImgId = null;
let mimAddingMode = false;

// ── TILE CACHE ──────────────────────────────────────────────────
const tileCache={};   // ключ: "z/x/y" → HTMLImageElement

function getTile(z,x,y){
  const key=z+'/'+x+'/'+y;
  if(tileCache[key]) return tileCache[key];
  const img=new Image();
  img.src=TILE_DIR+'/'+key+TILE_EXT;
  img.onload=()=>drawMap();
  tileCache[key]=img;
  return img;
}

// ── INIT ────────────────────────────────────────────────────────
function initMapIfNeeded(){
  if(!mapReady){
    mapReady=true;
    // ResizeObserver следит за map-area и обновляет canvas при любом изменении размера
    new ResizeObserver(()=>resizeCanvas()).observe(document.getElementById('map-area'));
  }
  resizeCanvas();
  if(!MAP._fitted){ MAP._fitted=true; setTimeout(fitAll,100); }
}

function resizeCanvas(){
  const area=document.getElementById('map-area');
  const w=area.offsetWidth;
  const h=area.offsetHeight;
  if(w<10||h<10) return;
  // Пиксельный буфер = размер контейнера. CSS размер не трогаем — canvas абсолютный внутри inset:0
  canvas.width=w;
  canvas.height=h;
  drawMap(); renderMapImages(); renderMarkers();
}

// ── КООРДИНАТНЫЕ ФУНКЦИИ ────────────────────────────────────────
// Используются маркерами и инверсным кликом.
// "span" = сколько градусов долготы умещается при z=1 на всю ширину экрана.
// Базовый размер мира = min(w,h) — совпадает с drawTiles
function worldBase(){ return Math.min(canvas.width, canvas.height); }
function pt(lat,lng){
  const w=canvas.width,h=canvas.height,z=MAP.z,span=0.7,base=worldBase();
  return{x:w/2+(lng-71.5)/span*base*z+MAP.ox, y:h/2-(lat-51.15)/span*base*z+MAP.oy};
}
function inv(x,y){
  const w=canvas.width,h=canvas.height,z=MAP.z,span=0.7,base=worldBase();
  return{lat:-(y-h/2-MAP.oy)/(base*z)*span+51.15, lng:(x-w/2-MAP.ox)/(base*z)*span+71.5};
}

// ── ГЛАВНАЯ ФУНКЦИЯ РИСОВАНИЯ ────────────────────────────────────
function drawMap(){
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#0d1520';
  ctx.fillRect(0,0,w,h);

  if(USE_TILES){
    drawTiles(w,h);
  } else {
    drawVectorFallback(w,h);
  }
  drawMapImages();   // изображения поверх тайлов, под маркерами
  drawCompass(w);
  updateScale(w,h);
}

// ── ТАЙЛОВЫЙ РЕНДЕРЕР (vips --layout google) ────────────────────
//
// Как работает система координат:
//
//  MAP.z=1 → весь мир (вся карта) занимает экран
//  MAP.z=2 → карта вдвое крупнее, видна четверть
//  и т.д.
//
//  tileZ вычисляется из MAP.z:
//    MAP.z ≈ 0.25 → tileZ=0  (1×1 тайл,  вся карта)
//    MAP.z ≈ 0.5  → tileZ=1  (2×2 тайла)
//    MAP.z ≈ 1    → tileZ=2  (4×4 тайла)
//    MAP.z ≈ 16   → tileZ=8  (256×256 тайлов, макс. детализация)
//
//  Формула: tileZ = round(log2(MAP.z * 4)), зажатый в [0..8]
//
//  На уровне tileZ:
//    tilesN = 2^tileZ  — число тайлов по каждой оси
//    каждый тайл покрывает (исходная_карта / tilesN) пикселей
//    на экране тайл занимает (worldPx / tilesN) пикселей
//
//  vips --layout google создаёт папки tiles/z/x/y.jpg
//  где z=0 — вся карта (1 тайл), z=8 — максимум (256×256 тайлов)
//  Это совпадает с нашей логикой — конвертация не нужна.
//
//  Заглушка при загрузке: пока тайл грузится показываем более
//  грубый тайл (меньший z) из кэша чтобы не было белых дыр.

function drawTiles(w,h){
  // Мир всегда квадратный — берём меньшую сторону canvas как базу.
  // Это гарантирует что квадратные тайлы не растягиваются.
  const worldSize = Math.min(w, h) * MAP.z;

  const tileZ = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX,
    Math.round(Math.log2(Math.max(0.001, MAP.z) * 4))));

  const tilesN    = Math.pow(2, tileZ);
  const pixPerTile = worldSize / tilesN;   // одинаковый размер по X и Y

  // Мир центрирован в canvas со смещением MAP.ox/oy
  const worldLeft = w/2 - worldSize/2 + MAP.ox;
  const worldTop  = h/2 - worldSize/2 + MAP.oy;

  const tx0 = Math.max(0,        Math.floor(-worldLeft          / pixPerTile));
  const ty0 = Math.max(0,        Math.floor(-worldTop           / pixPerTile));
  const tx1 = Math.min(tilesN-1, Math.ceil ((w - worldLeft)     / pixPerTile));
  const ty1 = Math.min(tilesN-1, Math.ceil ((h - worldTop)      / pixPerTile));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for(let ty=ty0; ty<=ty1; ty++){
    for(let tx=tx0; tx<=tx1; tx++){
      const sx = worldLeft + tx * pixPerTile;
      const sy = worldTop  + ty * pixPerTile;
      const sd = pixPerTile + 0.5;  // +0.5 убирает щели

      const img = getTile(tileZ, ty, tx);

      if(img.complete && img.naturalWidth){
        ctx.drawImage(img, sx, sy, sd, sd);
      } else {
        ctx.fillStyle = '#111827';
        ctx.fillRect(sx, sy, sd, sd);
        for(let fz = tileZ-1; fz >= ZOOM_MIN; fz--){
          const scale = Math.pow(2, tileZ - fz);
          const ftx   = Math.floor(tx / scale);
          const fty   = Math.floor(ty / scale);
          const fimg  = tileCache[fz+'/'+ftx+'/'+fty];
          if(fimg && fimg.complete && fimg.naturalWidth){
            const sub  = 1 / scale;
            const srcX = (tx % scale) * sub * TILE_SIZE;
            const srcY = (ty % scale) * sub * TILE_SIZE;
            const srcW = sub * TILE_SIZE;
            ctx.drawImage(fimg, srcX, srcY, srcW, srcW, sx, sy, sd, sd);
            break;
          }
        }
      }
    }
  }

  // Отладочная строка — уровень тайлов (убрать после настройки)
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('tile z='+tileZ+'  сетка '+tilesN+'×'+tilesN+'  MAP.z='+MAP.z.toFixed(2), 10, h-48);
}

// ── ВСТРОЕННАЯ ВЕКТОРНАЯ ЗАГЛУШКА ────────────────────────────────
// Рисуется когда USE_TILES=false (или как preview до загрузки тайлов)
function drawVectorFallback(w,h){
  const fill=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();const pp=pts.map(([a,b])=>pt(a,b));ctx.moveTo(pp[0].x,pp[0].y);pp.slice(1).forEach(q=>ctx.lineTo(q.x,q.y));ctx.closePath();ctx.fill();};
  const stroke=(pts,c,lw)=>{ctx.strokeStyle=c;ctx.lineWidth=lw*MAP.z;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();const pp=pts.map(([a,b])=>pt(a,b));ctx.moveTo(pp[0].x,pp[0].y);pp.slice(1).forEach(q=>ctx.lineTo(q.x,q.y));ctx.stroke();};
  fill([[51.16,71.44],[51.17,71.46],[51.165,71.48],[51.155,71.47],[51.15,71.45]],'#0f1e35');
  fill([[51.21,71.38],[51.215,71.40],[51.205,71.415],[51.195,71.40],[51.20,71.38]],'#0f1e35');
  fill([[51.13,71.56],[51.14,71.57],[51.135,71.59],[51.12,71.585],[51.12,71.57]],'#0f1e35');
  fill([[51.175,71.425],[51.185,71.43],[51.188,71.445],[51.178,71.455],[51.170,71.44]],'#0a1c12');
  fill([[51.22,71.46],[51.228,71.468],[51.225,71.48],[51.215,71.475],[51.212,71.462]],'#0a1c12');
  fill([[51.155,71.50],[51.162,71.505],[51.160,71.52],[51.150,71.518],[51.148,71.505]],'#0a1c12');
  [[51.195,71.46,51.205,71.475],[51.185,71.48,51.195,71.496],[51.205,71.48,51.215,71.496],
   [51.175,71.50,51.185,71.516],[51.195,71.50,51.208,71.516],[51.165,71.46,51.175,71.476],
   [51.215,71.45,51.228,71.462],[51.215,71.43,51.228,71.445],[51.195,71.43,51.208,71.445],
   [51.175,71.43,51.188,71.445],[51.185,71.516,51.195,71.532],[51.205,71.516,51.218,71.532],
   [51.225,71.50,51.238,71.516]].forEach(([la1,ln1,la2,ln2])=>{
     fill([[la1,ln1],[la2,ln1],[la2,ln2],[la1,ln2]],'#131c29');
     ctx.strokeStyle='#1e2d45';ctx.lineWidth=.5;ctx.stroke();
   });
  stroke([[51.14,71.40],[51.18,71.44],[51.22,71.48],[51.24,71.50]],'#1e3a5a',3);
  stroke([[51.10,71.50],[51.18,71.50],[51.26,71.50]],'#1e3a5a',3);
  stroke([[51.20,71.35],[51.20,71.50],[51.20,71.60]],'#1e3a5a',3);
  stroke([[51.15,71.40],[51.15,71.60]],'#182438',2);
  stroke([[51.25,71.40],[51.25,71.60]],'#182438',2);
  stroke([[51.10,71.45],[51.30,71.45]],'#182438',2);
  stroke([[51.10,71.55],[51.30,71.55]],'#182438',2);
  stroke([[51.17,71.43],[51.17,71.53]],'#14202f',1);
  stroke([[51.19,71.43],[51.19,71.53]],'#14202f',1);
  stroke([[51.21,71.43],[51.21,71.53]],'#14202f',1);
  stroke([[51.10,71.47],[51.30,71.47]],'#14202f',1);
  stroke([[51.10,71.51],[51.30,71.51]],'#14202f',1);
}

// ── КОМПАС ──────────────────────────────────────────────────────
function drawCompass(w){
  const cx=w-26,cy=34;
  ctx.save();ctx.globalAlpha=.72;
  ctx.fillStyle='#1e2d45';ctx.beginPath();ctx.arc(cx,cy,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ef4444';ctx.beginPath();ctx.moveTo(cx,cy-9);ctx.lineTo(cx-3,cy);ctx.lineTo(cx,cy+2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#475569';ctx.beginPath();ctx.moveTo(cx,cy+9);ctx.lineTo(cx+3,cy);ctx.lineTo(cx,cy-2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e2e8f0';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('N',cx,cy-12);
  ctx.restore();
}

// ── МАСШТАБНАЯ ЛИНЕЙКА ───────────────────────────────────────────
function updateScale(w,h){
  const l=inv(0,h/2), r2=inv(100,h/2);
  const scaleKm=(Math.abs(r2.lng-l.lng)*88);
  document.getElementById('map-scale').textContent='≈'+scaleKm.toFixed(2)+' км/100px';
}

// ── ПЛАВНЫЙ ЗУМ (requestAnimationFrame) ─────────────────────────
// zoomTo(target, cx, cy) — плавно анимирует MAP.z → target
// cx, cy — экранная точка, вокруг которой зумируем (курсор или центр)
function zoomTo(target, cx, cy){
  if(zoomAnimId){ cancelAnimationFrame(zoomAnimId); zoomAnimId=null; }
  const w=canvas.width, h=canvas.height;
  const mx = cx !== undefined ? cx - w/2 : 0;
  const my = cy !== undefined ? cy - h/2 : 0;
  const startZ = MAP.z;
  const endZ   = Math.max(0.25, Math.min(12, target));
  const startOx= MAP.ox, startOy= MAP.oy;
  // Пересчёт смещения так, чтобы точка под курсором не сдвинулась
  const endOx  = mx - (mx - startOx) * (endZ / startZ);
  const endOy  = my - (my - startOy) * (endZ / startZ);
  const dur    = 220; // ms — длительность анимации
  const t0     = performance.now();

  function ease(t){ return t<0.5 ? 2*t*t : -1+(4-2*t)*t; } // easeInOut

  function step(now){
    const p = Math.min(1, (now - t0) / dur);
    const e = ease(p);
    MAP.z  = startZ  + (endZ  - startZ)  * e;
    MAP.ox = startOx + (endOx - startOx) * e;
    MAP.oy = startOy + (endOy - startOy) * e;
    drawMap();
    renderMapImages();
    renderMarkers();
    if(p < 1){ zoomAnimId = requestAnimationFrame(step); }
    else { zoomAnimId=null; }
  }
  zoomAnimId = requestAnimationFrame(step);
}

// ═══════════════════════════════════════════
//  MARKERS (SVG pins with real icons)
// ═══════════════════════════════════════════
const iconCache={};

function markerSVG(color,icon,iconType,iconData){
  const uid_='m'+Math.random().toString(36).slice(2,7);
  const hasCustom=iconType==='custom'&&iconData;
  // Используем foreignObject для эмодзи — единственный надёжный способ в SVG
  const iconContent = hasCustom
    ? `<defs><clipPath id="${uid_}"><circle cx="20" cy="19" r="12"/></clipPath></defs>
       <image href="${iconData}" x="8" y="7" width="24" height="24" clip-path="url(#${uid_})"/>`
    : `<foreignObject x="7" y="6" width="26" height="26">
         <div xmlns="http://www.w3.org/1999/xhtml" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:15px;line-height:1;user-select:none">${icon||'📍'}</div>
       </foreignObject>`;
  return`<svg viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="46">
    <path d="M20 0C8.95 0 0 8.95 0 20c0 13.3 20 26 20 26s20-12.7 20-26C40 8.95 31.05 0 20 0z" fill="${color}"/>
    <circle cx="20" cy="19" r="12.5" fill="rgba(0,0,0,0.20)"/>
    <circle cx="20" cy="18" r="12.5" fill="white" fill-opacity="0.13"/>
    ${iconContent}
    <circle cx="20" cy="19" r="12.5" fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="1"/>
  </svg>`;
}

function renderMarkers(){
  document.querySelectorAll('.marker').forEach(m=>m.remove());
  document.querySelector('.popup')?.remove();
  const isAdmin=APP.role==='admin';

  places.forEach(pl=>{
    if(APP.filterCat!=='all'&&pl.category!==APP.filterCat) return;
    const pos=pt(pl.lat,pl.lng);
    if(pos.x<-60||pos.x>canvas.width+60||pos.y<-80||pos.y>canvas.height+40) return;

    const el=document.createElement('div');
    el.className='marker'+(APP.selectedId===pl.id?' selected':'');
    el.dataset.id=pl.id;
    el.style.left=pos.x+'px'; el.style.top=pos.y+'px';
    el.innerHTML=`<div class="marker-label">${pl.name}</div><div class="marker-body">${markerSVG(pl.color,pl.icon,pl.iconType,pl.iconData)}</div>`;
    el.addEventListener('click',e=>{e.stopPropagation();selectPlace(pl.id);});
    if(isAdmin) el.addEventListener('mousedown',e=>startMarkerDrag(e,pl));
    mapCon.appendChild(el);
  });

  if(APP.selectedId){
    const pl=places.find(x=>x.id===APP.selectedId);
    if(pl) showPopup(pl);
  }
}

let mdrag=null;
function startMarkerDrag(e,pl){
  if(e.button!==0) return; e.stopPropagation(); e.preventDefault();
  mdrag={id:pl.id,sx:e.clientX,sy:e.clientY,moved:false};
  const el=e.currentTarget; el.classList.add('dragging');
  const mv=ev=>{
    if(Math.abs(ev.clientX-mdrag.sx)>3||Math.abs(ev.clientY-mdrag.sy)>3) mdrag.moved=true;
    const r=mapCon.getBoundingClientRect();
    el.style.left=(ev.clientX-r.left)+'px'; el.style.top=(ev.clientY-r.top)+'px';
  };
  const up=ev=>{
    document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up);
    el.classList.remove('dragging');
    if(mdrag.moved){
      const r=mapCon.getBoundingClientRect();
      const c=inv(ev.clientX-r.left,ev.clientY-r.top);
      const idx=places.findIndex(x=>x.id===pl.id);
      if(idx!==-1){places[idx].lat=+c.lat.toFixed(5);places[idx].lng=+c.lng.toFixed(5);saveAll();drawMap();renderMapImages();renderMarkers();renderPlacesList();showToast('Место перемещено','success');}
    }
    mdrag=null;
  };
  document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up);
}

function selectPlace(id){
  APP.selectedId=(APP.selectedId===id)?null:id;
  renderMarkers(); renderPlacesList();
  if(APP.selectedId){const pl=places.find(x=>x.id===id);if(pl) scrollSbTo(id);}
}

function showPopup(pl){
  document.querySelector('.popup')?.remove();
  const pos=pt(pl.lat,pl.lng);
  const cats=getCats(); const cat=cats[pl.category]||cats.other;
  const isAdmin=APP.role==='admin';
  const ico=pl.iconType==='custom'&&pl.iconData?`<img src="${pl.iconData}" style="width:100%;height:100%;object-fit:contain">`:(pl.icon||cat.icon||'📍');
  const imgs=pl.images?.length?`<div class="popup-images">${pl.images.map((img,i)=>`<img class="popup-img" src="${img}" data-idx="${i}">`).join('')}</div>`:'';
  const admBtns=isAdmin?`<button class="btn btn-ghost btn-sm" id="pop-edit">✏️</button><button class="btn btn-danger btn-sm" id="pop-del">🗑</button>`:'';
  const pop=document.createElement('div');
  pop.className='popup'; pop.style.left=pos.x+'px'; pop.style.top=pos.y+'px';
  const catIcoHtml = cat.iconType==='custom'&&cat.iconData ? `<img src="${cat.iconData}" style="width:13px;height:13px;object-fit:contain;vertical-align:middle">` : (cat.icon||'');
  pop.innerHTML=`
    <div class="popup-hdr">
      <div class="popup-ico" style="background:${pl.color}22">${ico}</div>
      <div><div class="popup-title">${pl.name}</div><div class="popup-cat">${catIcoHtml} ${cat.label}</div></div>
      <button class="popup-close" id="pop-close">✕</button>
    </div>
    <div class="popup-body">
      ${pl.descHtml?`<div class="popup-desc">${pl.descHtml}</div>`:''}
      ${imgs}
      <div class="popup-coords">📍 ${pl.lat.toFixed(5)}, ${pl.lng.toFixed(5)}</div>
      <div class="popup-actions"><button class="btn btn-ghost btn-sm" id="pop-goto">🎯</button>${admBtns}</div>
    </div>`;
  mapCon.appendChild(pop);
  pop.querySelector('#pop-close').addEventListener('click',e=>{e.stopPropagation();APP.selectedId=null;renderMarkers();renderPlacesList();});
  pop.querySelector('#pop-goto').addEventListener('click',e=>{e.stopPropagation();centerOn(pl);});
  if(isAdmin){
    pop.querySelector('#pop-edit').addEventListener('click',e=>{e.stopPropagation();openEditModal(pl.id);});
    pop.querySelector('#pop-del').addEventListener('click',e=>{e.stopPropagation();confirmDelete(pl.id);});
  }
  pop.querySelectorAll('.popup-img').forEach(img=>img.addEventListener('click',e=>{e.stopPropagation();openLightbox(pl.images,+img.dataset.idx,pl.name);}));
}

// ═══════════════════════════════════════════
//  MINI MAP (тайловая)
// ═══════════════════════════════════════════
const miniCanvas=document.getElementById('mini-canvas');
const mctx=miniCanvas.getContext('2d');
let miniInited=false;
const miniTileCache={};

function initMiniMap(){
  const wrap=document.getElementById('mini-map-wrap');
  const r=wrap.getBoundingClientRect();
  miniCanvas.width=r.width||500; miniCanvas.height=r.height||200;
  drawMiniMap(); miniInited=true;
}

function getMiniTile(z,x,y){
  const key=z+'/'+x+'/'+y;
  if(miniTileCache[key]) return miniTileCache[key];
  const img=new Image();
  img.src=TILE_DIR+'/'+key+TILE_EXT;
  img.onload=()=>drawMiniMap();
  miniTileCache[key]=img;
  return img;
}

function drawMiniMap(){
  const w=miniCanvas.width, h=miniCanvas.height;
  mctx.clearRect(0,0,w,h);
  mctx.fillStyle='#0d1520';
  mctx.fillRect(0,0,w,h);

  // Уровень тайлов 2 (4×4) — хороший обзор всей карты в мини-окне
  const tileZ  = Math.min(2, ZOOM_MAX);
  const tilesN = Math.pow(2, tileZ);
  const tpw    = w / tilesN;
  const tph    = h / tilesN;

  mctx.imageSmoothingEnabled = true;
  mctx.imageSmoothingQuality = 'high';

  for(let ty=0; ty<tilesN; ty++){
    for(let tx=0; tx<tilesN; tx++){
      const sx = tx * tpw;
      const sy = ty * tph;
      // vips layout google: первый индекс папки = y (строка), второй = x (столбец)
      const img = getMiniTile(tileZ, ty, tx);
      if(img.complete && img.naturalWidth){
        mctx.drawImage(img, sx, sy, tpw+0.5, tph+0.5);
      } else {
        mctx.fillStyle='#111827';
        mctx.fillRect(sx, sy, tpw, tph);
        // fallback — уровень 0
        const f0=miniTileCache['0/0/0'];
        if(f0&&f0.complete&&f0.naturalWidth){
          const sub=1/tilesN;
          mctx.drawImage(f0,
            tx*sub*TILE_SIZE, ty*sub*TILE_SIZE, sub*TILE_SIZE, sub*TILE_SIZE,
            sx, sy, tpw+0.5, tph+0.5);
        }
      }
    }
  }

  // Кружки маркеров поверх тайлов
  places.forEach(pl=>{
    const {x,y}=miniLatLngToPixel(pl.lat, pl.lng, w, h);
    mctx.fillStyle=pl.color||'#3b82f6';
    mctx.strokeStyle='rgba(255,255,255,0.8)';
    mctx.lineWidth=1.5;
    mctx.beginPath();
    mctx.arc(x, y, 4, 0, Math.PI*2);
    mctx.fill();
    mctx.stroke();
  });
}

// lat/lng → пиксели мини-карты (весь мир без смещения)
function miniLatLngToPixel(lat,lng,w,h){
  const span=0.7;
  return{ x: w/2+(lng-71.5)/span*w, y: h/2-(lat-51.15)/span*h };
}

function miniInvCoord(x,y){
  const w=miniCanvas.width, h=miniCanvas.height, span=0.7;
  return{ lat: -(y-h/2)/h*span+51.15, lng: (x-w/2)/w*span+71.5 };
}

function setupMiniMapClick(){
  const wrap=document.getElementById('mini-map-wrap');
  const pinEl=document.getElementById('mini-pin');
  const pick=(e)=>{
    const r=wrap.getBoundingClientRect();
    const x=e.clientX-r.left, y=e.clientY-r.top;
    const c=miniInvCoord(x,y);
    document.getElementById('f-lat').value=c.lat.toFixed(5);
    document.getElementById('f-lng').value=c.lng.toFixed(5);
    pinEl.style.left=x+'px'; pinEl.style.top=y+'px'; pinEl.style.display='block';
    document.getElementById('mini-coords').textContent=`${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;
    // update pin icon
    pinEl.textContent = currentIconType==='custom'&&currentIconDataUrl?'📍':selectedEmoji;
  };
  wrap._pick=pick;
  wrap.removeEventListener('click',wrap._click);
  wrap._click=pick;
  wrap.addEventListener('click',pick);
}

// ═══════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════
function renderCatFilter(){
  const cats=getCats();
  const used=[...new Set(places.map(x=>x.category))];
  const c=document.getElementById('cat-filter');
  c.innerHTML='';
  const allBtn=document.createElement('button');
  allBtn.className='cat-chip'+(APP.filterCat==='all'?' active':'');
  allBtn.dataset.cat='all'; allBtn.textContent='🗺 Все';
  c.appendChild(allBtn);
  used.forEach(catId=>{
    const cat=cats[catId]||cats.other;
    const b=document.createElement('button');
    b.className='cat-chip'+(APP.filterCat===catId?' active':'');
    b.dataset.cat=catId;
    if(cat.iconType==='custom'&&cat.iconData){
      b.innerHTML=`<img class="cat-chip-icon" src="${cat.iconData}"> ${cat.label}`;
    } else {
      b.textContent=`${cat.icon} ${cat.label}`;
    }
    c.appendChild(b);
  });
  c.querySelectorAll('.cat-chip').forEach(b=>b.addEventListener('click',()=>{APP.filterCat=b.dataset.cat;renderCatFilter();renderPlacesList();drawMap();renderMarkers();}));
}

function renderPlacesList(){
  const container=document.getElementById('places-list');
  const cats=getCats();
  const filtered=APP.filterCat==='all'?places:places.filter(x=>x.category===APP.filterCat);
  if(!filtered.length){container.innerHTML=`<div class="empty-state"><div class="es-ico">📭</div><p>Нет мест в этой категории</p></div>`;return;}
  const isAdmin=APP.role==='admin';
  container.innerHTML='';
  filtered.forEach(pl=>{
    const cat=cats[pl.category]||cats.other;
    const card=document.createElement('div');
    card.className='place-card'+(APP.selectedId===pl.id?' selected':'');
    card.dataset.id=pl.id;
    const icoHtml=pl.iconType==='custom'&&pl.iconData?`<img src="${pl.iconData}" style="width:100%;height:100%;object-fit:contain">`:(pl.icon||cat.icon||'📍');
    const catIcoHtml=cat.iconType==='custom'&&cat.iconData?`<img src="${cat.iconData}" style="width:12px;height:12px;object-fit:contain;vertical-align:middle">`:cat.icon;
    const thumb=pl.images?.length?`<img class="pc-thumb" src="${pl.images[0]}" alt="">`:'';
    const admBtns=isAdmin?`<button class="btn btn-ghost btn-sm" data-action="edit" data-id="${pl.id}">✏️</button><button class="btn btn-danger btn-sm" data-action="del" data-id="${pl.id}">🗑</button>`:'';
    card.innerHTML=`
      <div class="pc-header">
        <div class="pc-icon" style="background:${pl.color}22">${icoHtml}</div>
        <div class="pc-info"><div class="pc-name">${pl.name}</div><div class="pc-cat">${catIcoHtml} ${cat.label}</div></div>
      </div>
      ${pl.descHtml?`<div class="pc-desc">${pl.descHtml}</div>`:''}
      ${thumb}
      <div class="pc-coords">📍 ${pl.lat.toFixed(4)}, ${pl.lng.toFixed(4)}</div>
      <div class="pc-actions"><button class="btn btn-ghost btn-sm" data-action="goto" data-id="${pl.id}">🎯</button>${admBtns}</div>`;
    card.addEventListener('click',()=>{selectPlace(pl.id);centerOn(pl);});
    card.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();
      if(b.dataset.action==='edit') openEditModal(pl.id);
      if(b.dataset.action==='del') confirmDelete(pl.id);
      if(b.dataset.action==='goto'){centerOn(pl);selectPlace(pl.id);}
    }));
    container.appendChild(card);
  });
}
function scrollSbTo(id){document.querySelector(`.place-card[data-id="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest'});}
function centerOn(pl){
  const span=0.7,base=worldBase();
  const targetOx=-(pl.lng-71.5)/span*base*MAP.z;
  const targetOy=(pl.lat-51.15)/span*base*MAP.z;
  if(zoomAnimId){ cancelAnimationFrame(zoomAnimId); zoomAnimId=null; }
  const sOx=MAP.ox,sOy=MAP.oy,dur=280,t0=performance.now();
  function ease(t){return t<0.5?2*t*t:-1+(4-2*t)*t;}
  function step(now){
    const p=Math.min(1,(now-t0)/dur),e=ease(p);
    MAP.ox=sOx+(targetOx-sOx)*e; MAP.oy=sOy+(targetOy-sOy)*e;
    drawMap(); renderMapImages(); renderMarkers();
    if(p<1) zoomAnimId=requestAnimationFrame(step); else zoomAnimId=null;
  }
  zoomAnimId=requestAnimationFrame(step);
}
function fitAll(){
  if(!places.length){MAP.ox=0;MAP.oy=0; zoomTo(1,canvas.width/2,canvas.height/2); return;}
  const lats=places.map(x=>x.lat),lngs=places.map(x=>x.lng);
  const minLat=Math.min(...lats)-.03,maxLat=Math.max(...lats)+.03,minLng=Math.min(...lngs)-.05,maxLng=Math.max(...lngs)+.05;
  const cLat=(minLat+maxLat)/2,cLng=(minLng+maxLng)/2,span=.7;
  const w=canvas.width,h=canvas.height,base=worldBase();
  MAP.ox=-(cLng-71.5)/span*base; MAP.oy=(cLat-51.15)/span*base;
  const newZ=Math.min(base/((maxLat-minLat)/span*base),base/((maxLng-minLng)/span*base),4)*.82;
  zoomTo(newZ, w/2, h/2);
}
function renderStats(){
  const cats=getCats(); const catC={};
  places.forEach(x=>{catC[x.category]=(catC[x.category]||0)+1;});
  const top=Object.entries(catC).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById('stats-grid').innerHTML=`
    <div class="stat-card"><div class="stat-num">${places.length}</div><div class="stat-label">Всего мест</div></div>
    <div class="stat-card"><div class="stat-num">${Object.keys(catC).length}</div><div class="stat-label">Категорий</div></div>
    <div class="stat-card" style="grid-column:span 2"><div class="stat-num" style="font-size:13px;color:var(--accent3)">${top?(cats[top[0]]?.label||top[0]):'—'}</div><div class="stat-label">Топ категория</div></div>`;
  const mx=Math.max(...Object.values(catC),1);
  document.getElementById('cat-bkdn').innerHTML=`<h3>По категориям</h3>`+Object.entries(catC).sort((a,b)=>b[1]-a[1]).map(([catId,cnt])=>{
    const cat=cats[catId]||cats.other;
    const icoHtml=cat.iconType==='custom'&&cat.iconData?`<img src="${cat.iconData}" style="width:18px;height:18px;object-fit:contain">`:cat.icon;
    return`<div class="cat-row"><div class="cat-row-ico">${icoHtml}</div><div class="cat-row-name">${cat.label}</div><div class="cat-bar-w"><div class="cat-bar" style="width:${cnt/mx*100}%"></div></div><div class="cat-row-cnt">${cnt}</div></div>`;
  }).join('');
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  document.getElementById('tab-'+b.dataset.tab).classList.add('active');
  if(b.dataset.tab==='stats') renderStats();
}));
document.getElementById('btn-toggle-sb').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('hidden'));

// ═══════════════════════════════════════════
//  MAP INTERACTION
// ═══════════════════════════════════════════
mapCon.addEventListener('mousedown',e=>{
  if(e.target.closest('.marker')||e.target.closest('.popup')||e.target.closest('.admin-bar')||e.target.closest('.map-img-resize-bar')) return;

  // Режим добавления изображения
  if(mimAddingMode){
    const r=mapCon.getBoundingClientRect(), c=inv(e.clientX-r.left,e.clientY-r.top);
    mimAddingMode=false; mapCon.classList.remove('adding');
    document.getElementById('add-hint').classList.remove('show');
    document.getElementById('add-hint').textContent='📍 Кликните на карту для размещения точки';
    openMapImgModal(null, c.lat, c.lng);
    return;
  }

  // Для админа — проверяем попадание в изображение на canvas
  if(APP.role==='admin' && mapImages.length){
    const r=mapCon.getBoundingClientRect();
    const cx=e.clientX-r.left, cy=e.clientY-r.top;
    const hit=hitTestMapImage(cx,cy);
    if(hit){
      e.stopPropagation();
      if(selectedImgId===hit.id){
        // Уже выбрано — начинаем перетаскивание
        startImgDrag(e, hit);
      } else {
        // Выбираем
        selectedImgId=hit.id;
        drawMap(); renderMapImages(); renderMarkers();
      }
      return;
    }
  }

  // Снимаем выделение изображения при клике в пустоту
  if(selectedImgId){
    selectedImgId=null; drawMap(); renderMapImages(); renderMarkers();
  }

  // Режим добавления точки интереса
  if(APP.addingMode){
    const r=mapCon.getBoundingClientRect(), c=inv(e.clientX-r.left,e.clientY-r.top);
    APP.addingMode=false; mapCon.classList.remove('adding'); document.getElementById('add-hint').classList.remove('show');
    openAddModal(c.lat,c.lng); return;
  }
  MAP.drag=true; MAP.lx=e.clientX; MAP.ly=e.clientY; mapCon.classList.add('grabbing');
});
document.addEventListener('mousemove',e=>{
  if(APP.page!=='map') return;
  const r=mapCon.getBoundingClientRect();
  if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
    const c=inv(e.clientX-r.left,e.clientY-r.top);
    document.getElementById('map-coords-disp').textContent=`${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;
  }
  if(!MAP.drag) return;
  MAP.ox+=e.clientX-MAP.lx; MAP.oy+=e.clientY-MAP.ly; MAP.lx=e.clientX; MAP.ly=e.clientY;
  drawMap(); renderMapImages(); renderMarkers();
});
document.addEventListener('mouseup',()=>{MAP.drag=false;mapCon.classList.remove('grabbing');});
// Колесо мыши — плавный зум с накоплением
let wheelAccum=0, wheelTimer=null;
mapCon.addEventListener('wheel',e=>{
  e.preventDefault();
  // Накапливаем дельту для плавности трекпада
  wheelAccum += e.deltaY < 0 ? 0.18 : -0.18;
  const r=mapCon.getBoundingClientRect();
  const cx=e.clientX-r.left, cy=e.clientY-r.top;
  zoomTo(MAP.z * Math.pow(2, wheelAccum), cx, cy);
  // Сброс накопленного через 80ms после последнего события
  clearTimeout(wheelTimer);
  wheelTimer=setTimeout(()=>{ wheelAccum=0; }, 80);
},{passive:false});

// Кнопки +/− — плавный зум к центру экрана
document.getElementById('zin').addEventListener('click',()=>{
  zoomTo(MAP.z*1.6, canvas.width/2, canvas.height/2);
});
document.getElementById('zout').addEventListener('click',()=>{
  zoomTo(MAP.z/1.6, canvas.width/2, canvas.height/2);
});
document.getElementById('zfit').addEventListener('click',fitAll);
document.getElementById('btn-add-click').addEventListener('click',()=>{APP.addingMode=true;mapCon.classList.add('adding');document.getElementById('add-hint').classList.add('show');});

// ═══════════════════════════════════════════
//  PLACE MODAL
// ═══════════════════════════════════════════
let selectedEmoji='📍', selectedColor=COLORS[0], currentIconType='emoji', currentIconDataUrl=null;
let stagedPhotos=[];
let editingCatId=null;

function buildEmojiGrid(gridId,currentEmoji,onSelect){
  const g=document.getElementById(gridId); g.innerHTML='';
  EMOJIS.forEach(e=>{const b=document.createElement('button');b.className='emoji-btn'+(e===currentEmoji?' selected':'');b.textContent=e;b.type='button';b.addEventListener('click',()=>{onSelect(e);buildEmojiGrid(gridId,e,onSelect);});g.appendChild(b);});
}
function buildColorGrid(gridId,currentColor,onSelect){
  const g=document.getElementById(gridId); g.innerHTML='';
  COLORS.forEach(c=>{const s=document.createElement('div');s.className='color-swatch'+(c===currentColor?' selected':'');s.style.background=c;s.addEventListener('click',()=>{onSelect(c);buildColorGrid(gridId,c,onSelect);});g.appendChild(s);});
}

function populateCatSelect(){
  const sel=document.getElementById('f-cat'); sel.innerHTML='<option value="">— Выберите —</option>';
  const cats=getCats();
  Object.entries(cats).forEach(([id,cat])=>{const o=document.createElement('option');o.value=id;o.textContent=`${cat.icon} ${cat.label}`;sel.appendChild(o);});
}
function renderPhotoPreviews(){
  const pv=document.getElementById('imgs-preview'); pv.innerHTML='';
  stagedPhotos.forEach((img,i)=>{
    const w=document.createElement('div');w.className='img-pw';
    const im=document.createElement('img');im.src=img;
    const rm=document.createElement('button');rm.className='img-rm';rm.textContent='✕';rm.type='button';
    rm.addEventListener('click',()=>{stagedPhotos.splice(i,1);renderPhotoPreviews();});
    w.appendChild(im);w.appendChild(rm);pv.appendChild(w);
  });
}
function handlePhotoFiles(files){
  Array.from(files).forEach(file=>{
    if(!file.type.startsWith('image/')||file.size>5*1024*1024) return;
    const r=new FileReader(); r.onload=e=>{stagedPhotos.push(e.target.result);renderPhotoPreviews();}; r.readAsDataURL(file);
  });
}

// Icon upload with auto-resize to 40×40
function loadIconFile(file, onLoad){
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const c2=document.createElement('canvas'); c2.width=40; c2.height=40;
      const cx2=c2.getContext('2d');
      cx2.clearRect(0,0,40,40);
      const s=Math.min(40/img.width,40/img.height);
      const dw=img.width*s, dh=img.height*s;
      cx2.drawImage(img,(40-dw)/2,(40-dh)/2,dw,dh);
      onLoad(c2.toDataURL('image/png'));
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById('f-icon-file').addEventListener('change',e=>{
  if(!e.target.files[0]) return;
  loadIconFile(e.target.files[0],dataUrl=>{
    currentIconType='custom'; currentIconDataUrl=dataUrl;
    document.getElementById('icon-preview-img').src=dataUrl;
    document.getElementById('icon-preview-wrap').style.display='flex';
    document.getElementById('icon-upload-area').style.display='none';
  });
});
document.getElementById('btn-remove-icon').addEventListener('click',()=>{
  currentIconType='emoji'; currentIconDataUrl=null;
  document.getElementById('f-icon-file').value='';
  document.getElementById('icon-preview-wrap').style.display='none';
  document.getElementById('icon-upload-area').style.display='block';
});

// Icon tabs
document.querySelectorAll('[data-itab]').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('[data-itab]').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.icon-panel').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  document.getElementById('itab-'+t.dataset.itab).classList.add('active');
}));

// Photo upload
const pua=document.getElementById('photo-upload-area');
document.getElementById('f-photos').addEventListener('change',e=>handlePhotoFiles(e.target.files));
pua.addEventListener('dragover',e=>{e.preventDefault();pua.classList.add('dov');});
pua.addEventListener('dragleave',()=>pua.classList.remove('dov'));
pua.addEventListener('drop',e=>{e.preventDefault();pua.classList.remove('dov');handlePhotoFiles(e.dataTransfer.files);});

// RTE
document.querySelectorAll('.rte-btn').forEach(b=>{
  b.addEventListener('mousedown',e=>{
    e.preventDefault();
    const cmd=b.dataset.cmd, val=b.dataset.val||null;
    if(cmd==='foreColor') document.execCommand(cmd,false,val);
    else if(cmd==='fontSize') document.execCommand(cmd,false,val);
    else document.execCommand(cmd,false,null);
    updateRteState();
  });
});
document.getElementById('rte-size').addEventListener('change',function(){
  document.execCommand('fontSize',false,this.value);
  document.getElementById('rte-editor').focus();
});
document.getElementById('rte-editor').addEventListener('keyup',updateRteState);
document.getElementById('rte-editor').addEventListener('mouseup',updateRteState);
function updateRteState(){
  document.querySelectorAll('.rte-btn[data-cmd]').forEach(b=>{
    const cmds=['bold','italic','underline','strikeThrough','justifyLeft','justifyCenter','justifyRight','insertUnorderedList','insertOrderedList'];
    if(cmds.includes(b.dataset.cmd)) b.classList.toggle('active',document.queryCommandState(b.dataset.cmd));
  });
}

// Mini-map coord sync
function syncMiniPin(){
  const lat=parseFloat(document.getElementById('f-lat').value);
  const lng=parseFloat(document.getElementById('f-lng').value);
  if(isNaN(lat)||isNaN(lng)) return;
  const w=miniCanvas.width, h=miniCanvas.height;
  const {x,y}=miniLatLngToPixel(lat,lng,w,h);
  const pin=document.getElementById('mini-pin');
  pin.style.left=x+'px'; pin.style.top=y+'px'; pin.style.display='block';
  document.getElementById('mini-coords').textContent=`${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
['f-lat','f-lng'].forEach(id=>document.getElementById(id).addEventListener('input',syncMiniPin));

function openAddModal(lat,lng){
  APP.editingId=null; stagedPhotos=[];
  document.getElementById('pm-title').textContent='Добавить точку интереса';
  document.getElementById('f-name').value='';
  document.getElementById('f-lat').value=lat?lat.toFixed(5):'';
  document.getElementById('f-lng').value=lng?lng.toFixed(5):'';
  document.getElementById('rte-editor').innerHTML='';
  currentIconType='emoji'; currentIconDataUrl=null;
  selectedEmoji='📍'; selectedColor=COLORS[0];
  document.getElementById('f-icon-file').value='';
  document.getElementById('icon-preview-wrap').style.display='none';
  document.getElementById('icon-upload-area').style.display='block';
  document.getElementById('f-photos').value='';
  populateCatSelect(); document.getElementById('f-cat').value='';
  buildEmojiGrid('emoji-grid',selectedEmoji,e=>{selectedEmoji=e; if(currentIconType==='emoji'){const pin=document.getElementById('mini-pin');pin.textContent=e;}});
  buildColorGrid('color-grid',selectedColor,c=>{selectedColor=c;});
  renderPhotoPreviews();
  showModal('place-modal');
  setTimeout(()=>{initMiniMap();drawMiniMap();setupMiniMapClick();if(lat&&lng) syncMiniPin();},80);
}
function openEditModal(id){
  const pl=places.find(x=>x.id===id); if(!pl) return;
  APP.editingId=id; stagedPhotos=[...(pl.images||[])];
  document.getElementById('pm-title').textContent='Редактировать точку';
  document.getElementById('f-name').value=pl.name;
  currentIconType=pl.iconType||'emoji'; currentIconDataUrl=pl.iconData||null;
  selectedEmoji=pl.icon||'📍'; selectedColor=pl.color||COLORS[0];
  document.getElementById('rte-editor').innerHTML=pl.descHtml||'';
  if(currentIconType==='custom'&&currentIconDataUrl){
    document.getElementById('icon-preview-img').src=currentIconDataUrl;
    document.getElementById('icon-preview-wrap').style.display='flex';
    document.getElementById('icon-upload-area').style.display='none';
    // switch to custom tab
    document.querySelectorAll('[data-itab]').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.icon-panel').forEach(p=>p.classList.remove('active'));
    document.querySelector('[data-itab="custom"]').classList.add('active');
    document.getElementById('itab-custom').classList.add('active');
  } else {
    document.getElementById('icon-preview-wrap').style.display='none';
    document.getElementById('icon-upload-area').style.display='block';
    document.querySelectorAll('[data-itab]').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.icon-panel').forEach(p=>p.classList.remove('active'));
    document.querySelector('[data-itab="emoji"]').classList.add('active');
    document.getElementById('itab-emoji').classList.add('active');
  }
  populateCatSelect(); document.getElementById('f-cat').value=pl.category;
  document.getElementById('f-lat').value=pl.lat; document.getElementById('f-lng').value=pl.lng;
  buildEmojiGrid('emoji-grid',selectedEmoji,e=>{selectedEmoji=e;});
  buildColorGrid('color-grid',selectedColor,c=>{selectedColor=c;});
  renderPhotoPreviews();
  showModal('place-modal');
  setTimeout(()=>{initMiniMap();drawMiniMap();setupMiniMapClick();syncMiniPin();},80);
}

function savePlace(){
  const name=document.getElementById('f-name').value.trim();
  const cat=document.getElementById('f-cat').value;
  const descHtml=document.getElementById('rte-editor').innerHTML.trim();
  const lat=parseFloat(document.getElementById('f-lat').value);
  const lng=parseFloat(document.getElementById('f-lng').value);
  if(!name){showToast('Введите название','danger');return;}
  if(!cat){showToast('Выберите категорию','danger');return;}
  if(isNaN(lat)||isNaN(lng)){showToast('Установите точку на мини-карте','danger');return;}

  const cats=getCats(); const catDef=cats[cat]||cats.other;
  const plData={name,category:cat,icon:currentIconType==='custom'?'📍':selectedEmoji,iconType:currentIconType,iconData:currentIconType==='custom'?currentIconDataUrl:null,color:selectedColor||catDef.color,descHtml,lat,lng,images:stagedPhotos,createdAt:Date.now()};

  if(APP.editingId){
    const idx=places.findIndex(x=>x.id===APP.editingId);
    places[idx]={...places[idx],...plData}; showToast('Место обновлено','success');
  } else {
    places.push({id:uid(),...plData}); showToast('Место добавлено','success');
  }
  saveAll(); hideModal('place-modal'); APP.addingMode=false; mapCon.classList.remove('adding'); document.getElementById('add-hint').classList.remove('show');
  renderAll(); refreshAdminViews();
}

document.getElementById('pm-save').addEventListener('click',savePlace);
document.getElementById('pm-cancel').addEventListener('click',()=>hideModal('place-modal'));
document.getElementById('pm-close').addEventListener('click',()=>hideModal('place-modal'));

// ═══════════════════════════════════════════
//  CATEGORY MODAL
// ═══════════════════════════════════════════
let catSelectedEmoji='🏷', catSelectedColor=COLORS[0], catIconType='emoji', catIconDataUrl=null;

document.getElementById('btn-add-cat').addEventListener('click',()=>openCatModal(null));
function openCatModal(id){
  editingCatId=id;
  catIconType='emoji'; catIconDataUrl=null;
  catSelectedEmoji='🏷'; catSelectedColor=COLORS[4];

  if(id){
    document.getElementById('cm-title').textContent='Редактировать категорию';
    // Ищем сначала в пользовательских (переопределения), потом во встроенных
    const override=userCats.find(c=>c.id===id);
    const builtin=BUILTIN_CATS[id];
    const cat=override||builtin;
    if(cat){
      document.getElementById('cm-name').value=cat.label;
      catSelectedEmoji=cat.icon||'🏷';
      catSelectedColor=cat.color||COLORS[4];
      catIconType=cat.iconType||'emoji';
      catIconDataUrl=cat.iconData||null;
    }
    // Подсказка для встроенных
    if(builtin&&!override){
      document.getElementById('cm-name').style.borderColor='var(--warning)';
    } else {
      document.getElementById('cm-name').style.borderColor='';
    }
  } else {
    document.getElementById('cm-title').textContent='Создать категорию';
    document.getElementById('cm-name').value='';
    document.getElementById('cm-name').style.borderColor='';
  }

  if(catIconType==='custom'&&catIconDataUrl){
    document.getElementById('ci-preview-img').src=catIconDataUrl;
    document.getElementById('ci-preview-wrap').style.display='flex';
    document.getElementById('cat-icon-upload').style.display='none';
  } else {
    document.getElementById('ci-preview-wrap').style.display='none';
    document.getElementById('cat-icon-upload').style.display='block';
  }
  buildEmojiGrid('cat-emoji-grid',catSelectedEmoji,e=>{catSelectedEmoji=e;});
  buildColorGrid('cat-color-grid',catSelectedColor,c=>{catSelectedColor=c;});
  showModal('cat-modal');
}

document.querySelectorAll('[data-citab]').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('[data-citab]').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  document.getElementById('ci-emoji-panel').style.display=t.dataset.citab==='emoji'?'':'none';
  document.getElementById('ci-custom-panel').style.display=t.dataset.citab==='custom'?'':'none';
}));
document.getElementById('cm-icon-file').addEventListener('change',e=>{
  if(!e.target.files[0]) return;
  loadIconFile(e.target.files[0],dataUrl=>{
    catIconType='custom'; catIconDataUrl=dataUrl;
    document.getElementById('ci-preview-img').src=dataUrl;
    document.getElementById('ci-preview-wrap').style.display='flex';
    document.getElementById('cat-icon-upload').style.display='none';
  });
});
document.getElementById('btn-rm-cat-ico').addEventListener('click',()=>{
  catIconType='emoji'; catIconDataUrl=null;
  document.getElementById('cm-icon-file').value='';
  document.getElementById('ci-preview-wrap').style.display='none';
  document.getElementById('cat-icon-upload').style.display='block';
});
document.getElementById('cm-save').addEventListener('click',()=>{
  const name=document.getElementById('cm-name').value.trim();
  if(!name){showToast('Введите название','danger');return;}
  document.getElementById('cm-name').style.borderColor='';

  if(editingCatId){
    const existingIdx=userCats.findIndex(c=>c.id===editingCatId);
    if(existingIdx!==-1){
      // Обновляем существующую запись (пользовательскую или уже переопределённую встроенную)
      userCats[existingIdx]={...userCats[existingIdx],label:name,icon:catSelectedEmoji,iconType:catIconType,iconData:catIconDataUrl,color:catSelectedColor};
    } else if(BUILTIN_CATS[editingCatId]){
      // Создаём переопределение встроенной — сохраняем с тем же id
      userCats.push({id:editingCatId,label:name,icon:catSelectedEmoji,iconType:catIconType,iconData:catIconDataUrl,color:catSelectedColor,builtin:false,override:true});
    }
    showToast('Категория обновлена','success');
  } else {
    userCats.push({id:'uc_'+uid(),label:name,icon:catSelectedEmoji,iconType:catIconType,iconData:catIconDataUrl,color:catSelectedColor,builtin:false});
    showToast('Категория создана','success');
  }
  saveAll(); hideModal('cat-modal'); renderCatFilter(); renderCatsManager(); renderAll();
});
document.getElementById('cm-cancel').addEventListener('click',()=>hideModal('cat-modal'));
document.getElementById('cm-close').addEventListener('click',()=>hideModal('cat-modal'));

function renderCatsManager(){
  const cats=getCats();
  const g=document.getElementById('cats-grid'); g.innerHTML='';
  Object.entries(cats).forEach(([id,cat])=>{
    const cnt=places.filter(p=>p.category===id).length;
    const icoHtml=cat.iconType==='custom'&&cat.iconData
      ?`<img src="${cat.iconData}" style="width:100%;height:100%;object-fit:contain">`
      :(cat.icon||'📌');
    const isBuiltinBase=BUILTIN_CATS[id]&&!userCats.find(c=>c.id===id&&c.override);
    const card=document.createElement('div');
    card.className='cat-card';
    card.innerHTML=`
      <div class="cat-card-ico" style="background:${cat.color}22">${icoHtml}</div>
      <div class="cat-card-info">
        <div class="cat-card-name">${cat.label}</div>
        <div class="cat-card-cnt">${cnt} мест · ${isBuiltinBase?'встроенная':'пользовательская'}</div>
      </div>
      <div class="cat-card-actions">
        <button class="btn btn-ghost btn-sm" data-edit="${id}" title="${isBuiltinBase?'Редактировать (переопределение)':'Редактировать'}">✏️</button>
        ${!BUILTIN_CATS[id]?`<button class="btn btn-danger btn-sm" data-del="${id}">🗑</button>`:''}
      </div>`;
    card.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openCatModal(id)));
    card.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{
      if(cnt>0){showToast(`В категории ${cnt} мест. Сначала переназначьте их.`,'warning');return;}
      userCats=userCats.filter(c=>c.id!==id);
      saveAll(); renderCatsManager(); renderCatFilter();
      showToast('Категория удалена','danger');
    }));
    g.appendChild(card);
  });
}

// ═══════════════════════════════════════════
//  ADMIN TABLE with drag-to-sort
// ═══════════════════════════════════════════
let dragRowId=null, dragOverId=null;

function renderAdminTable(){
  const q=(document.getElementById('adm-search').value||'').toLowerCase();
  const catF=document.getElementById('adm-cat-f').value;
  const cats=getCats();
  let filtered=[...places];
  if(q) filtered=filtered.filter(x=>x.name.toLowerCase().includes(q)||(x.descHtml||'').replace(/<[^>]*>/g,'').toLowerCase().includes(q));
  if(catF) filtered=filtered.filter(x=>x.category===catF);
  document.getElementById('adm-tbody').innerHTML='';
  filtered.forEach(pl=>{
    const cat=cats[pl.category]||cats.other;
    const icoHtml=pl.iconType==='custom'&&pl.iconData?`<img src="${pl.iconData}" style="width:100%;height:100%;object-fit:contain">`:(pl.icon||cat.icon||'📍');
    const catIcoHtml=cat.iconType==='custom'&&cat.iconData?`<img src="${cat.iconData}" style="width:12px;height:12px;object-fit:contain">`:cat.icon;
    const imgs=pl.images?.length?pl.images.map((img,i)=>`<img class="tbl-thumb" src="${img}" onclick="openLightbox(['${img.replace(/'/g,'')}'],0,'${pl.name.replace(/'/g,'')}');event.stopPropagation()">`).join(''):'<span style="color:var(--text3);font-size:10px">—</span>';
    const plainDesc=(pl.descHtml||'').replace(/<[^>]*>/g,'').slice(0,60)||'—';
    const tr=document.createElement('tr');
    tr.dataset.id=pl.id;
    tr.draggable=true;
    tr.innerHTML=`
      <td><span class="drag-handle" title="Перетащить для сортировки">⠿</span></td>
      <td><div class="tbl-ico-cell"><div class="tbl-ico" style="background:${pl.color}22">${icoHtml}</div><span class="tbl-name">${pl.name}</span></div></td>
      <td><span class="badge badge-blue">${catIcoHtml} ${cat.label}</span></td>
      <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text3)">${plainDesc}</td>
      <td>${imgs}</td>
      <td style="font-family:monospace;font-size:9px">${pl.lat.toFixed(4)}, ${pl.lng.toFixed(4)}</td>
      <td><div class="tbl-actions">
        <button class="btn btn-ghost btn-xs" onclick="openEditModal('${pl.id}')">✏️</button>
        <button class="btn btn-danger btn-xs" onclick="confirmDelete('${pl.id}')">🗑</button>
        <button class="btn btn-ghost btn-xs" onclick="goToOnMap('${pl.id}')">🗺</button>
      </div></td>`;
    // Row drag-to-sort
    tr.addEventListener('dragstart',()=>{dragRowId=pl.id;tr.classList.add('dragging-row');});
    tr.addEventListener('dragend',()=>{tr.classList.remove('dragging-row');document.querySelectorAll('.drag-over-row').forEach(r=>r.classList.remove('drag-over-row'));});
    tr.addEventListener('dragover',e=>{e.preventDefault();dragOverId=pl.id;document.querySelectorAll('.drag-over-row').forEach(r=>r.classList.remove('drag-over-row'));if(dragRowId!==dragOverId) tr.classList.add('drag-over-row');});
    tr.addEventListener('drop',e=>{
      e.preventDefault(); tr.classList.remove('drag-over-row');
      if(!dragRowId||dragRowId===dragOverId) return;
      const fromIdx=places.findIndex(x=>x.id===dragRowId);
      const toIdx=places.findIndex(x=>x.id===dragOverId);
      if(fromIdx===-1||toIdx===-1) return;
      const [moved]=places.splice(fromIdx,1); places.splice(toIdx,0,moved);
      saveAll(); renderAdminTable(); renderPlacesList(); drawMap(); renderMarkers();
      showToast('Порядок обновлён','success');
    });
    document.getElementById('adm-tbody').appendChild(tr);
  });
}

function populateAdminCatFilter(){
  const sel=document.getElementById('adm-cat-f'); sel.innerHTML='<option value="">Все категории</option>';
  const cats=getCats(); Object.entries(cats).forEach(([id,cat])=>{const o=document.createElement('option');o.value=id;o.textContent=`${cat.icon} ${cat.label}`;sel.appendChild(o);});
}
document.getElementById('adm-search').addEventListener('input',renderAdminTable);
document.getElementById('adm-cat-f').addEventListener('change',renderAdminTable);
document.getElementById('btn-adm-add').addEventListener('click',()=>openAddModal());
document.getElementById('btn-adm-add2').addEventListener('click',()=>openAddModal());

function goToOnMap(id){
  const pl=places.find(x=>x.id===id); if(!pl) return;
  showPage('map'); renderAll(); setTimeout(()=>{centerOn(pl);selectPlace(pl.id);},100);
}

// ═══════════════════════════════════════════
//  ADMIN DASHBOARD
// ═══════════════════════════════════════════
function renderAdminDashboard(){
  const cats=getCats(); const catC={};
  places.forEach(x=>{catC[x.category]=(catC[x.category]||0)+1;});
  const totalImgs=places.reduce((a,x)=>a+(x.images?.length||0),0);
  document.getElementById('adm-stats-grid').innerHTML=`
    <div class="astat"><div class="astat-ico" style="background:rgba(59,130,246,.15)">📍</div><div><div class="astat-num">${places.length}</div><div class="astat-label">Точек интереса</div></div></div>
    <div class="astat"><div class="astat-ico" style="background:rgba(34,197,94,.15)">🏷</div><div><div class="astat-num">${Object.keys(catC).length}</div><div class="astat-label">Категорий</div></div></div>
    <div class="astat"><div class="astat-ico" style="background:rgba(245,158,11,.15)">🖼</div><div><div class="astat-num">${totalImgs}</div><div class="astat-label">Фотографий</div></div></div>
    <div class="astat"><div class="astat-ico" style="background:rgba(99,102,241,.15)">🆕</div><div><div class="astat-num">${places.filter(x=>Date.now()-(x.createdAt||0)<86400000*7).length}</div><div class="astat-label">За неделю</div></div></div>`;
  const recent=[...places].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,6);
  document.getElementById('adm-recent-list').innerHTML=recent.map(pl=>{
    const cat=cats[pl.category]||cats.other;
    const icoHtml=pl.iconType==='custom'&&pl.iconData?`<img src="${pl.iconData}" style="width:100%;height:100%;object-fit:contain">`:pl.icon;
    return`<div class="adm-recent-item"><div class="adm-recent-ico">${icoHtml}</div><div style="flex:1"><div class="adm-recent-name">${pl.name}</div><div class="adm-recent-time">${cat.label} · ${getAgo(pl.createdAt)}</div></div><button class="btn btn-ghost btn-xs" onclick="openEditModal('${pl.id}')">✏️</button></div>`;
  }).join('');
}
function getAgo(ts){
  if(!ts) return '—'; const d=Date.now()-ts;
  if(d<60000) return 'только что';
  if(d<3600000) return Math.floor(d/60000)+' мин';
  if(d<86400000) return Math.floor(d/3600000)+' ч';
  return Math.floor(d/86400000)+' дн';
}

// Admin nav
document.querySelectorAll('.adm-nav-item').forEach(item=>item.addEventListener('click',()=>{
  document.querySelectorAll('.adm-nav-item').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.adm-sec').forEach(x=>x.classList.remove('active'));
  item.classList.add('active');
  const sec=item.dataset.sec;
  document.getElementById('asec-'+sec).classList.add('active');
  if(sec==='places'){renderAdminTable();populateAdminCatFilter();}
  if(sec==='dashboard') renderAdminDashboard();
  if(sec==='categories') renderCatsManager();
  if(sec==='mapimages') renderMapImagesAdmin();
}));

function refreshAdminViews(){
  if(APP.page==='admin'){renderAdminDashboard();renderAdminTable();renderCatsManager();}
}

// Settings
document.getElementById('btn-change-pass').addEventListener('click',()=>{
  const o=document.getElementById('s-old-p').value,n=document.getElementById('s-new-p').value,c=document.getElementById('s-cnf-p').value;
  if(o!==APP.adminPass){showToast('Неверный текущий пароль','danger');return;}
  if(n.length<6){showToast('Пароль слишком короткий','warning');return;}
  if(n!==c){showToast('Пароли не совпадают','danger');return;}
  APP.adminPass=n; localStorage.setItem('ga_pass',n);
  document.getElementById('s-old-p').value=''; document.getElementById('s-new-p').value=''; document.getElementById('s-cnf-p').value='';
  showToast('Пароль изменён!','success');
});
document.getElementById('btn-clear-all').addEventListener('click',()=>{
  document.getElementById('confirm-text').textContent='Удалить ВСЕ точки интереса? Необратимо!';
  document.getElementById('cfm-ok').onclick=()=>{places=[];saveAll();hideModal('confirm-modal');showToast('Все точки удалены','danger');renderAll();refreshAdminViews();};
  showModal('confirm-modal');
});

function doDeleteAllCats(){
  document.getElementById('confirm-text').textContent='Удалить все пользовательские категории и сбросить переопределения встроенных? Необратимо!';
  document.getElementById('cfm-ok').onclick=()=>{
    userCats=[]; saveAll(); hideModal('confirm-modal');
    showToast('Категории сброшены','danger');
    renderCatFilter(); renderCatsManager(); renderAll();
  };
  showModal('confirm-modal');
}
document.getElementById('btn-clear-cats').addEventListener('click', doDeleteAllCats);
document.getElementById('btn-clear-cats-settings').addEventListener('click', doDeleteAllCats);

// ═══════════════════════════════════════════
//  LIGHTBOX
// ═══════════════════════════════════════════
let lbImgs=[], lbIdx=0;
function openLightbox(imgs,idx,name){
  lbImgs=Array.isArray(imgs)?imgs:[imgs]; lbIdx=idx;
  document.getElementById('lb-img').src=lbImgs[idx];
  document.getElementById('lb-cap').textContent=`${name} · ${idx+1} / ${lbImgs.length}`;
  document.getElementById('lb-prev').style.display=lbImgs.length>1?'':'none';
  document.getElementById('lb-next').style.display=lbImgs.length>1?'':'none';
  document.getElementById('lightbox').classList.add('show');
}
function closeLightbox(){document.getElementById('lightbox').classList.remove('show');}
document.getElementById('lb-close').addEventListener('click',closeLightbox);
document.getElementById('lightbox').addEventListener('click',e=>{if(e.target===e.currentTarget)closeLightbox();});
document.getElementById('lb-prev').addEventListener('click',()=>{if(lbIdx>0){lbIdx--;document.getElementById('lb-img').src=lbImgs[lbIdx];document.getElementById('lb-cap').textContent=`Фото · ${lbIdx+1} / ${lbImgs.length}`;}});
document.getElementById('lb-next').addEventListener('click',()=>{if(lbIdx<lbImgs.length-1){lbIdx++;document.getElementById('lb-img').src=lbImgs[lbIdx];document.getElementById('lb-cap').textContent=`Фото · ${lbIdx+1} / ${lbImgs.length}`;}});

// ═══════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════
document.getElementById('search-input').addEventListener('input',e=>{
  const q=e.target.value, dd=document.getElementById('search-dropdown');
  if(!q.trim()){dd.classList.remove('show');return;}
  const cats=getCats();
  const res=places.filter(x=>x.name.toLowerCase().includes(q.toLowerCase())||(x.descHtml||'').replace(/<[^>]*>/g,'').toLowerCase().includes(q.toLowerCase())).slice(0,8);
  dd.innerHTML=res.length?res.map(pl=>{
    const icoHtml=pl.iconType==='custom'&&pl.iconData?`<img src="${pl.iconData}" style="width:100%;height:100%;object-fit:contain">`:(pl.icon||'📍');
    return`<div class="sri" data-id="${pl.id}"><div class="sri-ico" style="background:${pl.color}22">${icoHtml}</div><div><div class="sri-name" style="font-weight:600;color:var(--text)">${pl.name}</div><div style="font-size:10px;color:var(--text3)">${cats[pl.category]?.label||''}</div></div></div>`;
  }).join(''):`<div class="sri" style="color:var(--text3)">Ничего не найдено</div>`;
  dd.querySelectorAll('.sri[data-id]').forEach(item=>item.addEventListener('click',()=>{const pl=places.find(x=>x.id===item.dataset.id);if(pl){centerOn(pl);selectPlace(pl.id);}dd.classList.remove('show');document.getElementById('search-input').value='';}));
  dd.classList.add('show');
});
document.addEventListener('click',e=>{if(!e.target.closest('.hdr-search'))document.getElementById('search-dropdown').classList.remove('show');});

// ═══════════════════════════════════════════
//  MODALS HELPERS
// ═══════════════════════════════════════════
function showModal(id){document.getElementById(id).classList.add('show');}
function hideModal(id){document.getElementById(id).classList.remove('show');}
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)hideModal(o.id);}));
document.getElementById('cfm-cancel').addEventListener('click',()=>hideModal('confirm-modal'));

function confirmDelete(id){
  const pl=places.find(x=>x.id===id); if(!pl) return;
  document.getElementById('confirm-text').textContent=`Удалить место «${pl.name}»?`;
  document.getElementById('cfm-ok').onclick=()=>{places=places.filter(x=>x.id!==id);saveAll();if(APP.selectedId===id)APP.selectedId=null;hideModal('confirm-modal');showToast('Место удалено','danger');renderAll();refreshAdminViews();};
  showModal('confirm-modal');
}

// ═══════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════
function showToast(msg,type='info'){
  const icons={success:'✓',danger:'✕',info:'ℹ',warning:'⚠'};
  const t=document.createElement('div'); t.className=`toast ${type}`;
  t.innerHTML=`<span>${icons[type]}</span> ${msg}`;
  document.getElementById('toast-c').appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(18px)';t.style.transition='all .3s';setTimeout(()=>t.remove(),300);},2800);
}

// ═══════════════════════════════════════════
//  KEYBOARD
// ═══════════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(document.getElementById('lightbox').classList.contains('show')){
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowRight') document.getElementById('lb-next').click();
    if(e.key==='ArrowLeft') document.getElementById('lb-prev').click();
    return;
  }
  if(e.key==='Escape'){
    if(APP.addingMode){APP.addingMode=false;mapCon.classList.remove('adding');document.getElementById('add-hint').classList.remove('show');}
    else if(APP.selectedId){APP.selectedId=null;renderMarkers();renderPlacesList();}
    ['place-modal','cat-modal','confirm-modal','mapimg-modal'].forEach(id=>hideModal(id));
  }
});

// ═══════════════════════════════════════════
//  MAP IMAGES (overlay на карте)
// ═══════════════════════════════════════════
// ── Кэш загруженных изображений карты ──────────────────────────
const mapImgCache = {};

function getMapImg(mi){
  if(mapImgCache[mi.id] && mapImgCache[mi.id].src === mi.src) return mapImgCache[mi.id];
  const img = new Image();
  img.src = mi.src;
  img.onload = ()=>{ drawMap(); renderMapImages(); renderMarkers(); };
  mapImgCache[mi.id] = img;
  return img;
}

// size = ШИРИНА при max зуме. Высота — пропорционально исходному изображению.
function drawMapImages(){
  if(!mapImages.length) return;
  const sorted=[...mapImages].sort((a,b)=>(a.zLevel||1)-(b.zLevel||1));
  sorted.forEach(mi=>{
    const img=getMapImg(mi);
    if(!img.complete||!img.naturalWidth) return;
    const pos=pt(mi.lat,mi.lng);
    const w=(mi.size||128)*(MAP.z/ZOOM_MAX);
    if(w<1) return;
    const h=w*(img.naturalHeight/img.naturalWidth);
    ctx.drawImage(img, pos.x-w/2, pos.y-h/2, w, h);
    if(selectedImgId===mi.id&&APP.role==='admin'){
      ctx.save();
      ctx.strokeStyle='rgba(59,130,246,0.9)';
      ctx.lineWidth=2; ctx.setLineDash([5,3]);
      ctx.strokeRect(pos.x-w/2-3, pos.y-h/2-3, w+6, h+6);
      ctx.restore();
    }
  });
}

function hitTestMapImage(x,y){
  const sorted=[...mapImages].sort((a,b)=>(b.zLevel||1)-(a.zLevel||1));
  for(const mi of sorted){
    const pos=pt(mi.lat,mi.lng);
    const img=mapImgCache[mi.id];
    const w=(mi.size||128)*(MAP.z/ZOOM_MAX);
    const h=img&&img.naturalWidth ? w*(img.naturalHeight/img.naturalWidth) : w;
    if(x>=pos.x-w/2&&x<=pos.x+w/2&&y>=pos.y-h/2&&y<=pos.y+h/2) return mi;
  }
  return null;
}

function renderMapImages(){
  document.querySelectorAll('.map-img-overlay').forEach(e=>e.remove());
  if(APP.role!=='admin'||!selectedImgId) return;
  const mi=mapImages.find(x=>x.id===selectedImgId);
  if(!mi) return;

  const pos=pt(mi.lat,mi.lng);
  const img=mapImgCache[mi.id];
  const w=(mi.size||128)*(MAP.z/ZOOM_MAX);
  const h=img&&img.naturalWidth ? w*(img.naturalHeight/img.naturalWidth) : w;
  const zl=mi.zLevel||1;

  // Экранные координаты: центр X и нижний край изображения
  const cr=canvas.getBoundingClientRect();
  const sx=cr.left+pos.x;
  const sy=cr.top+pos.y+h/2+6;

  const bar=document.createElement('div');
  bar.className='map-img-overlay';
  bar.style.cssText=`position:fixed;top:${Math.min(window.innerHeight-44,sy)}px;left:${sx}px;transform:translateX(-50%);background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:3px 6px;display:flex;gap:4px;align-items:center;white-space:nowrap;box-shadow:var(--shadow-sm);pointer-events:all;z-index:500;`;

  bar.innerHTML=`
    <span class="map-img-zlabel">ш:</span>
    ${[64,128,256,512].map(s=>`<button class="map-img-resize-btn${(mi.size||128)===s?' active':''}" data-action="size" data-val="${s}">${s}</button>`).join('')}
    <span class="map-img-zlabel" style="margin-left:4px">z:</span>
    ${[1,2,3,4,5].map(z=>`<button class="map-img-resize-btn${zl===z?' active':''}" data-action="zlevel" data-val="${z}">${z}</button>`).join('')}
    <button class="map-img-resize-btn" data-action="edit" style="margin-left:4px">✏️</button>
    <button class="map-img-resize-btn" data-action="del" style="color:var(--danger)">🗑</button>`;

  bar.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const idx=mapImages.findIndex(x=>x.id===mi.id);
    if(idx===-1) return;
    if(b.dataset.action==='size'){mapImages[idx].size=+b.dataset.val;saveAll();drawMap();renderMapImages();renderMarkers();}
    else if(b.dataset.action==='zlevel'){mapImages[idx].zLevel=+b.dataset.val;saveAll();drawMap();renderMapImages();renderMarkers();}
    else if(b.dataset.action==='edit'){openMapImgModal(mi.id);}
    else if(b.dataset.action==='del'){confirmDeleteImg(mi.id);}
  }));
  document.body.appendChild(bar);
}

// Перетаскивание изображения на карте
let imgDrag = null;
function startImgDrag(e,mi){
  if(e.button!==0) return; e.stopPropagation(); e.preventDefault();
  const r=mapCon.getBoundingClientRect();
  // Запоминаем смещение курсора от центра изображения при начале drag
  const startPos=pt(mi.lat,mi.lng);
  const offsetX=(e.clientX-r.left)-startPos.x;
  const offsetY=(e.clientY-r.top)-startPos.y;
  imgDrag={id:mi.id, moved:false};

  const mv=ev=>{
    imgDrag.moved=true;
    const r2=mapCon.getBoundingClientRect();
    // Вычитаем смещение чтобы курсор оставался в той же точке изображения
    const cx=(ev.clientX-r2.left)-offsetX;
    const cy=(ev.clientY-r2.top)-offsetY;
    const c=inv(cx,cy);
    const idx=mapImages.findIndex(x=>x.id===mi.id);
    if(idx!==-1){
      mapImages[idx].lat=+c.lat.toFixed(5);
      mapImages[idx].lng=+c.lng.toFixed(5);
      // Живая перерисовка во время перетаскивания
      drawMap(); renderMapImages(); renderMarkers();
    }
  };

  const up=ev=>{
    document.removeEventListener('mousemove',mv);
    document.removeEventListener('mouseup',up);
    if(imgDrag && imgDrag.moved){
      saveAll();
      showToast('Изображение перемещено','success');
      drawMap(); renderMapImages(); renderMarkers();
    }
    imgDrag=null;
  };

  document.addEventListener('mousemove',mv);
  document.addEventListener('mouseup',up);
}

function confirmDeleteImg(id){
  const mi=mapImages.find(x=>x.id===id); if(!mi) return;
  document.getElementById('confirm-text').textContent=`Удалить изображение «${mi.name||'без названия'}»?`;
  document.getElementById('cfm-ok').onclick=()=>{
    mapImages=mapImages.filter(x=>x.id!==id);
    if(selectedImgId===id) selectedImgId=null;
    saveAll(); hideModal('confirm-modal'); renderMapImages(); renderMapImagesAdmin();
    showToast('Изображение удалено','danger');
  };
  showModal('confirm-modal');
}

// ── ДОБАВЛЕНИЕ ИЗОБРАЖЕНИЯ КЛИКОМ НА КАРТУ ──
document.getElementById('btn-add-mapimg').addEventListener('click',()=>{
  showPage('map');
  mimAddingMode=true;
  mapCon.classList.add('adding');
  document.getElementById('add-hint').textContent='🖼 Кликните на карту для размещения изображения';
  document.getElementById('add-hint').classList.add('show');
  showToast('Кликните на карту для размещения','info');
});

// ── MAP IMAGE MODAL ──
let mimSelectedSize=128, mimSelectedZLevel=1, mimImageDataUrl=null, mimEditingId=null;

function openMapImgModal(id, lat, lng){
  mimEditingId = id||null;
  mimSelectedSize=128; mimSelectedZLevel=1; mimImageDataUrl=null;
  document.getElementById('mim-title').textContent = id?'Редактировать изображение':'Добавить изображение на карту';
  document.getElementById('mim-name').value='';
  document.getElementById('mim-lat').value = lat?lat.toFixed(5):'';
  document.getElementById('mim-lng').value = lng?lng.toFixed(5):'';
  document.getElementById('mim-preview-wrap').style.display='none';
  document.getElementById('mim-upload-area').style.display='block';
  document.getElementById('mim-file').value='';

  if(id){
    const mi=mapImages.find(x=>x.id===id);
    if(mi){
      document.getElementById('mim-name').value=mi.name||'';
      document.getElementById('mim-lat').value=mi.lat;
      document.getElementById('mim-lng').value=mi.lng;
      mimSelectedSize=mi.size||128;
      mimSelectedZLevel=mi.zLevel||1;
      mimImageDataUrl=mi.src;
      document.getElementById('mim-preview').src=mi.src;
      document.getElementById('mim-preview-wrap').style.display='block';
      document.getElementById('mim-upload-area').style.display='none';
    }
  }
  updateMimChips();
  showModal('mapimg-modal');
}

function updateMimChips(){
  document.querySelectorAll('.size-chip').forEach(b=>{b.classList.toggle('active',+b.dataset.sz===mimSelectedSize);});
  document.querySelectorAll('.zlevel-chip').forEach(b=>{b.classList.toggle('active',+b.dataset.zl===mimSelectedZLevel);});
}

document.querySelectorAll('.size-chip').forEach(b=>b.addEventListener('click',()=>{mimSelectedSize=+b.dataset.sz;updateMimChips();}));
document.querySelectorAll('.zlevel-chip').forEach(b=>b.addEventListener('click',()=>{mimSelectedZLevel=+b.dataset.zl;updateMimChips();}));

document.getElementById('mim-file').addEventListener('change',e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    mimImageDataUrl=ev.target.result;
    document.getElementById('mim-preview').src=mimImageDataUrl;
    document.getElementById('mim-preview-wrap').style.display='block';
    document.getElementById('mim-upload-area').style.display='none';
  };
  reader.readAsDataURL(file);
});
document.getElementById('mim-remove-img').addEventListener('click',()=>{
  mimImageDataUrl=null;
  document.getElementById('mim-file').value='';
  document.getElementById('mim-preview-wrap').style.display='none';
  document.getElementById('mim-upload-area').style.display='block';
});
document.getElementById('mim-close').addEventListener('click',()=>hideModal('mapimg-modal'));
document.getElementById('mim-cancel').addEventListener('click',()=>hideModal('mapimg-modal'));
document.getElementById('mim-save').addEventListener('click',()=>{
  if(!mimImageDataUrl){showToast('Загрузите изображение','danger');return;}
  const lat=parseFloat(document.getElementById('mim-lat').value);
  const lng=parseFloat(document.getElementById('mim-lng').value);
  if(isNaN(lat)||isNaN(lng)){showToast('Укажите координаты','danger');return;}
  const name=document.getElementById('mim-name').value.trim()||'Изображение';
  if(mimEditingId){
    const idx=mapImages.findIndex(x=>x.id===mimEditingId);
    if(idx!==-1) mapImages[idx]={...mapImages[idx],name,src:mimImageDataUrl,lat,lng,size:mimSelectedSize,zLevel:mimSelectedZLevel};
    showToast('Изображение обновлено','success');
  } else {
    mapImages.push({id:uid(),name,src:mimImageDataUrl,lat,lng,size:mimSelectedSize,zLevel:mimSelectedZLevel,createdAt:Date.now()});
    showToast('Изображение добавлено','success');
  }
  saveAll(); hideModal('mapimg-modal'); renderMapImages(); renderMapImagesAdmin();
});

// Клик на карту в режиме добавления изображения
// (перехватываем в существующем mousedown handler через флаг mimAddingMode)

// ── ТАБЛИЦА ИЗОБРАЖЕНИЙ В ADMIN ──
function renderMapImagesAdmin(){
  const container=document.getElementById('mapimages-list');
  if(!container) return;
  if(!mapImages.length){
    container.innerHTML=`<div class="empty-state"><div class="es-ico">🖼</div><p>Нет изображений на карте.<br>Нажмите «Добавить изображение».</p></div>`;
    return;
  }
  container.innerHTML='';
  [...mapImages].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).forEach(mi=>{
    const card=document.createElement('div');
    card.className='img-map-card';
    card.innerHTML=`
      <img class="img-map-thumb" src="${mi.src}" alt="">
      <div class="img-map-info">
        <div class="img-map-name">${mi.name||'Без названия'}</div>
        <div class="img-map-meta">📍 ${mi.lat.toFixed(4)}, ${mi.lng.toFixed(4)} · ${mi.size||128}px · z-уровень ${mi.zLevel||1}</div>
      </div>
      <div class="img-map-actions">
        <button class="btn btn-ghost btn-sm" data-action="goto">🗺</button>
        <button class="btn btn-ghost btn-sm" data-action="edit">✏️</button>
        <button class="btn btn-danger btn-sm" data-action="del">🗑</button>
      </div>`;
    card.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
      if(b.dataset.action==='edit') openMapImgModal(mi.id);
      if(b.dataset.action==='del') confirmDeleteImg(mi.id);
      if(b.dataset.action==='goto'){
        showPage('map'); renderAll();
        setTimeout(()=>{
          const w=canvas.width,h=canvas.height,span=0.7;
          MAP.ox=-(mi.lng-71.5)/span*w*MAP.z; MAP.oy=(mi.lat-51.15)/span*h*MAP.z;
          drawMap(); renderMapImages(); renderMarkers();
        },100);
      }
    }));
    container.appendChild(card);
  });
}
function renderAll(){
  if(APP.page==='map'){ drawMap(); renderMapImages(); renderMarkers(); renderPlacesList(); renderCatFilter(); updateHeaderForRole(); }
}

// ── Start: guests go straight to map (called LAST after all functions defined) ──
enterAsGuest();

// ═══════════════════════════════════════════
//  MOBILE — sidebar overlay + touch events
// ═══════════════════════════════════════════
function isMobile(){ return window.innerWidth <= 768; }

let sbOverlay = null;
function getSbOverlay(){
  if(!sbOverlay){
    sbOverlay = document.createElement('div');
    sbOverlay.className = 'sidebar-overlay';
    document.querySelector('.app-body').appendChild(sbOverlay);
    sbOverlay.addEventListener('click', closeMobileSidebar);
  }
  return sbOverlay;
}
function openMobileSidebar(){
  document.getElementById('sidebar').classList.add('mobile-open');
  document.getElementById('sidebar').classList.remove('hidden');
  getSbOverlay().classList.add('show');
}
function closeMobileSidebar(){
  document.getElementById('sidebar').classList.remove('mobile-open');
  getSbOverlay().classList.remove('show');
}

// Replace sidebar toggle with mobile-aware version
document.getElementById('btn-toggle-sb').onclick = function(){
  if(isMobile()){
    const sb = document.getElementById('sidebar');
    if(sb.classList.contains('mobile-open')) closeMobileSidebar();
    else openMobileSidebar();
  } else {
    document.getElementById('sidebar').classList.toggle('hidden');
  }
};

// Touch map: pan + pinch-zoom
let lastTouchDist = 0;
mapCon.addEventListener('touchstart', e=>{
  e.preventDefault();
  if(e.touches.length === 1){
    MAP.drag = true;
    MAP.lx = e.touches[0].clientX;
    MAP.ly = e.touches[0].clientY;
  } else if(e.touches.length === 2){
    MAP.drag = false;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDist = Math.hypot(dx, dy);
  }
}, {passive:false});

mapCon.addEventListener('touchmove', e=>{
  e.preventDefault();
  if(e.touches.length === 1 && MAP.drag){
    MAP.ox += e.touches[0].clientX - MAP.lx;
    MAP.oy += e.touches[0].clientY - MAP.ly;
    MAP.lx = e.touches[0].clientX;
    MAP.ly = e.touches[0].clientY;
    drawMap(); renderMapImages(); renderMarkers();
  } else if(e.touches.length === 2 && lastTouchDist > 0){
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const cx = (e.touches[0].clientX + e.touches[1].clientX)/2;
    const cy = (e.touches[0].clientY + e.touches[1].clientY)/2;
    const r  = mapCon.getBoundingClientRect();
    zoomTo(MAP.z * (dist / lastTouchDist), cx - r.left, cy - r.top);
    lastTouchDist = dist;
  }
}, {passive:false});

mapCon.addEventListener('touchend', e=>{
  if(e.touches.length === 0){ MAP.drag = false; lastTouchDist = 0; }
}, {passive:true});

window.addEventListener('resize', ()=>{
  if(!isMobile() && sbOverlay) sbOverlay.classList.remove('show');
});
