// Seconds-based damped pendulum. Each cord has its own period and wind loading.
export function stepPendulum(s,wind,seconds,index=0){
 const steps=Math.max(1,Math.ceil(seconds/.008)),h=seconds/steps;
 const gravity=9.81/(s.length*.0026),drag=.9+(index%3)*.09;
 s.stretch??=0;s.springSpeed??=0;
 for(let j=0;j<steps;j++){
  const torque=wind*(1.05/(.9+(index%4)*.15));
  s.omega+=(-gravity*Math.sin(s.theta)-drag*s.omega+torque)*h;
  s.theta+=s.omega*h;
  if(Math.abs(s.theta)>.22){s.theta=Math.sign(s.theta)*.22;s.omega*=.35;}
  const extension=Math.min(6,Math.abs(wind)*4.8+s.omega*s.omega*12);
  s.springSpeed+=((45+index*1.3)*(extension-s.stretch)-4.5*s.springSpeed)*h;
  s.stretch+=s.springSpeed*h;
  if(Math.abs(s.stretch)>8){s.stretch=Math.sign(s.stretch)*8;s.springSpeed*=.4;}
 }
 return s.theta;
}
