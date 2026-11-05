const specimens=[
 ['Golden arc','金弧花','Pollen · Citrus · Warm air',1,'plant-0'],
 ['Porcelain lily','瓷光百合','White petals · Silk · Dew',2,'plant-1'],
 ['Blush bell','胭脂铃','Petal · Powder · Soft musk',2,'plant-2'],
 ['Amber ruffle','琥珀褶','Amber · Resin · Warm glass',4,'plant-3'],
 ['Lace calla','蕾丝马蹄莲','Velvet · Rosewood · Rain',4,'plant-4'],
 ['Jewel lantern','珠光灯笼','Berry · Iris · Evening air',8,'plant-5'],
 ['Lunar filament','月丝花','Iris · Mineral · Clean air',2,'plant-6'],
 ['Ghost orchid','幽兰','White petals · Dew · Moss',8,'ghost-orchid'],
 ['Needle herb','针叶草本','Green needles · Forest air',8,'herb'],
 ['Dark pod','深色香荚','Dry wood · Vanilla · Smoke',4,'wood'],
 ['Ginger root','姜根','Warm spice · Earth · Zest',1,'ginger'],
 ['Dried citrus','干橙片','Orange peel · Sun · Tea',1,'citrus'],
 ['Wood sliver','木质薄片','Dry wood · Bark · Earth',4,'bark'],
 ['Pink loops','粉丝花','Petal · Nectar · Soft air',2,'pink-loops'],
 ['Blush tassel','流苏花','Blush petals · Silk · Dew',2,'pink-tassel'],
 ['Azure bloom','蓝羽花','Blue petals · Rain · Green stem',8,'blue-bloom']
];
// Eight strands, two selectable specimens and jewelry accents each.
const arrangement=[
 [1,0,80,148,-7],[9,0,264,90,15],
 [2,1,122,136,8],[8,1,292,116,-14],
 [0,2,66,128,-9],[11,2,252,88,12],
 [4,3,132,126,6],[10,3,310,94,-12],
 [6,4,82,138,-6],[13,4,262,115,14],
 [3,5,132,116,9],[12,5,289,100,-14],
 [5,6,68,124,-5],[15,6,256,108,9],
 [7,7,104,116,5],[14,7,268,119,-8]
];
export const botanicals=arrangement.map(([specimen,strand,offset,size,rotation],id)=>{
 const [name,zh,notes,channel,asset]=specimens[specimen];
 return {id,name,zh,notes,channel,asset:`assets/${asset}.png`,strand,offset:offset+[-8,12,-16,22,-10,8,15,30][strand],size:size*.95*.90,rotation};
});
export const scentResults={1:'Golden Air',2:'Petal Reverie',3:'Soft Radiance',4:'Amber Silence',5:'Solar Trace',6:'Velvet Garden',7:'A Tender Alchemy',8:'Moon Study',9:'Wild Light',10:'Night Bloom',11:'Blush Atmosphere',12:'Earth & Ether',13:'Secret Herbarium',14:'Velvet Afterglow',15:'Botanical Apparatus'};
