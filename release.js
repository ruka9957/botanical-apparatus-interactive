export class ScentRelease{
 constructor(onRelease,sound,reduced,beforeRelease=null,onError=()=>{}){this.beforeRelease=beforeRelease;this.onError=onError;this.pending=false;this.generation=0;this.count=0;this.reduced=reduced;this.sound=sound;this.onRelease=onRelease;this.button=document.querySelector('#squeeze-bulb');this.station=document.querySelector('#release-station');this.last=-1000;
 const down=e=>{e.stopPropagation();if(document.querySelector('#app').dataset.phase!=='release')return;if(e.pointerId!=null)this.button.setPointerCapture(e.pointerId);this.station.classList.add('pressed');};
 const up=()=>{if(!this.station.classList.contains('pressed'))return;this.station.classList.remove('pressed');this.release();};
 this.button.addEventListener('pointerdown',down);this.button.addEventListener('pointerup',up);this.button.addEventListener('pointercancel',()=>this.station.classList.remove('pressed'));
 this.button.addEventListener('lostpointercapture',()=>this.station.classList.remove('pressed'));
 this.button.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat&&document.querySelector('#app').dataset.phase==='release'){e.preventDefault();this.station.classList.add('pressed');}});
 this.button.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();up();}});
 addEventListener('blur',()=>this.station.classList.remove('pressed'));
 }
 async release(){const now=performance.now();if(this.pending||now-this.last<600||document.querySelector('#app').dataset.phase!=='release')return;this.last=now;this.pending=true;const generation=this.generation;
 try{
 const active=this.beforeRelease?await this.beforeRelease():(window.botanicalStudy?.getState().combination||1);
 if(generation!==this.generation||document.querySelector('#app').dataset.phase!=='release')return;
 this.count++;this.sound.air();
 [...document.querySelectorAll('.scent-port')].forEach((port,i)=>{if(!(active&(1<<i)))return;
 for(let j=0;j<(this.reduced?1:4);j++){const p=document.createElement('i');p.className='mist-puff';p.style.setProperty('--dx',((i%2?1:-1)*(18+j*14))+'px');p.style.setProperty('--delay',j*.1+'s');port.append(p);p.addEventListener('animationend',()=>p.remove(),{once:true});}});
 this.station.classList.remove('released');void this.station.offsetWidth;this.station.classList.add('released');this.onRelease(this.count);
 }catch(error){this.onError(error);}finally{this.pending=false;}
 }
 reset(){this.generation++;this.count=0;this.station.classList.remove('pressed','released');document.querySelectorAll('.mist-puff').forEach(p=>p.remove());}
}

