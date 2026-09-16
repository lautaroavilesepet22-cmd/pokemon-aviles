/**
 * High-Resolution Pixel Art Sprite Engine for GBA Pokémon (FireRed / LeafGreen)
 * Features rich 32x32 pixel matrices, authentic color ramps, true GBA silhouettes,
 * and support for both Front and Back sprites for every Pokémon.
 */

export interface SpriteRenderOptions {
  time: number;
  blink: boolean;
  scale?: number;
  isFainting?: boolean;
  faintProgress?: number; // 0 to 1
  lungeOffset?: { x: number; y: number };
}

export interface PixelSpriteData {
  name: string;
  palette: Record<string, string>;
  grid: string[];
}

// -----------------------------------------------------------------------------
// RATTATA: Authentic GBA Front & Back Sprites
// Sleek quadruped rodent stance, curved spiral tail, white incisors & whiskers,
// ruby red eyes, folded pink ears, warm cream belly.
// -----------------------------------------------------------------------------

export const RATTATA_FRONT_SPRITE: PixelSpriteData = {
  name: 'Rattata',
  palette: {
    '#': '#22082C', // Delineado púrpura profundo
    'P': '#8A489C', // Púrpura principal
    'L': '#BA6AC8', // Lila claro (brillo y lomo)
    'S': '#542066', // Púrpura sombra
    'C': '#F6E8CC', // Crema vientre y hocico
    'c': '#D8C29C', // Sombra crema
    'K': '#F6A2BA', // Rosa suave oreja interior
    'D': '#C86684', // Sombra rosa oreja
    'W': '#FFFFFF', // Incisivos blancos, bigotes y brillo de ojos
    'R': '#D81818', // Ojo rojo rubí
    'B': '#1C1024', // Base bigotes y pupila
  },
  grid: [
    '................................',
    '..........................##....',
    '........##..............#PP#....',
    '.......#PP#............#P##.....',
    '......#PKKP#..........#PP#......',
    '.....#PKKKDP#........#PP#.......',
    '.....#PKKDDD#.......#PP#........',
    '....#PPKDD##.......#PP#.........',
    '....#PPP##........#PP#..........',
    '..##PPPLL#.......#PP#...........',
    '.#PPLLLLP##.....#PP#....##......',
    '#PLLLLPPPPP####.#PP#...#PP#.....',
    '#PLLPPPPPLLPPP##PP#...#PKKP#....',
    '.#PPRBWPPPPPP#PPP#...#PKKKDP#...',
    '..#PRRWPPPPP#PPP#....#PKDDD#....',
    '..#P#CCPPPPP###PP#...#PPDD##....',
    '..#CCCCCSPPPPPPPP#....##P#......',
    'W.#CCCWWSCPPPPPPPPS#...#P#......',
    '.W#CCCWWSCPPPPPPPPPPS###P#......',
    '..#CCCCCcSPPPPPPPPPPPS#S#.......',
    '..#CcCCCccSPPPPPPPPPPPS#........',
    '...#CCcCcCcSPPPPPPPPPPPS#.......',
    '....#CcCcCcSPPPPPPPPPPPPPS#.....',
    '.....#C##CcSPPPPPPPPPPPPPPS#....',
    '....#C#..#C#SPPPPPPPPPPPPPPS#...',
    '...#C#....#C#SPPPPPPPPPPPPPPS#..',
    '..#CC#.....#C#SPPPPPPPPP#####...',
    '..#WW#.....#C#.#SSSSSSSS#.......',
    '............#C#.#C#...#C#.......',
    '.............##.#WW#..#WW#......',
    '................................',
    '................................',
  ],
};

export const RATTATA_BACK_SPRITE: PixelSpriteData = {
  name: 'Rattata_Back',
  palette: {
    '#': '#22082C',
    'P': '#8A489C',
    'L': '#BA6AC8',
    'S': '#542066',
    'C': '#F6E8CC',
    'K': '#F6A2BA',
    'D': '#C86684',
    'W': '#FFFFFF',
  },
  grid: [
    '................................',
    '..........##....................',
    '.........#PP#...................',
    '........#P##....................',
    '.......#PP#.....................',
    '......#PP#......................',
    '.....#PP#.......##........##....',
    '....#PP#.......#PP#......#PP#...',
    '...#PP#.......#PKDP#....#PDKP#..',
    '...#PP#.......#PDDP#....#PDDP#..',
    '..#PP#.........#PP#......#PP#...',
    '..#PP#..........##........##....',
    '..#PP#.........#PPLLLLLLPP#.....',
    '...#PP#.......#PLLLLLLLLLLP#....',
    '....#PP#.....#PLLLLPPPPPLLLP#...',
    '.....#PP#####PLLPPSSSSSSSPLLP#..',
    '......##PPPPPPPPSSSSSSSSSSPPPP#.',
    '......#PPLLPPPPSSSSSSSSSSSSPPP#.',
    '.....#PLLLLLPPPSSSSSSSSSSSSPPP#.',
    '.....#PLLLLLPPPSSSSSSSSSSSSPPP#.',
    '....#PLLLLLLPPPSSSSSSSSSSSSPPP#.',
    '....#PLLLLLLPPPSSSSSSSSSSSSPPP#.',
    '....#PLLLLLLPPPSSSSSSSSSSSSPPP#.',
    '....#PLLLLLLPPPSSSSSSSSSSSSPPP#.',
    '.....#PLLLLPPPPSSSSSSSSSSSSPPP#.',
    '.....#CPLLPPPPSSSSSSSSSSSSSPPP#.',
    '....#CC#PPPPPSSSSSSSSSSSSSSPP#..',
    '...#CC#..#PPPPSSSSSSSSSSPPPP#...',
    '..#WW#....#PP##############.....',
    '...........#WW#..........#WW#...',
    '................................',
    '................................',
  ],
};

// -----------------------------------------------------------------------------
// CHARMANDER: Authentic GBA Front & Back Sprites
// Orange reptilian salamander with distinct muzzle/snout, teal eyes, cream belly,
// sturdy claws, and animated multi-layered fire flame at tail tip. (NO monkey traits!)
// -----------------------------------------------------------------------------

export const CHARMANDER_FRONT_SPRITE: PixelSpriteData = {
  name: 'Charmander_Front',
  palette: {
    '#': '#4A1408', // Delineado marrón rojizo
    'O': '#F08030', // Naranja piel salamandra
    'H': '#F8A050', // Naranja claro brillo cabeza/lomo
    'S': '#B84810', // Naranja sombra profunda
    'C': '#FFF0A8', // Crema vientre
    'c': '#E0C880', // Crema sombra
    'T': '#288090', // Azul turquesa ojo reptil
    't': '#50C8D8', // Turquesa claro iris
    'W': '#FFFFFF', // Brillo ojo y garras blancas
    'F': '#E82818', // Llama roja exterior
    'Y': '#F87810', // Llama naranja viva
    'G': '#F8D020', // Llama amarillo oro
    'Z': '#FFFEE0', // Llama núcleo blanco ardiente
  },
  grid: [
    '................................',
    '.............######.............',
    '...........##HHHHHH##...........',
    '..........#HHHHOOOHHH#..........',
    '.........#HHHOOOOOOOOH#.........',
    '........#HHOOOOOOOOOOOH#........',
    '........#HOOOOTTTOOOOOO#........',
    '........#HOOOTttWTOOOOO#........',
    '........#HOOOTtWWTOOO###........',
    '........#HOOOOTTTOOO#OO#........',
    '........#HOOOOOOOOO#OOO#........',
    '.........#HOOOOOOO#OOOO#........',
    '..........#HOOOOOOOOOO#.........',
    '...........#OOOOOOOOO#..........',
    '...........#SSOOCCCOOO#.........',
    '..........#SSSOCCCCCOOO#...#F#..',
    '.........#SSSOCCCCCOOOO#..#FYF#.',
    '.........#SSOCCCCCCCOOO#.#FYYGF#',
    '..##.....#SOCCCCCCCCCOO##FYYGZF#',
    '.#OO#....#SOCCCCCCCCCOO#FYYYGZF#',
    '#OOOO#...#SOCCCCCCCCCOO##FYYGF#.',
    '#WWOOO#...#SOCCCCCCCCOO#.#FYF#..',
    '.#WWOO#...#SSOCCCCCCCOO#..#F#...',
    '..#W##.....#SSOCCCCCOOO#.#O#....',
    '............#SSOOCOOOOO##OO#....',
    '...........#SSSOOOOOOO#OOOO#....',
    '..........#SSSSOOOOOO#OOOOO#....',
    '.........#SSSS#OOOOO#OOOOO#.....',
    '.........#SSS#..#OO#.#OOO#......',
    '.........#WWW#...##...#W#.......',
    '................................',
    '................................',
  ],
};

export const CHARMANDER_BACK_SPRITE: PixelSpriteData = {
  name: 'Charmander_Back',
  palette: {
    '#': '#4A1408',
    'O': '#F08030',
    'H': '#F8A050',
    'S': '#B84810',
    'C': '#FFF0A8',
    'W': '#FFFFFF',
    'F': '#E82818',
    'Y': '#F87810',
    'G': '#F8D020',
    'Z': '#FFFEE0',
  },
  grid: [
    '................................',
    '...........######...............',
    '.........##HHHHHH##.............',
    '........#HHHHHHHHHH#............',
    '.......#HHHHHHHHHHHH#...........',
    '.......#HHHHHHHHHHHH#...........',
    '.......#SSHHHHHHHHHH#...........',
    '.......#SSSSHHHHHHH#............',
    '........#SSSSSSHHH#.............',
    '.........#SSSSSSSS#.............',
    '........#SSSSSSSSSS#............',
    '.......#SSSSSSSSSSSS#...........',
    '......#SSSSSSSSSSSSSS#..........',
    '.....#SSSSSSSSSSSSSSSS#.........',
    '....#SSSSSSSSSSSSSSSSSC#........',
    '...#F#SSSSSSSSSSSSSSSSCC#.......',
    '..#FYF#SSSSSSSSSSSSSSSCCC#......',
    '.#FYYGF#SSSSSSSSSSSSSSCCC#......',
    '#FYYGZF#SSSSSSSSSSSSSSSCC#......',
    '#FYYGZF#SSSSSSSSSSSSSSSC#.......',
    '#FYYGZF#O#SSSSSSSSSSSSO#........',
    '.#FYYGF#OO#SSSSSSSSSSO#.........',
    '..#FYF#OOOO#SSSSSSSSO#..........',
    '...#F#OOOOOO#SSSSSSO#...........',
    '....#OOOOOOOO#SSSSO#............',
    '.....#OOOOOOOO####..............',
    '....#OOOOOOOOOO#................',
    '...#OOOOOOOOOOOO#...............',
    '...#OOOO#..#OOOO#...............',
    '...#WWW#....#WWW#...............',
    '................................',
    '................................',
  ],
};

// -----------------------------------------------------------------------------
// PIKACHU: Authentic GBA Front & Back Sprites
// Chubby electric mouse, red circular cheeks, black-tipped ears, lightning tail.
// -----------------------------------------------------------------------------

export const PIKACHU_FRONT_SPRITE: PixelSpriteData = {
  name: 'Pikachu_Front',
  palette: {
    '#': '#382408',
    'Y': '#FED020', // Amarillo vibrante Pikachu
    'H': '#FFF060', // Amarillo claro brillo
    'S': '#D89810', // Sombra amarilla
    'B': '#181410', // Ojos, nariz y puntas negras
    'W': '#FFFFFF', // Brillo de ojos
    'R': '#E82818', // Mejillas carmesí
    'T': '#7A3810', // Marrón base cola
  },
  grid: [
    '..#BB#....................#BB#..',
    '.#BBBB#..................#BBBB#.',
    '.#BBBY#..................#YBBB#.',
    '..#BYY#..................#YYB#..',
    '..#HYYS#................#SYYH#..',
    '...#HYYS#..............#SYYH#...',
    '....#HYYS#............#SYYH#....',
    '.....#HYYS#..........#SYYH#.....',
    '......#HYYY##########YYYH#......',
    '.....#HYYYYYYYYYYYYYYYYYYH#.....',
    '....#HYYYYYYYYYYYYYYYYYYYYH#....',
    '...#HYYYYYYYYYYYYYYYYYYYYYYH#...',
    '...#HYYBWYYYYYYYYYYYYYYBWYYH#...',
    '...#HYYBBBYYYYYYYYYYYYBBBYYH#...',
    '..#RHYYBBBYYYYYYYYYYYYBBBYYHR#..',
    '.#RRRHYYYBYYYYYBBYYYYYBYYYHRRR#.',
    '#RRRRHYYYYYYYYYYYYYYYYYYYYHRRRR#',
    '#RRRRHYYYYYYYY####YYYYYYYYHRRRR#',
    '.#RRRHYYYYYYYY#..#YYYYYYYYHRRR#.',
    '..#RHYYYYYYYYYYYYYYYYYYYYYYHR#..',
    '....#HYYYYYYYYYYYYYYYYYYYYH#....',
    '....#HYYYYYYYYYYYYYYYYYYYYH#..##',
    '...#HYYYY####YYYYYYYY####YYH##YY',
    '..#HYYYY#YYYY#YYYYYY#YYYY#YYHHYY',
    '..#HYYY#YYYYYY#YYYY#YYYYYY#HYYH#',
    '..#HYYY#YYYYYY#YYYY#YYYYYY#HYY#.',
    '...#HYY#SSSSSS#YYYY#SSSSSS#HY#..',
    '...#HYYY######YYYYYY######YYH#..',
    '....#HYYYYYYYYYYYYYYYYYYYYYH#...',
    '....#SS####SSSSSSSS####SSSS#....',
    '.....#YY#..#YYYYYY#..#YY#.......',
    '......##....######....##........',
  ],
};

export const PIKACHU_BACK_SPRITE: PixelSpriteData = {
  name: 'Pikachu_Back',
  palette: {
    '#': '#382408',
    'Y': '#FED020',
    'H': '#FFF060',
    'S': '#D89810',
    'B': '#181410',
    'T': '#7A3810', // Marrón oscuro rayas
  },
  grid: [
    '..#BB#....................#BB#..',
    '.#BBBB#..................#BBBB#.',
    '.#BBBY#..................#YBBB#.',
    '..#BYY#..................#YYB#..',
    '..#HYYS#................#SYYH#..',
    '...#HYYS#..............#SYYH#...',
    '....#HYYS#............#SYYH#....',
    '.....#HYYS#..........#SYYH#.....',
    '......#HYYY##########YYYH#......',
    '.....#HYYYYYYYYYYYYYYYYYYH#.....',
    '....#HYYYYYYYYYYYYYYYYYYYYH#....',
    '...#HYYYYYYYYYYYYYYYYYYYYYYH#...',
    '...#HYYYYYYYYYYYYYYYYYYYYYYH#...',
    '...#HYYYYYYYYYYYYYYYYYYYYYYH#...',
    '...#HYYYYYYYYYYYYYYYYYYYYYYH#...',
    '....#HYYYYYYYYYYYYYYYYYYYYH#....',
    '....#HYYYYYYYYYYYYYYYYYYYYH#....',
    '....#HYYYTTTTTTTTTTTTYYYYYH#....',
    '....#HYYYTTTTTTTTTTTTYYYYYH#....',
    '....#HYYYYYYYYYYYYYYYYYYYYH#....',
    '....#HYYYYYYYYYYYYYYYYYYYYH#..##',
    '....#HYYYTTTTTTTTTTTTYYYYYH##YY#',
    '....#HYYYTTTTTTTTTTTTYYYYYHYYY#.',
    '....#HYYYYYYYYYYYYYYYYYYYYYYY#..',
    '....#HYYYYYYYYYYYYYYYYYYYYYH#...',
    '....#HYYYYYYYYYYYYYYYYYYYYH#TT#.',
    '.....#HYYYYYYYYYYYYYYYYYYH#TT#..',
    '......#HYYYYYYYYYYYYYYYYH#TT#...',
    '.......#SSHYYYYYYYYYYHSS#TT#....',
    '........#SSSSSSSSSSSSSS#TT#.....',
    '........#YY#..####..#YY#........',
    '.........##..........##.........',
  ],
};

// -----------------------------------------------------------------------------
// PIDGEY: Authentic GBA Front & Back Sprites
// Distinct crest with red/yellow tips, black eye-mask, sharp beak, layered wings.
// -----------------------------------------------------------------------------

export const PIDGEY_FRONT_SPRITE: PixelSpriteData = {
  name: 'Pidgey_Front',
  palette: {
    '#': '#2A1608',
    'M': '#985830', // Marrón claro plumaje
    'D': '#583018', // Marrón oscuro alas
    'C': '#F5E6C4', // Crema pecho y mejillas
    'c': '#D8C49C', // Sombra crema
    'R': '#D83828', // Rojo cresta
    'Y': '#F8D030', // Amarillo cresta
    'O': '#F09028', // Pico anaranjado
    'B': '#181414', // Antifaz negro
    'W': '#FFFFFF', // Blanco ojo
    'K': '#E07828', // Patas y garras
  },
  grid: [
    '................................',
    '...............##...............',
    '..............#RR#..............',
    '.............#RRY#..............',
    '............#RRYYY#.............',
    '...........#RRYYYY##............',
    '..........#MRRYYYY##............',
    '.........#MMRRYYY#..............',
    '........#MMMRRYY#...............',
    '.......#MMMM####................',
    '......#MMBWB#MM#................',
    '.....#MMBBWB#MMM#...............',
    '....#OMCBBMM#MMMM#..............',
    '...#OOOCMMMM#MMMMM#.............',
    '..#OOOOCCMMM#MMMMMM#............',
    '....#OOOCCMMDDDDDDD#............',
    '.....#CCCCMDDDDDDDDD#...........',
    '....#CCCCCcMDDDDDDDDD#..........',
    '...#CCCCCCccMDDDDDDDD#..........',
    '..#CCCCCCCcCcMDDDDDD#...........',
    '..#CCCCCCCCcCcMDDDD#............',
    '..#CCCCCCCCcCcMDDD#.............',
    '...#CCCCCCCCcCcMD#..............',
    '....#CCCCCCCCCc##...............',
    '.....#CCCCCCcc#..##.............',
    '......#CCCCCc#..#DD#............',
    '.......#MMM##..#DDDD#...........',
    '........#M#...#DDDDDD#..........',
    '........#K#...#DDDDDD#..........',
    '.......#KK#....######...........',
    '......#KKKK#....................',
    '................................',
  ],
};

export const PIDGEY_BACK_SPRITE: PixelSpriteData = {
  name: 'Pidgey_Back',
  palette: {
    '#': '#2A1608',
    'M': '#985830',
    'D': '#583018',
    'R': '#D83828',
    'Y': '#F8D030',
    'C': '#F5E6C4',
  },
  grid: [
    '................................',
    '...............##...............',
    '..............#RR#..............',
    '.............#RRY#..............',
    '............#RRYYY#.............',
    '...........#RRYYYY##............',
    '..........#MRRYYYY##............',
    '.........#MMRRYYY#..............',
    '........#MMMRRYY#...............',
    '.......#MMMM####................',
    '......#MMMMMMMM#................',
    '.....#MMMMMMMMMM#...............',
    '....#MMMMMMMMMMMM#..............',
    '...#MMMMMDDDDDMMMM#.............',
    '..#MMMMMDDDDDDDDMMM#............',
    '..#MMMMDDDDDDDDDDMM#............',
    '..#MMMDDDDDDDDDDDDMM#...........',
    '..#MMDDDDDDDDDDDDDDM#...........',
    '..#MDDDDDDDDDDDDDDDDM#..........',
    '..#MDDDDDDDDDDDDDDDDM#..........',
    '..#MDDDDDDDDDDDDDDDDM#..........',
    '..#MDDDDDDDDDDDDDDDDM#..........',
    '..#MDDDDDDDDDDDDDDDDM#..........',
    '..#MDDDDDDDDDDDDDDDDM#..........',
    '..#MDDDDDDDDDDDDDDDDM#..........',
    '...#MDDDDDDDDDDDDDDM#...........',
    '....#MDDDDDDDDDDDDM#............',
    '.....#DDDDDDDDDDDD#.............',
    '......#DDDDDDDDDD#..............',
    '.......#CCCCCCCC#...............',
    '........#CCCCCC#................',
    '.........######.................',
  ],
};

// -----------------------------------------------------------------------------
// BULBASAUR: Authentic GBA Back & Front Sprites
// Turquoise body with dark green spots, big leafy green bulb on back, sturdy claws.
// -----------------------------------------------------------------------------

export const BULBASAUR_BACK_SPRITE: PixelSpriteData = {
  name: 'Bulbasaur_Back',
  palette: {
    '#': '#142018',
    'G': '#54B898', // Turquesa piel
    'S': '#307458', // Sombra turquesa
    'D': '#1C4C3A', // Manchas oscuras
    'B': '#48A830', // Bulbo verde hoja
    'V': '#206018', // Pliegues y nervaduras bulbo
    'L': '#78D050', // Brote tierno claro
    'W': '#FFFFFF', // Garras
  },
  grid: [
    '................#L#.............',
    '...............#BLB#............',
    '..............#BBVBB#...........',
    '.............#BBBVBBB#..........',
    '............#BBBBVBBBB#.........',
    '...........#BBBBBVBBBBB#........',
    '..........#BBBVBBVBBVBBB#.......',
    '.........#BBBVBBBVBBBVBBB#......',
    '........#VBBBVBBBVBBBVBBBV#.....',
    '........#VBBBVBBBVBBBVBBBV#.....',
    '........#VVVVVVVVVVVVVVVVV#.....',
    '.......#VBBBVBBBVBBBVBBBV#......',
    '......#G#VVVVVVVVVVVVVVV#G#.....',
    '.....#GGG#SSSSSSSSSSSSS#GGG#....',
    '....#GGGGG#SSSSSSSSSSS#GGGGG#...',
    '...#GGGGGGG###########GGGGGGG#..',
    '..#GGGDGGGGGGGGGGGGGGGGGGGDGGG#.',
    '.#GGGGDDGGGGGGGGGGGGGGGGGDDGGGG#',
    '#GGGGGDGGGGGGGGGGGGGGGGGGGDGGGG#',
    '#GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG#',
    '#GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG#',
    '#SGGGGGGGGGGGGGGGGGGGGGGGGGGGGS#',
    '.#SSGGGGGGGGGGGGGGGGGGGGGGGGSS#.',
    '..#SSSSGGGGGGGGGGGGGGGGGGSSSS#..',
    '...#SSSSSSGGGGGGGGGGGGSSSSSS#...',
    '....#SSSSSSSSSSSSSSSSSSSSSS#....',
    '.....#SSSS############SSSS#.....',
    '.....#SSSS#..........#SSSS#.....',
    '.....#WWW##..........##WWW#.....',
    '................................',
    '................................',
    '................................',
  ],
};

export const BULBASAUR_FRONT_SPRITE: PixelSpriteData = {
  name: 'Bulbasaur_Front',
  palette: {
    '#': '#142018',
    'G': '#54B898',
    'S': '#307458',
    'D': '#1C4C3A',
    'B': '#48A830',
    'V': '#206018',
    'R': '#D82828', // Ojos rojos
    'W': '#FFFFFF',
  },
  grid: [
    '................#B#.............',
    '...............#BBB#............',
    '..............#BBVBB#...........',
    '.............#BBBVBBB#..........',
    '.....##.....#BBBBVBBBB#.....##..',
    '....#GG#...#BBBBBVBBBBB#...#GG#.',
    '...#GGGG###BBBVBBVBBVBBB###GGGG#',
    '..#GGGGGG#BBBVBBBVBBBVBBB#GGGGGG',
    '.#GGGDGGGG#VBBBVBBBVBBBV#GGGGGGG',
    '#GGGGDDGGGG#VVVVVVVVVVV#GGGDGGGG',
    '#GGGGGDGGGGGGGGGGGGGGGGGGGDDGGGG',
    '#GGGGGGGGGGGGGGGGGGGGGGGGGGDGGGG',
    '#GGGGGRRWGGGGGGGGGGGGGRRWGGGGGGG',
    '#SGGGGRRRWGGGGGGGGGGGGRRRWGGGGGS',
    '#SGGGGRRRWGGGGGGGGGGGGRRRWGGGGGS',
    '.#SSGG###GGGGGGGGGGGGGG###GGSS#.',
    '..#SSSSGGGGGGGDGGGGGGGGGGSSSS#..',
    '...#SSSSGGGGGGDDGGGGGGGGSSSS#...',
    '....#SSSSGGGGGGGGGGGGGGSSSS#....',
    '.....#SSSSGGGGG##GGGGGSSSS#.....',
    '......#SSSSGGGG##GGGGSSSS#......',
    '.......#SSSSGGGGGGGGSSSS#.......',
    '......#G#SSSSSSSSSSSSSS#G#......',
    '.....#GGG#SSSSSSSSSSSS#GGG#.....',
    '....#GGGGG############GGGGG#....',
    '....#GGGG#............#GGGG#....',
    '....#WW##..............##WW#....',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
};

// -----------------------------------------------------------------------------
// SQUIRTLE: Authentic GBA Back & Front Sprites
// Pale blue turtle skin, large brown hexagonal carapace with cream rim, curly tail.
// -----------------------------------------------------------------------------

export const SQUIRTLE_BACK_SPRITE: PixelSpriteData = {
  name: 'Squirtle_Back',
  palette: {
    '#': '#1C1810',
    'U': '#74B4E8', // Azul piel
    'S': '#4680B8', // Sombra azul
    'B': '#A44E1C', // Caparazón marrón caparazón
    'D': '#66280C', // Ranuras oscuras caparazón
    'C': '#FFF2B4', // Borde crema caparazón
    'W': '#FFFFFF',
  },
  grid: [
    '.............######.............',
    '...........##UUUUUU##...........',
    '..........#UUUUUUUUUU#..........',
    '.........#UUUUUUUUUUUU#.........',
    '.........#UUUUUUUUUUUU#.........',
    '..........#SSSSUUUUUU#..........',
    '...........#SSSSSSSS#...........',
    '........####CCCCCCCC####........',
    '......##CCCCCCCCCCCCCCCC##......',
    '.....#CCCCBBDDDBBBDDDBBCCCC#....',
    '....#CCCBBBBDDDBBBDDDBBBBCCC#...',
    '...#CCCBBBBBDDDBBBDDDBBBBBCCC#..',
    '..#CCCBBBBBBDDDBBBDDDBBBBBBCCC#.',
    '.#U#CCDDDDDDDDDDDDDDDDDDDDDCC#..',
    '.#UU#CCDDDDDDDDDDDDDDDDDDDCC#...',
    '#UUUU#CCBBBBBDDDBBBDDDBBBCC#....',
    '#UUUS#CCBBBBBDDDBBBDDDBBBCC#....',
    '#UUSSS#CCBBBBDDDBBBDDBBBCC#.....',
    '.#SSSS#CCDDDDBBBDDDDBBBBCC#.....',
    '..#SS##CCDDDDDDDDDDDDDDDCC#.....',
    '....#CCCCCCCCCCCCCCCCCCCCCC#....',
    '.....##CCCCCCCCCCCCCCCCCC##.....',
    '......#SSSSUUUUUUUUUUUUSS#......',
    '.....#SSSSSUUUUUUUUUUUUSSS#.....',
    '....#SSSSSSUUUUUUUUUUUUSSSS#....',
    '....#SSSSUUU#........#UUUSSS#...',
    '.....#WWW##............##WWW#...',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
};

export const SQUIRTLE_FRONT_SPRITE: PixelSpriteData = {
  name: 'Squirtle_Front',
  palette: {
    '#': '#1C1810',
    'U': '#74B4E8',
    'S': '#4680B8',
    'C': '#FFF2B4', // Peto vientre crema
    'c': '#D8C488', // Sombra peto
    'R': '#883820', // Ojos marrón-rojizos
    'W': '#FFFFFF',
  },
  grid: [
    '.............######.............',
    '...........##UUUUUU##...........',
    '..........#UUUUUUUUUU#..........',
    '.........#UUUUUUUUUUUU#.........',
    '........#UUUUUUUUUUUUUU#........',
    '........#UURRWUUUUUURRWU#.......',
    '........#UURRRWUUUUURRRWU#......',
    '........#UU###UUUUUU###UU#......',
    '.........#UUUUUUUUUUUUUU#.......',
    '..........#UUUUU##UUUUU#........',
    '...........#UUUUUUUUUU#.........',
    '..........##CCCCCCCCCC##........',
    '........##CCCCCCCCCCCCCC##......',
    '.......#CCCCCCCccCCCCCCCCC#.....',
    '......#CCCCCCCCccCCCCCCCCCC#....',
    '.....#U#CCCCCCCccCCCCCCCCCC#....',
    '....#UU#CCCCCCCccCCCCCCCCC#.....',
    '...#UUUU#CCCCCCccCCCCCCCC#......',
    '...#UUUS#cccccccccccccccc#......',
    '....#SSS#CCCCCCccCCCCCCCC#......',
    '.....##CCCCCCCCccCCCCCCCCCC#....',
    '......#CCCCCCCCccCCCCCCCCCCC#...',
    '......#CCCCCCCCCCCCCCCCCCCC#....',
    '.......##CCCCCCCCCCCCCCCC##.....',
    '........#SSSSUUUUUUUUUUSS#......',
    '.......#SSSSSUUUUUUUUUUSSS#.....',
    '......#SSSSSSUUUUUUUUUUSSSS#....',
    '......#SSSSUUU#......#UUUSSS#...',
    '.......#WWW##..........##WWW#...',
    '................................',
    '................................',
    '................................',
  ],
};

// -----------------------------------------------------------------------------
// SPRITE LOOKUP TABLE (Front and Back for all Pokémon)
// -----------------------------------------------------------------------------

export const POKEMON_SPRITES_MAP: Record<
  string,
  { front: PixelSpriteData; back: PixelSpriteData }
> = {
  CHARMANDER: { front: CHARMANDER_FRONT_SPRITE, back: CHARMANDER_BACK_SPRITE },
  BULBASAUR: { front: BULBASAUR_FRONT_SPRITE, back: BULBASAUR_BACK_SPRITE },
  SQUIRTLE: { front: SQUIRTLE_FRONT_SPRITE, back: SQUIRTLE_BACK_SPRITE },
  RATTATA: { front: RATTATA_FRONT_SPRITE, back: RATTATA_BACK_SPRITE },
  PIDGEY: { front: PIDGEY_FRONT_SPRITE, back: PIDGEY_BACK_SPRITE },
  PIKACHU: { front: PIKACHU_FRONT_SPRITE, back: PIKACHU_BACK_SPRITE },
};

// -----------------------------------------------------------------------------
// HIGH-PERFORMANCE RUN-LENGTH PIXEL MATRIX RENDERER
// -----------------------------------------------------------------------------

export function renderPixelMatrix(
  ctx: CanvasRenderingContext2D,
  grid: string[],
  palette: Record<string, string>,
  cx: number,
  cy: number,
  pixelSize = 1.35,
  alpha = 1
) {
  const h = grid.length;
  const w = grid[0]?.length || 0;
  const startX = Math.round(cx - (w * pixelSize) / 2);
  const startY = Math.round(cy - (h * pixelSize) / 2);

  ctx.save();
  if (alpha < 1) ctx.globalAlpha = Math.max(0, alpha);
  ctx.imageSmoothingEnabled = false;

  for (let r = 0; r < h; r++) {
    const row = grid[r];
    let c = 0;
    while (c < row.length) {
      const char = row[c];
      const color = palette[char];
      if (!color) {
        c++;
        continue;
      }
      let run = 1;
      while (c + run < row.length && row[c + run] === char) {
        run++;
      }
      ctx.fillStyle = color;
      ctx.fillRect(
        startX + c * pixelSize,
        startY + r * pixelSize,
        run * pixelSize,
        pixelSize
      );
      c += run;
    }
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// MASTER UNIFIED POKÉMON SPRITE DRAW FUNCTION
// -----------------------------------------------------------------------------

export function drawPokemonSprite(
  ctx: CanvasRenderingContext2D,
  pokemonId: string,
  isBackView: boolean,
  x: number,
  y: number,
  opts: SpriteRenderOptions
) {
  if (opts.blink) return;

  const upperId = (pokemonId || 'CHARMANDER').toUpperCase();
  const pair = POKEMON_SPRITES_MAP[upperId] || POKEMON_SPRITES_MAP.CHARMANDER;
  const spriteData = isBackView ? pair.back : pair.front;

  const lungeX = opts.lungeOffset?.x ?? 0;
  const lungeY = opts.lungeOffset?.y ?? 0;
  const faintDrop = (opts.faintProgress ?? 0) * 45;
  const alpha = opts.faintProgress ? Math.max(0, 1 - opts.faintProgress * 1.5) : 1;

  // Gentle idle animation
  const animOffset = isBackView
    ? Math.sin(opts.time * 3) * 0.8
    : Math.sin(opts.time * 4.5) * 1.2;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 35, 15, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + lungeX, y + lungeY + 20, isBackView ? 20 : 18, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  renderPixelMatrix(
    ctx,
    spriteData.grid,
    spriteData.palette,
    x + lungeX,
    y + lungeY + faintDrop + animOffset,
    1.4, // Perfect 32x32 size for GBA battle arena
    alpha
  );
}

// Backwards-compatible standalone export functions
export function drawCharmanderBack(ctx: CanvasRenderingContext2D, x: number, y: number, opts: SpriteRenderOptions) {
  drawPokemonSprite(ctx, 'CHARMANDER', true, x, y, opts);
}
export function drawBulbasaurBack(ctx: CanvasRenderingContext2D, x: number, y: number, opts: SpriteRenderOptions) {
  drawPokemonSprite(ctx, 'BULBASAUR', true, x, y, opts);
}
export function drawSquirtleBack(ctx: CanvasRenderingContext2D, x: number, y: number, opts: SpriteRenderOptions) {
  drawPokemonSprite(ctx, 'SQUIRTLE', true, x, y, opts);
}
export function drawPidgeyFront(ctx: CanvasRenderingContext2D, x: number, y: number, opts: SpriteRenderOptions) {
  drawPokemonSprite(ctx, 'PIDGEY', false, x, y, opts);
}
export function drawRattataFront(ctx: CanvasRenderingContext2D, x: number, y: number, opts: SpriteRenderOptions) {
  drawPokemonSprite(ctx, 'RATTATA', false, x, y, opts);
}
export function drawPikachuFront(ctx: CanvasRenderingContext2D, x: number, y: number, opts: SpriteRenderOptions) {
  drawPokemonSprite(ctx, 'PIKACHU', false, x, y, opts);
}

// -----------------------------------------------------------------------------
// ATTACK PARTICLE FX RENDERER
// -----------------------------------------------------------------------------

export function drawAttackFX(
  ctx: CanvasRenderingContext2D,
  moveId: string,
  progress: number, // 0 to 1
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) {
  ctx.save();

  if (moveId === 'PLACAJE') {
    const starCount = 6;
    for (let i = 0; i < starCount; i++) {
      const angle = (i * Math.PI * 2) / starCount + progress * Math.PI;
      const dist = progress * 24;
      const px = toX + Math.cos(angle) * dist;
      const py = toY + Math.sin(angle) * dist;
      const starSize = Math.max(1, 4 * (1 - progress));

      ctx.fillStyle = '#FFE030';
      ctx.fillRect(px - starSize, py - starSize, starSize * 2, starSize * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(px - 1, py - 1, 2, 2);
    }
  } else if (moveId === 'ASCUAS') {
    const emberCount = 5;
    for (let i = 0; i < emberCount; i++) {
      const p = Math.max(0, Math.min(1, progress * 1.3 - i * 0.1));
      if (p <= 0 || p >= 1) continue;

      const currentX = fromX + (toX - fromX) * p;
      const currentY = fromY + (toY - fromY) * p - Math.sin(p * Math.PI) * 35;
      const flameR = 3 + Math.sin(p * Math.PI) * 4;

      ctx.fillStyle = '#E82818';
      ctx.beginPath();
      ctx.arc(currentX, currentY, flameR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F8B020';
      ctx.beginPath();
      ctx.arc(currentX, currentY, flameR * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(currentX, currentY, flameR * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (moveId === 'PISTOLA_AGUA') {
    const dropletCount = 6;
    for (let i = 0; i < dropletCount; i++) {
      const p = Math.max(0, Math.min(1, progress * 1.4 - i * 0.08));
      if (p <= 0 || p >= 1) continue;

      const currentX = fromX + (toX - fromX) * p;
      const currentY = fromY + (toY - fromY) * p;

      ctx.fillStyle = '#3880F0';
      ctx.beginPath();
      ctx.ellipse(currentX, currentY, 4, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#A0E0FF';
      ctx.beginPath();
      ctx.ellipse(currentX - 1, currentY - 1, 2, 1.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (progress > 0.6) {
      const splashProgress = (progress - 0.6) / 0.4;
      ctx.strokeStyle = '#50B0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(toX, toY + 5, splashProgress * 20, splashProgress * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (moveId === 'LATIGO_CEPA') {
    const slashP = progress;
    ctx.strokeStyle = '#288820';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(toX - 25, toY - 20 + slashP * 30);
    ctx.quadraticCurveTo(toX, toY, toX + 25, toY + 20 - slashP * 10);
    ctx.stroke();

    ctx.strokeStyle = '#60C838';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const lx = toX + Math.cos(i + progress * 8) * (15 * progress);
      const ly = toY + Math.sin(i + progress * 8) * (15 * progress);
      ctx.fillStyle = '#48B028';
      ctx.beginPath();
      ctx.ellipse(lx, ly, 3, 1.8, i, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (moveId === 'GRUNIDO') {
    const ringProgress = progress;
    const waveR = ringProgress * 40;

    ctx.strokeStyle = '#80B8E8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      fromX + (toX - fromX) * 0.4,
      fromY + (toY - fromY) * 0.4,
      waveR,
      -Math.PI * 0.4,
      Math.PI * 0.4
    );
    ctx.stroke();

    if (progress > 0.3) {
      ctx.strokeStyle = '#5098D8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(
        fromX + (toX - fromX) * 0.4,
        fromY + (toY - fromY) * 0.4,
        waveR - 10,
        -Math.PI * 0.35,
        Math.PI * 0.35
      );
      ctx.stroke();
    }
  } else if (moveId === 'IMPACTRUENO') {
    const boltProgress = progress;
    ctx.strokeStyle = '#FFE820';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(toX + 5, 0);
    ctx.lineTo(toX - 8, toY * 0.35);
    ctx.lineTo(toX + 7, toY * 0.65);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + progress * 6;
      const dist = boltProgress * 18;
      ctx.fillStyle = '#FFEE40';
      ctx.fillRect(toX + Math.cos(angle) * dist, toY + Math.sin(angle) * dist, 2.5, 2.5);
    }
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(toX, toY, 15 * progress, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// RED: Authentic GBA FireRed Overworld Player Sprite
// 4-Directional pixel art (DOWN, UP, LEFT, RIGHT) with step animations,
// red cap with white visor, backpack, jacket, denim jeans, sneakers & tall grass.
// -----------------------------------------------------------------------------
export function drawRedOverworld(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 'DOWN' | 'UP' | 'LEFT' | 'RIGHT',
  isMoving: boolean,
  walkFrame: number,
  inGrass: boolean
): void {
  ctx.save();

  // Subtle ground shadow
  ctx.fillStyle = 'rgba(10, 30, 15, 0.42)';
  ctx.beginPath();
  ctx.ellipse(x + 8, y + 15, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const legStep = isMoving ? (walkFrame === 0 ? 1 : -1) : 0;
  const armStep = isMoving ? (walkFrame === 0 ? 1 : -1) : 0;

  if (dir === 'DOWN') {
    // ------------------- FACING DOWN (FRONT) -------------------
    // Red Cap Dome
    ctx.fillStyle = '#DC2626'; // Red
    ctx.fillRect(x + 4, y - 2, 8, 5);
    ctx.fillStyle = '#EF4444'; // Top highlight
    ctx.fillRect(x + 5, y - 3, 6, 1);
    ctx.fillStyle = '#991B1B'; // Shadow
    ctx.fillRect(x + 3, y, 1, 3);
    ctx.fillRect(x + 12, y, 1, 3);

    // Cap White Emblem / Front panel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6, y - 1, 4, 3);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 7, y, 2, 1);

    // White Cap Visor
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 3, y + 3, 10, 2);
    // Dark underside of visor / forehead shadow
    ctx.fillStyle = '#262626';
    ctx.fillRect(x + 4, y + 4, 8, 1);

    // Hair at temples
    ctx.fillStyle = '#23140C';
    ctx.fillRect(x + 3, y + 5, 1, 2);
    ctx.fillRect(x + 12, y + 5, 1, 2);

    // Face
    ctx.fillStyle = '#FCD3A8';
    ctx.fillRect(x + 4, y + 5, 8, 4);
    ctx.fillStyle = '#EAA876';
    ctx.fillRect(x + 5, y + 8, 6, 1);

    // Eyes
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x + 5, y + 6, 2, 2);
    ctx.fillRect(x + 9, y + 6, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 5, y + 6, 1, 1);
    ctx.fillRect(x + 9, y + 6, 1, 1);

    // Red Vest / Jacket
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 3, y + 9, 10, 5);
    // White collar
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6, y + 9, 4, 1);
    // Black undershirt
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x + 7, y + 10, 2, 3);
    // Yellow backpack straps on shoulders
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x + 5, y + 10, 1, 3);
    ctx.fillRect(x + 10, y + 10, 1, 3);

    // Arms & Hands
    // Left arm
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 2, y + 10 + armStep, 2, 2);
    ctx.fillStyle = '#FCD3A8';
    ctx.fillRect(x + 2, y + 12 + armStep, 2, 2);
    // Right arm
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 12, y + 10 - armStep, 2, 2);
    ctx.fillStyle = '#FCD3A8';
    ctx.fillRect(x + 12, y + 12 - armStep, 2, 2);

    // Belt & Jeans
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x + 5, y + 13, 6, 1);
    ctx.fillStyle = '#1E3A8A'; // Blue jeans
    ctx.fillRect(x + 4, y + 14, 3, 1);
    ctx.fillRect(x + 9, y + 14, 3, 1);

    // Sneakers (Red & White)
    if (legStep === 0) {
      // Idle / standing
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 4, y + 15, 3, 1);
      ctx.fillRect(x + 9, y + 15, 3, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 4, y + 16, 3, 1);
      ctx.fillRect(x + 9, y + 16, 3, 1);
    } else if (legStep > 0) {
      // Left foot forward, right foot back
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 3, y + 15, 3, 1);
      ctx.fillRect(x + 9, y + 14, 3, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 3, y + 16, 3, 1);
      ctx.fillRect(x + 9, y + 15, 3, 1);
    } else {
      // Right foot forward, left foot back
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 4, y + 14, 3, 1);
      ctx.fillRect(x + 10, y + 15, 3, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 4, y + 15, 3, 1);
      ctx.fillRect(x + 10, y + 16, 3, 1);
    }
  } else if (dir === 'UP') {
    // ------------------- FACING UP (BACK) -------------------
    // Red Cap Back Dome
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 4, y - 2, 8, 6);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 5, y - 3, 6, 1);
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(x + 3, y, 1, 4);
    ctx.fillRect(x + 12, y, 1, 4);
    // Back adjustment arch
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x + 7, y + 2, 2, 1);
    ctx.fillStyle = '#FCD3A8';
    ctx.fillRect(x + 7, y + 3, 2, 1);

    // Hair at base of neck
    ctx.fillStyle = '#23140C';
    ctx.fillRect(x + 3, y + 4, 10, 4);
    ctx.fillRect(x + 4, y + 7, 8, 2);

    // Explorer Yellow/Amber Backpack
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x + 4, y + 8, 8, 5);
    // Top flap of bag
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 5, y + 8, 6, 2);
    ctx.fillStyle = '#451A03';
    ctx.fillRect(x + 7, y + 9, 2, 1); // Buckle
    // Red jacket shoulders visible
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 3, y + 8, 1, 5);
    ctx.fillRect(x + 12, y + 8, 1, 5);

    // Arms
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 2, y + 9 - armStep, 2, 4);
    ctx.fillRect(x + 12, y + 9 + armStep, 2, 4);

    // Pants (Jeans)
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(x + 4, y + 13, 8, 2);

    // Shoes back
    if (legStep === 0) {
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 4, y + 15, 3, 2);
      ctx.fillRect(x + 9, y + 15, 3, 2);
    } else if (legStep > 0) {
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 3, y + 15, 3, 2);
      ctx.fillRect(x + 9, y + 14, 3, 2);
    } else {
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 4, y + 14, 3, 2);
      ctx.fillRect(x + 10, y + 15, 3, 2);
    }
  } else if (dir === 'LEFT') {
    // ------------------- FACING LEFT (PROFILE) -------------------
    // Red Cap
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 4, y - 2, 8, 5);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 5, y - 3, 6, 1);
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(x + 11, y, 1, 3);

    // Visor jutting to the left
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 1, y + 2, 5, 2);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 2, y + 1, 3, 1);
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x + 2, y + 3, 4, 1);

    // Hair on right
    ctx.fillStyle = '#23140C';
    ctx.fillRect(x + 8, y + 4, 4, 3);

    // Face Profile
    ctx.fillStyle = '#FCD3A8';
    ctx.fillRect(x + 3, y + 4, 6, 4);
    // Nose point
    ctx.fillRect(x + 2, y + 5, 1, 2);
    // Eye
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x + 4, y + 5, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 4, y + 5, 1, 1);

    // Backpack visible on back (right side)
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x + 9, y + 8, 4, 5);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 9, y + 8, 3, 2);

    // Torso (Red jacket)
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 4, y + 8, 6, 5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 4, y + 8, 2, 1); // Collar

    // Arm (swinging)
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 5 + armStep, y + 9, 3, 3);
    ctx.fillStyle = '#FCD3A8';
    ctx.fillRect(x + 5 + armStep, y + 12, 2, 2);

    // Pants (Blue jeans)
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(x + 5, y + 13, 5, 2);

    // Shoes
    if (legStep === 0) {
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 4, y + 15, 5, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 3, y + 16, 6, 1);
    } else if (legStep > 0) {
      // Forward stride
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 3, y + 15, 4, 1);
      ctx.fillRect(x + 8, y + 14, 3, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 2, y + 16, 5, 1);
      ctx.fillRect(x + 8, y + 15, 3, 1);
    } else {
      // Back stride
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 5, y + 14, 4, 1);
      ctx.fillRect(x + 7, y + 15, 4, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 5, y + 15, 4, 1);
      ctx.fillRect(x + 7, y + 16, 4, 1);
    }
  } else if (dir === 'RIGHT') {
    // ------------------- FACING RIGHT (PROFILE) -------------------
    // Red Cap
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 4, y - 2, 8, 5);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 5, y - 3, 6, 1);
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(x + 4, y, 1, 3);

    // Visor jutting to the right
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 10, y + 2, 5, 2);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 11, y + 1, 3, 1);
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x + 10, y + 3, 4, 1);

    // Hair on left
    ctx.fillStyle = '#23140C';
    ctx.fillRect(x + 4, y + 4, 4, 3);

    // Face Profile
    ctx.fillStyle = '#FCD3A8';
    ctx.fillRect(x + 7, y + 4, 6, 4);
    // Nose point
    ctx.fillRect(x + 13, y + 5, 1, 2);
    // Eye
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x + 10, y + 5, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 11, y + 5, 1, 1);

    // Backpack visible on back (left side)
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x + 3, y + 8, 4, 5);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x + 4, y + 8, 3, 2);

    // Torso (Red jacket)
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 6, y + 8, 6, 5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 10, y + 8, 2, 1); // Collar

    // Arm (swinging)
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + 8 - armStep, y + 9, 3, 3);
    ctx.fillStyle = '#FCD3A8';
    ctx.fillRect(x + 9 - armStep, y + 12, 2, 2);

    // Pants (Blue jeans)
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(x + 6, y + 13, 5, 2);

    // Shoes
    if (legStep === 0) {
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 7, y + 15, 5, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 7, y + 16, 6, 1);
    } else if (legStep > 0) {
      // Forward stride
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 9, y + 15, 4, 1);
      ctx.fillRect(x + 5, y + 14, 3, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 9, y + 16, 5, 1);
      ctx.fillRect(x + 5, y + 15, 3, 1);
    } else {
      // Back stride
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 7, y + 14, 4, 1);
      ctx.fillRect(x + 5, y + 15, 4, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 7, y + 15, 4, 1);
      ctx.fillRect(x + 5, y + 16, 4, 1);
    }
  }

  // Tall grass overlay over feet
  if (inGrass) {
    ctx.fillStyle = '#207828';
    ctx.fillRect(x + 2, y + 12, 3, 5);
    ctx.fillRect(x + 7, y + 11, 3, 6);
    ctx.fillRect(x + 12, y + 13, 3, 4);

    ctx.fillStyle = '#48A840';
    ctx.fillRect(x + 3, y + 11, 1, 3);
    ctx.fillRect(x + 8, y + 10, 1, 4);
    ctx.fillRect(x + 13, y + 12, 1, 3);
  }

  ctx.restore();
}

