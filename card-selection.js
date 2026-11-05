// Bind by stable asset name, never by the moving chime's array position.
// The original scene names, channels and visible controls are intentionally untouched.
const ids={
 'pink-loops':'plant_01','blue-bloom':'plant_02','pink-tassel':'plant_03',
 'ghost-orchid':'plant_04','herb':'plant_05','wood':'plant_06',
 'ginger':'plant_07','citrus':'plant_08','bark':'plant_09',
 'plant-0':'plant_10','plant-1':'plant_11','plant-2':'plant_12',
 'plant-4':'plant_13','plant-5':'plant_14','plant-6':'plant_15',
 'plant-3':'plant_16'
};
export function cardPlantIds(assets){
 return [...new Set(assets.map(asset=>{
  const name=asset.split('/').pop().replace(/\.png$/,'');
  if(!ids[name])throw Object.assign(new Error('这枚植物尚未配置出卡规则，请重新选择。'),{code:'UNKNOWN_PLANT'});
  return ids[name];
 }))];
}
// User delegated this additional chime specimen's channel choice: amber → D.
export const extraPlant={id:'plant_16',number:16,name:'琥珀褶',scentChannel:'D',layoutRole:'Support',placementType:'round',assetPath:'../assets/plant-3.png'};
