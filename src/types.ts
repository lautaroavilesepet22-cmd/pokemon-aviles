export type GameState = 
  | 'OVERWORLD' 
  | 'BATTLE_TRANSITION' 
  | 'BATTLE' 
  | 'DIALOGUE'
  | 'INVENTORY';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Move {
  id: string;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  maxPP: number;
  currentPP: number;
  effect?: 'DAMAGE' | 'LOWER_ATTACK' | 'HEAL';
}

export interface PokemonStats {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  maxExp: number;
  types: string[];
  moves: Move[];
  color: string;
  accentColor: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  description: string;
  category: 'POKEBALL' | 'MEDICINE';
}

export type BattlePhase = 
  | 'INTRO'
  | 'PLAYER_ACTION_SELECT'
  | 'PLAYER_MOVE_SELECT'
  | 'PLAYER_ATTACK_ANIM'
  | 'PLAYER_DAMAGE_CALC'
  | 'ENEMY_ATTACK_ANIM'
  | 'ENEMY_DAMAGE_CALC'
  | 'BAG_SELECT'
  | 'POKEBALL_THROW'
  | 'POKEMON_SWITCH_SELECT'
  | 'POKEMON_SWITCHING'
  | 'MESSAGE'
  | 'LEVEL_UP'
  | 'VICTORY'
  | 'DEFEAT'
  | 'RUN_AWAY';

export type ActionMenuOption = 'LUCHAR' | 'MOCHILA' | 'POKEMON' | 'HUIR';

export interface TileDef {
  type: 
    | 'GRASS' 
    | 'TALL_GRASS' 
    | 'PATH' 
    | 'WATER' 
    | 'TREE' 
    | 'ROOF_RED' 
    | 'ROOF_BLUE' 
    | 'WALL' 
    | 'DOOR' 
    | 'FENCE' 
    | 'SIGN'
    | 'FLOWER'
    | 'LEDGE';
  solid: boolean;
  encounterRate: number; // 0 to 1
  color: string;
}
