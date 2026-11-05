import {resolveScentCard} from './resolve-scent-card.js';
import {cardPlantIds,extraPlant} from './card-selection.js';
import {prepareMasks,generatePlantLayout} from './card-layout.js';

const base=new URL('./scent-card-assets/',import.meta.url),images=new Map(),cards=new Map(),maskCache=new Map();
let rulesPromise;

// GitHub Pages assets can be slow to arrive. Never keep a rejected image promise
// cached: a subsequent print attempt must be allowed to fetch it again.
function loadImage(path){
 const url=new URL(path,base).href;
 if(images.has(url))return images.get(url);
 const p=new Promise((resolve,reject)=>{
  const image=new Image();
  image.decoding='async';
  image.fetchPriority='high';
  let settled=false;
  const finish=(error)=>{
   if(settled)return;
   settled=true;
   clearTimeout(timer);
   image.onload=null;
   image.onerror=null;
   if(error)reject(error);
   else resolve(image);
  };
  const timer=setTimeout(()=>finish(Object.assign(new Error('卡片素材下载超时，请检查网络后重新生成。'),{code:'ASSET_LOAD_FAILED',url})),60000);
  image.onload=()=>finish();
  image.onerror=()=>finish(Object.assign(new Error('卡片素材加载失败，请重新生成。'),{code:'ASSET_LOAD_FAILED',url}));
  image.src=url;
 });
 images.set(url,p);
 p.catch(()=>{if(images.get(url)===p)images.delete(url);});
 return p;
}

export function loadCardRules(){
 if(!rulesPromise)rulesPromise=fetch(new URL('scent-card-rules-v4.json',base))
  .then(r=>{if(!r.ok)throw new Error('卡片规则未能加载。');return r.json();})
  .then(r=>({...r,plants:[...r.plants,{...extraPlant}]}))
  .catch(e=>{rulesPromise=null;throw e;});
 return rulesPromise;
}
function alphaBounds(image){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
 const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(image,0,0);
 const d=x.getImageData(0,0,c.width,c.height).data;
 let l=c.width,t=c.height,r=0,b=0;
 for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++)if(d[(y*c.width+xx)*4+3]>=8){l=Math.min(l,xx);t=Math.min(t,y);r=Math.max(r,xx+1);b=Math.max(b,y+1);}
 if(r<=l||b<=t)throw new Error('植物图片没有可见内容。');
 return [l,t,r,b];
}
async function masksFor(template,rules){
 if(maskCache.has(template.id))return maskCache.get(template.id);
 const [allowed,protect,ink]=await Promise.all([
  loadImage(template.plantAllowedMaskPath),
  loadImage(template.smallTextProtectionPath),
  loadImage(template.textInkMaskPath)
 ]);
 const masks=prepareMasks({allowed,protect,ink},rules.canvas.width,rules.canvas.height);
 maskCache.set(template.id,masks);
 if(maskCache.size>3)maskCache.delete(maskCache.keys().next().value);
 return masks;
}
export function renderScentCard({rules,background,text,plants,layout,scale=2}){
 const canvas=document.createElement('canvas');
 canvas.width=rules.canvas.width*scale;canvas.height=rules.canvas.height*scale;
 const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(background,0,0,rules.canvas.width,rules.canvas.height);
 const byId=new Map(plants.map(p=>[p.id,p]));
 for(const p of layout){
  const plant=byId.get(p.plantId),[l,t,r,b]=p.cropBox;
  ctx.save();ctx.translate(p.centerX,p.centerY);ctx.rotate(p.rotationDeg*Math.PI/180);
  ctx.drawImage(plant.image,l,t,r-l,b-t,-p.width/2,-p.height/2,p.width,p.height);ctx.restore();
 }
 ctx.drawImage(text,0,0,rules.canvas.width,rules.canvas.height);
 return canvas;
}
export async function composeScentCard(plantIds,{seed,allowSingle=true}={}){
 const rules=await loadCardRules(),ids=[...new Set(plantIds)];
 // Preserve the project's existing 1–8 specimen selection.
 const card=resolveScentCard(ids,rules,{allowSingleForDebug:allowSingle,seed:seed||`${rules.designVersion}:${ids.join(',')}`});
 const key=JSON.stringify([card.selectedPlantIds,card.seed]);
 if(cards.has(key))return cards.get(key);
 const pending=(async()=>{
  const template=rules.templates.find(t=>t.id===card.templateId);
  const [background,text,plants,masks]=await Promise.all([
   loadImage(template.backgroundPath),
   loadImage(template.textLayerPath),
   Promise.all(ids.map(async id=>{
    const p=rules.plants.find(p=>p.id===id),image=await loadImage(p.assetPath);
    return {...p,image,cropBox:p.cropBox||alphaBounds(image)};
   })),
   masksFor(template,rules)
  ]);
  const layout=await generatePlantLayout({plants,template,masks,seed:card.seed});
  const canvas=renderScentCard({rules,background,text,plants,layout,scale:2});
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('卡片图片合成失败，请重试。')),'image/png'));
  return {card,layout,blob,url:URL.createObjectURL(blob),width:canvas.width,height:canvas.height,layoutVersion:'v4-silhouette-1'};
 })();
 cards.set(key,pending);
 pending.catch(()=>{if(cards.get(key)===pending)cards.delete(key);});
 if(cards.size>4){
  const oldest=cards.keys().next().value,entry=cards.get(oldest);
  cards.delete(oldest);
  entry.then(r=>URL.revokeObjectURL(r.url)).catch(()=>{});
 }
 return pending;
}
export function composeChimeCard(assets){return composeScentCard(cardPlantIds(assets));}
