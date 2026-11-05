// Local canvas particles: no assets, network, cursor replacement or scene transforms.
export function mountDream(){
 const app=document.querySelector('#app'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const space=document.createElement('div');space.id='dream-space';space.setAttribute('aria-hidden','true');app.querySelector('#paper-ground').after(space);
 const canvas=document.createElement('canvas');canvas.id='dream-glitter';canvas.setAttribute('aria-hidden','true');app.append(canvas);
 const ctx=canvas.getContext('2d'),particles=[];let bounds,dpr,last=0,lastMouse=0,lastButterfly=0,pointer=null,theme='space';
 const labels={white:'纯白',space:'柔光空间',night:'暮紫梦境'};
 const picker=document.createElement('div');picker.id='theme-picker';picker.setAttribute('role','group');picker.setAttribute('aria-label','切换背景');
 picker.innerHTML='<span>背景</span>'+Object.entries(labels).map(([id,label])=>`<button class="theme-swatch" data-theme="${id}" aria-label="背景：${label}" title="${label}" aria-pressed="false"></button>`).join('')+'<output id="theme-name" aria-live="polite"></output>';app.append(picker);
 function choose(id){theme=id;app.dataset.theme=id;picker.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===id)));picker.querySelector('output').textContent=labels[id];document.querySelector('meta[name=theme-color]')?.setAttribute('content',id==='night'?'#282735':id==='white'?'#ffffff':'#f3ebf0');try{localStorage.setItem('botanical-v10-background',id);}catch{}}
 picker.addEventListener('click',e=>{const b=e.target.closest('button[data-theme]');if(b)choose(b.dataset.theme);});
 try{const stored=localStorage.getItem('botanical-v10-background');if(labels[stored])theme=stored;}catch{}choose(theme);
 function resize(){bounds=app.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(bounds.width*dpr);canvas.height=Math.round(bounds.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles.length=0;pointer=null;}
 resize();addEventListener('resize',resize);
 function emit(x,y,n,butterfly=false){for(let i=0;i<n;i++){if(particles.length>=320)particles.shift();const a=Math.random()*Math.PI*2,s=Math.random()*(butterfly?14:10);particles.push({x:x+(Math.random()-.5)*9,y:y+(Math.random()-.5)*9,vx:Math.cos(a)*s,vy:Math.sin(a)*s-6,age:0,life:butterfly?1.25+Math.random()*.75:.65+Math.random()*.7,size:Math.random()<.16?2.1+Math.random()*1.7:.45+Math.random()*1.1,star:Math.random()<.17,hue:Math.floor(Math.random()*4),seed:Math.random()*6});}}
 app.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;const now=performance.now(),x=e.clientX-bounds.left,y=e.clientY-bounds.top;if(now-lastMouse<18)return;lastMouse=now;const distance=pointer?Math.hypot(x-pointer.x,y-pointer.y):0;if(distance>3){const n=Math.min(10,Math.ceil(distance/10));for(let i=1;i<=n;i++)emit(pointer.x+(x-pointer.x)*i/n,pointer.y+(y-pointer.y)*i/n,2);}pointer={x,y};},{passive:true});
 app.addEventListener('pointerleave',()=>pointer=null);
 function frame(t,flying,moth){if(reduced||document.hidden){last=t;return;}const dt=Math.min(.05,(t-last)/1000||.016);last=t;ctx.clearRect(0,0,bounds.width,bounds.height);
  if(flying&&t-lastButterfly>28&&Number(moth.style.opacity)>.12&&(app.dataset.phase==='observe'||app.dataset.phase==='collect')){lastButterfly=t;const r=moth.getBoundingClientRect(),x=r.left+r.width*.5-bounds.left,y=r.top+r.height*.55-bounds.top;if(x>0&&x<bounds.width&&y>0&&y<bounds.height)emit(x,y,4,true);}
  const palette=theme==='night'?['#fff9ff','#e9d4fa','#f7e8bc','#bcd9fa']:['#b8a4c9','#d7bba6','#faf3ff','#a4b6d0'];
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;if(p.age>=p.life){particles.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=8*dt;const u=p.age/p.life,fade=Math.min(1,u*8)*Math.pow(1-u,1.4),twinkle=.6+.4*Math.sin(p.age*17+p.seed)**2;ctx.globalAlpha=Math.min(.9,fade*twinkle);ctx.fillStyle=palette[p.hue];ctx.beginPath();if(p.star){const s=p.size*(.7+twinkle*.4);ctx.moveTo(p.x,p.y-s*2);ctx.quadraticCurveTo(p.x+s*.18,p.y-s*.18,p.x+s*1.5,p.y);ctx.quadraticCurveTo(p.x+s*.18,p.y+s*.18,p.x,p.y+s*2);ctx.quadraticCurveTo(p.x-s*.18,p.y+s*.18,p.x-s*1.5,p.y);ctx.quadraticCurveTo(p.x-s*.18,p.y-s*.18,p.x,p.y-s*2);}else ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();if(p.star){ctx.globalAlpha*=.24;ctx.beginPath();ctx.arc(p.x,p.y,p.size*2.4,0,Math.PI*2);ctx.fill();}}
  ctx.globalAlpha=1;canvas.dataset.particles=String(particles.length);canvas.dataset.butterflyTrail=String(!!flying);
 }
 return {frame};
}
