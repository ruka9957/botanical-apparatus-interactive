// One orthographic scale and one horizon. Only the camera's x changes by act.
export function layoutFor(w,h){
 const windowWidth=w,small=w<=900;w=small?w:Math.min(w,h*1.72);
 const scale=small?Math.min(w/850,.64,Math.max(.3,(h-400)/760)):Math.max(.3,Math.min(w/1550,(h-250)/730));
 const y=small?Math.min(360,h*.43)+40-125*scale:Math.max(35,h*.955-101-725*scale);
 const chime=980,collectX=w*(small?.32:.26)-chime*scale;
 const apparatusX=chime+w*(small?.50:.47)/scale-225;
 const labShift=Math.max(0,(w*(small?.18:.27)+(small?30:80))/scale-349);
 const releaseX=Math.max(2400,labShift+1180+w/(2*scale)+180);
 return {small,w,h,windowWidth,scale,y,chime,collectX,apparatusX,labShift,releaseX,collectorDrop:small?(h<800?40:80):0};
}
export function cameraPose(layout,phase,progress=0){
 const l=layout;let x=l.w*(l.small?.80:.65)-l.chime*l.scale;
 if(phase==='collect')x=l.collectX;
 if(phase==='distilling'||phase==='distilled'){
  const p=phase==='distilled'?1:Math.max(0,Math.min(1,progress));
  const u=Math.max(0,Math.min(1,(p-.18)/.74)),ease=u*u*(3-2*u);
  x=l.w*.5-(l.apparatusX+l.labShift+900+280*ease)*l.scale;
 }
 if(phase==='release')x=l.w*.5-(l.apparatusX+l.releaseX+(l.small?346:760))*l.scale;
 const mobileX=660+(l.small?(phase==='observe'?-l.w*.30/l.scale:phase==='collect'?l.w*.08/l.scale:0):l.w*(phase==='observe'?-.11:.05)/l.scale);
 const y=l.small?l.y-(phase==='observe'?40:Math.max(40,Math.min(90,40+(l.h-700)*.4))):l.y;
 return {x,y,scale:l.scale,mobileX,mobileZoom:phase==='observe'?1.18:l.small&&phase==='collect'?(l.w<360?.88:1.04):1};
}
export function arrangeSet(l){
 document.querySelector('#mobile').style.top=(65-(l.small?0:l.h*.055/l.scale))+'px';
 const app=document.querySelector('#apparatus'),svg=app.querySelector('.glass-scene');
 app.style.left=l.apparatusX+'px';app.style.width=(l.releaseX+1540)+'px';
 svg.setAttribute('viewBox',`0 0 ${l.releaseX+1540} 840`);
 const extension=document.querySelector('#glass-extension');extension.setAttribute('transform',`translate(${l.labShift} 0)`);extension.dataset.shift=l.labShift;
 const collectorScale=l.small?1.08:1,joinX=225+106*collectorScale,joinY=255+153*collectorScale+l.collectorDrop;
 document.querySelector('#collector').setAttribute('transform',`translate(225 ${255+l.collectorDrop}) scale(${collectorScale}) translate(-225 -255)`);
 const transfer=`M${joinX} ${joinY}H375Q402 ${joinY} 402 ${joinY-27}V205Q402 180 429 180H${663+l.labShift}Q${690+l.labShift} 180 ${690+l.labShift} 207V310`;
 document.querySelectorAll('#collection-connection path').forEach(p=>p.setAttribute('d',transfer));
 const inletY=l.small?114:280,inletX=l.releaseX+65*(l.small?.72:1);
 const bridge=`M${1597+l.labShift} 564H${1780+l.labShift}Q${1810+l.labShift} 564 ${1810+l.labShift} 532V${inletY+30}Q${1810+l.labShift} ${inletY} ${1845+l.labShift} ${inletY}H${inletX}`;
 document.querySelectorAll('#release-connection path').forEach(p=>p.setAttribute('d',bridge));
 const station=document.querySelector('#release-station');station.style.left=l.releaseX+'px';station.style.top=(l.small?-30:80)+'px';station.style.transform=l.small?'scale(.72)':'';station.style.transformOrigin='0 0';
 // Keep the phone printer's controls outside the scaled glass set.
 const printer=document.querySelector('#card-printer'),parent=l.small?document.querySelector('#app'):app;
 if(printer.parentElement!==parent)parent.append(printer);
 printer.style.left=l.small?'50%':(l.releaseX+1040)+'px';printer.style.top=l.small?(l.w>=600?'520px':'480px'):'-30px';
}
