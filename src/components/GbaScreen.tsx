import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, BattlePhase, Direction, PokemonStats, Move, InventoryItem } from '../types';
import {
  INITIAL_POKEMON,
  WILD_POKEMON_LIST,
  OVERWORLD_MAP,
  MAP_SIGNS,
  INITIAL_INVENTORY,
} from '../data/pokemonData';
import { sounds } from '../audio/soundEffects';
import {
  drawPokemonSprite,
  drawAttackFX,
  drawRedOverworld,
} from './PokemonSprites';

interface GbaScreenProps {
  selectedStarter: string;
  onBattleChange?: (inBattle: boolean) => void;
  onMessageLog?: (msg: string) => void;
}

const TILE_SIZE = 16;
const LOGICAL_WIDTH = 240;
const LOGICAL_HEIGHT = 160;
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;

export const GbaScreen: React.FC<GbaScreenProps> = ({
  selectedStarter,
  onBattleChange,
  onMessageLog,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>('OVERWORLD');

  // Party state (supports full team of up to 6 caught Pokémon)
  const [playerTeam, setPlayerTeam] = useState<PokemonStats[]>(() => {
    const starter = INITIAL_POKEMON[selectedStarter] || INITIAL_POKEMON.CHARMANDER;
    return [JSON.parse(JSON.stringify(starter))];
  });
  const [activeTeamIdx, setActiveTeamIdx] = useState<number>(0);
  const [switchMenuIdx, setSwitchMenuIdx] = useState<number>(0);
  const [overworldMenuTab, setOverworldMenuTab] = useState<'MOCHILA' | 'EQUIPO'>('MOCHILA');
  const [overworldTeamIdx, setOverworldTeamIdx] = useState<number>(0);

  const [playerPokemon, setPlayerPokemon] = useState<PokemonStats>(() => {
    return JSON.parse(JSON.stringify(INITIAL_POKEMON[selectedStarter] || INITIAL_POKEMON.CHARMANDER));
  });
  const [enemyPokemon, setEnemyPokemon] = useState<PokemonStats | null>(null);

  // Inventory state (Starts with 15 Poké Balls & 3 Potions)
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [bagMenuIdx, setBagMenuIdx] = useState<number>(0);
  const [overworldMenuOpen, setOverworldMenuOpen] = useState<boolean>(false);
  const [signDialogue, setSignDialogue] = useState<string | null>(null);

  // Battle state
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('INTRO');
  const [actionMenuIdx, setActionMenuIdx] = useState<number>(0); // 0: LUCHAR, 1: MOCHILA, 2: POKÉMON, 3: HUIR
  const [moveMenuIdx, setMoveMenuIdx] = useState<number>(0);
  const [dialogueText, setDialogueText] = useState<string>('');

  // Overworld player position (Starts in Pallet Town at col 9, row 33)
  const playerRef = useRef({
    col: 9,
    row: 33,
    targetCol: 9,
    targetRow: 33,
    dir: 'DOWN' as Direction,
    isMoving: false,
    moveProgress: 0,
    walkFrame: 0,
    stepCount: 0,
  });

  // Battle animated state refs
  const battleAnimRef = useRef({
    playerHpDisplay: 20,
    enemyHpDisplay: 16,
    playerExpDisplay: 0,
    transitionTimer: 0,
    transitionMax: 45,
    enemyBlink: 0,
    playerBlink: 0,
    shakeScreen: 0,
    bobTimer: 0,
    enemyFaintProgress: 0,
    playerFaintProgress: 0,
    playerLunge: { x: 0, y: 0 },
    enemyLunge: { x: 0, y: 0 },
    attackFx: null as {
      moveId: string;
      progress: number;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    } | null,
    // Pokéball throwing & catch animation
    pokeballAnim: null as {
      progress: number; // 0 to 1
      phase: 'FLYING' | 'BEAM' | 'DROP' | 'SHAKE' | 'CAUGHT' | 'BREAKOUT';
      shakeCount: number;
      shakeTimer: number;
      shakeAngle: number;
      success: boolean;
      sparkles: Array<{ x: number; y: number; vx: number; vy: number; life: number }>;
    } | null,
    // Level Up stats summary
    levelUpData: null as {
      oldLevel: number;
      newLevel: number;
      hpInc: number;
      atkInc: number;
      defInc: number;
      spdInc: number;
    } | null,
    dialogueQueue: [] as string[],
  });

  const autoAdvanceTimerRef = useRef<any>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Sync starter change
  useEffect(() => {
    const starter = INITIAL_POKEMON[selectedStarter] || INITIAL_POKEMON.CHARMANDER;
    const starterCopy = JSON.parse(JSON.stringify(starter));
    setPlayerTeam([starterCopy]);
    setActiveTeamIdx(0);
    setPlayerPokemon(starterCopy);
    battleAnimRef.current.playerHpDisplay = starter.currentHp;
    battleAnimRef.current.playerExpDisplay = starter.exp;
  }, [selectedStarter]);

  // Keep active party member in sync with playerPokemon
  useEffect(() => {
    setPlayerTeam((prev) =>
      prev.map((mon, idx) => (idx === activeTeamIdx ? playerPokemon : mon))
    );
  }, [playerPokemon, activeTeamIdx]);

  // Notify parent of battle change
  useEffect(() => {
    if (onBattleChange) {
      onBattleChange(gameState === 'BATTLE' || gameState === 'BATTLE_TRANSITION');
    }
  }, [gameState, onBattleChange]);

  // Check collision in overworld
  const isPassable = useCallback((col: number, row: number) => {
    if (row < 0 || row >= OVERWORLD_MAP.length) return false;
    const line = OVERWORLD_MAP[row];
    if (col < 0 || col >= line.length) return false;
    const tile = line[col];
    // Solid tiles: T (Tree), R (Roof Red), B (Roof Blue), L (Wall), F (Fence), W (Water), S (Sign), M (Mailbox)
    return !['T', 'R', 'B', 'L', 'F', 'W', 'S', 'M'].includes(tile);
  }, []);

  const isTallGrass = useCallback((col: number, row: number) => {
    if (row < 0 || row >= OVERWORLD_MAP.length) return false;
    const line = OVERWORLD_MAP[row];
    if (col < 0 || col >= line.length) return false;
    return line[col] === 'H';
  }, []);

  // Trigger Wild Battle
  const triggerWildBattle = useCallback(() => {
    sounds.playEncounter();
    const row = playerRef.current.row;
    let wildFactory = WILD_POKEMON_LIST[Math.floor(Math.random() * WILD_POKEMON_LIST.length)];

    // In Route 2 (row <= 13), higher chance for Pikachu and higher levels (Lv. 4 - 6)
    if (row <= 13) {
      if (Math.random() < 0.45) {
        // Pikachu favorite zone
        wildFactory = WILD_POKEMON_LIST[2]; // PIKACHU
      }
      const wild = wildFactory();
      wild.level = Math.random() > 0.5 ? 5 : 6;
      wild.maxHp += (wild.level - 3) * 3;
      wild.attack += (wild.level - 3);
      wild.defense += (wild.level - 3);
      wild.currentHp = wild.maxHp;
      setEnemyPokemon(wild);
      battleAnimRef.current.enemyHpDisplay = wild.currentHp;
    } else {
      // Route 1 (row 14 to 26)
      const wild = wildFactory();
      wild.level = Math.random() > 0.5 ? 3 : 4;
      wild.maxHp += wild.level;
      wild.currentHp = wild.maxHp;
      setEnemyPokemon(wild);
      battleAnimRef.current.enemyHpDisplay = wild.currentHp;
    }
    battleAnimRef.current.playerHpDisplay = playerPokemon.currentHp;
    battleAnimRef.current.playerExpDisplay = playerPokemon.exp;
    battleAnimRef.current.transitionTimer = 0;
    battleAnimRef.current.enemyFaintProgress = 0;
    battleAnimRef.current.playerFaintProgress = 0;
    battleAnimRef.current.playerLunge = { x: 0, y: 0 };
    battleAnimRef.current.enemyLunge = { x: 0, y: 0 };
    battleAnimRef.current.attackFx = null;
    battleAnimRef.current.pokeballAnim = null;
    battleAnimRef.current.levelUpData = null;

    setGameState('BATTLE_TRANSITION');
  }, [playerPokemon.currentHp, playerPokemon.exp]);

  // Execute Enemy Turn
  const executeEnemyTurn = useCallback(() => {
    if (!enemyPokemon || enemyPokemon.currentHp <= 0) return;

    const moveIdx = Math.floor(Math.random() * enemyPokemon.moves.length);
    const move = enemyPokemon.moves[moveIdx];

    setBattlePhase('ENEMY_ATTACK_ANIM');
    setDialogueText(`¡El ${enemyPokemon.name} salvaje usó ${move.name}!`);

    // Enemy lunges towards player
    battleAnimRef.current.enemyLunge = { x: -14, y: 10 };
    battleAnimRef.current.attackFx = {
      moveId: move.id,
      progress: 0,
      fromX: 170,
      fromY: 45,
      toX: 70,
      toY: 82,
    };

    if (move.id === 'GRUNIDO') {
      sounds.playGrowl();
    } else {
      sounds.playSelect();
    }

    setTimeout(() => {
      battleAnimRef.current.enemyLunge = { x: 0, y: 0 };

      if (move.power > 0) {
        sounds.playHit();
        battleAnimRef.current.playerBlink = 20;
        battleAnimRef.current.shakeScreen = 12;

        const atkVal = enemyPokemon.attack;
        const defVal = playerPokemon.defense;
        const baseDmg = Math.floor(
          (((2 * enemyPokemon.level) / 5 + 2) * move.power * (atkVal / Math.max(1, defVal))) / 50 + 2
        );
        const dmg = Math.max(1, Math.floor(baseDmg * (0.85 + Math.random() * 0.3)));

        const nextHp = Math.max(0, playerPokemon.currentHp - dmg);
        setPlayerPokemon((prev) => ({ ...prev, currentHp: nextHp }));

        setTimeout(() => {
          battleAnimRef.current.attackFx = null;

          if (nextHp <= 0) {
            // Check if player has another Pokémon in team ready to fight
            const hasBackup = playerTeam.some((m, idx) => idx !== activeTeamIdx && m.currentHp > 0);

            let faintP = 0;
            const faintTimer = setInterval(() => {
              faintP += 0.08;
              battleAnimRef.current.playerFaintProgress = Math.min(1, faintP);
              if (faintP >= 1) clearInterval(faintTimer);
            }, 30);

            setDialogueText(`¡${playerPokemon.name} se debilitó!`);
            setBattlePhase('MESSAGE');

            if (hasBackup) {
              battleAnimRef.current.dialogueQueue = [
                '¡Elige otro Pokémon de tu equipo para luchar!',
                'POKEMON_SWITCH_MENU',
              ];
            } else {
              battleAnimRef.current.dialogueQueue = [
                '¡A todo tu equipo no le quedan fuerzas!',
                '¡Has perdido el combate!',
                'Fuiste llevado de urgencia al Centro Pokémon...',
                'RETURN_OVERWORLD_FAINT',
              ];
            }
          } else {
            // Player survived -> return to player action menu
            setDialogueText(`¿Qué debe hacer ${playerPokemon.name}?`);
            setBattlePhase('PLAYER_ACTION_SELECT');
            setActionMenuIdx(0);
          }
        }, 800);
      } else {
        sounds.playGrowl();
        setTimeout(() => {
          battleAnimRef.current.attackFx = null;
          setDialogueText(`¡El ataque de ${playerPokemon.name} bajó!`);
          setBattlePhase('MESSAGE');
          battleAnimRef.current.dialogueQueue = ['ACTION_MENU'];
          autoAdvanceTimerRef.current = setTimeout(() => {
            handleAdvanceDialogue();
          }, 1500);
        }, 600);
      }
    }, 450);
  }, [activeTeamIdx, enemyPokemon, playerPokemon, playerTeam]);

  // Advance battle dialogue or queue
  const handleAdvanceDialogue = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    // Completely and cleanly handle fleeing without hanging
    if (battlePhase === 'RUN_AWAY') {
      setBattlePhase('PLAYER_ACTION_SELECT');
      setGameState('OVERWORLD');
      setEnemyPokemon(null);
      battleAnimRef.current.attackFx = null;
      battleAnimRef.current.pokeballAnim = null;
      battleAnimRef.current.levelUpData = null;
      onBattleChange?.(false);
      onMessageLog?.('Escapaste del combate sin problemas.');
      return;
    }

    const q = battleAnimRef.current.dialogueQueue;
    if (q.length > 0) {
      const next = q.shift()!;
      if (next === 'ACTION_MENU') {
        setBattlePhase('PLAYER_ACTION_SELECT');
        setActionMenuIdx(0);
        setDialogueText(`¿Qué debe hacer ${playerPokemon.name}?`);
      } else if (next === 'EXECUTE_ENEMY_TURN') {
        executeEnemyTurn();
      } else if (next === 'SHOW_LEVEL_UP_STATS') {
        setBattlePhase('LEVEL_UP');
      } else if (next === 'POKEMON_SWITCH_MENU') {
        setBattlePhase('POKEMON_SWITCH_SELECT');
      } else if (next === 'RETURN_OVERWORLD') {
        setGameState('OVERWORLD');
        setEnemyPokemon(null);
        battleAnimRef.current.pokeballAnim = null;
        battleAnimRef.current.levelUpData = null;
        onBattleChange?.(false);
      } else if (next === 'RETURN_OVERWORLD_FAINT') {
        // Respawn player in front of Red's house with whole team healed
        setPlayerTeam((prev) => prev.map((m) => ({ ...m, currentHp: m.maxHp })));
        setPlayerPokemon((prev) => ({ ...prev, currentHp: prev.maxHp }));
        playerRef.current.col = 9;
        playerRef.current.row = 21;
        playerRef.current.targetCol = 9;
        playerRef.current.targetRow = 21;
        setGameState('OVERWORLD');
        setEnemyPokemon(null);
        onBattleChange?.(false);
        onMessageLog?.('¡Todo tu equipo Pokémon recuperó su energía en el Centro Pokémon!');
      } else {
        setDialogueText(next);
        setBattlePhase('MESSAGE');
      }
    } else {
      if (battlePhase === 'LEVEL_UP') {
        setGameState('OVERWORLD');
        setEnemyPokemon(null);
        battleAnimRef.current.levelUpData = null;
        onBattleChange?.(false);
      } else if (battlePhase === 'MESSAGE' && dialogueText.includes('escapado')) {
        executeEnemyTurn();
      } else if (battlePhase === 'MESSAGE') {
        setBattlePhase('PLAYER_ACTION_SELECT');
        setActionMenuIdx(0);
        setDialogueText(`¿Qué debe hacer ${playerPokemon.name}?`);
      }
    }
  }, [battlePhase, dialogueText, executeEnemyTurn, onBattleChange, onMessageLog, playerPokemon]);

  // Handle Level Up calculations
  const processExpAndLevelUp = useCallback(
    (expGained: number) => {
      setPlayerPokemon((prev) => {
        const totalExp = prev.exp + expGained;
        if (totalExp >= prev.maxExp) {
          // LEVEL UP!
          const newLevel = prev.level + 1;
          const hpInc = Math.floor(Math.random() * 2) + 2; // +2 or +3 PS
          const atkInc = Math.floor(Math.random() * 2) + 1; // +1 or +2 Atk
          const defInc = Math.floor(Math.random() * 2) + 1; // +1 or +2 Def
          const spdInc = Math.floor(Math.random() * 2) + 1; // +1 or +2 Spd

          const newMaxHp = prev.maxHp + hpInc;
          const newCurrentHp = prev.currentHp + hpInc; // Heal current HP by the gain
          const remainingExp = totalExp - prev.maxExp;
          const nextMaxExp = Math.floor(prev.maxExp * 1.35);

          battleAnimRef.current.levelUpData = {
            oldLevel: prev.level,
            newLevel,
            hpInc,
            atkInc,
            defInc,
            spdInc,
          };

          sounds.playVictory();

          battleAnimRef.current.dialogueQueue = [
            `¡${prev.name} ganó ${expGained} puntos de EXP!`,
            `¡${prev.name} subió al nivel ${newLevel}!`,
            'SHOW_LEVEL_UP_STATS',
            'RETURN_OVERWORLD',
          ];

          return {
            ...prev,
            level: newLevel,
            maxHp: newMaxHp,
            currentHp: newCurrentHp,
            attack: prev.attack + atkInc,
            defense: prev.defense + defInc,
            speed: prev.speed + spdInc,
            exp: remainingExp,
            maxExp: nextMaxExp,
          };
        } else {
          // No level up yet, just gain EXP
          battleAnimRef.current.dialogueQueue = [
            `¡${prev.name} ganó ${expGained} puntos de EXP!`,
            'RETURN_OVERWORLD',
          ];
          return {
            ...prev,
            exp: totalExp,
          };
        }
      });
    },
    []
  );

  // Execute Player Move
  const executePlayerMove = useCallback(
    (move: Move) => {
      if (!enemyPokemon) return;
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      // Deduct PP
      setPlayerPokemon((prev) => {
        const moves = prev.moves.map((m) =>
          m.id === move.id ? { ...m, currentPP: Math.max(0, m.currentPP - 1) } : m
        );
        return { ...prev, moves };
      });

      setBattlePhase('PLAYER_ATTACK_ANIM');
      setDialogueText(`¡${playerPokemon.name} usó ${move.name}!`);

      // Player lunges forward
      battleAnimRef.current.playerLunge = { x: 14, y: -9 };
      battleAnimRef.current.attackFx = {
        moveId: move.id,
        progress: 0,
        fromX: 75,
        fromY: 78,
        toX: 175,
        toY: 42,
      };

      if (move.id === 'GRUNIDO') {
        sounds.playGrowl();
      } else {
        sounds.playSelect();
      }

      setTimeout(() => {
        battleAnimRef.current.playerLunge = { x: 0, y: 0 };

        if (move.power > 0) {
          sounds.playHit();
          battleAnimRef.current.enemyBlink = 20;
          battleAnimRef.current.shakeScreen = 14;

          const atkVal = playerPokemon.attack;
          const defVal = enemyPokemon.defense;
          const baseDmg = Math.floor(
            (((2 * playerPokemon.level) / 5 + 2) * move.power * (atkVal / Math.max(1, defVal))) / 50 + 2
          );
          const dmg = Math.max(1, Math.floor(baseDmg * (0.85 + Math.random() * 0.3)));

          const nextHp = Math.max(0, enemyPokemon.currentHp - dmg);
          setEnemyPokemon((prev) => (prev ? { ...prev, currentHp: nextHp } : null));

          setTimeout(() => {
            battleAnimRef.current.attackFx = null;

            if (nextHp <= 0) {
              sounds.playVictory();
              // Animate enemy faint downward
              let faintP = 0;
              const faintTimer = setInterval(() => {
                faintP += 0.08;
                battleAnimRef.current.enemyFaintProgress = Math.min(1, faintP);
                if (faintP >= 1) clearInterval(faintTimer);
              }, 30);

              // Calculate experience gained from enemy level
              const expGain = Math.floor(enemyPokemon.level * 24 + Math.random() * 8);

              setDialogueText(`¡El ${enemyPokemon.name} salvaje se debilitó!`);
              setBattlePhase('MESSAGE');
              processExpAndLevelUp(expGain);

              autoAdvanceTimerRef.current = setTimeout(() => {
                handleAdvanceDialogue();
              }, 2200);
            } else {
              setDialogueText(`¡Un golpe certero!`);
              setBattlePhase('MESSAGE');
              battleAnimRef.current.dialogueQueue = ['EXECUTE_ENEMY_TURN'];
              autoAdvanceTimerRef.current = setTimeout(() => {
                handleAdvanceDialogue();
              }, 1200);
            }
          }, 800);
        } else {
          sounds.playGrowl();
          setTimeout(() => {
            battleAnimRef.current.attackFx = null;
            setDialogueText(`¡El ataque del ${enemyPokemon.name} salvaje bajó!`);
            setBattlePhase('MESSAGE');
            battleAnimRef.current.dialogueQueue = ['EXECUTE_ENEMY_TURN'];
            autoAdvanceTimerRef.current = setTimeout(() => {
              handleAdvanceDialogue();
            }, 1200);
          }, 600);
        }
      }, 450);
    },
    [enemyPokemon, handleAdvanceDialogue, playerPokemon, processExpAndLevelUp]
  );

  // Throw Poké Ball to catch wild Pokémon
  const executeThrowPokeBall = useCallback(() => {
    if (!enemyPokemon) return;

    // Check Pokéball inventory count
    const ballItem = inventory.find((it) => it.id === 'POKEBALL');
    if (!ballItem || ballItem.count <= 0) {
      setDialogueText('¡No te quedan Poké Balls en la mochila!');
      setBattlePhase('MESSAGE');
      battleAnimRef.current.dialogueQueue = ['ACTION_MENU'];
      return;
    }

    // Deduct 1 Pokéball
    setInventory((prev) =>
      prev.map((it) => (it.id === 'POKEBALL' ? { ...it, count: it.count - 1 } : it))
    );

    setBattlePhase('POKEBALL_THROW');
    setDialogueText(`¡Lanzaste una Poké Ball!`);
    sounds.playSelect();

    // Catch rate logic: lower enemy HP = higher catch chance
    const hpRatio = enemyPokemon.currentHp / enemyPokemon.maxHp;
    const catchSuccess = Math.random() < Math.max(0.35, 1 - hpRatio * 0.7);

    battleAnimRef.current.pokeballAnim = {
      progress: 0,
      phase: 'FLYING',
      shakeCount: 0,
      shakeTimer: 0,
      shakeAngle: 0,
      success: catchSuccess,
      sparkles: [],
    };
  }, [enemyPokemon, inventory]);

  // Use Potion from Bag
  const executeUsePotion = useCallback(() => {
    const potionItem = inventory.find((it) => it.id === 'POTION');
    if (!potionItem || potionItem.count <= 0) {
      setDialogueText('¡No tienes Pociones en la mochila!');
      setBattlePhase('MESSAGE');
      battleAnimRef.current.dialogueQueue = ['ACTION_MENU'];
      return;
    }

    if (playerPokemon.currentHp >= playerPokemon.maxHp) {
      setDialogueText('¡Los PS de tu Pokémon ya están al máximo!');
      setBattlePhase('MESSAGE');
      battleAnimRef.current.dialogueQueue = ['ACTION_MENU'];
      return;
    }

    // Deduct 1 Potion & heal
    setInventory((prev) =>
      prev.map((it) => (it.id === 'POTION' ? { ...it, count: it.count - 1 } : it))
    );

    const healedHp = Math.min(playerPokemon.maxHp, playerPokemon.currentHp + 20);
    setPlayerPokemon((p) => ({ ...p, currentHp: healedHp }));
    sounds.playHeal();

    setDialogueText(`¡Usaste una Poción! ¡${playerPokemon.name} recuperó 20 PS!`);
    setBattlePhase('MESSAGE');
    battleAnimRef.current.dialogueQueue = ['EXECUTE_ENEMY_TURN'];
    autoAdvanceTimerRef.current = setTimeout(() => {
      handleAdvanceDialogue();
    }, 1800);
  }, [handleAdvanceDialogue, inventory, playerPokemon]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      keysRef.current[code] = true;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // Overworld interaction
      if (gameState === 'OVERWORLD') {
        if (signDialogue) {
          // Dismiss sign dialogue
          if (code === 'KeyZ' || code === 'KeyX' || code === 'Space' || code === 'Enter') {
            sounds.playSelect();
            setSignDialogue(null);
          }
          return;
        }

        if (overworldMenuOpen) {
          // Tab switching between MOCHILA and EQUIPO
          if (code === 'ArrowLeft' || code === 'KeyA') {
            sounds.playSelect();
            setOverworldMenuTab('MOCHILA');
            return;
          }
          if (code === 'ArrowRight' || code === 'KeyD') {
            sounds.playSelect();
            setOverworldMenuTab('EQUIPO');
            return;
          }

          if (overworldMenuTab === 'MOCHILA') {
            if (code === 'ArrowUp' || code === 'KeyW') {
              sounds.playSelect();
              setBagMenuIdx((prev) => Math.max(0, prev - 1));
            } else if (code === 'ArrowDown' || code === 'KeyS') {
              sounds.playSelect();
              setBagMenuIdx((prev) => Math.min(inventory.length - 1, prev + 1));
            } else if (code === 'KeyZ' || code === 'Space') {
              // Use item in overworld (e.g. potion)
              const selItem = inventory[bagMenuIdx];
              if (selItem && selItem.id === 'POTION') {
                if (selItem.count > 0 && playerPokemon.currentHp < playerPokemon.maxHp) {
                  setInventory((prev) =>
                    prev.map((it) => (it.id === 'POTION' ? { ...it, count: it.count - 1 } : it))
                  );
                  setPlayerPokemon((p) => ({
                    ...p,
                    currentHp: Math.min(p.maxHp, p.currentHp + 20),
                  }));
                  sounds.playHeal();
                  onMessageLog?.(`¡Usaste Poción! ${playerPokemon.name} recuperó 20 PS.`);
                } else {
                  sounds.playCancel();
                  onMessageLog?.('No puedes usar esta medicina ahora.');
                }
              } else {
                sounds.playSelect();
                onMessageLog?.(`${selItem.name}: ${selItem.description}`);
              }
            } else if (code === 'KeyX' || code === 'Escape' || code === 'Enter') {
              sounds.playCancel();
              setOverworldMenuOpen(false);
            }
          } else {
            // EQUIPO Tab in overworld
            if (code === 'ArrowUp' || code === 'KeyW') {
              sounds.playSelect();
              setOverworldTeamIdx((prev) => (prev > 0 ? prev - 1 : playerTeam.length - 1));
            } else if (code === 'ArrowDown' || code === 'KeyS') {
              sounds.playSelect();
              setOverworldTeamIdx((prev) => (prev < playerTeam.length - 1 ? prev + 1 : 0));
            } else if (code === 'KeyZ' || code === 'Space') {
              const targetMon = playerTeam[overworldTeamIdx];
              if (targetMon) {
                setActiveTeamIdx(overworldTeamIdx);
                setPlayerPokemon(targetMon);
                sounds.playSelect();
                onMessageLog?.(`¡${targetMon.name} es ahora el primer Pokémon de tu equipo!`);
              }
            } else if (code === 'KeyX' || code === 'Escape' || code === 'Enter') {
              sounds.playCancel();
              setOverworldMenuOpen(false);
            }
          }
          return;
        }

        // Open Bag / Menu with Enter or KeyI
        if (code === 'Enter' || code === 'KeyI') {
          sounds.playSelect();
          setOverworldMenuOpen(true);
          setBagMenuIdx(0);
          setOverworldTeamIdx(activeTeamIdx);
          return;
        }

        // Interact with Z
        if (code === 'KeyZ' || code === 'Space') {
          sounds.playSelect();
          const p = playerRef.current;
          let frontCol = p.col;
          let frontRow = p.row;
          if (p.dir === 'UP') frontRow -= 1;
          if (p.dir === 'DOWN') frontRow += 1;
          if (p.dir === 'LEFT') frontCol -= 1;
          if (p.dir === 'RIGHT') frontCol += 1;

          if (frontRow >= 0 && frontRow < OVERWORLD_MAP.length) {
            const tile = OVERWORLD_MAP[frontRow][frontCol];
            const coordKey = `${frontCol},${frontRow}`;
            if (tile === 'S') {
              const text = MAP_SIGNS[coordKey] || 'Cartel: "Ruta 1 al norte. ¡Cuidado con la hierba alta!"';
              setSignDialogue(text);
              onMessageLog?.(text);
            } else if (tile === 'D') {
              const text = 'Puerta: La puerta está cerrada pero la brisa huele a aventura.';
              setSignDialogue(text);
              onMessageLog?.(text);
            } else if (tile === 'M') {
              const text = 'Buzón de correo: ¡No hay cartas nuevas para Red hoy!';
              setSignDialogue(text);
              onMessageLog?.(text);
            }
          }
        }
      }

      // Battle interactions
      if (gameState === 'BATTLE') {
        if (battlePhase === 'RUN_AWAY') {
          // Instant dismiss when fleeing
          if (code === 'KeyZ' || code === 'KeyX' || code === 'Space' || code === 'Enter' || code === 'Escape') {
            handleAdvanceDialogue();
            return;
          }
        }

        if (
          battlePhase === 'INTRO' ||
          battlePhase === 'MESSAGE' ||
          battlePhase === 'VICTORY' ||
          battlePhase === 'DEFEAT' ||
          battlePhase === 'PLAYER_ATTACK_ANIM' ||
          battlePhase === 'ENEMY_ATTACK_ANIM'
        ) {
          if (code === 'KeyZ' || code === 'Space' || code === 'Enter') {
            sounds.playSelect();
            handleAdvanceDialogue();
          }
        } else if (battlePhase === 'LEVEL_UP') {
          if (code === 'KeyZ' || code === 'Space' || code === 'Enter') {
            sounds.playSelect();
            handleAdvanceDialogue();
          }
        } else if (battlePhase === 'PLAYER_ACTION_SELECT') {
          // 2x2 Menu: 0: LUCHAR, 1: MOCHILA, 2: POKÉMON, 3: HUIR
          if (code === 'ArrowUp' || code === 'KeyW') {
            sounds.playSelect();
            setActionMenuIdx((prev) => (prev >= 2 ? prev - 2 : prev));
          } else if (code === 'ArrowDown' || code === 'KeyS') {
            sounds.playSelect();
            setActionMenuIdx((prev) => (prev <= 1 ? prev + 2 : prev));
          } else if (code === 'ArrowLeft' || code === 'KeyA') {
            sounds.playSelect();
            setActionMenuIdx((prev) => (prev === 1 || prev === 3 ? prev - 1 : prev));
          } else if (code === 'ArrowRight' || code === 'KeyD') {
            sounds.playSelect();
            setActionMenuIdx((prev) => (prev === 0 || prev === 2 ? prev + 1 : prev));
          } else if (code === 'KeyZ' || code === 'Space' || code === 'Enter') {
            sounds.playSelect();
            if (actionMenuIdx === 0) {
              // LUCHAR
              setBattlePhase('PLAYER_MOVE_SELECT');
              setMoveMenuIdx(0);
            } else if (actionMenuIdx === 1) {
              // MOCHILA (Open Bag Screen)
              setBattlePhase('BAG_SELECT');
              setBagMenuIdx(0);
            } else if (actionMenuIdx === 2) {
              // POKÉMON (Cambio de Pokémon en combate)
              sounds.playSelect();
              setBattlePhase('POKEMON_SWITCH_SELECT');
              setSwitchMenuIdx(activeTeamIdx);
            } else if (actionMenuIdx === 3) {
              // HUIR (100% reliable escape)
              sounds.playRun();
              setDialogueText('¡Escapaste sin problemas!');
              setBattlePhase('RUN_AWAY');
              battleAnimRef.current.dialogueQueue = [];
              if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
              }
              autoAdvanceTimerRef.current = setTimeout(() => {
                handleAdvanceDialogue();
              }, 1000);
            }
          }
        } else if (battlePhase === 'POKEMON_SWITCH_SELECT') {
          // In-Battle Pokémon Switching Menu
          if (code === 'ArrowUp' || code === 'KeyW') {
            sounds.playSelect();
            setSwitchMenuIdx((prev) => (prev > 0 ? prev - 1 : playerTeam.length - 1));
          } else if (code === 'ArrowDown' || code === 'KeyS') {
            sounds.playSelect();
            setSwitchMenuIdx((prev) => (prev < playerTeam.length - 1 ? prev + 1 : 0));
          } else if (code === 'KeyX' || code === 'Escape') {
            sounds.playCancel();
            setBattlePhase('PLAYER_ACTION_SELECT');
            setDialogueText(`¿Qué debe hacer ${playerPokemon.name}?`);
          } else if (code === 'KeyZ' || code === 'Space' || code === 'Enter') {
            const targetMon = playerTeam[switchMenuIdx];
            if (!targetMon) return;

            if (switchMenuIdx === activeTeamIdx) {
              sounds.playCancel();
              setDialogueText(`¡${playerPokemon.name} ya está en combate!`);
              setBattlePhase('MESSAGE');
              battleAnimRef.current.dialogueQueue = ['POKEMON_SWITCH_MENU'];
              return;
            }

            if (targetMon.currentHp <= 0) {
              sounds.playCancel();
              setDialogueText(`¡A ${targetMon.name} no le quedan fuerzas para luchar!`);
              setBattlePhase('MESSAGE');
              battleAnimRef.current.dialogueQueue = ['POKEMON_SWITCH_MENU'];
              return;
            }

            // Valid switch!
            sounds.playRun();
            const prevMon = playerPokemon;
            setActiveTeamIdx(switchMenuIdx);
            setPlayerPokemon(targetMon);
            battleAnimRef.current.playerHpDisplay = targetMon.currentHp;
            battleAnimRef.current.playerExpDisplay = targetMon.exp;
            battleAnimRef.current.playerLunge = { x: 0, y: 0 };
            battleAnimRef.current.playerBlink = 0;
            battleAnimRef.current.playerFaintProgress = 0;

            setDialogueText(`¡Vuelve, ${prevMon.name}!`);
            setBattlePhase('MESSAGE');
            battleAnimRef.current.dialogueQueue = [
              `¡Adelante, ${targetMon.name}!`,
              'EXECUTE_ENEMY_TURN',
            ];
            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = setTimeout(() => {
              handleAdvanceDialogue();
            }, 1200);
          }
        } else if (battlePhase === 'BAG_SELECT') {
          // Mochila item navigation
          if (code === 'ArrowUp' || code === 'KeyW') {
            sounds.playSelect();
            setBagMenuIdx((prev) => Math.max(0, prev - 1));
          } else if (code === 'ArrowDown' || code === 'KeyS') {
            sounds.playSelect();
            setBagMenuIdx((prev) => Math.min(inventory.length - 1, prev + 1));
          } else if (code === 'KeyX' || code === 'Escape') {
            sounds.playCancel();
            setBattlePhase('PLAYER_ACTION_SELECT');
          } else if (code === 'KeyZ' || code === 'Space' || code === 'Enter') {
            const selectedItem = inventory[bagMenuIdx];
            if (selectedItem) {
              if (selectedItem.id === 'POKEBALL') {
                executeThrowPokeBall();
              } else if (selectedItem.id === 'POTION') {
                executeUsePotion();
              }
            }
          }
        } else if (battlePhase === 'PLAYER_MOVE_SELECT') {
          const moveCount = playerPokemon.moves.length;
          if (code === 'ArrowUp' || code === 'KeyW') {
            sounds.playSelect();
            setMoveMenuIdx((prev) => (prev >= 2 ? prev - 2 : prev));
          } else if (code === 'ArrowDown' || code === 'KeyS') {
            sounds.playSelect();
            setMoveMenuIdx((prev) => (prev + 2 < moveCount ? prev + 2 : prev));
          } else if (code === 'ArrowLeft' || code === 'KeyA') {
            sounds.playSelect();
            setMoveMenuIdx((prev) => (prev % 2 === 1 ? prev - 1 : prev));
          } else if (code === 'ArrowRight' || code === 'KeyD') {
            sounds.playSelect();
            setMoveMenuIdx((prev) => (prev % 2 === 0 && prev + 1 < moveCount ? prev + 1 : prev));
          } else if (code === 'KeyX' || code === 'Escape') {
            sounds.playCancel();
            setBattlePhase('PLAYER_ACTION_SELECT');
          } else if (code === 'KeyZ' || code === 'Space' || code === 'Enter') {
            sounds.playSelect();
            const move = playerPokemon.moves[moveMenuIdx];
            if (move) {
              executePlayerMove(move);
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    gameState,
    battlePhase,
    actionMenuIdx,
    moveMenuIdx,
    bagMenuIdx,
    inventory,
    overworldMenuOpen,
    overworldMenuTab,
    overworldTeamIdx,
    playerTeam,
    activeTeamIdx,
    switchMenuIdx,
    signDialogue,
    playerPokemon,
    handleAdvanceDialogue,
    executePlayerMove,
    executeThrowPokeBall,
    executeUsePotion,
    onMessageLog,
  ]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Disable image smoothing for crisp pixel art
      ctx.imageSmoothingEnabled = false;

      // High pixel-density scaling (2x scale for 480x320 canvas with 240x160 logical coords)
      ctx.save();
      ctx.scale(2, 2);

      // -----------------------------------------------------------------------
      // OVERWORLD STATE
      // -----------------------------------------------------------------------
      if (gameState === 'OVERWORLD') {
        const p = playerRef.current;

        // Player grid movement update
        if (p.isMoving) {
          p.moveProgress += 0.14; // Speed
          if (p.moveProgress >= 1) {
            p.col = p.targetCol;
            p.row = p.targetRow;
            p.isMoving = false;
            p.moveProgress = 0;
            p.stepCount += 1;
            p.walkFrame = p.stepCount % 2;

            // Check tall grass wild encounter
            if (isTallGrass(p.col, p.row)) {
              // 22% chance per step in tall grass
              if (Math.random() < 0.22) {
                triggerWildBattle();
              }
            }
          }
        } else if (!overworldMenuOpen && !signDialogue) {
          // Poll directional input
          let nextDir: Direction | null = null;
          let dCol = 0;
          let dRow = 0;

          if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
            nextDir = 'UP';
            dRow = -1;
          } else if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
            nextDir = 'DOWN';
            dRow = 1;
          } else if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
            nextDir = 'LEFT';
            dCol = -1;
          } else if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
            nextDir = 'RIGHT';
            dCol = 1;
          }

          if (nextDir) {
            p.dir = nextDir;
            const targetCol = p.col + dCol;
            const targetRow = p.row + dRow;

            if (isPassable(targetCol, targetRow)) {
              p.targetCol = targetCol;
              p.targetRow = targetRow;
              p.isMoving = true;
              p.moveProgress = 0;
            }
          }
        }

        // Clear Screen
        ctx.fillStyle = '#101010';
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        // Camera centered on player
        const currentPx = (p.isMoving ? p.col + (p.targetCol - p.col) * p.moveProgress : p.col) * TILE_SIZE;
        const currentPy = (p.isMoving ? p.row + (p.targetRow - p.row) * p.moveProgress : p.row) * TILE_SIZE;

        const camX = Math.floor(currentPx - LOGICAL_WIDTH / 2 + TILE_SIZE / 2);
        const camY = Math.floor(currentPy - LOGICAL_HEIGHT / 2 + TILE_SIZE / 2);

        const timeTick = Date.now() / 400;

        // Render Map Tiles
        for (let r = 0; r < OVERWORLD_MAP.length; r++) {
          const rowStr = OVERWORLD_MAP[r];
          for (let c = 0; c < rowStr.length; c++) {
            const tile = rowStr[c];
            const sx = c * TILE_SIZE - camX;
            const sy = r * TILE_SIZE - camY;

            if (sx < -TILE_SIZE || sx > LOGICAL_WIDTH || sy < -TILE_SIZE || sy > LOGICAL_HEIGHT) {
              continue;
            }

            // Tile Graphics
            if (tile === '.') {
              // Normal Grass
              ctx.fillStyle = '#48A048';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#58B058';
              ctx.fillRect(sx + 3, sy + 3, 2, 1);
              ctx.fillRect(sx + 10, sy + 11, 2, 1);
            } else if (tile === 'H') {
              // Hierba Alta (Tall Grass) - Detallada y frondosa con briznas
              ctx.fillStyle = '#185418'; // Base oscura
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

              // Briznas con relieve
              ctx.fillStyle = '#287028';
              ctx.fillRect(sx + 1, sy + 2, 3, 13);
              ctx.fillRect(sx + 6, sy + 1, 3, 14);
              ctx.fillRect(sx + 11, sy + 3, 3, 12);

              // Puntas claras con movimiento sutil de viento
              const sway = Math.sin(timeTick + c + r) > 0 ? 1 : 0;
              ctx.fillStyle = '#60B840';
              ctx.fillRect(sx + 2 + sway, sy, 2, 3);
              ctx.fillRect(sx + 7 + sway, sy, 2, 3);
              ctx.fillRect(sx + 12 + sway, sy + 1, 2, 3);
            } else if (tile === 'P') {
              // Camino de tierra arenoso con textura
              ctx.fillStyle = '#E0C068';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#C8A448';
              ctx.fillRect(sx + 2, sy + 4, 2, 1);
              ctx.fillRect(sx + 10, sy + 9, 2, 1);
              ctx.fillRect(sx + 6, sy + 13, 2, 1);
              ctx.fillStyle = '#F0D488';
              ctx.fillRect(sx + 4, sy + 2, 1, 1);
            } else if (tile === 'T') {
              // Árbol frondoso estilo GBA (Tronco + copa 3 niveles)
              ctx.fillStyle = '#48A048'; // Suelo debajo
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

              // Tronco de madera
              ctx.fillStyle = '#583818';
              ctx.fillRect(sx + 6, sy + 10, 4, 6);
              ctx.fillStyle = '#382008';
              ctx.fillRect(sx + 8, sy + 11, 2, 5);

              // Copa frondosa circular
              ctx.fillStyle = '#0E3010'; // Borde oscuro
              ctx.beginPath();
              ctx.arc(sx + 8, sy + 6, 7.5, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#246820'; // Follaje medio
              ctx.beginPath();
              ctx.arc(sx + 8, sy + 5.5, 6, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#409838'; // Brillo superior
              ctx.beginPath();
              ctx.arc(sx + 8, sy + 4.5, 3.5, 0, Math.PI * 2);
              ctx.fill();
            } else if (tile === 'R') {
              // Techo rojo de casa (Tejas 3D con sombras)
              ctx.fillStyle = '#D83828';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              // Líneas de tejas horizontales y sombras
              ctx.fillStyle = '#A02018';
              ctx.fillRect(sx, sy + 4, TILE_SIZE, 2);
              ctx.fillRect(sx, sy + 10, TILE_SIZE, 2);
              ctx.fillStyle = '#F06050';
              ctx.fillRect(sx, sy, TILE_SIZE, 1);
              ctx.fillRect(sx, sy + 6, TILE_SIZE, 1);
              ctx.fillRect(sx, sy + 12, TILE_SIZE, 1);
            } else if (tile === 'B') {
              // Techo azul del Laboratorio del Prof. Oak
              ctx.fillStyle = '#2868A8';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#184478';
              ctx.fillRect(sx, sy + 4, TILE_SIZE, 2);
              ctx.fillRect(sx, sy + 10, TILE_SIZE, 2);
              ctx.fillStyle = '#5098D8';
              ctx.fillRect(sx, sy, TILE_SIZE, 1);
              ctx.fillRect(sx, sy + 6, TILE_SIZE, 1);
            } else if (tile === 'L') {
              // Pared de casa con tablones y ventana con reflejo
              ctx.fillStyle = '#F4EEDC';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#D8CEBA';
              ctx.fillRect(sx, sy + 5, TILE_SIZE, 1);
              ctx.fillRect(sx, sy + 11, TILE_SIZE, 1);
              // Zócalo de piedra en la base
              ctx.fillStyle = '#888078';
              ctx.fillRect(sx, sy + 13, TILE_SIZE, 3);
              // Ventana pequeña con reflejo de cielo
              ctx.fillStyle = '#4880B8';
              ctx.fillRect(sx + 4, sy + 3, 8, 6);
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(sx + 5, sy + 4, 2, 2);
              ctx.strokeStyle = '#684020';
              ctx.strokeRect(sx + 3.5, sy + 2.5, 9, 7);
            } else if (tile === 'D') {
              // Puerta de madera con marco, pomo dorado y escalón
              ctx.fillStyle = '#F4EEDC';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#783818';
              ctx.fillRect(sx + 3, sy + 2, 10, 13);
              ctx.fillStyle = '#502008';
              ctx.fillRect(sx + 7, sy + 3, 1, 11);
              ctx.fillStyle = '#F8D030'; // Pomo dorado
              ctx.fillRect(sx + 10, sy + 8, 2, 2);
              ctx.fillStyle = '#A8A090'; // Escalón
              ctx.fillRect(sx + 2, sy + 14, 12, 2);
            } else if (tile === 'F') {
              // Valla de madera con postes
              ctx.fillStyle = '#48A048';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#C88848';
              ctx.fillRect(sx, sy + 4, TILE_SIZE, 3);
              ctx.fillRect(sx, sy + 10, TILE_SIZE, 3);
              ctx.fillStyle = '#905828';
              ctx.fillRect(sx + 2, sy + 2, 3, 13);
              ctx.fillRect(sx + 10, sy + 2, 3, 13);
            } else if (tile === 'W') {
              // Agua con reflejos animados
              ctx.fillStyle = '#3868B8';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              const waveOff = Math.sin(timeTick * 1.5 + c) * 2;
              ctx.fillStyle = '#70A8F8';
              ctx.fillRect(sx + 2 + waveOff, sy + 4, 5, 1);
              ctx.fillRect(sx + 8 - waveOff, sy + 10, 6, 1);
            } else if (tile === 'S') {
              // Cartel de madera informativo
              ctx.fillStyle = '#48A048';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#784818';
              ctx.fillRect(sx + 4, sy + 10, 2, 5);
              ctx.fillRect(sx + 10, sy + 10, 2, 5);
              ctx.fillStyle = '#B87838';
              ctx.fillRect(sx + 2, sy + 3, 12, 8);
              ctx.fillStyle = '#583010';
              ctx.fillRect(sx + 4, sy + 5, 8, 1);
              ctx.fillRect(sx + 4, sy + 8, 6, 1);
            } else if (tile === '*') {
              // Flores silvestres decorativas (Rojas, Amarillas y Blancas)
              ctx.fillStyle = '#48A048';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              // Flor roja
              ctx.fillStyle = '#E83828';
              ctx.fillRect(sx + 3, sy + 4, 3, 3);
              ctx.fillStyle = '#F8E030';
              ctx.fillRect(sx + 4, sy + 5, 1, 1);
              // Flor amarilla
              ctx.fillStyle = '#F8D030';
              ctx.fillRect(sx + 10, sy + 9, 3, 3);
              ctx.fillStyle = '#E87010';
              ctx.fillRect(sx + 11, sy + 10, 1, 1);
            } else if (tile === 'M') {
              // Buzón de correo de Red
              ctx.fillStyle = '#48A048';
              ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#683818';
              ctx.fillRect(sx + 7, sy + 8, 2, 7);
              ctx.fillStyle = '#D82818';
              ctx.fillRect(sx + 4, sy + 3, 8, 6);
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(sx + 9, sy + 4, 2, 2);
            }
          }
        }

        // Draw Player Sprite (Red GBA style centered in viewport)
        const px = Math.floor(LOGICAL_WIDTH / 2 - TILE_SIZE / 2);
        const py = Math.floor(LOGICAL_HEIGHT / 2 - TILE_SIZE / 2);
        const inGrass = isTallGrass(p.col, p.row);

        drawRedOverworld(ctx, px, py, p.dir, p.isMoving, p.walkFrame, inGrass);

        // HUD Banner (Route / Location + Starter Status)
        // HUD Banner (Route / Location + Starter Status + Team count)
        ctx.fillStyle = 'rgba(15, 20, 25, 0.85)';
        ctx.fillRect(0, 0, LOGICAL_WIDTH, 16);
        ctx.strokeStyle = '#284060';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, LOGICAL_WIDTH, 16);

        const isRoute2 = p.row <= 13;
        const isRoute1 = p.row > 13 && p.row <= 26;
        ctx.fillStyle = isRoute2 ? '#48B8E8' : isRoute1 ? '#68D070' : '#E8D080';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(isRoute2 ? '🌲 RUTA 2' : isRoute1 ? '🌿 RUTA 1' : '🏡 PUEBLO PALETA', 6, 11);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`${playerPokemon.name} :L${playerPokemon.level}`, 98, 11);

        // Party count & Balls indicator
        const pokeBallsCount = inventory.find((it) => it.id === 'POKEBALL')?.count || 0;
        ctx.fillStyle = '#F8D030';
        ctx.fillText(`PKMN:${playerTeam.length}`, 168, 11);
        ctx.fillStyle = '#F86040';
        ctx.fillText(`⚾${pokeBallsCount}`, 214, 11);

        // Signpost Dialogue Box Overlay in Overworld
        if (signDialogue) {
          const dy = LOGICAL_HEIGHT - 48;
          ctx.fillStyle = '#F8F8F0';
          ctx.fillRect(8, dy, LOGICAL_WIDTH - 16, 42);
          ctx.strokeStyle = '#284060';
          ctx.lineWidth = 2;
          ctx.strokeRect(8, dy, LOGICAL_WIDTH - 16, 42);

          ctx.fillStyle = '#202020';
          ctx.font = '6.5px "Press Start 2P", monospace';
          const lines = wrapText(ctx, signDialogue, 210);
          lines.forEach((l, idx) => {
            ctx.fillText(l, 14, dy + 14 + idx * 12);
          });

          ctx.fillStyle = '#C03010';
          ctx.font = '5.5px "Press Start 2P", monospace';
          ctx.fillText('▼ [Z] Cerrar', LOGICAL_WIDTH - 65, dy + 37);
        }

        // Overworld Bag & Party Overlay
        if (overworldMenuOpen) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

          const mx = 16;
          const my = 14;
          const mw = LOGICAL_WIDTH - 32;
          const mh = LOGICAL_HEIGHT - 28;

          ctx.fillStyle = '#F8F8F0';
          ctx.fillRect(mx, my, mw, mh);
          ctx.strokeStyle = '#284868';
          ctx.lineWidth = 2;
          ctx.strokeRect(mx, my, mw, mh);

          // Tab Bar (MOCHILA vs EQUIPO)
          const tab1Active = overworldMenuTab === 'MOCHILA';
          const tabW = Math.floor((mw - 8) / 2);

          // Tab 1: MOCHILA
          ctx.fillStyle = tab1Active ? '#204870' : '#8898A8';
          ctx.fillRect(mx + 4, my + 4, tabW, 14);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '6px "Press Start 2P", monospace';
          ctx.fillText('🎒 MOCHILA', mx + 10, my + 14);

          // Tab 2: EQUIPO
          ctx.fillStyle = !tab1Active ? '#204870' : '#8898A8';
          ctx.fillRect(mx + 4 + tabW, my + 4, tabW, 14);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '6px "Press Start 2P", monospace';
          ctx.fillText(`👥 EQUIPO (${playerTeam.length}/6)`, mx + 10 + tabW, my + 14);

          if (overworldMenuTab === 'MOCHILA') {
            // List Items
            inventory.forEach((item, idx) => {
              const iy = my + 30 + idx * 18;
              ctx.fillStyle = idx === bagMenuIdx ? '#D82818' : '#202020';
              ctx.font = '6.5px "Press Start 2P", monospace';
              ctx.fillText(`${item.name} x${item.count}`, mx + 16, iy);

              if (idx === bagMenuIdx) {
                // Cursor
                ctx.fillStyle = '#D82818';
                ctx.beginPath();
                ctx.moveTo(mx + 8, iy - 5);
                ctx.lineTo(mx + 13, iy - 2);
                ctx.lineTo(mx + 8, iy + 1);
                ctx.fill();
              }
            });

            // Selected item description box
            const selItem = inventory[bagMenuIdx];
            if (selItem) {
              ctx.fillStyle = '#E8E8DC';
              ctx.fillRect(mx + 6, my + mh - 36, mw - 12, 30);
              ctx.strokeStyle = '#A8A090';
              ctx.lineWidth = 1;
              ctx.strokeRect(mx + 6, my + mh - 36, mw - 12, 30);

              ctx.fillStyle = '#303030';
              ctx.font = '5.5px "Press Start 2P", monospace';
              const descLines = wrapText(ctx, selItem.description, mw - 20);
              descLines.forEach((dl, di) => {
                ctx.fillText(dl, mx + 10, my + mh - 24 + di * 10);
              });
            }

            ctx.fillStyle = '#606060';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.fillText('[←/→] Tab  [Z] Usar  [X] Salir', mx + 8, my + mh - 4);
          } else {
            // Render Party in Overworld
            playerTeam.forEach((mon, idx) => {
              const iy = my + 24 + idx * 16;
              const isSelected = idx === overworldTeamIdx;
              const isLead = idx === activeTeamIdx;

              ctx.fillStyle = isSelected ? '#D82818' : isLead ? '#1848A0' : '#202020';
              ctx.font = '6px "Press Start 2P", monospace';
              ctx.fillText(mon.name.toUpperCase(), mx + 16, iy);

              ctx.fillStyle = '#A06010';
              ctx.font = '5.5px "Press Start 2P", monospace';
              ctx.fillText(`Nv.${mon.level}`, mx + 88, iy);

              // Mini HP bar
              const barX = mx + 124;
              const barW = 34;
              ctx.fillStyle = '#404040';
              ctx.fillRect(barX, iy - 5, barW, 4);
              const hpR = Math.max(0, Math.min(1, mon.currentHp / mon.maxHp));
              ctx.fillStyle = hpR > 0.5 ? '#20B020' : hpR > 0.2 ? '#E0A010' : '#D02010';
              ctx.fillRect(barX + 0.5, iy - 4.5, Math.floor((barW - 1) * hpR), 3);

              ctx.fillStyle = '#505050';
              ctx.font = '4.5px "Press Start 2P", monospace';
              ctx.fillText(`${mon.currentHp}/${mon.maxHp}`, mx + 162, iy);

              if (isLead) {
                ctx.fillStyle = '#D86800';
                ctx.font = '5px "Press Start 2P", monospace';
                ctx.fillText('LÍDER', mx + mw - 28, iy);
              }

              if (isSelected) {
                ctx.fillStyle = '#D82818';
                ctx.beginPath();
                ctx.moveTo(mx + 8, iy - 4);
                ctx.lineTo(mx + 13, iy - 1);
                ctx.lineTo(mx + 8, iy + 2);
                ctx.fill();
              }
            });

            ctx.fillStyle = '#606060';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.fillText('[←/→] Tab  [Z] Elegir Líder  [X] Salir', mx + 8, my + mh - 4);
          }
        }
      }

      // -----------------------------------------------------------------------
      // BATTLE TRANSITION STATE
      // -----------------------------------------------------------------------
      else if (gameState === 'BATTLE_TRANSITION') {
        const t = battleAnimRef.current.transitionTimer;
        battleAnimRef.current.transitionTimer += 1;

        // GBA Flash and Swirl sequence
        ctx.fillStyle = t % 6 < 3 ? '#FFFFFF' : '#000000';
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

        const radius = Math.max(0, (battleAnimRef.current.transitionMax - t) * 6);
        ctx.save();
        ctx.beginPath();
        ctx.arc(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#204820';
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        ctx.restore();

        if (t >= battleAnimRef.current.transitionMax) {
          setGameState('BATTLE');
          setBattlePhase('INTRO');
          setDialogueText(`¡Un ${enemyPokemon?.name} salvaje apareció!`);
          battleAnimRef.current.dialogueQueue = [`¡Adelante, ${playerPokemon.name}!`, 'ACTION_MENU'];
        }
      }

      // -----------------------------------------------------------------------
      // BATTLE STATE
      // -----------------------------------------------------------------------
      else if (gameState === 'BATTLE' && enemyPokemon) {
        // Screen Shake
        let offsetX = 0;
        let offsetY = 0;
        if (battleAnimRef.current.shakeScreen > 0) {
          battleAnimRef.current.shakeScreen -= 1;
          offsetX = (Math.random() - 0.5) * 6;
          offsetY = (Math.random() - 0.5) * 4;
        }

        ctx.save();
        ctx.translate(offsetX, offsetY);

        // Battle Background (GBA Grassland battle arena)
        ctx.fillStyle = '#E8F8E0'; // Pale sky
        ctx.fillRect(0, 0, LOGICAL_WIDTH, 100);
        ctx.fillStyle = '#C8E8B8'; // Meadow gradient
        ctx.fillRect(0, 70, LOGICAL_WIDTH, 30);

        // Enemy Battle Platform (Top Right)
        ctx.fillStyle = '#98C888';
        ctx.beginPath();
        ctx.ellipse(175, 58, 48, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78A868';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Player Battle Platform (Bottom Left)
        ctx.fillStyle = '#88B878';
        ctx.beginPath();
        ctx.ellipse(65, 96, 54, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#689858';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Animate HP Bar Drain Smoothly
        if (battleAnimRef.current.playerHpDisplay > playerPokemon.currentHp) {
          battleAnimRef.current.playerHpDisplay = Math.max(
            playerPokemon.currentHp,
            battleAnimRef.current.playerHpDisplay - 0.2
          );
        } else if (battleAnimRef.current.playerHpDisplay < playerPokemon.currentHp) {
          battleAnimRef.current.playerHpDisplay = Math.min(
            playerPokemon.currentHp,
            battleAnimRef.current.playerHpDisplay + 0.2
          );
        }

        if (battleAnimRef.current.enemyHpDisplay > enemyPokemon.currentHp) {
          battleAnimRef.current.enemyHpDisplay = Math.max(
            enemyPokemon.currentHp,
            battleAnimRef.current.enemyHpDisplay - 0.2
          );
        }

        // Animate EXP Bar Fill Smoothly
        if (battleAnimRef.current.playerExpDisplay < playerPokemon.exp) {
          battleAnimRef.current.playerExpDisplay = Math.min(
            playerPokemon.exp,
            battleAnimRef.current.playerExpDisplay + 0.5
          );
        } else if (battleAnimRef.current.playerExpDisplay > playerPokemon.exp) {
          battleAnimRef.current.playerExpDisplay = playerPokemon.exp;
        }

        // Draw Enemy Sprite (or hide if captured in Pokéball)
        const pkAnim = battleAnimRef.current.pokeballAnim;
        const hideEnemyForCapture =
          pkAnim && (pkAnim.phase === 'DROP' || pkAnim.phase === 'SHAKE' || pkAnim.phase === 'CAUGHT');

        if (!hideEnemyForCapture) {
          if (battleAnimRef.current.enemyBlink > 0) {
            battleAnimRef.current.enemyBlink -= 1;
          }
          const enemyBlinkActive = battleAnimRef.current.enemyBlink > 0 && battleAnimRef.current.enemyBlink % 4 < 2;

          const ex = 175;
          const ey = 42;
          const enemySpriteOpts = {
            time: battleAnimRef.current.bobTimer,
            blink: enemyBlinkActive,
            scale: 1.15,
            faintProgress: battleAnimRef.current.enemyFaintProgress,
            lungeOffset: battleAnimRef.current.enemyLunge,
          };

          drawPokemonSprite(ctx, enemyPokemon.id, false, ex, ey, enemySpriteOpts);
        }

        // Draw Player Pokemon Sprite (Back view with rich detailing)
        if (battleAnimRef.current.playerBlink > 0) {
          battleAnimRef.current.playerBlink -= 1;
        }
        const playerBlinkActive = battleAnimRef.current.playerBlink > 0 && battleAnimRef.current.playerBlink % 4 < 2;

        const px = 65;
        const py = 85;
        const playerSpriteOpts = {
          time: battleAnimRef.current.bobTimer,
          blink: playerBlinkActive,
          scale: 1.25,
          faintProgress: battleAnimRef.current.playerFaintProgress,
          lungeOffset: battleAnimRef.current.playerLunge,
        };

        drawPokemonSprite(ctx, playerPokemon.id, true, px, py, playerSpriteOpts);

        // Render Active Attack Particle FX
        if (battleAnimRef.current.attackFx) {
          const fx = battleAnimRef.current.attackFx;
          fx.progress = Math.min(1, fx.progress + 0.05);
          drawAttackFX(ctx, fx.moveId, fx.progress, fx.fromX, fx.fromY, fx.toX, fx.toY);
        }

        // ---------------------------------------------------------------------
        // POKÉBALL THROW & CATCH ANIMATION
        // ---------------------------------------------------------------------
        if (pkAnim) {
          if (pkAnim.phase === 'FLYING') {
            pkAnim.progress += 0.04;
            const startX = 65;
            const startY = 90;
            const targetX = 175;
            const targetY = 55;

            const curX = startX + (targetX - startX) * pkAnim.progress;
            const arcY = Math.sin(pkAnim.progress * Math.PI) * 45;
            const curY = startY + (targetY - startY) * pkAnim.progress - arcY;

            drawPokeBall(ctx, curX, curY, pkAnim.progress * 10);

            if (pkAnim.progress >= 1) {
              pkAnim.phase = 'BEAM';
              pkAnim.progress = 0;
            }
          } else if (pkAnim.phase === 'BEAM') {
            pkAnim.progress += 0.06;
            // Red capture beam sucking enemy into ball
            ctx.fillStyle = 'rgba(255, 60, 60, 0.45)';
            ctx.beginPath();
            ctx.moveTo(175, 55);
            ctx.lineTo(155, 30);
            ctx.lineTo(195, 30);
            ctx.fill();

            drawPokeBall(ctx, 175, 55, 0);

            if (pkAnim.progress >= 1) {
              pkAnim.phase = 'DROP';
              pkAnim.progress = 0;
            }
          } else if (pkAnim.phase === 'DROP') {
            pkAnim.progress += 0.08;
            const dropY = 55 + pkAnim.progress * 6;
            drawPokeBall(ctx, 175, dropY, 0);

            if (pkAnim.progress >= 1) {
              pkAnim.phase = 'SHAKE';
              pkAnim.shakeCount = 0;
              pkAnim.shakeTimer = 0;
            }
          } else if (pkAnim.phase === 'SHAKE') {
            pkAnim.shakeTimer += 1;
            let ballAngle = 0;

            // Wobble left and right at intervals
            if (pkAnim.shakeTimer % 40 > 25) {
              const wobbleP = (pkAnim.shakeTimer % 40 - 25) / 15;
              ballAngle = Math.sin(wobbleP * Math.PI * 2) * 0.35;
              if (pkAnim.shakeTimer % 40 === 26) {
                sounds.playSelect();
              }
            }

            drawPokeBall(ctx, 175, 61, ballAngle);

            if (pkAnim.shakeTimer === 40) pkAnim.shakeCount = 1;
            if (pkAnim.shakeTimer === 80) pkAnim.shakeCount = 2;
            if (pkAnim.shakeTimer === 120) pkAnim.shakeCount = 3;

            if (pkAnim.shakeTimer > 150) {
              if (pkAnim.success) {
                pkAnim.phase = 'CAUGHT';
                sounds.playVictory();
                const caughtMon: PokemonStats = {
                  ...enemyPokemon,
                  exp: 0,
                  maxExp: Math.floor(enemyPokemon.level * 24 + 20),
                };
                setPlayerTeam((prev) => {
                  if (prev.length < 6) {
                    return [...prev, caughtMon];
                  }
                  return prev;
                });
                setDialogueText(`¡Ya está! ¡${enemyPokemon.name} salvaje fue atrapado!`);
                setBattlePhase('MESSAGE');
                battleAnimRef.current.dialogueQueue = [
                  `¡${enemyPokemon.name} se unió a tu equipo Pokémon!`,
                  `¡Los datos de ${enemyPokemon.name} se registraron en la Pokédex!`,
                  'RETURN_OVERWORLD',
                ];
              } else {
                pkAnim.phase = 'BREAKOUT';
                sounds.playHit();
                setDialogueText(`¡Oh no! ¡El ${enemyPokemon.name} se ha escapado!`);
                setBattlePhase('MESSAGE');
                battleAnimRef.current.dialogueQueue = ['EXECUTE_ENEMY_TURN'];
                autoAdvanceTimerRef.current = setTimeout(() => {
                  handleAdvanceDialogue();
                }, 1800);
              }
            }
          } else if (pkAnim.phase === 'CAUGHT') {
            drawPokeBall(ctx, 175, 61, 0);
            // Draw golden capture stars bursting
            for (let i = 0; i < 4; i++) {
              const ang = (i * Math.PI) / 2 + Date.now() / 200;
              const sx = 175 + Math.cos(ang) * 16;
              const sy = 61 + Math.sin(ang) * 12;
              ctx.fillStyle = '#F8E030';
              ctx.fillRect(sx - 1, sy - 1, 3, 3);
            }
          }
        }

        function drawPokeBall(c: CanvasRenderingContext2D, x: number, y: number, angle: number) {
          c.save();
          c.translate(x, y);
          c.rotate(angle);

          // Outer circle
          c.fillStyle = '#D82818';
          c.beginPath();
          c.arc(0, 0, 6.5, Math.PI, 0); // Top red
          c.fill();

          c.fillStyle = '#FFFFFF';
          c.beginPath();
          c.arc(0, 0, 6.5, 0, Math.PI); // Bottom white
          c.fill();

          // Black center belt
          c.fillStyle = '#202020';
          c.fillRect(-6.5, -1, 13, 2);

          // Center button
          c.fillStyle = '#202020';
          c.beginPath();
          c.arc(0, 0, 2.5, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#FFFFFF';
          c.beginPath();
          c.arc(0, 0, 1.2, 0, Math.PI * 2);
          c.fill();

          c.restore();
        }

        // ---------------------------------------------------------------------
        // ENEMY STATUS PLATE (Top Left)
        // ---------------------------------------------------------------------
        ctx.fillStyle = '#F8F8D0';
        ctx.fillRect(10, 8, 105, 28);
        ctx.strokeStyle = '#383838';
        ctx.lineWidth = 1;
        ctx.strokeRect(9.5, 7.5, 106, 29);

        ctx.fillStyle = '#202020';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(enemyPokemon.name.toUpperCase(), 14, 17);
        ctx.fillStyle = '#C03010';
        ctx.fillText(`:L${enemyPokemon.level}`, 84, 17);

        // HP Label & Bar
        ctx.fillStyle = '#D86010';
        ctx.fillText('HP', 16, 28);
        ctx.fillStyle = '#505050';
        ctx.fillRect(32, 22, 76, 6);

        const enemyHpPct = Math.max(0, Math.min(1, battleAnimRef.current.enemyHpDisplay / enemyPokemon.maxHp));
        ctx.fillStyle = enemyHpPct > 0.5 ? '#20C020' : enemyHpPct > 0.2 ? '#E8A010' : '#E82010';
        ctx.fillRect(33, 23, Math.floor(74 * enemyHpPct), 4);

        // ---------------------------------------------------------------------
        // PLAYER STATUS PLATE (Bottom Right)
        // ---------------------------------------------------------------------
        ctx.fillStyle = '#F8F8D0';
        ctx.fillRect(124, 56, 108, 41);
        ctx.strokeStyle = '#383838';
        ctx.lineWidth = 1;
        ctx.strokeRect(123.5, 55.5, 109, 42);

        ctx.fillStyle = '#202020';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(playerPokemon.name.toUpperCase(), 128, 65);
        ctx.fillStyle = '#C03010';
        ctx.fillText(`:L${playerPokemon.level}`, 196, 65);

        // HP Bar
        ctx.fillStyle = '#D86010';
        ctx.fillText('HP', 130, 76);
        ctx.fillStyle = '#505050';
        ctx.fillRect(146, 70, 80, 6);

        const playerHpPct = Math.max(0, Math.min(1, battleAnimRef.current.playerHpDisplay / playerPokemon.maxHp));
        ctx.fillStyle = playerHpPct > 0.5 ? '#20C020' : playerHpPct > 0.2 ? '#E8A010' : '#E82010';
        ctx.fillRect(147, 71, Math.floor(78 * playerHpPct), 4);

        // Numeric HP
        ctx.fillStyle = '#202020';
        ctx.font = '5.5px "Press Start 2P", monospace';
        ctx.fillText(`${Math.round(battleAnimRef.current.playerHpDisplay)}/${playerPokemon.maxHp}`, 182, 85);

        // EXP Bar (Cyan - Classic Gen 3 GBA)
        ctx.fillStyle = '#4080B0';
        ctx.fillText('EXP', 130, 93);
        ctx.fillStyle = '#505050';
        ctx.fillRect(146, 88, 80, 4);

        const expPct = Math.max(0, Math.min(1, battleAnimRef.current.playerExpDisplay / playerPokemon.maxExp));
        ctx.fillStyle = '#48B8E8'; // Cyan EXP
        ctx.fillRect(147, 89, Math.floor(78 * expPct), 2);

        // ---------------------------------------------------------------------
        // GBA BATTLE BOTTOM TEXTBOX & MENU
        // ---------------------------------------------------------------------
        const tbY = 100;
        const tbH = 60;
        ctx.fillStyle = '#F8F8F8';
        ctx.fillRect(2, tbY, LOGICAL_WIDTH - 4, tbH - 2);
        ctx.strokeStyle = '#204870';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, tbY, LOGICAL_WIDTH - 4, tbH - 2);

        // Inner soft border
        ctx.strokeStyle = '#D0D8E0';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, tbY + 3, LOGICAL_WIDTH - 10, tbH - 8);

        if (
          battlePhase === 'INTRO' ||
          battlePhase === 'MESSAGE' ||
          battlePhase === 'POKEBALL_THROW' ||
          battlePhase === 'PLAYER_ATTACK_ANIM' ||
          battlePhase === 'ENEMY_ATTACK_ANIM' ||
          battlePhase === 'VICTORY' ||
          battlePhase === 'DEFEAT' ||
          battlePhase === 'RUN_AWAY'
        ) {
          // Typewriter Dialogue Area
          ctx.fillStyle = '#202020';
          ctx.font = '7px "Press Start 2P", monospace';
          const lines = wrapText(ctx, dialogueText, 210);
          lines.forEach((l, idx) => {
            ctx.fillText(l, 14, tbY + 20 + idx * 14);
          });

          // Blinking down arrow if interactive
          if (battlePhase !== 'PLAYER_ATTACK_ANIM' && battlePhase !== 'ENEMY_ATTACK_ANIM') {
            ctx.fillStyle = '#D82818';
            ctx.beginPath();
            ctx.moveTo(LOGICAL_WIDTH - 18, tbY + 42);
            ctx.lineTo(LOGICAL_WIDTH - 12, tbY + 42);
            ctx.lineTo(LOGICAL_WIDTH - 15, tbY + 47);
            ctx.fill();
          }
        } else if (battlePhase === 'LEVEL_UP') {
          // LEVEL UP STATS BOX OVERLAY
          const lu = battleAnimRef.current.levelUpData;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(10, tbY + 5, LOGICAL_WIDTH - 20, tbH - 10);
          ctx.strokeStyle = '#284878';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(10, tbY + 5, LOGICAL_WIDTH - 20, tbH - 10);

          ctx.fillStyle = '#D82818';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText(`¡SUBIDA DE NIVEL! (${playerPokemon.name} Lv.${playerPokemon.level})`, 18, tbY + 18);

          if (lu) {
            ctx.fillStyle = '#202020';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.fillText(`PS MÁX: +${lu.hpInc} (${playerPokemon.maxHp})`, 18, tbY + 30);
            ctx.fillText(`ATAQUE: +${lu.atkInc} (${playerPokemon.attack})`, 128, tbY + 30);
            ctx.fillText(`DEFENSA: +${lu.defInc} (${playerPokemon.defense})`, 18, tbY + 42);
            ctx.fillText(`VELOCIDAD: +${lu.spdInc} (${playerPokemon.speed})`, 128, tbY + 42);
          }

          ctx.fillStyle = '#808080';
          ctx.font = '5px "Press Start 2P", monospace';
          ctx.fillText('▼ [Z] Continuar', LOGICAL_WIDTH - 70, tbY + 51);
        } else if (battlePhase === 'PLAYER_ACTION_SELECT') {
          // Left Question
          ctx.fillStyle = '#202020';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText(`¿Qué debe`, 14, tbY + 22);
          ctx.fillText(`hacer ${playerPokemon.name}?`, 14, tbY + 36);

          // Right 2x2 Menu Box
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(125, tbY + 6, 108, tbH - 14);
          ctx.strokeStyle = '#284060';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(125, tbY + 6, 108, tbH - 14);

          const options = [
            { text: 'LUCHAR', x: 138, y: tbY + 22, id: 0 },
            { text: 'MOCHILA', x: 182, y: tbY + 22, id: 1 },
            { text: 'POKÉMON', x: 138, y: tbY + 38, id: 2 },
            { text: 'HUIR', x: 182, y: tbY + 38, id: 3 },
          ];

          options.forEach((opt) => {
            ctx.fillStyle = opt.id === actionMenuIdx ? '#D82818' : '#202020';
            ctx.font = '6.5px "Press Start 2P", monospace';
            ctx.fillText(opt.text, opt.x, opt.y);

            if (opt.id === actionMenuIdx) {
              ctx.fillStyle = '#D82818';
              ctx.beginPath();
              ctx.moveTo(opt.x - 7, opt.y - 5);
              ctx.lineTo(opt.x - 2, opt.y - 2);
              ctx.lineTo(opt.x - 7, opt.y + 1);
              ctx.fill();
            }
          });
        } else if (battlePhase === 'BAG_SELECT') {
          // GBA Battle Bag Overlay
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(8, tbY + 6, 140, tbH - 14);
          ctx.strokeStyle = '#284060';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(8, tbY + 6, 140, tbH - 14);

          inventory.forEach((item, idx) => {
            const iy = tbY + 22 + idx * 16;
            ctx.fillStyle = idx === bagMenuIdx ? '#D82818' : '#202020';
            ctx.font = '6.5px "Press Start 2P", monospace';
            ctx.fillText(`${item.name} x${item.count}`, 22, iy);

            if (idx === bagMenuIdx) {
              ctx.fillStyle = '#D82818';
              ctx.beginPath();
              ctx.moveTo(14, iy - 5);
              ctx.lineTo(19, iy - 2);
              ctx.lineTo(14, iy + 1);
              ctx.fill();
            }
          });

          // Bag helper box (right)
          ctx.fillStyle = '#F0F0E8';
          ctx.fillRect(154, tbY + 6, 78, tbH - 14);
          ctx.strokeStyle = '#606060';
          ctx.lineWidth = 1;
          ctx.strokeRect(154, tbY + 6, 78, tbH - 14);

          const selItem = inventory[bagMenuIdx];
          ctx.fillStyle = '#202020';
          ctx.font = '5.5px "Press Start 2P", monospace';
          if (selItem) {
            const descLines = wrapText(ctx, selItem.description, 70);
            descLines.slice(0, 3).forEach((dl, di) => {
              ctx.fillText(dl, 158, tbY + 18 + di * 10);
            });
          }
          ctx.fillStyle = '#808080';
          ctx.font = '5px "Press Start 2P", monospace';
          ctx.fillText('[X] Volver', 158, tbY + 48);
        } else if (battlePhase === 'PLAYER_MOVE_SELECT') {
          // Moves Menu
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(8, tbY + 6, 150, tbH - 14);
          ctx.strokeStyle = '#284060';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(8, tbY + 6, 150, tbH - 14);

          // Move Slots
          playerPokemon.moves.forEach((move, idx) => {
            const mx = idx % 2 === 0 ? 20 : 88;
            const my = idx < 2 ? tbY + 22 : tbY + 38;

            ctx.fillStyle = idx === moveMenuIdx ? '#D82818' : '#202020';
            ctx.font = '6.5px "Press Start 2P", monospace';
            ctx.fillText(move.name.toUpperCase(), mx, my);

            if (idx === moveMenuIdx) {
              ctx.fillStyle = '#D82818';
              ctx.beginPath();
              ctx.moveTo(mx - 7, my - 5);
              ctx.lineTo(mx - 2, my - 2);
              ctx.lineTo(mx - 7, my + 1);
              ctx.fill();
            }
          });

          // Move details plate (right)
          const selMove = playerPokemon.moves[moveMenuIdx] || playerPokemon.moves[0];
          ctx.fillStyle = '#F0F0E8';
          ctx.fillRect(164, tbY + 6, 68, tbH - 14);
          ctx.strokeStyle = '#606060';
          ctx.lineWidth = 1;
          ctx.strokeRect(164, tbY + 6, 68, tbH - 14);

          ctx.fillStyle = '#202020';
          ctx.font = '6px "Press Start 2P", monospace';
          ctx.fillText(`PP ${selMove.currentPP}/${selMove.maxPP}`, 170, tbY + 20);
          ctx.fillText(`TIPO/`, 170, tbY + 32);
          ctx.fillStyle = '#C04018';
          ctx.fillText(selMove.type, 170, tbY + 42);
        } else if (battlePhase === 'POKEMON_SWITCH_SELECT') {
          // GBA Party Selection Screen Overlay in battle
          ctx.fillStyle = 'rgba(12, 24, 38, 0.96)';
          ctx.fillRect(4, 4, LOGICAL_WIDTH - 8, LOGICAL_HEIGHT - 8);
          ctx.strokeStyle = '#386090';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(4, 4, LOGICAL_WIDTH - 8, LOGICAL_HEIGHT - 8);

          // Header Title
          ctx.fillStyle = '#1c3b5e';
          ctx.fillRect(6, 6, LOGICAL_WIDTH - 12, 14);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '6.5px "Press Start 2P", monospace';
          ctx.fillText('EQUIPO POKÉMON — SELECCIONA UNO', 12, 16);

          // Render party members (up to 6)
          playerTeam.forEach((mon, idx) => {
            const isSelected = idx === switchMenuIdx;
            const isActive = idx === activeTeamIdx;
            const isFainted = mon.currentHp <= 0;
            const rowY = 24 + idx * 19;
            const rowH = 17;

            // Row card background
            if (isSelected) {
              ctx.fillStyle = '#FFF8D8'; // Gold highlight
              ctx.fillRect(8, rowY, LOGICAL_WIDTH - 16, rowH);
              ctx.strokeStyle = '#D83818';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(8, rowY, LOGICAL_WIDTH - 16, rowH);
            } else {
              ctx.fillStyle = idx % 2 === 0 ? '#1b2d42' : '#142233';
              ctx.fillRect(8, rowY, LOGICAL_WIDTH - 16, rowH);
              ctx.strokeStyle = '#284060';
              ctx.lineWidth = 1;
              ctx.strokeRect(8, rowY, LOGICAL_WIDTH - 16, rowH);
            }

            // Cursor indicator
            if (isSelected) {
              ctx.fillStyle = '#D82818';
              ctx.beginPath();
              ctx.moveTo(11, rowY + rowH / 2 - 3.5);
              ctx.lineTo(15, rowY + rowH / 2);
              ctx.lineTo(11, rowY + rowH / 2 + 3.5);
              ctx.fill();
            }

            // Mini Pokéball icon
            const iconX = 22;
            const iconY = rowY + 8.5;
            ctx.fillStyle = '#E83020';
            ctx.beginPath();
            ctx.arc(iconX, iconY, 3.5, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(iconX, iconY, 3.5, 0, Math.PI);
            ctx.fill();
            ctx.fillStyle = '#202020';
            ctx.fillRect(iconX - 3.5, iconY - 0.5, 7, 1);

            // Mon Name & Level
            ctx.fillStyle = isSelected ? '#181818' : '#F8F8F8';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.fillText(mon.name.toUpperCase(), 30, rowY + 11.5);

            ctx.fillStyle = isSelected ? '#B02810' : '#F0A020';
            ctx.font = '5.5px "Press Start 2P", monospace';
            ctx.fillText(`Nv.${mon.level}`, 98, rowY + 11.5);

            // HP Bar
            const barX = 132;
            const barY = rowY + 7;
            const barW = 42;
            ctx.fillStyle = '#303030';
            ctx.fillRect(barX, barY, barW, 4);

            const hpRatio = Math.max(0, Math.min(1, mon.currentHp / mon.maxHp));
            ctx.fillStyle = hpRatio > 0.5 ? '#20C020' : hpRatio > 0.2 ? '#E8A010' : '#E82010';
            ctx.fillRect(barX + 0.5, barY + 0.5, Math.floor((barW - 1) * hpRatio), 3);

            // HP Numeric Text
            ctx.fillStyle = isSelected ? '#202020' : '#E0E0E0';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.fillText(`${mon.currentHp}/${mon.maxHp}`, 180, rowY + 11.5);

            // Status Badge
            if (isActive) {
              ctx.fillStyle = '#E8A010';
              ctx.font = '5px "Press Start 2P", monospace';
              ctx.fillText('ACTIVO', 204, rowY + 11.5);
            } else if (isFainted) {
              ctx.fillStyle = '#E03020';
              ctx.font = '5px "Press Start 2P", monospace';
              ctx.fillText('DEBIL.', 204, rowY + 11.5);
            } else {
              ctx.fillStyle = '#40C060';
              ctx.font = '5px "Press Start 2P", monospace';
              ctx.fillText('LISTO', 206, rowY + 11.5);
            }
          });

          // Footer Instructions
          ctx.fillStyle = '#E0E8F0';
          ctx.fillRect(8, LOGICAL_HEIGHT - 17, LOGICAL_WIDTH - 16, 12);
          ctx.fillStyle = '#202020';
          ctx.font = '5.5px "Press Start 2P", monospace';
          ctx.fillText('[Z] Cambiar   [X] Volver', 14, LOGICAL_HEIGHT - 9);
        }

        ctx.restore(); // battle shake translate restore
      }

      ctx.restore(); // 2x high pixel density scaling restore

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    gameState,
    battlePhase,
    actionMenuIdx,
    moveMenuIdx,
    bagMenuIdx,
    switchMenuIdx,
    overworldMenuTab,
    overworldTeamIdx,
    playerTeam,
    activeTeamIdx,
    dialogueText,
    inventory,
    overworldMenuOpen,
    signDialogue,
    playerPokemon,
    enemyPokemon,
    isPassable,
    isTallGrass,
    triggerWildBattle,
  ]);

  // Helper function for text wrapping in retro canvas
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // Virtual controller action helper
  const sendKey = (code: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code }));
    }, 120);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* GBA Screen Frame */}
      <div className="relative p-2 sm:p-3 bg-neutral-900 border-4 border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Anti-glare retro screen bezel */}
        <div className="relative rounded-lg overflow-hidden border-2 border-neutral-700 bg-black">
          <canvas
            id="gba-canvas"
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="pixelated w-[320px] h-[213px] sm:w-[480px] sm:h-[320px] md:w-[540px] md:h-[360px] block cursor-pointer select-none"
            tabIndex={0}
            onClick={() => {
              if (gameState === 'BATTLE') {
                sendKey('KeyZ');
              } else if (overworldMenuOpen || signDialogue) {
                sendKey('KeyZ');
              }
            }}
          />

          {/* Retro subtle CRT scanline overlay effect */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,0,0,0.04)] to-[rgba(0,0,0,0.12)] bg-[length:100%_4px]" />
        </div>
      </div>

      {/* Quick In-Game Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 text-xs text-neutral-400 font-mono">
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">↑ ↓ ← →</kbd>
          Moverse / Navegar
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">Z</kbd>
          A / Interactuar / Aceptar
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">X</kbd>
          B / Cancelar / Menú
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-amber-300">ENTER</kbd>
          START / Mochila
        </span>
      </div>
    </div>
  );
};
