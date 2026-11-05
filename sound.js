// One audio context, one low-pass master, pre-rendered mellow notes. No noise sources.
export class Soundscape{
 constructor(){this.enabled=false;this.music=new Audio('assets/paper-piano.wav');this.music.loop=true;this.music.preload='auto';this.music.volume=.72;this.lastChime=-1000;this.chimeBuffer=null;}
 async prepare(){
  if(!this.context){
   this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=0;
   const low=this.context.createBiquadFilter();low.type='lowpass';low.frequency.value=1800;low.Q.value=.2;
   const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-24;limiter.knee.value=18;limiter.ratio.value=5;limiter.attack.value=.01;limiter.release.value=.25;
   this.master.connect(low).connect(limiter).connect(this.context.destination);
   this.context.createMediaElementSource(this.music).connect(this.master);
  }
  await this.context.resume();
  if(!this.chimeBuffer){try{const response=await fetch('assets/soft-touch.wav');this.chimeBuffer=await this.context.decodeAudioData(await response.arrayBuffer());}catch{}}
 }
 async toggle(){
  try{await this.prepare();
   if(this.enabled){this.enabled=false;this.master.gain.setTargetAtTime(0,this.context.currentTime,.12);clearTimeout(this.pauseTimer);this.pauseTimer=setTimeout(()=>this.music.pause(),650);}
   else{clearTimeout(this.pauseTimer);await this.music.play();this.enabled=true;this.master.gain.setTargetAtTime(.5,this.context.currentTime,.35);}
  }catch(error){this.enabled=false;this.music.pause();throw error;}
  return this.enabled;
 }
 chime(power=.3){
  if(!this.enabled||!this.chimeBuffer||performance.now()-this.lastChime<900)return;
  this.lastChime=performance.now();const s=this.context.createBufferSource(),g=this.context.createGain();s.buffer=this.chimeBuffer;g.gain.value=Math.min(.18,Math.max(0,power)*.35);s.connect(g).connect(this.master);s.start();
 }
 air(){} // Mist is visual: removing synthesized hiss avoids the former electrical sound.
}
