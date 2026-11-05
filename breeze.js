export function ambientBreeze(time,index=0){
 const cycle=20500,elapsed=time-1600-index*135;
 if(elapsed<0)return 0;
 const phase=elapsed%cycle;if(phase>7200)return 0;
 const u=phase/7200,envelope=Math.sin(Math.PI*u)**2;
 const eddy=.70+.24*Math.sin(u*Math.PI*4+.4)+.10*Math.sin(u*Math.PI*9+index*.29);
 return envelope*eddy*(Math.floor(elapsed/cycle)%2?-.88:1);
}
