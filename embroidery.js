const titles={
 observe:['hero-observe.png','A little wind. A living stillness.'],
 collect:['hero-collect.png','Gather what speaks to you.'],
 release:['hero-release.png','An invisible connection.']
};
export function embroideredText(lines,{brand=false}={}){
 if(brand)return '<span class="brand-art"><img src="assets/title-stitched.png" alt="Botanical Apparatus"></span>';
 const key=lines[0]?.startsWith('Gather')?'collect':lines[0]?.startsWith('An invisible')?'release':'observe';
 const [asset,alt]=titles[key];
 return '<span class="embroidered-art"><img src="assets/'+asset+'" alt="'+alt+'" draggable="false"></span>';
}
