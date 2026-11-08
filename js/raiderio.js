// ⚡ Raider.IO — API pública, sin claves
const RIO = {
  slug(realm) {
    return realm.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/['’`]/g, '').trim().replace(/\s+/g, '-');
  },

  async fetch(region, realm, name) {
    const fields = 'gear,mythic_plus_scores_by_season:current,mythic_plus_weekly_highest_level_runs,raid_progression';
    const url = `https://raider.io/api/v1/characters/profile?region=${encodeURIComponent(region)}` +
      `&realm=${encodeURIComponent(RIO.slug(realm))}&name=${encodeURIComponent(name.trim())}&fields=${fields}`;
    let res;
    try { res = await fetch(url); }
    catch { throw new Error('No se pudo conectar con Raider.IO'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (/not find/i.test(data.message || '')) throw new Error('Raider.IO no encuentra ese personaje. Revisa nombre, reino y región');
      throw new Error(data.message || `Error ${res.status} de Raider.IO`);
    }
    return data;
  },

  // Convierte la respuesta en campos del códice
  map(d, raids) {
    const cls = RIO_CLASS[d.class] || 'war';
    const specIdx = (RIO_SPECS[cls] || []).indexOf(d.active_spec_name);
    const spec = CLASSES[cls].specs[specIdx >= 0 ? specIdx : 0][0];
    const score = d.mythic_plus_scores_by_season?.[0]?.scores?.all;
    const runs = (d.mythic_plus_weekly_highest_level_runs || []).map(r => +r.mythic_level || 0).sort((a, b) => b - a);

    // Progreso de banda: prioriza las bandas que tienes configuradas
    let raid = '';
    const prog = d.raid_progression || {};
    const known = raids.map(r => r.id).find(id => prog[id]);
    const entry = prog[known] || Object.values(prog).find(p => p.summary && !/^0\//.test(p.summary));
    if (entry) {
      const parts = [];
      if (entry.normal_bosses_killed) parts.push(`${entry.normal_bosses_killed}/${entry.total_bosses} N`);
      if (entry.heroic_bosses_killed) parts.push(`${entry.heroic_bosses_killed}/${entry.total_bosses} H`);
      if (entry.mythic_bosses_killed) parts.push(`${entry.mythic_bosses_killed}/${entry.total_bosses} M`);
      raid = parts.join(' · ') || entry.summary || '';
    }

    return {
      name: d.name,
      realm: d.realm,
      region: (d.region || 'eu').toLowerCase(),
      faction: d.faction === 'alliance' ? 'Alianza' : 'Horda',
      race: RIO_RACE[d.race] || 'Otra',
      cls, spec,
      ilvl: Math.round(d.gear?.item_level_equipped || 0),
      mplus: Math.round(score || 0),
      raid,
      thumb: d.thumbnail_url || '',
      profileUrl: d.profile_url || '',
      weeklyRuns: runs,
      synced: Date.now(),
    };
  },
};
