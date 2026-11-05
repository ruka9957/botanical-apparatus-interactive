export function mountPaper(){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.id='paper-ground';svg.setAttribute('aria-hidden','true');
 // Full-bleed ground. Chroma separates the purple thread from its beige raster paper.
 const thread=(id,night=false)=>`<filter id="${id}" color-interpolation-filters="sRGB" x="-2%" y="-2%" width="104%" height="104%"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -3 -7 10 0 -.06" result="ink"/><feComposite in="ink" in2="SourceAlpha" operator="in" result="thread"/>${night?'<feFlood flood-color="#d5c2ee"/><feComposite in2="thread" operator="in"/>':'<feComposite in="SourceGraphic" in2="thread" operator="in"/>'}</filter>`;
 svg.innerHTML=`<defs><linearGradient id="paper-tone" x2=".85" y2="1"><stop stop-color="#fbf8f0"/><stop offset=".55" stop-color="#f8f5ec"/><stop offset="1" stop-color="#f5f2e9"/></linearGradient><filter id="paper-fibers"><feTurbulence type="fractalNoise" baseFrequency=".78 .18" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>${thread('thread-alpha')}${thread('thread-alpha-night',true)}</defs><rect class="sheet" width="100%" height="100%" fill="url(#paper-tone)"/><rect class="fibers" width="100%" height="100%" filter="url(#paper-fibers)" opacity=".025"/>`;
 document.querySelector('#app').prepend(svg);
}
