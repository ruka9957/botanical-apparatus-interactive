/**
 * Reference resolver, V4.1. Pure data only: no DOM, API, image loading or layout.
 * rules is the parsed companion scent-card-rules-v4.json.
 */
export function resolveScentCard(selectedPlantIds, rules, options = {}) {
  function fail(code, message) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }
  if (!Array.isArray(selectedPlantIds) || selectedPlantIds.some(id => typeof id !== 'string')) {
    fail('INVALID_SELECTION', 'selectedPlantIds 必须是植物 ID 字符串数组。');
  }
  const ids = [...new Set(selectedPlantIds)]; // Preserve selection order for ordered layouts.
  const min = options.allowSingleForDebug === true ? 1 : 2;
  if (ids.length < min) fail('TOO_FEW_PLANTS', `至少选择 ${min} 件不同植物。`);
  if (ids.length > 8) fail('TOO_MANY_PLANTS', '最多选择 8 件不同植物。');
  if (!rules || !Array.isArray(rules.plants) || !Array.isArray(rules.personas) || !Array.isArray(rules.templates)) {
    fail('CONFIG_MISMATCH', '缺少 V4 植物、人格或模板配置。');
  }
  const plantById = new Map(rules.plants.map(p => [p.id, p]));
  if (plantById.size !== rules.plants.length) fail('CONFIG_MISMATCH', '植物 ID 重复。');
  const channels = new Set();
  for (const id of ids) {
    const plant = plantById.get(id);
    if (!plant) fail('UNKNOWN_PLANT', `未知植物 ID：${id}`);
    if (!['A', 'B', 'C', 'D'].includes(plant.scentChannel)) {
      fail('INVALID_CHANNEL', `植物通道不合法：${id}`);
    }
    channels.add(plant.scentChannel);
  }
  const channelKey = [...channels].sort().join('');
  const personaId = rules.channelPersonaIds?.[channelKey];
  const matchingPersonas = rules.personas.filter(p => p.id === personaId);
  if (matchingPersonas.length !== 1) fail('CONFIG_MISMATCH', `人格映射缺失或重复：${channelKey}`);
  const persona = matchingPersonas[0];
  if (persona.channelKey !== channelKey) fail('CONFIG_MISMATCH', '人格与通道键不一致。');
  const matchingTemplates = rules.templates.filter(t => t.id === persona.templateId);
  if (matchingTemplates.length !== 1) fail('CONFIG_MISMATCH', 'V4 模板配对缺失或重复。');
  const template = matchingTemplates[0];
  if (template.personaId !== personaId) fail('CONFIG_MISMATCH', '模板与人格编号不一致。');
  return {
    selectedPlantIds: ids,
    channels: [...channelKey],
    channelKey,
    personaId,
    personaName: persona.name,
    personaTitle: persona.title,
    templateId: template.id,
    compositionMode: template.compositionMode,
    canvas: { ...rules.canvas },
    seed: String(options.seed ?? 'default'),
    assetBase: rules.assetBase,
    assets: {
      background: template.backgroundPath,
      textLayer: template.textLayerPath,
      plantAllowedMask: template.plantAllowedMaskPath,
      smallTextProtection: template.smallTextProtectionPath,
      textInkMask: template.textInkMaskPath,
      foregroundLayers: [...(template.foregroundLayers ?? [])]
    }
  };
}
