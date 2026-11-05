export const DURATION=16000;
export const PROCESS=[
 {from:0,to:.22,label:'01 / 浸润 · 植物舒展，气味慢慢溶出'},
 {from:.22,to:.46,label:'02 / 提取 · 玻璃温热，细密气泡升起'},
 {from:.46,to:.78,label:'03 / 冷凝 · 蒸汽在盘管中凝成液珠'},
 {from:.78,to:1.01,label:'04 / 凝结 · 滴落、泛起涟漪，留下一份气味'}];
const clamp=x=>Math.max(0,Math.min(1,x));
const $=s=>document.querySelector(s);
export class Distillation{
 constructor(){this.running=false;this.progress=0;this.paths=[...document.querySelectorAll('.process-route')];this.lengths=this.paths.map(p=>p.getTotalLength());this.beads=[...document.querySelectorAll('.flow-bead')];this.bubbles=[...document.querySelectorAll('.process-bubble')];this.wisps=[...document.querySelectorAll('.steam-wisp')];}
 refresh(){this.lengths=this.paths.map(p=>p.getTotalLength());}
 start(now,combination){this.started=now;this.running=true;this.progress=0;const colors=['#a29a77','#b18b9f','#91a394','#b39a7d'];this.color=colors[Math.max(0,Math.floor(Math.log2(combination||1)))%4];$('#apparatus').style.setProperty('--essence',this.color);$('#apparatus').classList.add('is-distilling');this.paint(0);}
 reset(){this.running=false;this.progress=0;this.paint(0);$('#apparatus').classList.remove('is-distilling');}
 frame(now,reduced=false){if(!this.running)return false;this.progress=Math.min(1,(now-this.started)/DURATION);this.paint(this.progress,reduced);if(this.progress>=1){this.running=false;$('#apparatus').classList.remove('is-distilling');return true;}return false;}
 paint(p,reduced=false){
  const seconds=p*16,active=this.running&&p<1;
  $('#app').style.setProperty('--process',p);$('#distill-progress').value=p;
  const stage=PROCESS.find(s=>p>=s.from&&p<s.to)||PROCESS[3];$('#process-label').textContent=p>=1?'制香完成 · 进入第四幕，释放你的气味想象':stage.label;$('#process-time').textContent=String(Math.min(16,Math.floor(seconds))).padStart(2,'0')+' / 16 SEC';
  document.querySelectorAll('.process-stages span').forEach((s,i)=>s.classList.toggle('active',stage===PROCESS[i]));
  $('#bottle-plants').style.opacity=p>.1?Math.max(.2,1-(p-.1)*2):1;$('#bottle-plants').style.transform=`translateY(${p*12}px)`;$('#essence-pool').style.opacity=p>.015?.65:0;
  const heat=active&&p>.19&&p<.8;$('#heat-halo').style.opacity=heat?.55+Math.sin(seconds*2)*.10:0;$('#heater-ring').style.opacity=heat?.7:.25;$('#extract-liquid').style.opacity=p>.14?.8:0;
  $('#extract-liquid').setAttribute('d',`M570 ${545+Math.sin(seconds*3)*3}Q626 ${535+Math.sin(seconds*3+1)*3} 689 545T811 544V641H570Z`);
  $('#bubbles').style.opacity=heat?1:0;this.bubbles.forEach((b,i)=>{const q=(seconds*(.35+i%4*.035)+i*.149)%1;b.setAttribute('cy',608-q*(100+i%3*18));b.setAttribute('cx',612+i%6*28+Math.sin(q*6+i)*6);b.style.opacity=heat?Math.sin(q*Math.PI)*.75:0;b.setAttribute('r',(2.3+i%4)*(.6+q*.6));});
  $('#steam-plumes').style.opacity=active&&p>.27&&p<.73?.7:0;this.wisps.forEach((w,i)=>{const q=(seconds*.38+i*.25)%1;w.style.transform=`translate(${Math.sin(seconds+i)*5}px,${-q*30}px)`;w.style.opacity=Math.sin(q*Math.PI)*.65;});
  this.paths.forEach((path,i)=>{const q=clamp((p-[.025,.26,.45][i])/[.25,.26,.36][i]);path.style.strokeDasharray=this.lengths[i];path.style.strokeDashoffset=this.lengths[i]*(1-q);path.style.opacity=q>0?.22:0;});
  this.beads.forEach(bead=>{const r=Number(bead.dataset.route),i=Number(bead.dataset.seed),start=[.025,.26,.45][r],end=[.32,.65,.93][r],on=active&&p>start&&p<end,q=((seconds-[.4,4.1,7.2][r])/[2.5,2.1,4][r]+i/8)%1,point=this.paths[r].getPointAtLength(clamp(q)*this.lengths[r]);bead.setAttribute('cx',point.x+(r?Number($('#glass-extension').dataset.shift||0):0));bead.setAttribute('cy',point.y);bead.style.opacity=on?(reduced?.45:.85):0;});
  const fill=clamp((p-.76)/.24);$('#receiver-liquid').style.opacity=fill>0?.9:0;$('#receiver-liquid').style.transform=`translateY(${55*(1-fill)}px)`;const dropping=active&&p>.76,q=(seconds*1.6)%1;
  $('#falling-drop').style.opacity=dropping?Math.min(1,q*5):0;$('#falling-drop').style.transform=`translateY(${Math.max(0,(q-.25)/.75)**2*(57+55*(1-fill))}px)`;
  const ripple=$('#drop-ripple');ripple.setAttribute('cy',591+55*(1-fill));ripple.setAttribute('rx',3+q*31);ripple.setAttribute('ry',1+q*4);ripple.style.opacity=dropping?(1-q)*.65:0;
 }
}

