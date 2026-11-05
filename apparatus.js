import {printerMarkup} from './printer.js';
const coilY=Array.from({length:7},(_,i)=>'C940 '+(220+i*31)+' 995 '+(220+i*31)+' 990 '+(233+i*31)+' C984 '+(247+i*31)+' 935 '+(247+i*31)+' 945 '+(260+i*31)).join(' ');
const coilX=Array.from({length:11},(_,i)=>'C'+(1230+i*40)+' 407 '+(1230+i*40)+' 492 '+(1250+i*40)+' 485 C'+(1270+i*40)+' 479 '+(1270+i*40)+' 408 '+(1290+i*40)+' 417').join(' ');
export function apparatusMarkup(){return `
<svg viewBox="0 0 3700 840" class="glass-scene" aria-label="轻盈的锥形收集瓶、玻璃提取与冷凝装置">
<defs>
 <linearGradient id="tube-edge" x2="0" y2="1"><stop stop-color="#8d9994" stop-opacity=".5"/><stop offset=".2" stop-color="#fdfdf9" stop-opacity=".8"/><stop offset=".6" stop-color="#d7e0d9" stop-opacity=".11"/><stop offset="1" stop-color="#9aaba4" stop-opacity=".48"/></linearGradient>
 <linearGradient id="essence-gradient" x2="0" y2="1"><stop stop-color="var(--essence,#b4aa90)" stop-opacity=".1"/><stop offset="1" stop-color="var(--essence,#b4aa90)" stop-opacity=".48"/></linearGradient>
 <radialGradient id="warmth"><stop stop-color="#d9c8a7" stop-opacity=".45"/><stop offset="1" stop-color="#d9c8a7" stop-opacity="0"/></radialGradient>
 <filter id="contact"><feGaussianBlur stdDeviation="6"/></filter>
 <clipPath id="bottleClip"><path d="M182 255H268V350Q270 365 280 390L350 625Q355 660 325 665H125Q90 660 98 625L170 390Q180 365 182 350Z"/></clipPath>
</defs>
<g id="collector">
 <ellipse cx="225" cy="681" rx="130" ry="7" fill="#677567" opacity=".09" filter="url(#contact)"/>
 <image class="conical-vessel" href="assets/conical-flask.png" x="70" y="220" width="310" height="465" preserveAspectRatio="none" opacity=".64"/>
 <g clip-path="url(#bottleClip)"><g id="essence-pool" opacity="0"><path d="M94 570Q225 562 355 570V675H94Z" fill="url(#essence-gradient)"/><ellipse cx="225" cy="570" rx="130" ry="6" fill="var(--essence,#b4aa90)" opacity=".18"/></g><g id="bottle-plants"></g></g>
 <path d="M181 275V348Q180 365 168 399L108 609M271 280V350Q274 368 286 405L342 610" fill="none" stroke="#fdfefb" stroke-opacity=".43" stroke-width="1.5"/>
 <ellipse id="mouth-glow" cx="225" cy="255" rx="48" ry="10" fill="none" stroke="#9aae9b" stroke-width="2"/>
</g>
<g id="glass-extension">
 <path class="glass-connector" d="M269 327H380Q410 327 410 347V385H482" fill="none" stroke="url(#tube-edge)" stroke-width="9"/>
 <path d="M269 324H380Q413 324 413 347V382H482" fill="none" stroke="#fcfcf8" stroke-width="1.2" opacity=".55"/>
 <ellipse cx="1230" cy="694" rx="670" ry="7" fill="#677567" opacity=".06" filter="url(#contact)"/>
 <image class="physical-lab minimal-lab" href="assets/minimal-lab.png" x="470" y="80" width="1500" height="600" preserveAspectRatio="none"/>
 <ellipse id="heat-halo" cx="860" cy="580" rx="120" ry="52" fill="url(#warmth)" opacity="0"/>
 <g class="fluid-layer" transform="translate(470 80) scale(.75)">
  <path class="process-route" d="M0 407H485V605"/>
  <path class="process-route" d="M520 350Q520 295 580 295H720Q790 295 790 220V110Q790 40 860 40H920Q980 40 980 110V190M955 220${coilY}V500Q955 535 1004 535H1025Q1060 535 1060 500Q1060 450 1132 450H1205"/>
  <path class="process-route" d="M1205 450L1230 417${coilX}L1730 450H1770Q1808 450 1808 490V580"/>
  <g id="bubbles" opacity="0">${Array.from({length:12},(_,i)=>`<circle class="process-bubble" cx="${485+(i%4)*19}" cy="${640-(i%3)*12}" r="${2+i%3}" style="animation-delay:${-i*.27}s"/>`).join('')}</g>
  <g id="receiver-liquid" opacity="0"><path d="M1775 680H1840L1865 725Q1808 743 1750 725Z" fill="url(#essence-gradient)"/><ellipse cx="1808" cy="681" rx="33" ry="4" fill="var(--essence,#b4aa90)" opacity=".35"/></g>
  <circle id="falling-drop" cx="1808" cy="600" r="3" fill="var(--essence,#b4aa90)" opacity="0"/>
 </g>
</g>
<g id="release-connection" fill="none"><path d="M1962 204H2110Q2140 204 2140 240V474Q2140 489 2162 489H2268" stroke="url(#tube-edge)" stroke-width="9"/><path d="M1962 201H2110Q2137 201 2137 240V474Q2137 492 2162 492H2268" stroke="#fcfcf9" stroke-width="1.2" opacity=".65"/></g>
</svg>
<div id="release-station">
 <img class="blue-apparatus" src="assets/frontal-klein.png" alt="正面朝向的克莱因蓝闻香盒上半部" draggable="false">
 <div class="scent-port" data-channel="1" style="left:31%;top:9%"></div><div class="scent-port" data-channel="2" style="left:62%;top:9%"></div><div class="scent-port" data-channel="4" style="left:35%;top:23%"></div><div class="scent-port" data-channel="8" style="left:65%;top:23%"></div>
 <button id="squeeze-bulb" aria-label="挤压气囊，喷雾并生成卡片" title="按住并松开气囊"><span class="bulb-image" aria-hidden="true"></span><span class="bulb-hint">轻轻挤压 · RELEASE</span></button>
</div>
${printerMarkup()}`;}
