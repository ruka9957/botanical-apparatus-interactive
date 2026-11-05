import {printerMarkup} from './printer.js';
// Shared coordinates and layered materials keep all three acts physically connected.
const tube=(d,w=13)=>`<g class="glass-tube" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="#849094" stroke-opacity=".42" stroke-width="${w}"/><path d="${d}" stroke="url(#tube-glass)" stroke-width="${w-2}"/><path d="${d}" stroke="#fffefb" stroke-opacity=".9" stroke-width="2.2" transform="translate(-1.5 -1.5)"/><path d="${d}" stroke="#a8b4ba" stroke-opacity=".4" stroke-width="1.2" transform="translate(2.2 2.2)"/></g>`;
const jar='M180 255V339C180 370 111 379 107 449V601Q107 649 166 651H284Q343 649 343 601V449C339 379 270 370 270 339V255';
const extract='M651 310H729V368C729 389 802 399 806 493V558Q806 628 733 635H647Q574 628 574 558V493C578 399 651 389 651 368Z';
const receiver='M1518 490H1562V536C1562 559 1625 564 1625 611V630Q1625 658 1590 660H1490Q1455 658 1455 630V611C1455 564 1518 559 1518 536Z';
const transfer='M331 408H375Q402 408 402 381V205Q402 180 429 180H663Q690 180 690 207V310';
const steam='M729 338H822Q846 338 846 312V182Q846 158 873 158H948Q973 158 973 184V260';
const coil=Array.from({length:6},(_,i)=>`C939 ${280+i*30} 1007 ${280+i*30} 997 ${295+i*30}C988 ${310+i*30} 939 ${310+i*30} 949 ${325+i*30}`).join(' ');
const cooling=`M973 260L949 280${coil}V490Q949 524 986 524H1060Q1091 524 1091 492V250Q1091 225 1119 225H1459Q1540 225 1540 294V490`;
const link='M1597 564H1780Q1810 564 1810 532V280Q1810 245 1845 245H2110Q2140 245 2140 280V395Q2140 420 2165 420H2265';
const material=(name,sw,sh,b,x,y,w,h,cls='')=>`<svg class="volume-render ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${b.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="assets/${name}-volume.png" width="${sw}" height="${sh}"/></svg>`;
const funnel=(x,y)=>material('funnel',1327,1185,[53,49,1222,1080],x-61,y-8,122,117);
export function apparatusMarkup(){return `
<svg viewBox="0 0 3700 840" class="glass-scene" aria-label="一体相连的圆肩采集瓶、玻璃提取器、冷凝管与克莱因蓝闻香装置">
<defs>
 <linearGradient id="glass-body"><stop stop-color="#74969b" stop-opacity=".65"/><stop offset=".045" stop-color="#ebffff" stop-opacity=".95"/><stop offset=".12" stop-color="#b8d3d8" stop-opacity=".28"/><stop offset=".3" stop-color="#f8ffff" stop-opacity=".09"/><stop offset=".56" stop-color="#fcf9f2" stop-opacity=".05"/><stop offset=".82" stop-color="#c5dce0" stop-opacity=".15"/><stop offset=".92" stop-color="#fffefa" stop-opacity=".94"/><stop offset="1" stop-color="#75979c" stop-opacity=".66"/></linearGradient>
 <linearGradient id="tube-glass" x2="0" y2="1"><stop stop-color="#ffffff" stop-opacity=".94"/><stop offset=".30" stop-color="#e3e8eb" stop-opacity=".5"/><stop offset=".65" stop-color="#fafdfd" stop-opacity=".28"/><stop offset="1" stop-color="#aeb9bf" stop-opacity=".58"/></linearGradient>
 <linearGradient id="metal-soft"><stop stop-color="#8e9c94"/><stop offset=".3" stop-color="#e1e5dc"/><stop offset=".52" stop-color="#f4f4e9"/><stop offset=".8" stop-color="#bac2b7"/><stop offset="1" stop-color="#8d9a91"/></linearGradient>
 <linearGradient id="essence-gradient" x2="0" y2="1"><stop stop-color="var(--essence,#aaa2b7)" stop-opacity=".15"/><stop offset="1" stop-color="var(--essence,#aaa2b7)" stop-opacity=".65"/></linearGradient>
 <radialGradient id="warmth"><stop stop-color="#d9b88d" stop-opacity=".6"/><stop offset="1" stop-color="#d9b88d" stop-opacity="0"/></radialGradient>
 <linearGradient id="cobalt-face" x2="1" y2=".4"><stop stop-color="#153d9e" stop-opacity=".94"/><stop offset=".11" stop-color="#275bcb" stop-opacity=".86"/><stop offset=".45" stop-color="#3667cd" stop-opacity=".79"/><stop offset=".8" stop-color="#2154b9" stop-opacity=".88"/><stop offset="1" stop-color="#11378e" stop-opacity=".96"/></linearGradient>
 <linearGradient id="cobalt-top" x2="0" y2="1"><stop stop-color="#dbe5f6" stop-opacity=".85"/><stop offset=".24" stop-color="#86a4db" stop-opacity=".8"/><stop offset=".8" stop-color="#4975cf" stop-opacity=".94"/><stop offset="1" stop-color="#1d49aa"/></linearGradient>
 <radialGradient id="glass-lens" cx=".32" cy=".35"><stop stop-color="#fff" stop-opacity=".65"/><stop offset=".42" stop-color="#e8faff" stop-opacity=".15"/><stop offset="1" stop-color="#a8c4ca" stop-opacity="0"/></radialGradient>
 <linearGradient id="glass-base" x2="0" y2="1"><stop stop-color="#7e9da0" stop-opacity=".42"/><stop offset=".33" stop-color="#fbffff" stop-opacity=".95"/><stop offset=".58" stop-color="#bdd5d8" stop-opacity=".5"/><stop offset="1" stop-color="#79999e" stop-opacity=".65"/></linearGradient>
 <radialGradient id="bolt" cx=".33" cy=".22"><stop stop-color="#fffefa"/><stop offset=".28" stop-color="#dbe1d9"/><stop offset=".58" stop-color="#9ba9a3"/><stop offset=".8" stop-color="#ecede2"/><stop offset="1" stop-color="#6e817c"/></radialGradient>
 <linearGradient id="rubber" x2="1" y2=".4"><stop stop-color="#545b55"/><stop offset=".35" stop-color="#343d36"/><stop offset="1" stop-color="#232d25"/></linearGradient>
 <filter id="contact"><feGaussianBlur stdDeviation="6"/></filter>
 <clipPath id="bottleClip"><path d="${jar}Z"/></clipPath><clipPath id="extractClip"><path d="${extract}"/></clipPath><clipPath id="receiverClip"><path d="${receiver}"/></clipPath>
 <mask id="collectorMaterial" class="material-mask" maskUnits="userSpaceOnUse" mask-type="alpha" x="107" y="247" width="236" height="408">${material('collector',1145,1374,[162,89,820,1180],107,247,236,408)}</mask>
 <mask id="extractMaterial" class="material-mask" maskUnits="userSpaceOnUse" mask-type="alpha" x="574" y="303" width="232" height="332">${material('extraction',1122,1402,[139,167,845,1082],574,303,232,332)}</mask>
 <mask id="receiverMaterial" class="material-mask" maskUnits="userSpaceOnUse" mask-type="alpha" x="1455" y="485" width="170" height="175">${material('extraction',1122,1402,[139,167,845,1082],1455,485,170,175)}</mask>
</defs>
<g id="collector">
 <ellipse cx="225" cy="670" rx="133" ry="7" fill="#677567" opacity=".11" filter="url(#contact)"/>
 <path class="glass-vessel render-fallback" d="${jar}"/>
 ${material('collector',1145,1374,[162,89,820,1180],107,247,236,408)}
 <g mask="url(#collectorMaterial)"><g id="essence-pool" opacity="0"><path d="M101 566Q225 555 350 566V660H101Z" fill="url(#essence-gradient)"/><ellipse cx="225" cy="566" rx="123" ry="7" fill="var(--essence)" opacity=".3"/></g><g id="bottle-plants"></g></g>
 <g fill="none" class="render-fallback"><ellipse cx="225" cy="255" rx="46" ry="8" stroke="#a0aea5" stroke-width="1.4"/><ellipse cx="225" cy="259" rx="45" ry="7" stroke="#fffef9" stroke-width="2.4"/><ellipse cx="225" cy="251" rx="41" ry="5" stroke="#fdfef9" stroke-width="1.5"/>
 <path d="M179 278V339C179 373 119 386 117 449V597Q117 637 170 640H283" stroke="#fffef9" stroke-width="4" opacity=".8"/><path d="M270 281V338C270 373 332 389 334 448V595Q334 634 288 641" stroke="#9caea6" stroke-width="1.3" opacity=".5"/><path d="M130 447Q144 414 167 410" stroke="#fffef9" stroke-width="6" opacity=".55"/><ellipse cx="225" cy="643" rx="91" ry="5" stroke="#e8eee5" stroke-width="2"/><path d="M138 490H158M138 516H151M138 542H158" stroke="#9aa89b" stroke-width="1.2" opacity=".6"/></g>
 <text x="146" y="574" font-size="10" fill="#939f92" letter-spacing="2">250 ml</text><ellipse id="mouth-glow" cx="225" cy="255" rx="48" ry="10" fill="none" stroke="#9aae9b" stroke-width="2"/>
</g>
<g id="collection-connection">${tube(transfer)}<path id="transfer-route" class="process-route" d="${transfer}"/></g>
<g id="glass-extension">
 <ellipse cx="1100" cy="690" rx="600" ry="7" fill="#677567" opacity=".07" filter="url(#contact)"/>
 <g class="apparatus-support" fill="url(#metal-soft)" stroke="#9da99b" stroke-width=".6"><rect x="863" y="104" width="7" height="564" rx="3.5"/><ellipse cx="866" cy="672" rx="83" ry="7"/><rect x="852" y="304" width="30" height="24" rx="4"/><rect x="876" y="314" width="55" height="5" rx="2"/></g>
 <ellipse id="heat-halo" cx="690" cy="642" rx="157" ry="67" fill="url(#warmth)" opacity="0"/>
 <g class="glass-vessel"><path class="render-fallback" d="${extract}"/><ellipse class="render-fallback" cx="690" cy="310" rx="40" ry="7"/><path d="M927 260H1015V464Q1015 507 973 510Q927 506 927 464Z"/><ellipse cx="971" cy="260" rx="44" ry="8"/><path d="M1115 202H1459Q1552 202 1552 294V319H1528V294Q1528 248 1459 248H1115Z"/><ellipse cx="1115" cy="225" rx="7" ry="23"/></g>
 ${material('extraction',1122,1402,[139,167,845,1082],574,303,232,332)}
 <g mask="url(#extractMaterial)"><path id="extract-liquid" fill="url(#essence-gradient)" opacity="0" d="M570 544Q626 532 689 545T811 544V641H570Z"/><g id="bubbles" opacity="0">${Array.from({length:18},(_,i)=>`<circle class="process-bubble" data-seed="${i}" cx="${610+i%6*29}" cy="${595-Math.floor(i/6)*12}" r="${2.5+i%4}"/>`).join('')}</g><g id="steam-plumes" opacity="0">${[0,1,2,3].map(i=>`<path class="steam-wisp" d="M${661+i*18} 467C${633+i*18} 436 ${691+i*18} 411 ${664+i*18} 372"/>`).join('')}</g></g>
 ${tube(steam)}${tube(cooling,10)}
 <g class="glass-glint" fill="none"><path class="render-fallback" d="M650 332V367C650 395 586 410 585 493V555Q585 614 644 623"/><path d="M1010 277V463Q1010 500 979 502"/><path d="M1120 207H1456Q1547 207 1547 293"/></g>
 <g class="heater"><ellipse cx="690" cy="644" rx="116" ry="12" fill="#b4b7a5"/><rect x="574" y="644" width="232" height="25" rx="8" fill="url(#metal-soft)"/><ellipse cx="690" cy="646" rx="105" ry="7" fill="#e5e2cf"/><path id="heater-ring" d="M600 652H780" stroke="#b79b7a" stroke-width="3" stroke-linecap="round" opacity=".25"/></g>
 <g class="glass-vessel render-fallback"><path d="${receiver}"/><ellipse cx="1540" cy="490" rx="23" ry="5"/></g>
 ${material('extraction',1122,1402,[139,167,845,1082],1455,485,170,175)}
 <g mask="url(#receiverMaterial)"><g id="receiver-liquid" opacity="0"><path d="M1450 591Q1540 581 1630 591V667H1450Z" fill="url(#essence-gradient)"/><ellipse cx="1540" cy="591" rx="85" ry="5" fill="var(--essence)" opacity=".35"/></g><ellipse id="drop-ripple" cx="1540" cy="598" rx="3" ry="1" fill="none" stroke="var(--essence)" stroke-width="1.4" opacity="0"/></g>
 <path class="glass-glint render-fallback" d="M1516 504V536C1516 563 1464 570 1464 613V629Q1464 648 1492 650"/>
 <g class="process-routes"><path class="process-route" d="${steam}"/><path class="process-route" d="${cooling}"/></g>
 <path id="falling-drop" d="M1540 518C1540 518 1534 526 1534 530A6 6 0 0 0 1546 530C1546 526 1540 518 1540 518Z" fill="var(--essence)" stroke="#fffef7" stroke-width=".8" opacity="0"/>
 <g class="set-labels" fill="#959a87" font-size="12" letter-spacing="2"><text x="612" y="717">01 / EXTRACTION</text><text x="1072" y="717">02 / CONDENSATION</text><text x="1475" y="717">03 / ESSENCE</text></g>
</g>
<g id="flow-beads">${[0,1,2].map(route=>Array.from({length:8},(_,i)=>`<circle class="flow-bead" data-route="${route}" data-seed="${i}" r="${route===2?5.2:5.6}" opacity="0"/>`).join('')).join('')}</g>
<g id="release-connection">${tube(link)}</g></svg>
<div id="release-station">
 <svg class="blue-apparatus" viewBox="0 0 960 500" aria-label="柔和层次的正面克莱因蓝闻香盒上半部">
  ${funnel(200,65)}${funnel(500,65)}
  ${tube('M65 200H112',13)}
  ${material('cobalt-body',1796,876,[97,123,1602,658],65,177,695,338,'cobalt-render')}
  <g fill="#123e99" stroke="#aac9ed" stroke-opacity=".5">${[[200,194],[500,194],[320,225],[620,225]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="15" ry="4.5"/>`).join('')}</g>
  ${tube('M200 173V194',12)}${tube('M500 173V194',12)}
  ${funnel(320,116)}${funnel(620,116)}
  <g fill="url(#bolt)" stroke="#82969a" stroke-width="1">${[[80,210],[730,210],[80,478],[730,478]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="11"/><circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#eff6ed" stroke-opacity=".5"/><path d="M${x-4} ${y+3}L${x+4} ${y-3}" fill="none" stroke="#637878" stroke-width="1.7"/>`).join('')}<rect x="51" y="187" width="28" height="26" rx="5"/><rect x="731" y="231" width="28" height="28" rx="5"/></g>
  ${tube('M745 245H770Q787 245 787 221V205Q787 180 812 180H875',12)}
  <text x="395" y="462" font-size="13" text-anchor="middle" fill="#e4e8ee" opacity=".7" letter-spacing="5">BOTANICAL / SCENT</text>
 </svg>
 <div class="scent-port" data-channel="1" style="left:20.8333%;top:13%"></div><div class="scent-port" data-channel="2" style="left:52.0833%;top:13%"></div><div class="scent-port" data-channel="4" style="left:33.3333%;top:23.2%"></div><div class="scent-port" data-channel="8" style="left:64.5833%;top:23.2%"></div>
 <button id="squeeze-bulb" aria-label="挤压气囊，喷雾并生成卡片" title="按住并松开气囊"><svg class="bulb-image" viewBox="0 0 150 285" aria-hidden="true"><path d="M70 3H80V39C80 60 127 86 131 151C137 221 106 261 75 264C44 261 13 221 19 151C23 86 70 60 70 39Z" fill="url(#rubber)" stroke="#445044" stroke-width="1"/><path d="M74 9V35" stroke="#828a7d" stroke-width="2"/><path d="M43 120Q27 165 40 205" stroke="#a0a595" stroke-opacity=".18" stroke-width="4" fill="none"/></svg><span class="bulb-hint">轻轻挤压 · RELEASE</span></button>
</div>${printerMarkup()}`;}
