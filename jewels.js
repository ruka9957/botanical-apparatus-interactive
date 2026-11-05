export const jewelDefs=`<radialGradient id="gem-blue" cx=".28" cy=".2"><stop stop-color="#e9ffff"/><stop offset=".24" stop-color="#74d6df"/><stop offset=".6" stop-color="#1798ad"/><stop offset="1" stop-color="#075870"/></radialGradient><radialGradient id="gem-pink" cx=".25" cy=".2"><stop stop-color="#fff7ff"/><stop offset=".3" stop-color="#eeb5d3"/><stop offset=".7" stop-color="#c86fa6"/><stop offset="1" stop-color="#804d75"/></radialGradient><radialGradient id="gem-gold" cx=".2" cy=".15"><stop stop-color="#fffbd7"/><stop offset=".35" stop-color="#e8c989"/><stop offset=".7" stop-color="#b68c42"/><stop offset="1" stop-color="#806733"/></radialGradient>`;
export function jewelMarkup(type='star',color='blue',size=11){
 const count=type==='star'?10:12;
 const points=Array.from({length:count},(_,i)=>{const a=i*Math.PI*2/count-Math.PI/2,r=type==='star'&&i%2?size*.46:size;return [Math.cos(a)*r,Math.sin(a)*r];});
 const outline=points.map(p=>p.join(',')).join(' ');
 return `<polygon points="${outline}" fill="url(#gem-${color})" stroke="${color==='blue'?'#468e9b':color==='pink'?'#b68ba6':'#ab956b'}" stroke-width=".65"/>
 ${points.map((p,i)=>{const q=points[(i+1)%count];return `<path class="gem-facet" d="M0 0L${p.join(' ')}L${q.join(' ')}Z" fill="${i%2?'#fff':'#37414f'}" opacity="${i%2?.32:.18}"/>`;}).join('')}
 <polygon points="${points.map(p=>p.map(v=>v*.5).join(',')).join(' ')}" fill="none" stroke="#f5fdff" stroke-width=".55" opacity=".75"/>
 <path class="gem-glint" d="M${-size*.5} ${-size*.9}v${size*.65}m${-size*.325} ${-size*.325}h${size*.65}" stroke="white" stroke-width="1" stroke-linecap="round"/>
 <circle cx="${-size*.35}" cy="${-size*.48}" r="1.1" fill="#fff"/>`;
}
export function lightJewel(group,angle,seed=0){
 const shine=Math.pow(Math.max(0,Math.cos(angle*2.3+seed)),16);
 group.querySelectorAll('.gem-facet').forEach((f,i)=>f.setAttribute('opacity',(.1+.4*Math.max(0,Math.sin(angle*1.8+seed+i*1.25))).toFixed(3)));
 const glint=group.querySelector('.gem-glint');if(glint)glint.setAttribute('opacity',(.12+shine*.88).toFixed(3));
 return shine;
}
export function roundRhinestone(size=7){
 const facets=Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,b=(i+1)*Math.PI/6;return `<path class="gem-facet" d="M0 0L${Math.cos(a)*size*.87} ${Math.sin(a)*size*.87}L${Math.cos(b)*size*.87} ${Math.sin(b)*size*.87}Z" fill="${['#fafcff','#697a8b','#d6dbe1','#fff'][i%4]}" opacity=".65"/>`;}).join('');
 return `<ellipse cx="0" cy="${-size-3}" rx="1.2" ry="2" fill="none" stroke="#a1a2a0" stroke-width=".6"/><circle cy=".5" r="${size}" fill="#898e94"/><circle r="${size-.45}" fill="#eff2f5" stroke="#c2c7ca" stroke-width=".65"/>${facets}<circle r="${size*.46}" fill="#dce4eb" stroke="#fcfeff" stroke-width=".65"/><path d="M${-size*.6} 0A${size*.65} ${size*.65} 0 0 1 0 ${-size*.6}" fill="none" stroke="#fff" stroke-width="1.1"/><path class="gem-glint" d="M${-size*.36} ${-size*.9}v${size*.9}m${-size*.45} ${-size*.45}h${size*.9}" stroke="#fff" stroke-width=".85" stroke-linecap="round"/>`;
}
