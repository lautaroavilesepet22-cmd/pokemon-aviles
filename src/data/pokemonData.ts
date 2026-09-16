import { PokemonStats, Move, InventoryItem } from '../types';

export const MOVES: Record<string, Move> = {
  PLACAJE: {
    id: 'PLACAJE',
    name: 'Placaje',
    type: 'NORMAL',
    power: 35,
    accuracy: 95,
    maxPP: 35,
    currentPP: 35,
    effect: 'DAMAGE',
  },
  GRUNIDO: {
    id: 'GRUNIDO',
    name: 'Gruñido',
    type: 'NORMAL',
    power: 0,
    accuracy: 100,
    maxPP: 40,
    currentPP: 40,
    effect: 'LOWER_ATTACK',
  },
  ASCUAS: {
    id: 'ASCUAS',
    name: 'Ascuas',
    type: 'FUEGO',
    power: 40,
    accuracy: 100,
    maxPP: 25,
    currentPP: 25,
    effect: 'DAMAGE',
  },
  LATIGO_CEPA: {
    id: 'LATIGO_CEPA',
    name: 'Látigo Cepa',
    type: 'PLANTA',
    power: 45,
    accuracy: 100,
    maxPP: 25,
    currentPP: 25,
    effect: 'DAMAGE',
  },
  PISTOLA_AGUA: {
    id: 'PISTOLA_AGUA',
    name: 'Pistola Agua',
    type: 'AGUA',
    power: 40,
    accuracy: 100,
    maxPP: 25,
    currentPP: 25,
    effect: 'DAMAGE',
  },
  ATAQUE_ARENA: {
    id: 'ATAQUE_ARENA',
    name: 'At. Arena',
    type: 'TIERRA',
    power: 0,
    accuracy: 100,
    maxPP: 15,
    currentPP: 15,
    effect: 'LOWER_ATTACK',
  },
  IMPACTRUENO: {
    id: 'IMPACTRUENO',
    name: 'Impactrueno',
    type: 'ELECTRICO',
    power: 40,
    accuracy: 100,
    maxPP: 30,
    currentPP: 30,
    effect: 'DAMAGE',
  },
  MORDISCO: {
    id: 'MORDISCO',
    name: 'Mordisco',
    type: 'NORMAL',
    power: 42,
    accuracy: 100,
    maxPP: 25,
    currentPP: 25,
    effect: 'DAMAGE',
  },
};

export const INITIAL_POKEMON: Record<string, PokemonStats> = {
  CHARMANDER: {
    id: 'CHARMANDER',
    name: 'Charmander',
    level: 5,
    maxHp: 20,
    currentHp: 20,
    attack: 11,
    defense: 9,
    speed: 13,
    exp: 0,
    maxExp: 45,
    types: ['FUEGO'],
    moves: [
      { ...MOVES.PLACAJE },
      { ...MOVES.GRUNIDO },
      { ...MOVES.ASCUAS },
    ],
    color: '#F08030',
    accentColor: '#E03010',
  },
  BULBASAUR: {
    id: 'BULBASAUR',
    name: 'Bulbasaur',
    level: 5,
    maxHp: 21,
    currentHp: 21,
    attack: 10,
    defense: 10,
    speed: 10,
    exp: 0,
    maxExp: 45,
    types: ['PLANTA', 'VENENO'],
    moves: [
      { ...MOVES.PLACAJE },
      { ...MOVES.GRUNIDO },
      { ...MOVES.LATIGO_CEPA },
    ],
    color: '#78C850',
    accentColor: '#4E8234',
  },
  SQUIRTLE: {
    id: 'SQUIRTLE',
    name: 'Squirtle',
    level: 5,
    maxHp: 22,
    currentHp: 22,
    attack: 9,
    defense: 12,
    speed: 9,
    exp: 0,
    maxExp: 45,
    types: ['AGUA'],
    moves: [
      { ...MOVES.PLACAJE },
      { ...MOVES.GRUNIDO },
      { ...MOVES.PISTOLA_AGUA },
    ],
    color: '#6890F0',
    accentColor: '#3850B0',
  },
};

export const WILD_POKEMON_LIST: Array<() => PokemonStats> = [
  () => ({
    id: 'PIDGEY',
    name: 'Pidgey',
    level: Math.random() > 0.4 ? 3 : 4,
    maxHp: 16,
    currentHp: 16,
    attack: 8,
    defense: 7,
    speed: 10,
    exp: 0,
    maxExp: 30,
    types: ['NORMAL', 'VOLADOR'],
    moves: [
      { ...MOVES.PLACAJE },
      { ...MOVES.ATAQUE_ARENA },
    ],
    color: '#A890F0',
    accentColor: '#A890F0',
  }),
  () => ({
    id: 'RATTATA',
    name: 'Rattata',
    level: Math.random() > 0.5 ? 3 : 2,
    maxHp: 15,
    currentHp: 15,
    attack: 10,
    defense: 6,
    speed: 13,
    exp: 0,
    maxExp: 25,
    types: ['NORMAL'],
    moves: [
      { ...MOVES.PLACAJE },
      { ...MOVES.GRUNIDO },
    ],
    color: '#A85888',
    accentColor: '#783858',
  }),
  () => ({
    id: 'PIKACHU',
    name: 'Pikachu',
    level: 4,
    maxHp: 18,
    currentHp: 18,
    attack: 11,
    defense: 7,
    speed: 15,
    exp: 0,
    maxExp: 35,
    types: ['ELECTRICO'],
    moves: [
      { ...MOVES.IMPACTRUENO },
      { ...MOVES.GRUNIDO },
    ],
    color: '#F8D030',
    accentColor: '#B89010',
  }),
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'POKEBALL',
    name: 'Poké Ball',
    count: 15,
    description: 'Dispositivo en forma de cápsula para atrapar Pokémon salvajes.',
    category: 'POKEBALL',
  },
  {
    id: 'POTION',
    name: 'Poción',
    count: 3,
    description: 'Medicina en aerosol que restaura hasta 20 PS de un Pokémon herido.',
    category: 'MEDICINE',
  },
];

export const TILE_COLORS = {
  G: '#48A048', // Césped base
  H: '#186818', // Hierba Alta (Encuentros)
  P: '#E0C068', // Camino de tierra
  T: '#206020', // Árbol frondoso (Sólido)
  W: '#4878D0', // Agua lago (Sólido)
  R: '#D83828', // Techo rojo casa (Sólido)
  B: '#2868A8', // Techo azul laboratorio (Sólido)
  L: '#F0E8D0', // Pared casa/edificio (Sólido)
  D: '#704020', // Puerta madera
  F: '#C08848', // Valla de madera (Sólido)
  S: '#886840', // Cartel de madera interactivo
  '*': '#48A048', // Flores silvestres decorativas
  M: '#D83828', // Buzón rojo de correo
};

// Mapa extendido: 21 columnas x 40 filas
// Filas 0 a 13: RUTA 2 (NUEVA RUTA - Camino montañoso, Pikachu y Pidgey de mayor nivel, claros floridos)
// Filas 14 a 26: RUTA 1 (Camino campestre con hierba alta densa)
// Filas 27 a 39: PUEBLO PALETA (Casa de Red, Laboratorio de Oak, estanque y jardines)
export const OVERWORLD_MAP: string[] = [
  'TTTTTTTTT...TTTTTTTTT', // 0: Ruta 2 norte
  'T.HHHHHH....HHHHHHH.T', // 1: Ruta 2 hierba espesa
  'T.HHHHHH....HHHHHHH.T', // 2: Ruta 2
  'T...*....PP.....*...T', // 3: Ruta 2 flores
  'T.HHHH...PP..HHHHHH.T', // 4: Ruta 2
  'T.HHHH.S.PP..HHHHHH.T', // 5: Cartel Ruta 2
  'T...*....PP.....*...T', // 6: Ruta 2
  'TTFFFFF..PP..FFFFFTTT', // 7: Valla montañosa Ruta 2
  'T.HHHHH..PP..HHHHHH.T', // 8: Ruta 2
  'T.HHHHH..PP.....*...T', // 9: Ruta 2
  'T..*.....PP..HHHHHH.T', // 10: Ruta 2
  'T.HHHHH..PP..HHHHHH.T', // 11: Ruta 2 sur
  'TTFFFFF..PP..FFFFFFTT', // 12: Valla divisoria Ruta 2 y Ruta 1
  'T...S....PP.....S...T', // 13: Cartel límite Ruta 2 / Ruta 1
  'T..HHHHH.PP.HHHHHHH.T', // 14: Ruta 1 norte
  'T..HHHHH.PP.HHHHHHH.T', // 15: Ruta 1
  'T...*....PP.....*...T', // 16: Flores en Ruta 1
  'T.HHHHH..PP..HHHHHH.T', // 17: Ruta 1
  'T.HHHHH..PP..HHHHHH.T', // 18: Ruta 1
  'T..*..S..PP.....*...T', // 19: Cartel Ruta 1
  'TTFFFFF..PP..FFFFFFTT', // 20: Valla divisoria Ruta 1
  'T..HHHH..PP.....HHH.T', // 21: Ruta 1
  'T..HHHH..PP..*..HHH.T', // 22: Ruta 1
  'T...*....PP.HHHH....T', // 23: Hierba y flores
  'T.HHHHH..PP.HHHHHHH.T', // 24: Ruta 1 sur
  'TTFFFFF..PP..FFFFFFTT', // 25: Valla sur Ruta 1
  'T...S....PP.....S...T', // 26: Límite Ruta 1 / Pueblo Paleta
  'T........PP.........T', // 27: Entrada norte Pueblo Paleta
  'T.RRRR...PP..BBBBBB.T', // 28: Casa de Red y Laboratorio de Oak
  'T.RRRR...PP..BBBBBB.T', // 29: Techos
  'T.LLLL...PP..LLLLLL.T', // 30: Paredes
  'T.MD.L...PP..L.DD.L.T', // 31: Puertas y buzón de Red
  'T.*.S....PP....S....T', // 32: Carteles Paleta y flores
  'T........PP.........T', // 33: Plaza central (Spawn jugador: Col 9, Row 33)
  'T.WWWW...PP...*..*..T', // 34: Estanque de agua y flores
  'T.WWWW...PP..FFFFF..T', // 35: Estanque
  'T.WWWW...PP.........T', // 36: Estanque sur
  'T........PP.........T', // 37: Camino sur
  'TTTTTTTTTTTTTTTTTTTTT', // 38: Frontera sur
  'TTTTTTTTTTTTTTTTTTTTT', // 39: Borde sur
];

export const MAP_SIGNS: Record<string, string> = {
  '7,5': 'RUTA 2: Camino silvestre hacia el Bosque Verde. ¡Pikachus salvajes habitan aquí!',
  '4,13': 'RUTA 2 (SUR) - ¡Cuidado con Pokémon salvajes de mayor nivel!',
  '16,13': 'CONSEJO: Puedes cambiar de Pokémon en combate seleccionando "POKÉMON".',
  '6,19': 'RUTA 1: Camino campestre hacia Ciudad Verde.',
  '4,26': 'PUEBLO PALETA: ¡De blanco puros comienzos!',
  '16,26': 'CONSEJO: Abre tu Mochila con [C] o [ENTER] para revisar tus Pokémon y objetos.',
  '4,32': 'CASA DE RED: ¡Hogar dulce hogar!',
  '15,32': 'LABORATORIO DEL PROFESOR OAK: Estudio y custodia de Pokémon.',
};
