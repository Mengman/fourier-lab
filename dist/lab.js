'use strict';
const $ = id => document.getElementById(id);
const tau = 2 * Math.PI;
const ink = '#146e59', violet = '#8464ae', orange = '#bc5a2f';
function listen(ids, fn, event = 'input') {
  ids.forEach(id => $(id).addEventListener(event, fn));
}
function plot(id, bounds, curves, {xTicks = [], yTicks = [], bars = [], marker, dark = false} = {}) {
  const c = $(id), ctx = c.getContext('2d'), w = c.width, h = c.height;
  const [xMin, xMax, yMin, yMax] = bounds;
  const l = 56, r = w - 20, t = 15, b = h - 36;
  const px = x => l + (x - xMin) / (xMax - xMin) * (r - l);
  const py = y => b - (y - yMin) / (yMax - yMin) * (b - t);
  ctx.fillStyle = dark ? '#112d26' : '#f6f9f3'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = dark ? '#35574b' : '#d9e5d9';
  ctx.fillStyle = dark ? '#b5d6c5' : '#486056'; ctx.font = '16px monospace';
  for (const x of xTicks) {
    ctx.beginPath(); ctx.moveTo(px(x), t); ctx.lineTo(px(x), b); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillText(x, px(x), b + 23);
  }
  for (const y of yTicks) {
    ctx.beginPath(); ctx.moveTo(l, py(y)); ctx.lineTo(r, py(y)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(y, l - 7, py(y) + 5);
  }
  ctx.save(); ctx.beginPath(); ctx.rect(l - 4, t - 4, r - l + 8, b - t + 8); ctx.clip();
  for (const [points, color, width = 3] of curves) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y)));
    ctx.stroke();
  }
  for (const [x, y, color] of bars) {
    ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px(x), py(yMin)); ctx.lineTo(px(x), py(y)); ctx.stroke();
    ctx.beginPath(); ctx.arc(px(x), py(y), 4, 0, tau); ctx.fill();
  }
  if (marker) {
    const [x, y] = marker;
    ctx.strokeStyle = ctx.fillStyle = orange; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(px(x), t); ctx.lineTo(px(x), b); ctx.stroke();
    ctx.setLineDash([]); ctx.beginPath(); ctx.arc(px(x), py(y), 5, 0, tau); ctx.fill();
  }
  ctx.restore();
}
function hero() {
  const c = $('heroPlot'), g = c.getContext('2d');
  g.fillStyle = '#102d25'; g.fillRect(0, 0, 760, 440);
  g.strokeStyle = '#2a4d40'; g.lineWidth = 1;
  for (let x = 20; x < 760; x += 30) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 440); g.stroke(); }
  for (let y = 10; y < 440; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(760, y); g.stroke(); }
  for (const [color, shift, width] of [['#477d6b', 48, 2], ['#8ff4d1', 0, 4]]) {
    g.strokeStyle = color; g.lineWidth = width; g.beginPath();
    for (let i = 0; i < 355; i++) {
      const y = 221 + shift - 67 * Math.cos(i / 355 * tau * 3) - 32 * Math.cos(i / 355 * tau * 7);
      if (i === 0) g.moveTo(20, y); else g.lineTo(20 + i, y);
    }
    g.stroke();
  }
  g.fillStyle = '#a8caba'; g.font = '25px monospace'; g.fillText('→', 388, 231);
  for (let i = 0; i < 9; i++) {
    const y = i === 2 ? 198 : i === 6 ? 110 : 5, x = 444 + i * 32;
    g.fillStyle = i === 6 ? '#e8ac6e' : '#8ff4d1'; g.fillRect(x, 337 - y, 4, y);
    g.beginPath(); g.arc(x + 2, 337 - y, 5, 0, tau); g.fill();
  }
  g.fillStyle = '#a8caba'; g.font = '16px monospace'; g.fillText('3 Hz', 489, 122); g.fillText('7 Hz', 617, 210);
}
function project(samples, f, rate) {
  let re = 0, im = 0;
  for (let n = 0; n < samples.length; n++) {
    const a = tau * f * n / rate;
    re += samples[n] * Math.cos(a);
    im -= samples[n] * Math.sin(a);
  }
  return [re, im];
}
function signal() {
  const f = +$('probe').value, mix = +$('mix').value, degrees = +$('phase').value;
  const phi = degrees * Math.PI / 180, n = 128;
  const x = t => Math.cos(tau * 3 * t + phi) + mix * Math.cos(tau * 7 * t);
  const samples = Float64Array.from({length:n}, (_, i) => x(i/n));
  const scale = hz => (hz === 0 ? 1 : 2) / n;
  const mag = hz => Math.hypot(...project(samples, hz, n)) * scale(hz);
  const waveform = [], ref = [];
  for (let i = 0; i <= 256; i++) {
    waveform.push([i/256, x(i/256)]);
    ref.push([i/256, Math.cos(tau * f * i/256)]);
  }
  plot('wave', [0, 1, -2.1, 2.1], [[ref, violet, 2], [waveform, ink]], {xTicks:[0,.25,.5,.75,1],yTicks:[-2,-1,0,1,2]});
  plot('probePlot', [0, 12, 0, 1.25], [], {xTicks:[0,2,4,6,8,10,12],yTicks:[0,.5,1],bars:Array.from({length:13},(_,i)=>[i,mag(i),ink]),marker:[f,mag(f)]});
  $('probeVal').value = f + ' Hz'; $('mixVal').value = mix.toFixed(2); $('phaseVal').value = degrees + '°';
  const [re,im] = project(samples,f,n).map(value => (value*scale(f)).toFixed(2));
  $('probeNote').textContent = `当前匹配度 ${mag(f).toFixed(2)}（余弦投影 ${re}，负正弦投影 ${im}）。把探针从 3 Hz 移到 4 Hz 再到 7 Hz，比较读数。回到 3 Hz 转动相位，观察两个投影如何变化。`;
}
function fft(re, im, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    while (j & bit) { j ^= bit; bit >>= 1; }
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let size = 2; size <= n; size *= 2) {
    const half = size / 2, step = (inverse ? tau : -tau) / size;
    for (let j = 0; j < half; j++) {
      const c = Math.cos(step*j), s = Math.sin(step*j);
      for (let a = j; a < n; a += size) {
        const b = a + half;
        const r = c*re[b] - s*im[b], m = s*re[b] + c*im[b];
        re[b] = re[a] - r; im[b] = im[a] - m;
        re[a] += r; im[a] += m;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
function fft2(re, im, n, inverse = false) {
  const rr = new Float64Array(n), ii = new Float64Array(n);
  for (let y = 0; y < n; y++) {
    fft(re.subarray(y*n,(y+1)*n), im.subarray(y*n,(y+1)*n), inverse);
  }
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) { rr[y] = re[y*n+x]; ii[y] = im[y*n+x]; }
    fft(rr, ii, inverse);
    for (let y = 0; y < n; y++) { re[y*n+x] = rr[y]; im[y*n+x] = ii[y]; }
  }
}
const side = 128;
let imageCache;
function makeImage(pattern) {
  return Float64Array.from({length:side*side}, (_,i) => {
    const x = (i % side) / side, y = Math.floor(i / side) / side;
    if (pattern === 'stripes') return 128 + 60*Math.cos(tau*4*x) + 40*Math.cos(tau*(19*x + 9*y));
    if (pattern === 'edges') return 43 + 145*(x > .16 && x < .46 && y > .18 && y < .65)
      + 189*(Math.hypot(x-.68,y-.61)<.19);
    const far = .56 - .17*Math.sin(tau*(x-.04)) - .08*Math.cos(tau*3*x);
    const near = .74 - .10*Math.cos(tau*(x+.1)) + .045*Math.cos(tau*4*x);
    const moon = Math.hypot(x-.73,y-.26) < .091;
    const landscape = y > near ? 49 + 21*(1-y) : y > far ? 97 + 33*(1-y) : 158 + 51*(1-y) + 30*moon;
    return landscape + 24*Math.cos(tau*22*x) + 15*Math.cos(tau*22*y);
  });
}
function pixels(id, color) {
  const ctx = $(id).getContext('2d'), frame = ctx.createImageData(side,side);
  for (let i = 0; i < side*side; i++) {
    const [r,g,b] = color(i);
    frame.data.set([r,g,b,255],i*4);
  }
  ctx.putImageData(frame,0,0);
}
function gray(v) { return [v,v,v]; }
function image() {
  const pattern = $('pattern').value, mask = $('mask').value, radius = +$('radius').value;
  if (imageCache?.pattern !== pattern) {
    const original = makeImage(pattern), re = original.slice(), im = new Float64Array(re.length);
    fft2(re,im,side);
    imageCache = {pattern,original,re,im};
    pixels('original', i => gray(original[i]));
  }
  const {original,re,im} = imageCache, cutR = re.slice(), cutI = im.slice();
  const half = side/2;
  function keep(x,y) {
    if (mask === 'low') return Math.hypot(x,y) <= radius;
    if (mask === 'high') return Math.hypot(x,y) > radius;
    if (mask === 'notch') return [[22,0],[-22,0],[0,22],[0,-22]].every(([u,v]) => Math.hypot(x-u,y-v)>1);
    return true;
  }
  pixels('imageSpectrum', i => {
    const x = i % side - half, y = Math.floor(i / side) - half;
    const k = ((y + side) % side)*side + (x+side)%side;
    const mag = Math.log1p(Math.hypot(re[k],im[k])/16);
    const v = 11 + 244*Math.min(1,mag/10);
    if (keep(x,y)) return [v*.58,v,v*.86];
    cutR[k] = cutI[k] = 0;
    return [v*.55,v*.26,v*.2];
  });
  fft2(cutR,cutI,side,true);
  pixels('recon', i => gray(cutR[i] + (mask === 'high' ? 128 : 0)));
  $('radius').disabled = ['all','notch'].includes(mask);
  $('radiusVal').value = $('radius').disabled ? '—' : radius + ' 轮/图';
  const rms = Math.sqrt(cutR.reduce((sum,value,i) => sum+(value-original[i])**2,0)/cutR.length);
  $('imageLabel').textContent = mask === 'high' ? '以中灰为零' : `均方根误差 ${rms.toFixed(2)}`;
  $('imageNote').textContent = ({
    low:'拖小半径。细网格先消失，边缘也变软。青绿为保留的频率，暗红为压掉的频率。',
    high:'拖动半径。观察平坦区域如何变成中灰，边缘和细纹怎样留下来。图中比中灰亮和暗分别代表正、负响应。',
    notch:'用「山峦与网格干扰」观察效果。这里仅压掉横、竖方向上每图 22 轮的四个尖峰附近，其他细节大多能保留。',
    all:'逆变换将完整的复数频谱还原成输入图像。尝试来回切换低通和高通，看它们分别舍弃了哪些成分。'
  })[mask];
}
function heatCoefficient(n, time) {
  const angle = n * Math.PI;
  const initial = 2 * (Math.cos(angle/3) - Math.cos(2*angle/3)) / angle;
  return initial * Math.exp(-angle*angle*time);
}
function heat() {
  const count = +$('heatTerms').value, time = +$('heatTime').value;
  const coeff = Array.from({length:count}, (_, i) => heatCoefficient(i+1, time));
  const contribution = (n, x) => (coeff[n-1] ?? 0) * Math.sin(n*Math.PI*x);
  const points = fn => Array.from({length:361}, (_, i) => [i/360, fn(i/360)]);
  const target = [[0,0], [1/3,0], [1/3,1], [2/3,1], [2/3,0], [1,0]];
  const sum = points(x => coeff.reduce((total, _, i) => total + contribution(i+1, x), 0));
  const axes = {xTicks:[0,.25,.5,.75,1]};
  plot('heatPlot', [0,1,-.15,1.18], [[target,'#86918a',2],[sum,ink]],
    {...axes,yTicks:[0,.25,.5,.75,1]});
  plot('heatModes', [0,1,-.75,.75],
    [[points(x => contribution(3,x)),violet],[points(x => contribution(1,x)),ink]],
    {...axes,yTicks:[-.5,-.25,0,.25,.5]});
  $('heatTermsVal').value = count + ' 项';
  $('heatTimeVal').value = time.toFixed(3);
  const third = count >= 3 ? coeff[2].toFixed(3) : '未加入';
  $('heatNote').textContent = `第 1 项的系数 ${coeff[0].toFixed(3)} · 第 3 项的系数 ${third}。`;
}
hero();
listen(['heatTerms','heatTime'], heat); heat();
listen(['probe','mix','phase'], signal); signal();
listen(['pattern','mask','radius'], image); image();

let audioContext, playing, example, uploaded, activeAudio, frames = [], heatmap;
let audioRevision = 0;
const maxHz = 4000;
function audioCtx() {
  audioContext ??= new AudioContext();
  return audioContext;
}
function stopAudio() {
  if (!playing) return;
  playing.stop(); playing = null; $('play').textContent = '▶ 播放';
}
function notch(samples, rate, center, width) {
  let n = 1;
  while (n < samples.length) n *= 2;
  const re = new Float64Array(n), im = new Float64Array(n);
  re.set(samples); fft(re,im);
  for (let k = 0; k < n; k++) {
    const f = Math.min(k,n-k)*rate/n;
    if (Math.abs(f-center) <= width) re[k] = im[k] = 0;
  }
  fft(re,im,true);
  return Float32Array.from(re.subarray(0,samples.length));
}
function decode(bytes) {
  return new OfflineAudioContext(1, 1, 16000).decodeAudioData(bytes);
}
function mono(buffer) {
  const rate = buffer.sampleRate, data = new Float32Array(Math.min(buffer.length, rate * 8));
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const channel = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) data[i] += channel[i]/buffer.numberOfChannels;
  }
  return {data,rate};
}
function vowelDemo() {
  const rate = 16000, duration = 3.6;
  const vowels = [[800,1200],[290,2250],[340,820]];
  const data = Float32Array.from({length:rate*duration}, (_,i) => {
    const t = i/rate, block = Math.floor(t/1.2), local = t%1.2;
    if (local>.92) return 0;
    const [f1,f2] = vowels[block], f0 = 142;
    let s = 0;
    for (let k=1;k<25;k++) {
      const f=k*f0;
      const gain=(.08+Math.exp(-(((f-f1)/150)**2)) + .65*Math.exp(-(((f-f2)/180)**2)))/Math.sqrt(k);
      s += gain*Math.sin(tau*f*t);
    }
    return .36*s*Math.min(1,local/.06,(.92-local)/.12);
  });
  return {data,rate};
}
function db(magnitude) { return Math.max(-80,20*Math.log10(Math.max(1e-6,magnitude))); }
function spectrogram() {
  if (!activeAudio) return;
  const {data,rate} = activeAudio, n = 2**+$('window').value;
  const duration = data.length/rate, max = Math.min(maxHz,rate/2);
  const size = Math.min(470, Math.max(2, Math.ceil(data.length/(n/4))));
  const weights = Float64Array.from({length:n},(_,i)=>(1-Math.cos(tau*i/(n-1)))/2);
  const weight = weights.reduce((a,b)=>a+b,0);
  const r = new Float64Array(n), im = new Float64Array(n);
  frames = Array.from({length:size},(_,col)=>{
    const start = Math.round(col/(size-1)*(data.length-1))-n/2;
    for (let i=0;i<n;i++) r[i]=(data[start+i]??0)*weights[i];
    im.fill(0); fft(r,im);
    return Float64Array.from({length:n/2+1},(_,k)=>db(Math.hypot(r[k],im[k])*(k===0||k===n/2?1:2)/weight));
  });
  const c=$('spectrogram'), g=c.getContext('2d'), w=c.width, h=c.height;
  const top=11,left=65,bottom=h-37,right=w-20;
  const grid = g.createImageData(right-left,bottom-top);
  for (let y=0;y<grid.height;y++) {
    const k=Math.round((1-y/(grid.height-1))*max*n/rate);
    for(let x=0;x<grid.width;x++){
      const a=Math.max(0,Math.min(1,(frames[Math.round(x/(grid.width-1)*(size-1))][k]+65)/55));
      const i=(y*grid.width+x)*4;
      grid.data[i]=12+240*a**2; grid.data[i+1]=34+207*a;
      grid.data[i+2]=33+113*a; grid.data[i+3]=255;
    }
  }
  g.fillStyle='#f6f9f3';g.fillRect(0,0,w,h);g.putImageData(grid,left,top);
  g.fillStyle='#486056';g.font='17px monospace';g.textAlign='right';
  for(let f=0;f<=max;f+=1000) g.fillText(f,left-7,bottom-(bottom-top)*f/max+5);
  g.textAlign='center';
  for(let i=0;i<=4;i++) g.fillText((duration*i/4).toFixed(2),left+(right-left)*i/4,bottom+23);
  heatmap=g.getImageData(0,0,w,h);
  $('windowVal').value = `${n} 点 · ${(n/rate*1000).toFixed(0)} ms · Δf ${(rate/n).toFixed(1)} Hz`;
  drawFrame();
}
function drawFrame() {
  if (!activeAudio || !heatmap) return;
  const at=+$('frame').value/1000, {data,rate}=activeAudio;
  const c=$('spectrogram'), g=c.getContext('2d');
  g.putImageData(heatmap,0,0);
  const x=65+(c.width-85)*at;
  g.strokeStyle='#ffbb81';g.lineWidth=3;g.beginPath();g.moveTo(x,11);g.lineTo(x,c.height-37);g.stroke();
  $('frameVal').value = (at*data.length/rate).toFixed(2)+' s';
  const spectrum=frames[Math.round(at*(frames.length-1))], n=(spectrum.length-1)*2;
  const max=Math.min(maxHz,rate/2);
  const points=Array.from(spectrum,(v,k)=>[k*rate/n,v]).filter(([f])=>f<=max);
  plot('slice',[0,max,-80,0],[[points,ink]],{xTicks:[0,1000,2000,3000,4000].filter(f=>f<=max),yTicks:[-80,-60,-40,-20,0]});
}
function selectAudio() {
  stopAudio();
  const mode = $('audioMode').value;
  if (mode === 'upload') {
    activeAudio = uploaded;
    $('audioStatus').textContent = '本地音频 · 在浏览器内分析';
  } else if (example) {
    if (mode==='clean') activeAudio=example;
    else {
      const {data,rate}=example;
      const noisy=Float32Array.from(data,(s,i)=>s+.18*Math.sin(tau*1000*i/rate));
      activeAudio={data: mode==='noisy' ? noisy : notch(noisy,rate,1000,18),rate};
    }
    const names={clean:'啊、衣、乌。傅立叶变换。',noisy:'混入 1 kHz 正弦波',filtered:'压低 1 kHz ± 18 Hz · 逆 FFT 重建'};
    $('audioStatus').textContent=mode==='clean' && example.synthetic ? '合成元音「啊、衣、乌」 · 声道模型' : names[mode];
  }
  $('play').disabled = !activeAudio;
  spectrogram();
}
async function loadExample() {
  try {
    const res=await fetch('speech.wav');
    if (!res.ok) throw new Error('Missing example');
    example=mono(await decode(await res.arrayBuffer()));
    if (example.data.length < 8000) throw new Error('Empty example');
  } catch {
    example={...vowelDemo(),synthetic:true};
    $('audioMode').options[0].textContent='合成元音 · 啊、衣、乌';
  }
  selectAudio();
}
$('audioFile').addEventListener('change',async ()=>{
  const file=$('audioFile').files[0], revision=++audioRevision;
  if (!file) return;
  try {
    const decoded=mono(await decode(await file.arrayBuffer()));
    if (revision!==audioRevision) return;
    if (!decoded.data.length) throw new Error('Empty file');
    uploaded=decoded;
    $('audioMode').options[3].disabled=false; $('audioMode').value='upload';selectAudio();
  } catch {
    if (revision===audioRevision) $('audioStatus').textContent='无法读取这段音频。试试 WAV、MP3 或其他浏览器支持的格式。';
  }
});
$('play').addEventListener('click',async ()=>{
  if (playing) { stopAudio(); return; }
  try {
    const context=audioCtx();
    await context.resume();
    if (playing || !activeAudio) return;
    const {data,rate}=activeAudio, buffer=context.createBuffer(1,data.length,rate);
    buffer.copyToChannel(data,0);
    const source=context.createBufferSource(), gain=context.createGain();
    source.buffer=buffer;gain.gain.value=.55;
    source.connect(gain).connect(context.destination);
    source.onended=()=>{ if(playing===source) { playing=null; $('play').textContent='▶ 播放'; } };
    source.start();playing=source;$('play').textContent='■ 停止';
  } catch { $('audioStatus').textContent='浏览器无法播放音频。语谱图仍可用。'; }
});
$('spectrogram').addEventListener('click',event=>{
  const box=$('spectrogram').getBoundingClientRect(),w=$('spectrogram').width;
  $('frame').value=Math.round(Math.max(0,Math.min(1,((event.clientX-box.left)/box.width*w-65)/(w-85)))*1000);
  drawFrame();
});
listen(['audioMode'],selectAudio);listen(['window'],spectrogram);listen(['frame'],drawFrame);
$('play').disabled=true;loadExample();

const tasks=[
  {
    title:'测出一个频点的强度',
    text:'re 和 im 已经算好。返回这个复数的长度，作为该频点的未归一化幅度。预计改 1 行。',
    starter:'function magnitude(re, im) {\n  // 把两条投影合成一个长度\n  return 0;\n}',
    hint:'把 re 和 im 想成直角三角形的两条直角边。JavaScript 的 Math.hypot 可以直接求斜边。',
    solution:'return Math.hypot(re, im);',
    cases:[[3,4],[-5,12],[0,-2],[0,0],[.3,.4]],
    expected:[5,13,2,0,.5], fn:'magnitude'
  },
  {
    title:'画出二维图像的低通掩膜',
    text:'u、v 是以频谱中心为原点的坐标。频点距原点不超过 radius 时返回 1，否则返回 0。预计改 1–2 行。',
    starter:'function lowPass(u, v, radius) {\n  // 判断频点是否落在圆里\n  return 0;\n}',
    hint:'圆的边界也要保留。用 Math.hypot 求距离，或比较距离的平方。',
    solution:'return Math.hypot(u, v) <= radius ? 1 : 0;',
    cases:[[0,0,0],[3,4,5],[-3,-4,5],[4,4,5],[0,9,5]],
    expected:[1,1,1,0,0], fn:'lowPass'
  },
  {
    title:'压掉一条啸声频带',
    text:'freq 是带符号的频率。若它靠近 +center 或 −center，距离不超过 width，就返回 0。其余频点返回 1。预计改 2 行。',
    starter:'function notchGain(freq, center, width) {\n  // 两侧对称的频带都要处理\n  return 1;\n}',
    hint:'先把负频率折到正半轴。比较这个频率和 center 的距离。',
    solution:'const distance = Math.abs(Math.abs(freq) - center);\nreturn distance <= width ? 0 : 1;',
    cases:[[1000,1000,18],[-1018,1000,18],[982,1000,18],[-981,1000,18],[120,1000,18],[443,440,3]],
    expected:[0,0,0,1,1,0], fn:'notchGain'
  }
];
let currentTask=0, runId=0;
const drafts=tasks.map(task=>task.starter), results=tasks.map(()=>'准备就绪。补完函数后运行测试。');
function setTask(index) {
  currentTask=index;const task=tasks[index];
  $('taskTitle').textContent=task.title;$('taskText').textContent=task.text;
  $('editor').value=drafts[index];$('hint').textContent=task.hint;$('solution').textContent=task.solution;
  $('testOut').textContent=results[index];$('answer').open=false;
  document.querySelectorAll('[data-task]').forEach(el=>el.setAttribute('aria-pressed',String(+el.dataset.task===index)));
}
function evaluate(code,task) {
  const script=`self.onmessage=({data})=>{
    try {
      const fn = new Function(data.code + "\\nreturn " + data.fn)();
      postMessage({values:data.cases.map(args=>fn(...args))});
    } catch (err) { postMessage({error:String(err)}); }
  };`;
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(new Blob([script],{type:'text/javascript'}));
    let worker, timer;
    function finish(callback,result) {
      clearTimeout(timer); worker?.terminate(); URL.revokeObjectURL(url); callback(result);
    }
    try {
      worker=new Worker(url);
      timer=setTimeout(()=>finish(reject,new Error('运行超过 1.5 秒。请检查循环是否会结束。')),1500);
      worker.onmessage=({data})=>data.error ? finish(reject,new Error(data.error)) : finish(resolve,data.values);
      worker.onerror=()=>finish(reject,new Error('浏览器无法启动练习运行器。'));
      worker.postMessage({code,fn:task.fn,cases:task.cases});
    } catch(error) { finish(reject,error); }
  });
}
$('run').addEventListener('click',async ()=>{
  const id=++runId, index=currentTask, task=tasks[index], code=$('editor').value;
  $('run').disabled=true;$('testOut').textContent='测试中…';
  let result;
  try {
    const values=await evaluate(code,task);
    let passed=0;
    const lines=task.cases.map((args,i)=>{
      const got=values[i], want=task.expected[i];
      const ok=typeof got==='number' && Math.abs(got-want)<1e-8;
      passed+=Number(ok);
      return `${ok?'✓':'✗'} ${task.fn}(${args.join(', ')}) → ${String(got)}${ok?'':`，预期 ${want}`}`;
    });
    result=`${passed}/${lines.length} 通过\n${lines.join('\n')}`;
  } catch(error) { result='运行错误 · '+error.message; }
  if(id===runId) {
    results[index]=result;
    if(currentTask===index) $('testOut').textContent=result;
  }
  $('run').disabled=false;
});
$('reset').addEventListener('click',()=>{
  runId++;drafts[currentTask]=tasks[currentTask].starter;
  results[currentTask]='已重置。补完函数后运行测试。';setTask(currentTask);
});
$('editor').addEventListener('input',()=>{drafts[currentTask]=$('editor').value;});
document.querySelectorAll('[data-task]').forEach(el=>el.addEventListener('click',()=>setTask(+el.dataset.task)));
setTask(0);
