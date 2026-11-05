import {mountHardwarePanel} from './hardware-panel.js';
import {channelMask} from './hardware-controller.js';
import {loadCardRules} from './card-composer.js';
import {cardPlantIds} from './card-selection.js';
import {resolveScentCard} from './resolve-scent-card.js';
import {mountDream} from './dream.js';
import {mountPaper} from './paper.js';
import {embroideredText} from './embroidery.js';
import {botanicals,scentResults} from './botanicals.js';
import {apparatusMarkup} from './glass-set.js';
import {WindChime} from './chime.js';
import {Soundscape} from './acoustics.js';
import {Distillation} from './process.js';
import {ScentRelease} from './release.js';
import {CardPrinter} from './printer.js';
import {layoutFor,cameraPose,arrangeSet} from './scene-layout.js';
const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const state={phase:'observe',selected:[],drag:null,spin:null,transition:false};
const camera={x:0,y:0,scale:1},target={x:0,y:0,scale:1};let cameraMove=null,layout;
mountPaper();const dream=mountDream();$('#apparatus').innerHTML=apparatusMarkup();
$('.brand').innerHTML=embroideredText(['Botanical Apparatus'],{brand:true})+'<span>植物制香 · 交互装置</span>';
const chime=new WindChime(botanicals),nodes=chime.nodes,soundscape=new Soundscape(),distillation=new Distillation(),printer=new CardPrinter(reduced);
const hardware=mountHardwarePanel();
async function selectedCard(assets){return resolveScentCard(cardPlantIds(assets),await loadCardRules(),{allowSingleForDebug:true});}
const releaseStation=new ScentRelease(count=>{
 $('#release-count').textContent='第 '+count+' 阵气味想象';
 $('#foot-sub').textContent='第 '+count+' 次闻香 · 卡片正在右侧留存';
 $('#instruction').textContent='薄雾散去，气味的想象依然停留。';
 printer.print(state.selected.map(id=>botanicals[id].asset));
},soundscape,reduced,async()=>{
 const assets=state.selected.map(id=>botanicals[id].asset);
 const card=await selectedCard(assets);
 if(state.phase!=='release'||assets.join('|')!==state.selected.map(id=>botanicals[id].asset).join('|'))throw new Error('选择已变化，请重新挤压气囊');
 await hardware.spray(card.channelKey);
 return channelMask(card.channelKey);
},error=>toast(error.message));
let last=0,toastTimer,sound=true,lastHover=0,lastPointer=null,transitionTimer;
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x));};
function tone(power=.2){soundscape.chime(power);}
// Default music on; browser-blocked playback resumes on the first gesture.
function syncMusic(){sound=soundscape.enabled;$('#sound').innerHTML='MUSIC '+(sound?'ON':'OFF')+' <span>⌁</span>';$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'关闭背景音乐':'开启背景音乐');}
soundscape.onMusicChange=syncMusic;
function activateAudio(e){soundscape.unlock().catch(()=>{});if(!e.target.closest?.('#sound')&&soundscape.enabled)soundscape.startMusic().catch(()=>{});}
addEventListener('pointerdown',activateAudio,{capture:true});
addEventListener('keydown',activateAudio,{capture:true});
$('#viewport').addEventListener('selectstart',e=>e.preventDefault());
$('#viewport').addEventListener('dragstart',e=>e.preventDefault());
$('#sound').onclick=async()=>{try{await soundscape.toggle();}catch{toast('音乐暂时无法播放，请再试一次');}syncMusic();};
syncMusic();soundscape.startMusic().catch(()=>{});
function scare(){chime.scare();}
function pose(){
 return cameraPose(layout,state.phase,distillation.progress);
}
function resize(){const page=$('#app'),minHeight=innerWidth>=600?900:innerHeight<=680?700:innerHeight<=760?740:820,viewHeight=page.clientWidth<=900?Math.max(innerHeight,minHeight):page.clientHeight;layout=layoutFor(page.clientWidth,viewHeight);arrangeSet(layout);renderActions();distillation.refresh();Object.assign(target,pose());if(!state.initialized){Object.assign(camera,target);state.initialized=true;}}
function moveCamera(duration=2350){
 resize();cameraMove={from:{...camera},to:{...target},start:performance.now(),duration:reduced?1:duration};
}
const collectorHit=$('#bottleClip path').cloneNode();collectorHit.setAttribute('class','collection-hit');collectorHit.setAttribute('fill','transparent');collectorHit.setAttribute('pointer-events','all');$('#collector').append(collectorHit);
$('#collector').setAttribute('role','button');$('#collector').setAttribute('tabindex','0');$('#collector').setAttribute('aria-label','采集瓶：点选植物后，轻触此处采集');
$('#collector').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&state.phase==='collect'&&state.armed!=null){e.preventDefault();const m=mouth();startDrag({clientX:m.x,clientY:m.y,pointerId:0},state.armed);}});
resize();addEventListener('resize',()=>{cancelDrag();resize();cameraMove=null;});
function positionCaption(){
 if(state.phase!=='collect')return;
 const m=mouth(),mouthX=m.x,mouthY=m.y;
 const caption=$('#vessel-caption');caption.style.width=(layout.small?Math.min(148,Math.max(120,(innerWidth-mouthX-12)*2)):300)+'px';const height=caption.offsetHeight;
 const page=$('#app').getBoundingClientRect(),center=layout.small?Math.min(layout.w-caption.offsetWidth/2-12,Math.max(caption.offsetWidth/2+12,mouthX-page.left)):mouthX-page.left;caption.style.left=center+'px';caption.style.top=(mouthY-page.top-height-(layout.small?20:52))+'px';
}
function draw(t){
 const page=$('#app');if(page.scrollTop)page.scrollTop=0;if(page.scrollLeft)page.scrollLeft=0;
 const viewport=$('#viewport');if(viewport.scrollLeft)viewport.scrollLeft=0;if(viewport.scrollTop)viewport.scrollTop=0;
 const dt=Math.min((t-last)/16.667||1,3);last=t;
 if(state.phase==='distilling'&&!cameraMove)Object.assign(target,pose());
 if(cameraMove){
  const u=Math.min(1,(t-cameraMove.start)/cameraMove.duration),e=smooth(u);
  for(const key of ['x','y','scale','mobileX','mobileZoom'])camera[key]=cameraMove.from[key]+(cameraMove.to[key]-cameraMove.from[key])*e;
  if(u>=1){cameraMove=null;Object.assign(target,pose());}
 }else for(const key of ['x','y','scale','mobileX','mobileZoom'])camera[key]+=(target[key]-camera[key])*(reduced?1:1-Math.pow(.91,dt));
 $('#world').style.transform='translate('+camera.x+'px,'+camera.y+'px) scale('+camera.scale+')';
 $('#mobile').style.left=camera.mobileX+'px';
 $('#mobile').style.scale=camera.mobileZoom;
 $('#mobile').style.translate='0 '+(-259*(camera.mobileZoom-1))+'px';
 if(state.distillPending&&!cameraMove){state.distillPending=false;distillation.start(t,state.selected.reduce((m,id)=>m|botanicals[id].channel,0));}
 chime.frame(t,dt,state.selected,!!state.spin,reduced);
 dream.frame(t,!!chime.flight,chime.moth);
 const wind=Number($('#mobile').dataset.breeze||0);$('#app').classList.toggle('breezy',Math.abs(wind)>.12&&state.phase==='observe');
 $('#mobile').style.transform=reduced?'none':'translateX('+(wind*2)+'px) rotate('+(wind*.45)+'deg)';
 if(Math.abs(wind)>.5&&t-(state.lastBreezeTone||-20000)>17500){tone(.18);state.lastBreezeTone=t;}
 positionCaption();
 if(distillation.frame(t,reduced))phase('distilled');
 requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
const copy={
 observe:{chapter:'01 / OBSERVE',title:['A little wind.','A living stillness.'],intro:'一阵微风，一座悬浮的植物园。<br>轻轻拨动，让气味的想象开始流转。',instruction:'按住装置，左右拨动'},
 collect:{chapter:'02 / COMPOSE · 采集',title:['Gather what','speaks to you.'],intro:'摘下一枚植物，拖向玻璃瓶口。<br>选择 1–8 份，编织你的气味想象。',instruction:'拖至瓶口附近，植物会轻轻落入'},
 distilling:{chapter:'03 / DISTILL · 制香',title:['Gather what','speaks to you.'],intro:'原料浸润，玻璃慢慢温热。<br>沿着透明管道，凝结一份气味想象。',instruction:''},
 distilled:{chapter:'03 / DISTILL · 制香完成',title:['Gather what','speaks to you.'],intro:'最后一滴，在玻璃中停留。<br>你的组合已准备好，镜头将继续向右。',instruction:''},
 release:{chapter:'04 / RELEASE & ARCHIVE',title:['An invisible','connection.'],intro:'轻轻挤压气囊，让薄雾升起。<br>同时，一张气味人格卡缓缓出纸。',instruction:'挤压气囊 · 释放薄雾与卡片'}
};
function phase(p){
 releaseStation.generation++;
 clearArmed();cancelDrag();state.spin=null;state.distillPending=false;state.phase=p;$('#app').dataset.phase=p;
 $('#vessel-caption').inert=p!=='collect';$('#vessel-caption').setAttribute('aria-hidden',String(p!=='collect'));$('#mobile').inert=!['observe','collect'].includes(p);$('#collector').setAttribute('tabindex',p==='collect'?'0':'-1');$('#release-station').inert=p!=='release';
 const c=copy[p];$('#chapter').textContent=c.chapter;$('#title').innerHTML=embroideredText(c.title);$('#intro').innerHTML=innerWidth<=900&&p==='release'?'挤压气囊，让香气与人格卡一起出现。':c.intro;$('#instruction').textContent=innerWidth<=900&&p==='collect'?'拖入瓶口，或点选植物后再点采集瓶':c.instruction;
 $('#begin').hidden=p!=='observe';$('#distill').hidden=p!=='collect';$('#proceed').hidden=p!=='distilled';$('#restart').hidden=p!=='release';$('#back').hidden=p==='observe'||p==='collect'||p==='distilling';
 $('#back').textContent=p==='release'?'← 返回制香':'← 返回采集';
 $('#process-panel').hidden=p!=='distilling'&&p!=='distilled';$('#replay').hidden=p!=='distilled';$('#scent-result').hidden=true;
 const act=p==='observe'?1:p==='collect'?2:p==='release'?4:3;$('#progress').innerHTML=[1,2,3,4].map((n,i)=>(i?'<span></span>':'')+(n===act?'<b>0'+n+'</b>':'<i>0'+n+'</i>')).join('');
 $('#foot-sub').textContent=p==='release'?'闻香与出纸 · 一场气味的想象':'植物、器物，与不可见之物';
 if(p==='collect'||p==='observe'){distillation.reset();releaseStation.reset();printer.reset();$('#release-count').textContent='挤压气囊，让想象缓缓舒展。';}
 if(p==='release'){
  printer.prepare(state.selected.map(id=>botanicals[id].asset));
  const mask=state.selected.reduce((m,id)=>m|botanicals[id].channel,0);$('#scent-name').textContent=scentResults[mask]||'A Botanical Reverie';$('#scent-notes').textContent=state.selected.map(id=>botanicals[id].zh).join(' · ');
  document.querySelectorAll('.scent-port').forEach(port=>port.classList.remove('active'));
  const assets=state.selected.map(id=>botanicals[id].asset);
  selectedCard(assets).then(card=>{
   if(state.phase!=='release'||assets.join('|')!==state.selected.map(id=>botanicals[id].asset).join('|'))return;
   const actualMask=channelMask(card.channelKey);
   document.querySelectorAll('.scent-port').forEach((port,i)=>port.classList.toggle('active',!!(actualMask&(1<<i))));
  }).catch(error=>toast(error.message));
 }
 moveCamera(p==='release'?2850:2350);if(layout.small)window.scrollTo({top:0,behavior:'instant'});state.transition=true;clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>state.transition=false,reduced?20:2350);update();
}
function beginDistillation(){
 if(!state.selected.length){toast('先从风铃摘下一枚植物，拖入右侧瓶口，再开始制香。');$('#vessel-caption').classList.add('needs-specimen');setTimeout(()=>$('#vessel-caption').classList.remove('needs-specimen'),2200);return;}
 if(state.drag?.busy){toast('请等植物轻轻落入瓶中');return;}
 distillation.reset();phase('distilling');state.distillPending=true;$('#process-label').textContent='镜头正在移向制香台…';tone(.18);
}
$('#begin').onclick=()=>phase('collect');$('#distill').onclick=beginDistillation;$('#replay').onclick=beginDistillation;$('#proceed').onclick=()=>phase('release');$('#back').onclick=()=>phase(state.phase==='release'?'distilled':'collect');
$('#restart').onclick=()=>{state.selected=[];phase('collect');};
function renderActions(){
 const small=innerWidth<=900;
 if(state.initialized){const c=copy[state.phase];$('#instruction').textContent=small&&state.phase==='collect'?'拖入瓶口，或点选植物后再点采集瓶':c.instruction;$('#intro').innerHTML=small&&state.phase==='release'?'挤压气囊，让香气与人格卡一起出现。':c.intro;}
 $('#begin').innerHTML=(small?'开始采集':'开始采集 · BEGIN')+' <span>↗</span>';
 $('#proceed').innerHTML=(small?'进入闻香':'进入第四幕 · 闻香')+' <span>→</span>';
 $('#restart').innerHTML=(small?'再做一份':'再做一份 · COMPOSE AGAIN')+' <span>↺</span>';
 $('#distill').innerHTML=state.selected.length?(small?'开始制香 <span>→</span>':'开始制香 · DISTILL <span>→</span>'):(small?'先采集一枚植物 <span>↗</span>':'先采集植物 · 如何操作 <span>↗</span>');
}
function update(){
 $('#count').textContent=String(state.selected.length).padStart(2,'0')+' / 08 SPECIMENS';
 $('#distill').disabled=false;$('#distill').setAttribute('aria-disabled','false');$('#distill').classList.toggle('awaiting-specimen',!state.selected.length);
 renderActions();
 $('#undo').disabled=$('#clear').disabled=!state.selected.length;
 $('#bottle-plants').innerHTML=state.selected.map((id,i)=>{const b=botanicals[id],x=112+(i%3)*57,y=535-Math.floor(i/3)*47;return '<g class="bottle-item" style="animation-delay:'+(i===state.selected.length-1?'0s':'-2s')+'"><image href="'+b.asset+'" x="'+x+'" y="'+y+'" width="84" height="106" transform="rotate('+((i%2?1:-1)*(12+i*4))+' '+(x+42)+' '+(y+53)+')" opacity=".88"/></g>';}).join('');
}
$('#undo').onclick=()=>{clearArmed();cancelDrag();state.selected.pop();update();};$('#clear').onclick=()=>{clearArmed();cancelDrag();state.selected=[];update();};
phase('observe');state.transition=false;cameraMove=null;Object.assign(camera,target);

function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function mouth(){const r=$('#mouth-glow').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
function clearArmed(){state.armed=null;nodes.forEach(n=>{n.el.classList.remove('armed');n.el.setAttribute('aria-pressed','false');});}
function startDrag(e,id){clearArmed();if(state.selected.length>=8){toast('已采集 8 份 · 可先撤回或清空');return;}if(state.selected.includes(id))return;const b=botanicals[id],r=nodes[id].el.getBoundingClientRect(),el=new Image();el.src=b.asset;el.className='drag-plant';const width=Math.max(r.width,76);el.style.width=width+'px';el.style.height=width*1.25+'px';$('#drag-layer').append(el);nodes[id].el.classList.add('dragging');chime.disturb(b.strand,-.015);if(id===chime.perch)scare();state.drag={id,el,width,x:e.clientX,y:e.clientY,pointer:e.pointerId,origin:{x:r.left+r.width/2,y:r.top+r.height/2},busy:false,pointerType:e.pointerType,startX:e.clientX,startY:e.clientY};$('#specimen-label').innerHTML=`<strong>${b.name}</strong>${b.zh}<span>${b.notes}</span>`;$('#specimen-label').style.opacity=1;moveDrag(e);tone(.2);}
function moveDrag(e){const d=state.drag;if(!d||d.busy)return;d.x=e.clientX;d.y=e.clientY;d.el.style.transform=`translate(${d.x-d.width/2}px,${d.y-d.width*.55}px) rotate(-8deg)`;$('#specimen-label').style.left=Math.min(innerWidth-200,Math.max(12,d.x+d.width*.55))+'px';$('#specimen-label').style.top=Math.max(100,d.y-25)+'px';const m=mouth(),distance=Math.hypot((d.x-m.x)*.8,d.y-m.y);$('#mouth-glow').classList.toggle('active',distance<100);if(distance<Math.max(48,95*camera.scale))collect();}
async function collect(){const d=state.drag;if(!d||d.busy)return;d.busy=true;$('#specimen-label').style.opacity=0;const m=mouth();const animation=d.el.animate([{transform:d.el.style.transform,opacity:1},{transform:`translate(${m.x-d.width*.35}px,${m.y-d.width*.6}px) rotate(8deg) scale(.7)`,opacity:1,offset:.55},{transform:`translate(${m.x-d.width*.27}px,${m.y+150*camera.scale}px) rotate(20deg) scale(.5)`,opacity:.2}],{duration:reduced?1:650,easing:'cubic-bezier(.3,.05,.2,1)',fill:'forwards'});try{await animation.finished;}catch{}if(state.drag!==d)return;state.selected.push(d.id);if(layout.small)toast('已采集 '+botanicals[d.id].zh);d.el.remove();nodes[d.id].el.classList.remove('dragging');state.drag=null;$('#hand').classList.remove('grip');$('#mouth-glow').classList.remove('active');update();soundscape.collect();}
async function cancelDrag(){const d=state.drag;if(!d)return;state.drag=null;$('#specimen-label').style.opacity=0;$('#mouth-glow').classList.remove('active');$('#hand').classList.remove('grip');const r=nodes[d.id].el.getBoundingClientRect();const a=d.el.animate([{transform:d.el.style.transform,opacity:1},{transform:`translate(${r.left}px,${r.top}px) rotate(0deg) scale(.9)`,opacity:.4}],{duration:reduced?1:450,easing:'cubic-bezier(.25,.6,.3,1)'});try{await a.finished;}catch{}d.el.remove();nodes[d.id].el.classList.remove('dragging');chime.disturb(botanicals[d.id].strand,.012);}
$('#viewport').addEventListener('pointerdown',e=>{if(e.button!==0||state.transition||e.target.closest('#release-station,#card-printer'))return;e.preventDefault();if(layout.small&&state.phase==='collect'&&state.armed!=null&&e.target.closest('#collector')){const id=state.armed,m=mouth();startDrag(e,id);moveDrag({clientX:m.x,clientY:m.y});return;}const el=e.target.closest('.pendant');$('#viewport').setPointerCapture(e.pointerId);$('#hand').classList.add('grip');if(state.phase==='collect'&&el){startDrag(e,Number(el.dataset.id));}else if((state.phase==='observe'||state.phase==='collect')&&e.target.closest('#mobile')){tone(.35);state.spin={x:e.clientX,time:performance.now(),distance:0};}});
addEventListener('pointermove',e=>{
 const onScene=e.target.closest?.('#viewport');
 $('#hand').style.opacity=onScene&&e.pointerType==='mouse'?1:0;
 $('#hand').style.left=e.clientX+'px';$('#hand').style.top=e.clientY+'px';
 if(onScene&&e.pointerType==='mouse')document.body.classList.add('custom-cursor');
 const now=performance.now(),dx=lastPointer?e.clientX-lastPointer.x:0;
 if(state.drag)moveDrag(e);
 if(state.spin){chime.spin(e.clientX-state.spin.x);state.spin.x=e.clientX;state.spin.distance+=Math.abs(dx);}
 else if(onScene&&!state.drag&&!state.transition&&(state.phase==='observe'||state.phase==='collect')){
  const page=$('#app').getBoundingClientRect(),zoom=camera.mobileZoom,localX=320+((e.clientX-page.left-camera.x)/camera.scale-$('#mobile').offsetLeft-320)/zoom,localY=91+((e.clientY-page.top-camera.y)/camera.scale-$('#mobile').offsetTop+259*(zoom-1)-91)/zoom;
  let nearest=-1,distance=25;
  chime.strands.forEach((s,i)=>{const d=Math.abs(localX-s.x);if(d<distance&&localY>s.top&&localY<s.top+s.length){nearest=i;distance=d;}});
  if(nearest>=0&&Math.abs(dx)>1&&now-lastHover>160){chime.disturb(nearest,dx*.0003);lastHover=now;if(now-(state.lastTone||0)>600){tone(.22);state.lastTone=now;}}
 }
 $('#hand').classList.toggle('hovering',!!e.target.closest?.('.pendant'));
 lastPointer={x:e.clientX,y:e.clientY};
});
function release(e){if(state.drag&&!state.drag.busy){const d=state.drag,tap=layout.small&&e&&Math.hypot(d.x-d.startX,d.y-d.startY)<12;cancelDrag();if(tap){state.armed=d.id;nodes[d.id].el.classList.add('armed');nodes[d.id].el.setAttribute('aria-pressed','true');toast('已选 '+botanicals[d.id].zh+' · 再轻触采集瓶');}}if(state.spin&&state.spin.distance>10)tone(.35);state.spin=null;$('#hand').classList.remove('grip');}
addEventListener('pointerup',release);addEventListener('pointercancel',()=>{release();cancelDrag();});$('#viewport').addEventListener('lostpointercapture',()=>{if(state.drag&&!state.drag.busy)cancelDrag();state.spin=null;});addEventListener('blur',()=>{release();cancelDrag();$('#hand').style.opacity=0;});document.addEventListener('mouseleave',()=>{release();cancelDrag();$('#hand').style.opacity=0;});addEventListener('keydown',e=>{if(e.key==='Escape'){release();cancelDrag();}if((e.key==='Enter'||e.key===' ')&&document.activeElement.classList.contains('pendant')){e.preventDefault();if(state.phase!=='collect'){toast('请先进入植物采集阶段');return;}const id=Number(document.activeElement.dataset.id);if(state.selected.includes(id))return;if(state.selected.length>=8){toast('最多采集 8 份');return;}state.selected.push(id);update();soundscape.collect();}});


window.botanicalStudy={getState:()=>({version:'v10-dream',phase:state.phase,selected:[...state.selected],combination:state.selected.reduce((m,id)=>m|botanicals[id].channel,0),camera:{...camera},printing:printer.phase,distillation:distillation.progress,music:soundscape.enabled})};


