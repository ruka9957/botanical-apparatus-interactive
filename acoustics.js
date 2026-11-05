// Gesture-unlocked effects and optional music have independent gain paths.
export class Soundscape{
 constructor(){this.enabled=true;this.unlocked=false;this.lastChime=-1000;this.sequence=0;this.music=new Audio('assets/paper-garden.wav');this.music.id='background-music';this.music.hidden=true;this.music.loop=true;this.music.preload='auto';document.body.append(this.music);for(const type of ['playing','pause','error'])this.music.addEventListener(type,()=>this.reportMusic());}
 setup(){
  if(!this.context){
   this.context=new AudioContext();const low=this.context.createBiquadFilter();low.type='lowpass';low.frequency.value=3400;low.Q.value=.3;
   const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=3;limiter.attack.value=.008;limiter.release.value=.2;
   this.fx=this.context.createGain();this.fx.gain.value=.8;this.musicGain=this.context.createGain();this.musicGain.gain.value=0;
   this.fx.connect(low);this.musicGain.connect(low);low.connect(limiter).connect(this.context.destination);this.context.createMediaElementSource(this.music).connect(this.musicGain);
   this.loading=Promise.all(['glass-chime.wav','botanical-drop.wav','natural-wind-chime.mp3'].map(async(name)=>{const r=await fetch('assets/'+name);if(!r.ok)throw Error('audio asset');return this.context.decodeAudioData(await r.arrayBuffer());})).then(([chime,drop,tinkle])=>{this.chimeBuffer=chime;this.dropBuffer=drop;this.tinkleBuffer=tinkle;let peak=0;for(let channel=0;channel<tinkle.numberOfChannels;channel++)for(const sample of tinkle.getChannelData(channel))peak=Math.max(peak,Math.abs(sample));this.chimeLevel=.32/Math.max(.32,peak);document.querySelector('#app').dataset.effects='ready';document.querySelector('#app').dataset.chimeDuration=tinkle.duration.toFixed(2);}).catch(()=>{this.loading=null;document.querySelector('#app').dataset.effects='unavailable';});
  }
  this.context.onstatechange=()=>this.reportMusic();
 }
 async unlock(){this.unlocked=true;this.setup();await this.context.resume();await this.loading;}
 reportMusic(){const playing=this.enabled&&!this.music.paused&&this.context?.state==='running';document.querySelector('#app').dataset.musicPlayback=playing?'playing':this.enabled?'waiting':'off';this.onMusicChange?.();}
 async startMusic(){
  if(!this.enabled)return false;this.setup();clearTimeout(this.pauseTimer);this.context.resume().catch(()=>{});this.musicGain.gain.setTargetAtTime(.45,this.context.currentTime,.3);
  try{await this.music.play();if(!this.enabled)this.music.pause();this.reportMusic();return this.enabled;}catch(e){this.reportMusic();if(e.name==='NotAllowedError'||e.name==='AbortError')return false;throw e;}
 }
 async toggle(){this.enabled=!this.enabled;clearTimeout(this.pauseTimer);if(this.enabled){await this.startMusic();}else{if(this.context)this.musicGain.gain.setTargetAtTime(0,this.context.currentTime,.15);this.pauseTimer=setTimeout(()=>{if(!this.enabled){this.music.pause();this.reportMusic();}},750);}this.reportMusic();return this.enabled;}
 play(buffer,power,rate=1,delay=0){if(!buffer||this.context.state!=='running')return;const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.playbackRate.value=rate;gain.gain.value=power;source.connect(gain).connect(this.fx);source.onended=()=>{source.disconnect();gain.disconnect();if(this.chimeVoice?.source===source)this.chimeVoice=null;};source.start(this.context.currentTime+delay);return{source,gain};}
 async chime(power=.3){if(!this.unlocked||performance.now()-this.lastChime<1600)return;this.lastChime=performance.now();await this.unlock();if(this.chimeVoice){const now=this.context.currentTime;this.chimeVoice.gain.gain.setTargetAtTime(0,now,.045);this.chimeVoice.source.stop(now+.16);}this.chimeVoice=this.play(this.tinkleBuffer,Math.min(.32,.23+power*.12)*this.chimeLevel);document.querySelector('#app').dataset.lastEffect='chime';document.querySelector('#app').dataset.chimeVoice='natural-recording';}
 async collect(){if(!this.unlocked)return;await this.unlock();this.play(this.dropBuffer,.54);this.play(this.chimeBuffer,.22,1.5,.14);document.querySelector('#app').dataset.lastEffect='collect';}
 async air(){if(!this.unlocked)return;await this.unlock();this.play(this.dropBuffer,.18,.65);document.querySelector('#app').dataset.lastEffect='release';}
}
