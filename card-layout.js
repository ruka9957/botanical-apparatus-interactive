// All coordinates are in the V4 1086×1448 design canvas. No viewport inputs.
const STEP=4,GAP=12,MIN_LONG_EDGE=64;
const footprints=new WeakMap();
export function randomFrom(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function maskData(image){const c=canvas(image.width,image.height),x=c.getContext('2d',{willReadFrequently:true});x.drawImage(image,0,0);return x.getImageData(0,0,c.width,c.height).data;}
export function prepareMasks(images,width,height){
 const allowed=maskData(images.allowed),protect=maskData(images.protect),ink=maskData(images.ink),cols=Math.ceil(width/STEP),rows=Math.ceil(height/STEP),ok=new Uint8Array(cols*rows),title=new Float32Array(cols*rows);let totalInk=0;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const gx=x*STEP,gy=y*STEP;let safe=true,sum=0;
  for(let dy=-2;dy<=STEP+1;dy+=2)for(let dx=-2;dx<=STEP+1;dx+=2){const px=gx+dx,py=gy+dy;if(px<0||py<0||px>=width||py>=height){safe=false;continue;}const k=(py*width+px)*4;if(allowed[k]<128||protect[k]>20)safe=false;}
  for(let dy=0;dy<STEP&&gy+dy<height;dy++)for(let dx=0;dx<STEP&&gx+dx<width;dx++)sum+=ink[((gy+dy)*width+gx+dx)*4]/255;
  const k=y*cols+x;ok[k]=safe?1:0;title[k]=sum;totalInk+=sum;
 }
 return {allowed,protect,ink,ok,title,totalInk,cols,rows,width,height};
}
function footprint(plant,w,h,rotation,step=STEP){
 let cache=footprints.get(plant);if(!cache){cache=new Map();footprints.set(plant,cache);}const key=[w.toFixed(2),h.toFixed(2),rotation.toFixed(2),step].join(':');if(cache.has(key))return cache.get(key);
 const r=rotation*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r));
 const cw=Math.ceil((w*c+h*s)/step)+4,ch=Math.ceil((h*c+w*s)/step)+4,cv=canvas(cw,ch),ctx=cv.getContext('2d',{willReadFrequently:true});
 ctx.translate(cw/2,ch/2);ctx.rotate(r);const [l,t,right,bottom]=plant.cropBox;ctx.drawImage(plant.image,l,t,right-l,bottom-t,-w/(2*step),-h/(2*step),w/step,h/step);
 const pixels=ctx.getImageData(0,0,cw,ch).data,points=[];
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[(y*cw+x)*4+3]>=30)points.push([x,y]);
 const result={points,cw,ch};cache.set(key,result);return result;
}
function placement(plant,centerX,centerY,width,height,rotationDeg){return {plantId:plant.id,cropBox:[...plant.cropBox],centerX,centerY,width,height,rotationDeg,opacity:1};}
function propose(plant,p,masks,occupied){
 const f=footprint(plant,p.width,p.height,p.rotationDeg),ox=Math.round(p.centerX/STEP-f.cw/2),oy=Math.round(p.centerY/STEP-f.ch/2);let overlapInk=0;
 for(const [x,y] of f.points){const xx=ox+x,yy=oy+y,k=yy*masks.cols+xx;if(xx<0||yy<0||xx>=masks.cols||yy>=masks.rows||!masks.ok[k]||occupied[k])return null;overlapInk+=masks.title[k];}
 // Quantize centers exactly as used by coarse silhouette rasterization.
 return {p:{...p,centerX:(ox+f.cw/2)*STEP,centerY:(oy+f.ch/2)*STEP},f,ox,oy,overlapInk};
}
function occupy(hit,masks,occupied){
 const radius=Math.ceil(GAP/STEP);
 for(const [x,y] of hit.f.points){const xx=hit.ox+x,yy=hit.oy+y;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(dx*dx+dy*dy<=radius*radius){const gx=xx+dx,gy=yy+dy;if(gx>=0&&gy>=0&&gx<masks.cols&&gy<masks.rows)occupied[gy*masks.cols+gx]=1;}}
}
function ordered(plants,template,masks,seed){
 const a=template.plantArea,counts=template.futurePlantOrder.rowsByCount[String(plants.length)],rng=randomFrom(seed),gap=GAP,pad=9,rowH=(a.height-pad*2-gap*(counts.length-1))/counts.length;
 // Smaller retries preserve every item, order and the minimum visible size.
 for(const factor of [1,.96,.92,.88]){
  const occupied=new Uint8Array(masks.cols*masks.rows),result=[];let index=0,valid=true;
  for(let row=0;row<counts.length&&valid;row++){
   const n=counts[row],cellW=(a.width-pad*2-gap*(n-1))/n;
   for(let col=0;col<n;col++){
    const plant=plants[index++],[l,t,r,b]=plant.cropBox,pw=r-l,ph=b-t;
    let angle=(rng()-.5)*5;const rad=angle*Math.PI/180;let scale=Math.min(cellW/(pw*Math.abs(Math.cos(rad))+ph*Math.abs(Math.sin(rad))),rowH/(ph*Math.abs(Math.cos(rad))+pw*Math.abs(Math.sin(rad))))*.94*factor;
    if(Math.max(pw,ph)*scale<MIN_LONG_EDGE){angle=0;scale=Math.min(cellW/pw,rowH/ph)*.98*factor;}
    if(Math.max(pw,ph)*scale<MIN_LONG_EDGE){valid=false;break;}
    const hit=propose(plant,placement(plant,a.x+pad+cellW/2+col*(cellW+gap),a.y+pad+rowH/2+row*(rowH+gap),pw*scale,ph*scale,angle),masks,occupied);
    if(!hit){valid=false;break;}occupy(hit,masks,occupied);result.push(hit.p);
   }
  }
  if(valid)return result;
 }
 return null;
}
function fineValidate(layout,plantById,masks){
 const occupied=new Uint8Array(masks.width*masks.height);let title=0;
 for(const p of layout){
  const f=footprint(plantById.get(p.plantId),p.width,p.height,p.rotationDeg,1),ox=Math.round(p.centerX-f.cw/2),oy=Math.round(p.centerY-f.ch/2);
  for(const [x,y] of f.points){const xx=ox+x,yy=oy+y,k=yy*masks.width+xx;if(xx<0||yy<0||xx>=masks.width||yy>=masks.height||masks.allowed[k*4]<128||masks.protect[k*4]>20||occupied[k])return false;occupied[k]=1;title+=masks.ink[k*4]/255;}
 }
 return title/Math.max(1,masks.totalInk)<=.1;
}
const yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,0));
export async function generatePlantLayout({plants,template,masks,seed}){
 const byId=new Map(plants.map(p=>[p.id,p]));
 if(template.compositionMode==='ordered_reserved'){
  for(let n=0;n<12;n++){const result=ordered(plants,template,masks,seed+'-ordered-'+n);if(result&&fineValidate(result,byId,masks))return result;}
 }else{
  const a=template.plantArea,rng=randomFrom(seed),rank=plants.map((p,i)=>({p,i})).sort((a,b)=>(a.p.layoutRole==='Hero'?-2:0)-(b.p.layoutRole==='Hero'?-2:0)||a.i-b.i);let best=null,bestScore=Infinity;
  for(let candidate=0;candidate<88;candidate++){
   const occupied=new Uint8Array(masks.cols*masks.rows),result=[];let ink=0,score=0,failed=false;
   const sizeFactor=Math.max(.5,1-Math.floor(candidate/11)*.09);
   for(let n=0;n<rank.length;n++){
    const plant=rank[n].p,[l,t,r,b]=plant.cropBox,aspect=(r-l)/(b-t);
    const target=Math.min(310,Math.sqrt(a.width*a.height/plants.length)*(.80+(n===0?.17:0)))*sizeFactor*(.94+rng()*.1);
    let w=aspect>=1?target:target*aspect,h=aspect>=1?target/aspect:target;const fit=Math.min(1,(a.width-20)/w,(a.height-20)/h);w*=fit;h*=fit;
    if(Math.max(w,h)<MIN_LONG_EDGE){failed=true;break;}
    let chosen=null,localBest=Infinity;
    for(let attempt=0;attempt<85;attempt++){
     const angle=[-12,-6,0,6,12][Math.floor(rng()*5)],rad=angle*Math.PI/180,ew=Math.abs(w*Math.cos(rad))+Math.abs(h*Math.sin(rad)),eh=Math.abs(h*Math.cos(rad))+Math.abs(w*Math.sin(rad));
     if(ew>a.width-12||eh>a.height-12)continue;
     const cx=a.x+ew/2+6+rng()*(a.width-ew-12),cy=a.y+eh/2+6+rng()*(a.height-eh-12);
     const hit=propose(plant,placement(plant,cx,cy,w,h,angle),masks,occupied);if(!hit||((ink+hit.overlapInk)/Math.max(1,masks.totalInk))>.085)continue;
     const balance=((cx-a.x-a.width/2)/a.width)**2+((cy-a.y-a.height/2)/a.height)**2,quality=hit.overlapInk/Math.max(1,masks.totalInk)*18+balance;
     if(quality<localBest){chosen=hit;localBest=quality;}if(attempt>12&&chosen)break;
    }
    if(!chosen){failed=true;break;}ink+=chosen.overlapInk;score+=localBest;occupy(chosen,masks,occupied);result.push(chosen.p);
   }
   if(!failed&&fineValidate(result,byId,masks)){
    score+=Math.floor(candidate/11)*.3;if(score<bestScore){best=result;bestScore=score;}
    if(candidate>=9)break;
   }
   if(candidate%4===3)await yieldFrame();
  }
  if(best)return best;
 }
 throw Object.assign(new Error('这组植物暂未找到清晰的卡面排布，请重试出卡或重新采集。'),{code:'LAYOUT_UNRESOLVED'});
}
