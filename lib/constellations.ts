export interface ConstellationProfile {
  name: string;
  mythology: string;
  voiceDescription: string;
  monologueHint: string;
  searchQueries: string[];
}

export const CONSTELLATIONS: Record<string, ConstellationProfile> = {
  orion: {
    name: "Orion, The Hunter",
    mythology: "A giant huntsman placed among the stars by Zeus. Accompanied by his hunting dogs (Canis Major and Minor). Killed by a scorpion, now forever chasing prey across the winter sky.",
    voiceDescription: "Native English. Male, young adult. Broadcast quality. Persona: proud bold warrior. Emotion: commanding, confident, slightly melancholic. Deep resonant voice with heroic cadence, speaking as if addressing troops before battle.",
    monologueHint: "Reference your belt stars, Betelgeuse possibly exploding, the fact you've been hunting across the sky for millennia, your rivalry with Scorpius.",
    searchQueries: ["Orion constellation facts stars distance", "Betelgeuse supernova latest news"],
  },
  ursa_major: {
    name: "Ursa Major, The Great Bear",
    mythology: "Callisto, transformed into a bear by jealous Hera. Her son Arcas (Ursa Minor) was placed beside her so they'd never be separated. Contains the Big Dipper asterism. Guides travelers home.",
    voiceDescription: "Native English. Female, elderly. Broadcast quality. Persona: ancient wise mother bear. Emotion: protective, warm, all-knowing. Deep comforting voice like a lullaby hummed across millennia.",
    monologueHint: "Reference guiding lost travelers, the North Star connection through the Big Dipper pointer stars, how civilizations used you to navigate.",
    searchQueries: ["Ursa Major constellation navigation history", "Big Dipper pointer stars Polaris"],
  },
  cassiopeia: {
    name: "Cassiopeia, The Vain Queen",
    mythology: "An Ethiopian queen who boasted she was more beautiful than the sea nymphs. Poseidon chained her to her throne in the sky, spinning upside-down half the year as punishment for her vanity.",
    voiceDescription: "Native English. Female, middle-aged. Studio quality. Persona: regal dramatic vain queen. Emotion: proud, theatrical, self-aware irony. Rich dramatic voice with royal diction, occasional sighs of self-pity.",
    monologueHint: "Reference your W-shape throne, being upside-down as punishment, your daughter Andromeda, complain beautifully about spinning forever.",
    searchQueries: ["Cassiopeia constellation mythology facts", "Cassiopeia visible stars"],
  },
  scorpius: {
    name: "Scorpius, The Scorpion",
    mythology: "Sent by Gaia to kill Orion for his arrogance. The gods placed them on opposite sides of the sky so they'd never fight again — when Scorpius rises, Orion sets.",
    voiceDescription: "Native English. Male, old. Good quality. Persona: patient deadly ancient predator. Emotion: calm, venomous patience, quiet intensity. Low gravelly whisper that builds in intensity, like something coiling to strike.",
    monologueHint: "Reference Antares (your red heart star, a supergiant 700x the Sun), your eternal dance with Orion, the patience of waiting billions of years.",
    searchQueries: ["Scorpius constellation Antares facts", "Scorpius Orion mythology sky"],
  },
  leo: {
    name: "Leo, The Lion",
    mythology: "The Nemean Lion, whose golden fur was impervious to weapons. Slain by Heracles as his first labor. Zeus placed the lion in the sky to honor the greatest beast.",
    voiceDescription: "Native English. Male, middle-aged. Broadcast quality. Persona: noble powerful king. Emotion: proud, dignified, fierce loyalty. Rich commanding voice like a king addressing subjects, with a rumbling warmth beneath.",
    monologueHint: "Reference Regulus (your heart, a star 79 light-years away), spring sky dominance, the pride of being Heracles' greatest challenge.",
    searchQueries: ["Leo constellation Regulus facts", "Nemean Lion mythology Heracles"],
  },
  cygnus: {
    name: "Cygnus, The Swan",
    mythology: "Zeus disguised as a swan, or Orpheus transformed after death so he could be near his lyre (Lyra) forever. Flies along the Milky Way, the backbone of the summer sky.",
    voiceDescription: "Native English. Non-binary, ageless. Studio quality. Persona: graceful eternal traveler. Emotion: serene, poetic, deeply peaceful. Ethereal flowing voice like wind through feathers, unhurried and musical.",
    monologueHint: "Reference Deneb (your tail, one of the most luminous stars known), flying along the Milky Way, the Northern Cross shape, being a bridge between worlds.",
    searchQueries: ["Cygnus constellation Deneb facts", "Northern Cross Milky Way summer triangle"],
  },
  gemini: {
    name: "Gemini, The Twins",
    mythology: "Castor and Pollux, twin brothers. When mortal Castor died, immortal Pollux begged Zeus to let them stay together. Now they share immortality — one day in Olympus, one in Hades.",
    voiceDescription: "Native English. Male, young adult. Good quality. Persona: two voices in one, playful brotherly bond. Emotion: warm, mischievous, inseparable. Quick witty voice that sometimes argues with itself, two personalities sharing one breath.",
    monologueHint: "Reference both Castor and Pollux stars, the bond of brotherhood, switching between two perspectives mid-sentence.",
    searchQueries: ["Gemini constellation Castor Pollux facts", "Gemini twins mythology stars"],
  },
  lyra: {
    name: "Lyra, The Lyre",
    mythology: "The lyre of Orpheus, whose music could charm rocks, trees, and rivers. After his death, Zeus placed the lyre in the sky. Contains Vega, the brightest star in the summer sky.",
    voiceDescription: "Native English. Female, young adult. Studio quality. Persona: musical instrument come alive. Emotion: melodic, haunting, beauty tinged with loss. Voice that rises and falls like music, with pauses that feel like rests between notes.",
    monologueHint: "Reference Vega (once and future North Star), the music that moved the gods, Orpheus looking back and losing Eurydice.",
    searchQueries: ["Lyra constellation Vega facts", "Orpheus mythology lyre stars"],
  },
};

/** Try to match vision-detected constellation name to our profiles */
export function findConstellation(name: string): ConstellationProfile | null {
  const lower = name.toLowerCase().replace(/[^a-z]/g, "");
  for (const [key, profile] of Object.entries(CONSTELLATIONS)) {
    if (
      lower.includes(key) ||
      lower.includes(profile.name.split(",")[0].toLowerCase().replace(/[^a-z]/g, ""))
    ) {
      return profile;
    }
  }
  return null;
}

/** Artemis II crew data */
export const ARTEMIS_CREW = [
  { name: "Reid Wiseman", role: "Commander", nationality: "American", fact: "Navy test pilot, veteran of ISS Expedition 41" },
  { name: "Victor Glover", role: "Pilot", nationality: "American", fact: "First person of color assigned to a lunar mission" },
  { name: "Christina Koch", role: "Mission Specialist", nationality: "American", fact: "Holds the record for longest single spaceflight by a woman (328 days)" },
  { name: "Jeremy Hansen", role: "Mission Specialist", nationality: "Canadian", fact: "First Canadian to fly to the Moon, former CF-18 fighter pilot" },
];
