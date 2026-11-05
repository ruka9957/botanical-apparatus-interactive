import {composeChimeCard} from './card-composer.js';
export const CARD_COLOR='#e5dfe8';

export class CardPrinter{
 constructor(reduced){
  this.reduced=reduced;
  this.phase='idle';
  this.sheet=document.querySelector('#card-sheet');
  this.unit=document.querySelector('#card-printer');
  this.status=document.querySelector('#print-status');
  this.download=document.querySelector('#download-card');
  this.retry=document.querySelector('#retry-card');
  this.run=0;
  this.download.addEventListener('click',()=>this.save());
  this.retry.addEventListener('click',()=>this.print(this.currentAssets));

  // Pre-compose during the existing distillation scene, without changing app.js.
  // #bottle-plants is updated synchronously by app.js in selection order.
  document.querySelector('#distill')?.addEventListener('click',()=>{
   const assets=[...document.querySelectorAll('#bottle-plants image')]
    .map(image=>image.getAttribute('href')).filter(Boolean);
   if(assets.length)this.prepare(assets).catch(()=>{});
  });
 }
 prepare(assets){
  if(!assets?.length)return Promise.reject(new Error('请先采集植物，再生成卡片。'));
  const key=JSON.stringify(assets);
  if(this.selectionKey===key&&this.preparation)return this.preparation;
  this.currentAssets=[...assets];
  this.selectionKey=key;
  this.preparation=composeChimeCard(assets);
  this.preparation.catch(()=>{});
  return this.preparation;
 }
 async print(assets){
  if(this.phase!=='idle')return;
  const run=++this.run;
  this.phase='preparing';
  this.unit.dataset.state='printing';
  this.status.textContent='正在准备卡片素材，请稍候…';
  this.download.hidden=true;
  this.retry.hidden=true;
  let result;
  try{result=await this.prepare(assets);}catch(e){
   if(run!==this.run)return;
   this.phase='idle';
   this.unit.dataset.state='idle';
   this.selectionKey=null;
   this.preparation=null;
   this.status.textContent=e.message||'卡片暂未生成，请重新生成。';
   this.retry.hidden=false;
   return;
  }
  if(run!==this.run)return;
  this.result=result;
  this.phase='printing';
  // The original paper window, card proportions, animation, and download stay intact.
  this.sheet.style.height='auto';
  this.sheet.style.aspectRatio='3 / 4';
  this.sheet.style.backgroundImage=`url("${result.url}")`;
  this.sheet.style.backgroundSize='100% 100%';
  this.sheet.setAttribute('aria-label',result.card.personaName+' · '+result.card.personaTitle);
  this.sheet.dataset.persona=String(result.card.personaId);
  this.sheet.dataset.template=result.card.templateId;
  this.sheet.dataset.channels=result.card.channelKey;
  this.sheet.dataset.plants=result.card.selectedPlantIds.join(',');
  this.sheet.dataset.exportSize=result.width+'x'+result.height;
  this.status.textContent='卡片正在出纸…';
  this.animation=this.sheet.animate([
   {transform:'translateY(-101%) rotateX(5deg)',filter:'brightness(.89)'},
   {transform:'translateY(-99%) rotateX(3deg)',filter:'brightness(.94)',offset:.07},
   {transform:'translateY(-16%) rotateX(1deg)',filter:'brightness(.99)',offset:.83},
   {transform:'translateY(0) rotateX(0)',filter:'brightness(1)'}
  ],{duration:this.reduced?900:5900,easing:'cubic-bezier(.24,.08,.18,1)',fill:'forwards'});
  try{await this.animation.finished;}catch{return;}
  if(run!==this.run)return;
  this.phase='ready';
  this.unit.dataset.state='ready';
  this.status.textContent='你的香型人格卡已出纸';
  this.download.hidden=false;
  if(innerWidth<=900)this.unit.scrollIntoView({block:'center',behavior:this.reduced?'instant':'smooth'});
 }
 save(){
  if(this.phase!=='ready'||!this.result)return;
  const a=document.createElement('a');
  a.href=this.result.url;
  a.download='Botanical-Scent-'+this.result.card.channelKey+'-'+String(this.result.card.personaId).padStart(2,'0')+'.png';
  a.click();
 }
 reset(){
  this.run++;
  this.animation?.cancel();
  this.phase='idle';
  this.selectionKey=null;
  this.preparation=null;
  this.currentAssets=null;
  this.unit.dataset.state='idle';
  this.download.hidden=true;
  this.retry.hidden=true;
  this.status.textContent='挤压气囊，卡片将缓缓出纸';
  this.result=null;
  this.sheet.style.backgroundImage='';
  for(const key of ['persona','template','channels','plants','exportSize'])delete this.sheet.dataset[key];
  this.sheet.setAttribute('aria-label','香型人格卡纸');
 }
}
export function printerMarkup(){return `<section id="card-printer" aria-label="香型人格卡出纸装置" data-state="idle">
 <div class="printer-label">SCENT PORTRAIT<span>香型人格卡</span></div>
 <div class="printer-face"></div><div class="printer-cavity"></div>
 <div class="paper-window"><div id="card-sheet" class="card-sheet" role="img" aria-label="香型人格卡纸"></div></div>
 <div class="printer-upper-lip"></div><div class="printer-lower-lip"></div>
 <div class="printer-caption"><span id="print-status" role="status" aria-live="polite">挤压气囊，卡片将缓缓出纸</span><button id="retry-card" type="button" hidden style="display:block;pointer-events:auto;font-size:16px;letter-spacing:1px;margin:16px auto 0;padding:11px 9px;border-bottom:1px solid #b0a7ba;color:#8c7a9a;min-width:275px">重新生成卡片 · RETRY</button><button id="download-card" hidden>保存卡片 · DOWNLOAD PNG <span>↓</span></button></div>
 </section>`;}
