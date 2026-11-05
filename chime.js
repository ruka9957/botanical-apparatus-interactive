import {stepPendulum} from './pendulum.js';
import {ambientBreeze} from './breeze.js';
import {jewelDefs,jewelMarkup,lightJewel,roundRhinestone} from './jewels.js';
const ns='http://www.w3.org/2000/svg';
const svg=(tag,attrs={})=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;};
export class WindChime{
 constructor(specimens){
  this.started=performance.now();this.items=specimens;this.angle=.14;this.velocity=.00075;
  const rig=document.querySelector('#rig');
  rig.innerHTML=`<defs>${jewelDefs}
  <linearGradient id="steel" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#727a65"/><stop offset=".28" stop-color="#d6d9c9"/><stop offset=".48" stop-color="#717b63"/><stop offset=".65" stop-color="#e9eadf"/><stop offset="1" stop-color="#626d58"/></linearGradient>
  <radialGradient id="pearl" cx=".3" cy=".25"><stop stop-color="#fffefa"/><stop offset=".4" stop-color="#eee5da"/><stop offset=".8" stop-color="#d0c4b4"/><stop offset="1" stop-color="#a99e8e"/></radialGradient>
  <linearGradient id="crystal" x2="1" y2="1"><stop stop-color="#fbffff" stop-opacity=".8"/><stop offset=".3" stop-color="#d5dcd6" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset=".7" stop-color="#bac9c1" stop-opacity=".3"/><stop offset="1" stop-color="#fafff9" stop-opacity=".8"/></linearGradient>
  <radialGradient id="jade" cx=".2" cy=".3"><stop stop-color="#b9cec2"/><stop offset=".5" stop-color="#8cafa5"/><stop offset="1" stop-color="#5e8e82"/></radialGradient>
  </defs><path d="M320 -150V91" stroke="#7f886f" stroke-width=".9"/><ellipse cx="320" cy="95" rx="5" ry="10" fill="none" stroke="#7f886f" stroke-width="1"/>`;
  this.support=svg('path',{fill:'none',stroke:'#859077','stroke-width':'.9'});rig.append(this.support);
  this.spiral=svg('path',{fill:'none',stroke:'url(#steel)','stroke-width':'3.1','stroke-linecap':'round'});rig.append(this.spiral);
  this.strands=Array.from({length:8},(_,i)=>{
   const rope=svg('path',{fill:'none',stroke:'#8b917b','stroke-width':'.7','stroke-opacity':'.62'});rig.append(rope);
   const jewel=svg('g');jewel.innerHTML=`<ellipse cx="0" cy="-7" rx="3" ry="5" fill="none" stroke="#929779" stroke-width=".8"/><circle cy="3" r="${i%3===0?7:5}" fill="url(#pearl)" stroke="#b1a696" stroke-width=".4"/><path d="M0 11 v10" fill="none" stroke="#9d967d" stroke-width=".65"/>`;rig.append(jewel);
   const accent=svg('g');accent.innerHTML=jewelMarkup(i%3===1?'round':'star',['blue','pink','gold'][i%3],i%3===1?5.4:9);rig.append(accent);
   const drop=svg('g');drop.innerHTML=roundRhinestone([7,6.3,7.5,6.8,7.1,6.1,7.4,6.5][i]*.9);rig.append(drop);
   return {rope,jewel,accent,drop,theta:0,omega:0,stretch:0,springSpeed:0,x:0,top:0,length:[350,410,375,440,365,415,395,435][i]};
  });
  this.nodes=specimens.map(b=>{const el=document.createElement('button');el.className='pendant';el.dataset.id=b.id;el.setAttribute('aria-label',`${b.zh} · ${b.name}，拖入收集瓶`);el.innerHTML=`<img src="${b.asset}" alt="${b.zh}" draggable="false">`;if([0,2,4,6,8,10,12].includes(b.id)){const stones=svg('svg',{viewBox:'0 0 100 125','class':'petal-stones','aria-hidden':'true'});stones.innerHTML=`<g transform="translate(43 58)">${jewelMarkup('round','pink',2.5)}</g><g transform="translate(60 76)">${jewelMarkup('round','blue',1.8)}</g>`;el.append(stones);}el.style.width=b.size+'px';el.style.height=b.size*1.25+'px';document.querySelector('#pendants').append(el);return {el,x:0,y:0};});
  this.moth=document.querySelector('#moth');this.moth.innerHTML='<span class="wing wing-left"></span><span class="wing wing-right"></span>';this.flight=null;this.perch=4;
 }
 disturb(index,force){const s=this.strands[index];s.omega+=Math.max(-.25,Math.min(.25,force*15));s.springSpeed+=Math.min(6,Math.abs(force)*130);}
 spin(dx){dx=Math.max(-18,Math.min(18,dx));this.angle+=dx*.0035;this.velocity=Math.max(-.012,Math.min(.012,dx*.0004));this.strands.forEach((s,i)=>this.disturb(i,dx*.00006*(.8+Math.sin(i)*.2)));if(Math.abs(dx)>8)this.scare();}
 scare(){if(!this.flight)this.flight={start:performance.now(),x:this.nodes[this.perch].x,y:this.nodes[this.perch].y+35};}
 frame(t,dt,selected,spinning,reduced){
  const wind=reduced?0:ambientBreeze(t-this.started);document.querySelector('#mobile').dataset.breeze=wind.toFixed(3);
  if(!spinning&&!reduced){this.velocity+=(.00028+wind*.0008-this.velocity)*.035*dt;this.angle+=this.velocity*dt;}
  let d='';for(let j=0;j<=200;j++){const f=j/200,a=f*4*Math.PI+this.angle,r=40+f*218,x=320+Math.cos(a)*r,y=151+Math.sin(a)*r*.23+f*23;d+=(j?'L':'M')+x.toFixed(2)+' '+y.toFixed(2);if(!j)this.support.setAttribute('d',`M320 105 Q320 135 ${x} ${y}`);}this.spiral.setAttribute('d',d);
  this.strands.forEach((s,i)=>{
   const f=.53+i/17,a=f*4*Math.PI+this.angle,r=40+f*218;
   s.x=320+Math.cos(a)*r;s.top=151+Math.sin(a)*r*.23+f*23;
   stepPendulum(s,reduced?0:ambientBreeze(t-this.started,i),Math.min(dt/60,.05),i);
   const sway=reduced?0:Math.sin(t*.00063+i)*.008+s.theta;
   s.sway=sway;s.effectiveLength=s.length+(reduced?0:s.stretch);const end=s.x+Math.sin(sway)*s.effectiveLength,endY=s.top+Math.cos(sway)*s.effectiveLength;
   s.rope.setAttribute('d',`M${s.x} ${s.top} Q${s.x+Math.sin(sway)*s.effectiveLength*.46+wind*2} ${s.top+Math.cos(sway)*s.effectiveLength*.46} ${end} ${endY}`);
   s.jewel.setAttribute('transform',`translate(${s.x+Math.sin(sway)*37} ${s.top+Math.cos(sway)*37}) rotate(${-sway*30})`);
   const u=.49,ax=s.x+Math.sin(sway)*s.effectiveLength*u,ay=s.top+Math.cos(sway)*s.effectiveLength*u;
   s.accent.setAttribute('transform',`translate(${ax} ${ay}) rotate(${Math.sin(a)*12}) scale(${.86+Math.cos(a)*.12})`);
   lightJewel(s.accent,this.angle,i*.9);lightJewel(s.drop,this.angle+sway,i*1.2);
   s.drop.setAttribute('transform',`translate(${end} ${endY}) rotate(${-sway*50})`);
  });
  document.querySelector('#mobile').dataset.maxSwing=Math.max(...this.strands.map(s=>Math.abs(s.sway)*57.3)).toFixed(2);document.querySelector('#mobile').dataset.stretch=Math.max(...this.strands.map(s=>Math.abs(s.stretch))).toFixed(2);
  this.items.forEach((b,i)=>{const n=this.nodes[i],s=this.strands[b.strand],depth=Math.sin((.53+b.strand/17)*4*Math.PI+this.angle),u=b.offset/s.length,distance=b.offset*s.effectiveLength/s.length;n.x=s.x+Math.sin(s.sway)*distance;n.y=s.top+Math.cos(s.sway)*distance;
   n.el.style.transform=`translate(${n.x-b.size/2}px,${n.y}px) rotate(${b.rotation-s.sway*57.3}deg) scale(${.95+depth*.055})`;
   n.el.style.zIndex=Math.round(20+depth*8)+(b.offset>200?1:0);n.el.classList.toggle('collected',selected.includes(i));const stones=n.el.querySelector('.petal-stones');if(stones)lightJewel(stones,this.angle,i*.8);
  });
  if(selected.includes(this.perch)){this.scare();this.perch=[4,2,0,8,10,12,14,9,13,15].find(id=>!selected.includes(id))??1;}
  this.drawMoth(t,reduced);
 }
 drawMoth(t,reduced){const p=this.nodes[this.perch];let x=p.x+22,y=p.y+35,rotation=-18,alpha=1,flutter=reduced?1:1+Math.sin(t*.002)*.015;
  if(this.flight&&!reduced){const f=this.flight,age=(t-f.start)/1000;
   if(age<2.6){const u=age/2.6;x=(1-u)**2*f.x+2*(1-u)*u*(f.x+220)+u*u*(f.x+390);y=(1-u)**2*f.y+2*(1-u)*u*(f.y-290)+u*u*(f.y-80);alpha=Math.min(1,(1-u)*3);rotation=10+u*50;}
   else if(age<6){alpha=0;}
   else if(age<8.5){const u=(age-6)/2.5;x=(1-u)**2*(p.x-260)+2*(1-u)*u*(p.x-80)+u*u*(p.x+22);y=(1-u)**2*(p.y-180)+2*(1-u)*u*(p.y-230)+u*u*(p.y+35);alpha=Math.min(1,u*3);rotation=-18-u*15;}
   else this.flight=null;flutter=.62+Math.abs(Math.sin(t*.055))*.38;
  }
  this.moth.style.transform=`translate(${x}px,${y}px) rotate(${rotation}deg) scaleX(${flutter})`;this.moth.style.opacity=alpha;this.moth.style.setProperty('--wing-fold',`${reduced?7:(this.flight?18+Math.abs(Math.sin(t*.014))*60:8+Math.sin(t*.0015)*6)}deg`);
 }
}

