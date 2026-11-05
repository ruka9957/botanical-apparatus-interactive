export const DURATION=12000;
export const PROCESS=[
 {from:0,to:.22,label:'01 / 浸润 · 原料在玻璃中舒展'},
 {from:.22,to:.46,label:'02 / 提取 · 温柔加热，气泡升起'},
 {from:.46,to:.78,label:'03 / 冷凝 · 沿着玻璃，缓缓流动'},
 {from:.78,to:1.01,label:'04 / 凝结 · 一滴气味的想象'}
];
export class Distillation{
 constructor(){this.running=false;this.progress=0;this.started=0;this.paths=[...document.querySelectorAll('.process-route')];this.paths.forEach(p=>p.dataset.length=p.getTotalLength());}
 start(now,combination){this.started=now;this.running=true;this.progress=0;this.paint(0);
 const colors=['#b4aa90','#b59cad','#aaab93','#b59d85'];
 this.color=colors[Math.max(0,Math.floor(Math.log2(combination||1)))%4];document.querySelector('#apparatus').style.setProperty('--essence',this.color);
 document.querySelector('#apparatus').classList.add('is-distilling');}
 reset(){this.running=false;this.progress=0;this.paint(0);document.querySelector('#apparatus').classList.remove('is-distilling');}
 frame(now,reduced=false){if(!this.running)return false;this.progress=Math.min(1,(now-this.started)/DURATION);this.paint(this.progress,reduced);if(this.progress>=1){this.running=false;document.querySelector('#apparatus').classList.remove('is-distilling');return true;}return false;}
 paint(p,reduced=false){
 const app=document.querySelector('#app');app.style.setProperty('--process',p);
 document.querySelector('#distill-progress').value=p;
 const stage=PROCESS.find(s=>p>=s.from&&p<s.to)||PROCESS[3];document.querySelector('#process-label').textContent=p>=1?'制香完成 · 进入第三幕，释放你的气味想象':stage.label;
 document.querySelector('#process-time').textContent=String(Math.min(12,Math.floor(p*12))).padStart(2,'0')+' / 12 SEC';
 const plants=document.querySelector('#bottle-plants');plants.style.opacity=p>.1?Math.max(.12,1-(p-.1)*2.3):1;plants.style.transform='translateY('+(p*12)+'px)';
 document.querySelector('#essence-pool').style.opacity=p>.02?.38:0;document.querySelector('#essence-pool').style.transform='translateY('+(20*(1-Math.min(1,p*3)))+'px)';
 this.paths.forEach((path,i)=>{const q=Math.max(0,Math.min(1,(p-[.15,.38,.56][i])/[.3,.33,.32][i])),len=Number(path.dataset.length);path.style.strokeDasharray=len;path.style.strokeDashoffset=len*(1-q);path.style.opacity=q>0?(reduced?.5:.6):0;});
 document.querySelector('#heat-halo').style.opacity=p>.18&&p<.85?(reduced?.15:.22):0;
 document.querySelector('#bubbles').style.opacity=p>.22&&p<.79?(reduced?.25:.8):0;
 document.querySelector('#receiver-liquid').style.opacity=p>.7?.62:0;
 document.querySelector('#receiver-liquid').style.transform='translateY('+(15*(1-Math.max(0,(p-.7)/.3)))+'px)';
 document.querySelector('#falling-drop').style.opacity=p>.77&&p<.99?1:0;
 }
}
