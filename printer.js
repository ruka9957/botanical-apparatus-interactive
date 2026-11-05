import {composeChimeCard} from './card-composer.js';
export const CARD_COLOR='#e5dfe8';
export class CardPrinter{
 constructor(reduced){
  this.reduced=reduced;this.phase='idle';this.sheet=document.querySelector('#card-sheet');this.unit=document.querySelector('#card-printer');this.status=document.querySelector('#print-status');this.download=document.querySelector('#download-card');this.run=0;
  this.download.addEventListener('click',()=>this.save());
 }
 prepare(assets){
  const key=JSON.stringify(assets);if(this.selectionKey===key&&this.preparation)return this.preparation;
  this.selectionKey=key;this.preparation=composeChimeCard(assets);this.preparation.catch(()=>{});return this.preparation;
 }
 async print(assets){
  if(this.phase!=='idle')return;const run=++this.run;this.phase='preparing';this.unit.dataset.state='printing';this.status.textContent='正在出纸，请稍候…';this.download.hidden=true;
  let result;try{result=await this.prepare(assets);}catch(e){if(run!==this.run)return;this.phase='idle';this.unit.dataset.state='idle';this.selectionKey=null;this.preparation=null;this.status.textContent=e.message||'卡片暂未生成，请再次挤压气囊重试。';return;}
  if(run!==this.run)return;this.result=result;this.phase='printing';
  // Only the emitted paper changes aspect ratio; the slot, camera, captions and controls stay put.
  this.sheet.style.height='auto';this.sheet.style.aspectRatio='3 / 4';this.sheet.style.backgroundImage=`url("${result.url}")`;this.sheet.style.backgroundSize='100% 100%';
  this.sheet.setAttribute('aria-label',result.card.personaName+' · '+result.card.personaTitle);
  this.sheet.dataset.persona=String(result.card.personaId);this.sheet.dataset.template=result.card.templateId;this.sheet.dataset.channels=result.card.channelKey;this.sheet.dataset.plants=result.card.selectedPlantIds.join(',');this.sheet.dataset.exportSize=result.width+'x'+result.height;
  this.animation=this.sheet.animate([{transform:'translateY(-101%) rotateX(5deg)',filter:'brightness(.89)'},{transform:'translateY(-99%) rotateX(3deg)',filter:'brightness(.94)',offset:.07},{transform:'translateY(-16%) rotateX(1deg)',filter:'brightness(.99)',offset:.83},{transform:'translateY(0) rotateX(0)',filter:'brightness(1)'}],{duration:this.reduced?900:5900,easing:'cubic-bezier(.24,.08,.18,1)',fill:'forwards'});
  try{await this.animation.finished;}catch{return;}if(run!==this.run)return;
  this.phase='ready';this.unit.dataset.state='ready';this.status.textContent='你的香型人格卡已出纸';this.download.hidden=false;
  if(innerWidth<=900)this.unit.scrollIntoView({block:'center',behavior:this.reduced?'instant':'smooth'});
 }
 save(){
  if(this.phase!=='ready'||!this.result)return;
  const a=document.createElement('a');a.href=this.result.url;a.download='Botanical-Scent-'+this.result.card.channelKey+'-'+String(this.result.card.personaId).padStart(2,'0')+'.png';a.click();
 }
 reset(){this.run++;this.animation?.cancel();this.phase='idle';this.unit.dataset.state='idle';this.download.hidden=true;this.status.textContent='挤压气囊，卡片将缓缓出纸';this.result=null;this.sheet.style.backgroundImage='';for(const key of ['persona','template','channels','plants','exportSize'])delete this.sheet.dataset[key];this.sheet.setAttribute('aria-label','香型人格卡纸');}
}
export function printerMarkup(){return `<section id="card-printer" aria-label="香型人格卡出纸装置" data-state="idle">
 <div class="printer-label">SCENT PORTRAIT<span>香型人格卡</span></div>
 <div class="printer-face"></div><div class="printer-cavity"></div>
 <div class="paper-window"><div id="card-sheet" class="card-sheet" role="img" aria-label="香型人格卡纸"></div></div>
 <div class="printer-upper-lip"></div><div class="printer-lower-lip"></div>
 <div class="printer-caption"><span id="print-status" role="status" aria-live="polite">挤压气囊，卡片将缓缓出纸</span><button id="download-card" hidden>保存卡片 · DOWNLOAD PNG <span>↓</span></button></div>
 </section>`;}
