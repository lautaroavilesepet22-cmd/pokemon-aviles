export const PYTHON_TKINTER_CODE = `"""
=============================================================================
PROTOTIPO DE POKÉMON ROJO FUEGO / VERDE HOJA (GBA) EN PYTHON + TKINTER
=============================================================================
Desarrollado exclusivamente con la biblioteca estándar de Python (tkinter, math, random, time).
Sin dependencias externas ni necesidad de instalar Pygame.

Controles:
  - Flechas de dirección : Moverse por el mapa / Navegar menús
  - Z                    : Interactuar / Aceptar / Confirmar acción
  - X                    : Cancelar / Retroceder / Abrir Menú

Cómo ejecutar:
  python pokemon_rojo_fuego.py
=============================================================================
"""

import tkinter as tk
import random
import math
import time

# =============================================================================
# CONSTANTES Y PALETA DE COLORES GBA (ROJO FUEGO / VERDE HOJA)
# =============================================================================
SCREEN_WIDTH = 480       # Ancho de la ventana (escalado 2x de GBA 240x160)
SCREEN_HEIGHT = 320      # Alto de la ventana
TILE_SIZE = 32           # Tamaño de cada casilla en píxeles (15x10 tiles visibles)
FPS = 60
FRAME_TIME_MS = int(1000 / FPS)

# Paleta oficial fiel a Game Boy Advance
COLOR_GRASS = "#48A048"          # Verde hierba suave
COLOR_TALL_GRASS = "#186818"     # Hierba alta (encuentros)
COLOR_PATH = "#E0C068"           # Camino de tierra / arena
COLOR_TREE_DARK = "#184818"      # Borde de árboles
COLOR_TREE_LIGHT = "#308030"     # Copa de árboles
COLOR_WATER = "#4078D8"          # Agua
COLOR_ROOF_RED = "#D83828"       # Techo Casa de Red
COLOR_ROOF_BLUE = "#2868A8"      # Techo Laboratorio de Oak
COLOR_WALL = "#F0E8D0"           # Paredes de casas
COLOR_DOOR = "#704020"           # Puerta
COLOR_FENCE = "#C08848"          # Vallas de madera

# Paleta de Interfaz / Batalla
COLOR_TEXTBOX_BG = "#F8F8F8"     # Fondo caja de texto
COLOR_TEXTBOX_BORDER = "#204870" # Borde azul oscuro GBA
COLOR_TEXTBOX_INNER = "#D0D8E0"  # Sombra interna caja
COLOR_TEXT = "#202020"           # Texto oscuro
COLOR_HP_GREEN = "#28B028"       # Barra de vida alta
COLOR_HP_YELLOW = "#E8A818"      # Barra de vida media
COLOR_HP_RED = "#D83820"         # Barra de vida baja
COLOR_HP_BG = "#505050"          # Fondo vacío de barra HP
COLOR_PLATFORM_PLAYER = "#A8C890"# Base de combate jugador
COLOR_PLATFORM_ENEMY = "#B8D8A0" # Base de combate enemigo


# =============================================================================
# CLASE: POKEMON (POO)
# =============================================================================
class Pokemon:
    """
    Representa a un Pokémon individual, sus estadísticas base,
    puntos de salud (HP) y sus movimientos disponibles.
    
    [CÓMO AÑADIR MÁS POKÉMON]:
    Crea una nueva instancia pasando nombre, nivel, hp_max, ataque, defensa, velocidad
    y una lista de diccionarios con los ataques deseados.
    """
    def __init__(self, nombre, nivel, hp_max, ataque, defensa, velocidad, ataques, color_cuerpo, color_detalle, exp=0, max_exp=50):
        self.nombre = nombre
        self.nivel = nivel
        self.hp_max = hp_max
        self.hp_actual = hp_max
        self.ataque = ataque
        self.defensa = defensa
        self.velocidad = velocidad
        self.ataques = ataques  # Lista de dicts: [{'nombre': 'Placaje', 'potencia': 35, 'tipo': 'NORMAL'}, ...]
        self.color_cuerpo = color_cuerpo
        self.color_detalle = color_detalle
        self.exp = exp
        self.max_exp = max_exp

    def esta_debilitado(self):
        return self.hp_actual <= 0

    def recibir_danio(self, cantidad):
        self.hp_actual = max(0, self.hp_actual - cantidad)

    def curar(self, cantidad):
        self.hp_actual = min(self.hp_max, self.hp_actual + cantidad)

    def ganar_experiencia(self, exp_ganada):
        """Añade experiencia y calcula subida de nivel con aumento de estadísticas"""
        self.exp += exp_ganada
        subio_nivel = False
        stats_gain = {}
        if self.exp >= self.max_exp:
            subio_nivel = True
            self.nivel += 1
            hp_inc = random.randint(2, 3)
            atk_inc = random.randint(1, 2)
            def_inc = random.randint(1, 2)
            spd_inc = random.randint(1, 2)

            self.hp_max += hp_inc
            self.hp_actual = min(self.hp_max, self.hp_actual + hp_inc)
            self.ataque += atk_inc
            self.defensa += def_inc
            self.velocidad += spd_inc
            self.exp = self.exp - self.max_exp
            self.max_exp = int(self.max_exp * 1.35)

            stats_gain = {
                "hp": hp_inc,
                "atk": atk_inc,
                "def": def_inc,
                "spd": spd_inc
            }
        return subio_nivel, stats_gain

    def calcular_danio_contra(self, ataque_idx, objetivo):
        """Fórmula simplificada basada en el cálculo oficial de daño de Pokémon GBA"""
        ataque = self.ataques[ataque_idx]
        potencia = ataque.get("potencia", 40)
        if potencia == 0:
            return 0  # Movimiento de estado (ej: Gruñido)
        
        # Variación aleatoria entre 85% y 100%
        factor_variacion = random.uniform(0.85, 1.0)
        danio = math.floor((((2 * self.nivel / 5 + 2) * potencia * (self.ataque / max(1, objetivo.defensa))) / 50 + 2) * factor_variacion)
        return max(1, danio)


# =============================================================================
# SISTEMA DE PIXEL ART PERSONALIZADO (MATRIZ DE PÍXELES ESTILO GBA)
# Reemplaza primitivas geométricas y elipses por siluetas pixel-art detalladas
# =============================================================================
PIXEL_ART_SPRITES = {
    "Pidgey": {
        "palette": {
            "#": "#2A1608",  # Delineado oscuro
            "M": "#985830",  # Marrón plumaje
            "D": "#583018",  # Marrón oscuro alas
            "C": "#F5E6C4",  # Crema pecho y mejillas
            "R": "#D83828",  # Rojo cresta frontal
            "Y": "#F8D030",  # Amarillo cresta
            "O": "#F09028",  # Naranja pico
            "B": "#181818",  # Antifaz negro y pupila
            "W": "#FFFFFF",  # Blanco ojo
            "K": "#E07828",  # Garras
        },
        "grid": [
            "....................",
            "........RR..........",
            ".......RRY..........",
            "......RRYY#.........",
            ".....#RRYYY#........",
            "....#MM####.........",
            "...#MBW#MM#.........",
            "...#CBM#MMM#........",
            "..#OOCMMMMM#........",
            ".#OOOCMMMMM#........",
            "....#CMMDDDD#.......",
            "...#CCMDDDDDD#......",
            "...#CCCCMDDDDD#.....",
            "...#CCCCMDDDD#......",
            "....#CCCCMDD#.......",
            ".....#CCCCM##.......",
            "......#MMM#..##.....",
            "......#K#K#..#D#....",
            ".....#KK#KK#........",
            "....................",
        ]
    },
    "Pikachu": {
        "palette": {
            "#": "#382808",  # Delineado oscuro
            "Y": "#FCD020",  # Amarillo eléctrico
            "S": "#D8A010",  # Sombra amarilla
            "B": "#181818",  # Puntas de orejas / ojos
            "W": "#FFFFFF",  # Brillo ojos
            "R": "#E82818",  # Mejillas rojas
            "T": "#8B4513",  # Marrón cola
            "L": "#FFF050",  # Rayo amarillo claro
        },
        "grid": [
            ".B#..........#B.....",
            "#BB#........#BB#....",
            "#BYS#......#SYB#....",
            ".#YY#......#YY#.....",
            "..#YY######YY#......",
            "..#YYYYYYYYYY#......",
            ".#YYYYYYYYYYYY#.....",
            ".#YYBWYYYYBWYY#.....",
            ".#YYBBYYYYBBYY#.....",
            "#RYYBBYYYYBBYR#.....",
            "#RRRYYBBBBBYRRR#....",
            ".#RRRYYYYYYYRR#.....",
            "..#YYYYYYYYYY#...##.",
            "..#YYYYYYYYYY#..#LY#",
            ".#YYYYYYYYYYYY##LLYY",
            ".#Y#YYYYYYYY#Y#LYY#.",
            ".#Y#YYYYYYYY#Y#YY#..",
            "..#YYYYYYYYYY#TT#...",
            "...#SS####SS#TT#....",
            "...#YY#..#YY#.......",
            "....................",
        ]
    },
    "Rattata": {
        "palette": {
            "#": "#200828",  # Borde morado muy oscuro
            "P": "#8A489C",  # Púrpura principal cuerpo
            "L": "#B06ABE",  # Púrpura claro reflejo lomo
            "S": "#542468",  # Púrpura sombra profunda
            "K": "#F4A0B8",  # Rosa orejas interior
            "D": "#C86884",  # Rosa oscuro sombra oreja
            "C": "#F4E6C8",  # Crema vientre y hocico
            "c": "#D8C49C",  # Crema sombra vientre
            "W": "#FFFFFF",  # Incisivo blanco afilado y brillo ojo
            "R": "#D81818",  # Ojo rojo rubí
            "B": "#1C1020",  # Bigotes oscuros
        },
        "grid": [
            "...................#PP#.",
            ".......#PP#.......#P##P#",
            "......#PKKP#.....#P#..##",
            ".....#PKKKDP#...#P#.....",
            ".....#PKKDD#...#P#......",
            "..#P#.#PKD#...#P#.......",
            ".#PPL#.#P#...#P#........",
            "#PLLLP#####.#P#.........",
            "#PLPPLLPPPS#P#..#PPP#...",
            ".#PPRWPPPPP##..#PKKP#...",
            "B.#PRRPPPPP...#PKKDP#...",
            "BB#CCSPPPPP###PPDDP#....",
            ".#CCCWSPPPPPPSSSS#......",
            "..#CCCWSPPPPPSSS#.......",
            "...#CCCcSPPPPPPS#.......",
            "....#CCcSPPPPPPPS#......",
            ".....#C#SPPPPPPPPS#.....",
            "....#C#.#SPPPPPPPS#.....",
            "...#C#...#SS####SS#.....",
            "..#WW#....#CC#..#CC#....",
            "........................",
        ]
    },
    "Charmander": {
        "palette": {
            "#": "#501808",  # Delineado marrón rojizo
            "O": "#F08030",  # Naranja piel
            "S": "#B84810",  # Sombra naranja
            "C": "#FFF0A0",  # Borde crema panza
            "F": "#E83818",  # Llama roja
            "Y": "#F8B020",  # Llama naranja
            "W": "#FFF870",  # Núcleo llama amarilla
            "K": "#FFFFFF",  # Garras
        },
        "grid": [
            "........#OOOO#......",
            ".......#OOOOOO#.....",
            "......#OOOOOOOO#....",
            "......#OOOOOOOO#....",
            ".......#SSSSOO#.....",
            "......#SSSSSOOO#....",
            "...#F#SSSSSOOOOC#...",
            "..#FYF#SSSSOOOOOC#..",
            ".#FYYWF#SSSSOOOOOC#.",
            ".#FYYWF##SSOOOOOC#..",
            "..#FYF#O#SSSSOOO#...",
            "...#F#OO#SSSSOOO#...",
            "....#OOOO#SSSOOO#...",
            "...#OOOOOO#SSOO#....",
            "..#OOOOOOOO####.....",
            ".#OOOOOOOOOO#.......",
            ".#OOOOOOOOOO#.......",
            "..#OO#..#OO#........",
            ".#KK#....#KK#.......",
            "....................",
        ]
    },
    "Bulbasaur": {
        "palette": {
            "#": "#182818",  # Delineado verde
            "G": "#58B898",  # Turquesa piel
            "S": "#307058",  # Sombra turquesa
            "D": "#205040",  # Manchas oscuras
            "B": "#48A830",  # Bulbo verde
            "V": "#206018",  # Pliegues bulbo
            "L": "#78D050",  # Brote tierno
            "W": "#FFFFFF",  # Garras
        },
        "grid": [
            ".........#L#........",
            "........#BBB#.......",
            ".......#BBVBB#......",
            "......#BBBVBBB#.....",
            ".....#BBBBVBBBB#....",
            "....#BBVBVBVBBBB#...",
            "...#VBBBVBBBVBBV#...",
            "...#VBBBVBBBVBBV#...",
            "....#VVVVVVVVVV#....",
            "...#G#SSSSSSSS#G#...",
            "..#GGG#SSSSSS#GGG#..",
            ".#GGGGG######GGGGG#.",
            ".#GGDGGGGGGGGGGDGG#.",
            "#GGGDGGGGGGGGGGDGGG#",
            "#GGGGGGGGGGGGGGGGGG#",
            "#SGGGGGGGGGGGGGGGGS#",
            ".#SSGGGGGGGGGGGGSS#.",
            "..#SS##########SS#..",
            "..#WW#........#WW#..",
            "....................",
        ]
    },
    "Squirtle": {
        "palette": {
            "#": "#201810",  # Delineado marrón
            "U": "#78B8F0",  # Azul piel
            "S": "#4888C0",  # Sombra azul
            "B": "#A85020",  # Caparazón marrón
            "D": "#682810",  # Ranuras caparazón
            "C": "#FFF0B0",  # Borde crema
            "W": "#FFFFFF",  # Garras y brillo
        },
        "grid": [
            "........#UUUU#......",
            ".......#UUUUUU#.....",
            "......#UUUUUUUU#....",
            "......#UUUUUUUU#....",
            ".......#SSSSUU#.....",
            "......#CCCCCCCC#....",
            ".....#CBBDDBBBDC#...",
            "..#UU#CBBBDDBBDC#...",
            ".#UUUU#CBDDDDDBC#...",
            ".#UUSUU#CBDDDBC#....",
            ".#UUSSU#CBBDBBC#....",
            "..#UU#CBBBDDBBDC#...",
            "...##CBBBDDDDDBDC#..",
            "....#CCCCCCCCCCCC#..",
            "...#SSSSUUUUUUUU#...",
            "..#SSSSUUUUUUUUUU#..",
            "..#SSSUU#..#UUUS#...",
            "..#WW##......##WW#..",
            "....................",
        ]
    }
}


# =============================================================================
# CLASE: TILEMAP / MAPA
# =============================================================================
class TileMap:
    """
    Gestiona la cuadrícula de exploración (Overworld).
    Define los tipos de terreno, colisiones y zonas de hierba alta.
    
    [CÓMO EXPANDIR EL MAPA]:
    Modifica la matriz 'DISEÑO_MAPA'. Añade nuevas filas o columnas.
    T = Árbol (Colisión)
    H = Hierba Alta (Probabilidad de combate salvaje)
    P = Camino de tierra (Transitable)
    . = Césped normal (Transitable)
    R = Techo rojo (Colisión)
    B = Techo azul laboratorio (Colisión)
    L = Pared de casa (Colisión)
    D = Puerta
    F = Valla de madera (Colisión)
    W = Agua (Colisión)
    """
    DISENIO_MAPA = [
        # --- RUTA 1 (Norte) ---
        "TTTTTTTTTTTTTTTTTTTT",
        "T..HHHHHH....HHHH..T",
        "T..HHHHHH.PP.HHHH..T",
        "TT.HHHHHH.PP.HHHH.TT",
        "T...**....PP...**..T",
        "T.HHHHHH..PP..HHHH.T",
        "T.HHHHHH..PP..HHHH.T",
        "TT..**....PP.......T",
        "T...S.....PP.......T",
        "T..HHHHH..PP..HHHH.T",
        "T..HHHHH..PP..HHHH.T",
        "T.........PP.......T",
        "T.FFFFFFFF..FFFFFF.T",
        "T.........PP.......T",
        # --- PUEBLO PALETA (Sur) ---
        "T.........PP.......T",
        "T..RRRR...PP..BBBB.T",
        "T..RRRR...PP..BBBB.T",
        "T..LLLL...PP..LLLL.T",
        "T..L.DL...PP..L.DL.T",
        "T.M..S....PP.......T",
        "T.........PP.......T",
        "T...*.....PP...*...T",
        "T..WWWWW..PP.FFFFF.T",
        "T..WWWWW..PP.......T",
        "T..WWWWW..PP.S.....T",
        "T.........PP.......T",
        "TTTTTTTTTTTTTTTTTTTT",
    ]

    # Conjunto de tiles que bloquean el paso
    TILES_SOLIDOS = {'T', 'R', 'B', 'L', 'F', 'W', 'S', 'M'}

    def __init__(self):
        self.filas = len(self.DISENIO_MAPA)
        self.columnas = len(self.DISENIO_MAPA[0])

    def es_transitable(self, col, fila):
        if 0 <= fila < self.filas and 0 <= col < self.columnas:
            tile = self.DISENIO_MAPA[fila][col]
            return tile not in self.TILES_SOLIDOS
        return False

    def es_hierba_alta(self, col, fila):
        if 0 <= fila < self.filas and 0 <= col < self.columnas:
            return self.DISENIO_MAPA[fila][col] == 'H'
        return False

    def get_tile(self, col, fila):
        if 0 <= fila < self.filas and 0 <= col < self.columnas:
            return self.DISENIO_MAPA[fila][col]
        return 'T'


# =============================================================================
# CLASE PRINCIPAL: GAME
# =============================================================================
class Game:
    """
    Clase principal que inicializa Tkinter, gestiona el bucle de juego (.after),
    los estados ('OVERWORLD', 'BATTLE'), y los eventos de teclado.
    """
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Pokémon Rojo Fuego (GBA) - Prototipo Tkinter")
        self.root.geometry(f"{SCREEN_WIDTH}x{SCREEN_HEIGHT}")
        self.root.resizable(False, False)

        # Canvas principal para renderizado
        self.canvas = tk.Canvas(
            self.root,
            width=SCREEN_WIDTH,
            height=SCREEN_HEIGHT,
            bg="#000000",
            highlightthickness=0
        )
        self.canvas.pack(fill=tk.BOTH, expand=True)

        # Estado del juego: 'OVERWORLD' o 'BATTLE'
        self.estado = 'OVERWORLD'

        # Instanciar el mapa
        self.mapa = TileMap()

        # Posición del jugador en la cuadrícula (en tiles - Pueblo Paleta)
        self.player_col = 9
        self.player_row = 21
        self.player_dir = "DOWN"
        self.player_pasos = 0
        
        # Animación de movimiento suave entre casillas
        self.is_moving = False
        self.move_progress = 0.0 # 0.0 a 1.0
        self.target_col = self.player_col
        self.target_row = self.player_row

        # Inicializar equipo Pokémon del Jugador
        self.player_pokemon = Pokemon(
            nombre="Charmander",
            nivel=5,
            hp_max=20,
            ataque=11,
            defensa=9,
            velocidad=13,
            ataques=[
                {"nombre": "Placaje", "potencia": 35, "tipo": "NORMAL"},
                {"nombre": "Gruñido", "potencia": 0, "tipo": "NORMAL", "efecto": "BAJAR_ATAQUE"},
                {"nombre": "Ascuas", "potencia": 40, "tipo": "FUEGO"},
            ],
            color_cuerpo="#F08030",
            color_detalle="#D84010",
            exp=0,
            max_exp=50
        )

        # Estado de combate
        self.enemy_pokemon = None
        self.battle_menu_selected = 0   # 0: LUCHAR, 1: MOCHILA, 2: POKÉMON, 3: HUIR
        self.battle_substate = "ACTION" # "ACTION", "MOVES", "MESSAGE", "BAG"
        self.move_selected = 0
        self.battle_message = ""
        self.message_queue = []
        self.battle_turn = "PLAYER"     # "PLAYER" o "ENEMY"
        
        # Animación de barras de vida
        self.player_hp_display = float(self.player_pokemon.hp_actual)
        self.enemy_hp_display = 0.0

        # Animación de parpadeo de daño
        self.enemy_blink_timer = 0
        self.player_blink_timer = 0

        # Inventario inicial del jugador (15 Poké Balls y 3 Pociones)
        self.pokeballs = 15
        self.pociones = 3

        # Teclas presionadas
        self.keys_held = set()

        # Vincular eventos de teclado
        self.root.bind("<KeyPress>", self.on_key_press)
        self.root.bind("<KeyRelease>", self.on_key_release)

        # Iniciar Game Loop a ~60 FPS
        self.game_loop()

    # -------------------------------------------------------------------------
    # GESTIÓN DE EVENTOS DE TECLADO
    # -------------------------------------------------------------------------
    def on_key_press(self, event):
        key = event.keysym.lower()
        self.keys_held.add(key)

        if self.estado == 'OVERWORLD':
            # Movimiento por pasos en grid
            if not self.is_moving:
                if key in ['up', 'w']:
                    self.intentar_mover(0, -1, "UP")
                elif key in ['down', 's']:
                    self.intentar_mover(0, 1, "DOWN")
                elif key in ['left', 'a']:
                    self.intentar_mover(-1, 0, "LEFT")
                elif key in ['right', 'd']:
                    self.intentar_mover(1, 0, "RIGHT")

        elif self.estado == 'BATTLE':
            self.manejar_input_batalla(key)

    def on_key_release(self, event):
        key = event.keysym.lower()
        if key in self.keys_held:
            self.keys_held.remove(key)

    # -------------------------------------------------------------------------
    # LÓGICA DE MOVIMIENTO OVERWORLD
    # -------------------------------------------------------------------------
    def intentar_mover(self, dx, dy, direccion):
        self.player_dir = direccion
        dest_col = self.player_col + dx
        dest_row = self.player_row + dy

        if self.mapa.es_transitable(dest_col, dest_row):
            self.target_col = dest_col
            self.target_row = dest_row
            self.is_moving = True
            self.move_progress = 0.0
        else:
            # Choque contra pared / obstáculo
            pass

    def actualizar_overworld(self):
        # Si se está moviendo entre casillas, animar progresivamente
        if self.is_moving:
            self.move_progress += 0.15
            if self.move_progress >= 1.0:
                self.move_progress = 0.0
                self.is_moving = False
                self.player_col = self.target_col
                self.player_row = self.target_row
                self.player_pasos += 1

                # Comprobar encuentro con Pokémon salvaje en hierba alta
                if self.mapa.es_hierba_alta(self.player_col, self.player_row):
                    # 25% de probabilidad por paso en hierba alta
                    if random.random() < 0.25:
                        self.iniciar_batalla()

    # -------------------------------------------------------------------------
    # INICIO Y LÓGICA DE BATALLA
    # -------------------------------------------------------------------------
    def generar_pokemon_salvaje(self):
        """Genera un Pidgey o Rattata salvaje con nivel entre 2 y 4"""
        opciones = [
            ("Pidgey", random.randint(2, 4), 16, 9, 7, 10, [
                {"nombre": "Placaje", "potencia": 35, "tipo": "NORMAL"},
                {"nombre": "Ataque Arena", "potencia": 0, "tipo": "TIERRA"}
            ], "#A890F0", "#8068C0"),
            ("Rattata", random.randint(2, 3), 14, 10, 6, 12, [
                {"nombre": "Placaje", "potencia": 35, "tipo": "NORMAL"},
                {"nombre": "Gruñido", "potencia": 0, "tipo": "NORMAL"}
            ], "#A85888", "#783858")
        ]
        datos = random.choice(opciones)
        return Pokemon(
            nombre=datos[0],
            nivel=datos[1],
            hp_max=datos[2],
            ataque=datos[3],
            defensa=datos[4],
            velocidad=datos[5],
            ataques=datos[6],
            color_cuerpo=datos[7],
            color_detalle=datos[8]
        )

    def iniciar_batalla(self):
        self.enemy_pokemon = self.generar_pokemon_salvaje()
        self.enemy_hp_display = float(self.enemy_pokemon.hp_actual)
        self.player_hp_display = float(self.player_pokemon.hp_actual)
        self.estado = 'BATTLE'
        self.battle_substate = "MESSAGE"
        self.battle_message = f"¡Un {self.enemy_pokemon.nombre} salvaje apareció!"
        self.message_queue = [
            f"¡Adelante, {self.player_pokemon.nombre}!",
            "MENU_ACTION"
        ]

    def manejar_input_batalla(self, key):
        if self.battle_substate == "MESSAGE":
            # Avanzar mensajes al presionar 'Z' o 'Return'
            if key in ['z', 'return', 'space']:
                if self.message_queue:
                    siguiente = self.message_queue.pop(0)
                    if siguiente == "MENU_ACTION":
                        self.battle_substate = "ACTION"
                        self.battle_menu_selected = 0
                    elif siguiente == "TURNO_ENEMIGO":
                        self.ejecutar_turno_enemigo()
                    elif siguiente == "VICTORIA":
                        self.estado = 'OVERWORLD'
                    elif siguiente == "DERROTA":
                        # Curar al Pokémon y volver
                        self.player_pokemon.hp_actual = self.player_pokemon.hp_max
                        self.player_hp_display = float(self.player_pokemon.hp_max)
                        self.estado = 'OVERWORLD'
                    elif siguiente == "HUIR_EXITO":
                        self.estado = 'OVERWORLD'
                    else:
                        self.battle_message = siguiente
                else:
                    self.battle_substate = "ACTION"

        elif self.battle_substate == "ACTION":
            # Menú 2x2:
            # [0: LUCHAR]  [1: MOCHILA]
            # [2: POKÉMON] [3: HUIR]
            if key in ['up', 'w']:
                if self.battle_menu_selected in [2, 3]:
                    self.battle_menu_selected -= 2
            elif key in ['down', 's']:
                if self.battle_menu_selected in [0, 1]:
                    self.battle_menu_selected += 2
            elif key in ['left', 'a']:
                if self.battle_menu_selected in [1, 3]:
                    self.battle_menu_selected -= 1
            elif key in ['right', 'd']:
                if self.battle_menu_selected in [0, 2]:
                    self.battle_menu_selected += 1
            elif key in ['z', 'return']:
                if self.battle_menu_selected == 0:  # LUCHAR
                    self.battle_substate = "MOVES"
                    self.move_selected = 0
                elif self.battle_menu_selected == 1:  # MOCHILA
                    if self.pociones > 0 and self.player_pokemon.hp_actual < self.player_pokemon.hp_max:
                        self.pociones -= 1
                        curacion = 20
                        self.player_pokemon.curar(curacion)
                        self.battle_substate = "MESSAGE"
                        self.battle_message = f"¡Usaste una Poción! {self.player_pokemon.nombre} recuperó HP."
                        self.message_queue = ["TURNO_ENEMIGO"]
                    else:
                        self.battle_substate = "MESSAGE"
                        self.battle_message = "¡No necesitas usar Poción ahora!"
                        self.message_queue = ["MENU_ACTION"]
                elif self.battle_menu_selected == 2:  # POKÉMON
                    self.battle_substate = "MESSAGE"
                    self.battle_message = f"{self.player_pokemon.nombre} Lv.{self.player_pokemon.nivel} (HP: {self.player_pokemon.hp_actual}/{self.player_pokemon.hp_max})"
                    self.message_queue = ["MENU_ACTION"]
                elif self.battle_menu_selected == 3:  # HUIR
                    self.battle_substate = "MESSAGE"
                    self.battle_message = "¡Escapaste sin problemas!"
                    self.message_queue = ["HUIR_EXITO"]

        elif self.battle_substate == "MOVES":
            num_moves = len(self.player_pokemon.ataques)
            if key in ['up', 'w'] and self.move_selected >= 2:
                self.move_selected -= 2
            elif key in ['down', 's'] and self.move_selected + 2 < num_moves:
                self.move_selected += 2
            elif key in ['left', 'a'] and self.move_selected % 2 == 1:
                self.move_selected -= 1
            elif key in ['right', 'd'] and self.move_selected % 2 == 0 and self.move_selected + 1 < num_moves:
                self.move_selected += 1
            elif key in ['x', 'escape']:
                self.battle_substate = "ACTION"
            elif key in ['z', 'return']:
                # Ejecutar ataque del jugador
                self.ejecutar_ataque_jugador(self.move_selected)

    def ejecutar_ataque_jugador(self, move_idx):
        ataque = self.player_pokemon.ataques[move_idx]
        nombre_ataque = ataque["nombre"]
        danio = self.player_pokemon.calcular_danio_contra(move_idx, self.enemy_pokemon)
        
        self.battle_substate = "MESSAGE"
        self.battle_message = f"¡{self.player_pokemon.nombre} usó {nombre_ataque}!"
        self.enemy_blink_timer = 15  # Efecto parpadeo

        if danio > 0:
            self.enemy_pokemon.recibir_danio(danio)

        # Verificar si el enemigo fue derrotado
        if self.enemy_pokemon.esta_debilitado():
            exp_ganada = int(self.enemy_pokemon.nivel * 24 + random.randint(4, 10))
            subio_nivel, stats = self.player_pokemon.ganar_experiencia(exp_ganada)
            
            mensajes = [
                f"¡El {self.enemy_pokemon.nombre} enemigo se debilitó!",
                f"¡{self.player_pokemon.nombre} ganó {exp_ganada} puntos de EXP!"
            ]
            if subio_nivel:
                mensajes.append(f"¡{self.player_pokemon.nombre} subió al nivel {self.player_pokemon.nivel}!")
                mensajes.append(f"PS:+{stats['hp']} ATK:+{stats['atk']} DEF:+{stats['def']} VEL:+{stats['spd']}")

            mensajes.append("VICTORIA")
            self.message_queue = mensajes
        else:
            # Turno del enemigo
            self.message_queue = ["TURNO_ENEMIGO"]

    def ejecutar_turno_enemigo(self):
        if self.enemy_pokemon.esta_debilitado():
            return
        
        # Elige un ataque aleatorio
        move_idx = random.randint(0, len(self.enemy_pokemon.ataques) - 1)
        ataque = self.enemy_pokemon.ataques[move_idx]
        nombre_ataque = ataque["nombre"]
        danio = self.enemy_pokemon.calcular_danio_contra(move_idx, self.player_pokemon)

        self.battle_substate = "MESSAGE"
        self.battle_message = f"¡{self.enemy_pokemon.nombre} enemigo usó {nombre_ataque}!"
        self.player_blink_timer = 15

        if danio > 0:
            self.player_pokemon.recibir_danio(danio)

        if self.player_pokemon.esta_debilitado():
            self.message_queue = [
                f"¡{self.player_pokemon.nombre} se debilitó!",
                "¡Has perdido el combate! Regresando al centro...",
                "DERROTA"
            ]
        else:
            self.message_queue = ["MENU_ACTION"]

    def actualizar_batalla(self):
        # Animación de reducción fluida de la barra de HP
        if self.player_hp_display > self.player_pokemon.hp_actual:
            self.player_hp_display = max(float(self.player_pokemon.hp_actual), self.player_hp_display - 0.5)
        elif self.player_hp_display < self.player_pokemon.hp_actual:
            self.player_hp_display = min(float(self.player_pokemon.hp_actual), self.player_hp_display + 0.5)

        if self.enemy_hp_display > self.enemy_pokemon.hp_actual:
            self.enemy_hp_display = max(float(self.enemy_pokemon.hp_actual), self.enemy_hp_display - 0.5)

        # Reducir temporizadores de parpadeo
        if self.enemy_blink_timer > 0:
            self.enemy_blink_timer -= 1
        if self.player_blink_timer > 0:
            self.player_blink_timer -= 1

        # Si el siguiente mensaje en cola es el turno del enemigo, dispararlo
        if self.battle_substate == "MESSAGE" and self.message_queue and self.message_queue[0] == "TURNO_ENEMIGO":
            self.message_queue.pop(0)
            self.ejecutar_turno_enemigo()

    # -------------------------------------------------------------------------
    # RENDERIZADO DEL OVERWORLD EN CANVAS
    # -------------------------------------------------------------------------
    def dibujar_overworld(self):
        self.canvas.delete("all")

        # Cámara centrada en el jugador
        interp_x = self.player_col + (self.target_col - self.player_col) * self.move_progress if self.is_moving else self.player_col
        interp_y = self.player_row + (self.target_row - self.player_row) * self.move_progress if self.is_moving else self.player_row

        cam_x = interp_x * TILE_SIZE - SCREEN_WIDTH // 2 + TILE_SIZE // 2
        cam_y = interp_y * TILE_SIZE - SCREEN_HEIGHT // 2 + TILE_SIZE // 2

        # Dibujar casillas visibles
        cols = self.mapa.columnas
        filas = self.mapa.filas

        for r in range(filas):
            for c in range(cols):
                tile = self.mapa.get_tile(c, r)
                sx = c * TILE_SIZE - cam_x
                sy = r * TILE_SIZE - cam_y

                # Omitir tiles fuera de pantalla
                if sx < -TILE_SIZE or sx > SCREEN_WIDTH or sy < -TILE_SIZE or sy > SCREEN_HEIGHT:
                    continue

                if tile == '.':      # Césped
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_GRASS, outline="")
                elif tile == 'H':    # Hierba Alta
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_TALL_GRASS, outline="")
                    # Detalles de hojas de hierba alta estilo GBA
                    self.canvas.create_rectangle(sx + 4, sy + 6, sx + 8, sy + 26, fill="#288028", outline="")
                    self.canvas.create_rectangle(sx + 14, sy + 4, sx + 18, sy + 28, fill="#207020", outline="")
                    self.canvas.create_rectangle(sx + 24, sy + 8, sx + 28, sy + 24, fill="#288028", outline="")
                elif tile == 'P':    # Camino de arena
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_PATH, outline="")
                elif tile == 'T':    # Árbol
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_TREE_DARK, outline="")
                    self.canvas.create_oval(sx + 2, sy + 2, sx + TILE_SIZE - 2, sy + TILE_SIZE - 2, fill=COLOR_TREE_LIGHT, outline="")
                    self.canvas.create_oval(sx + 8, sy + 8, sx + TILE_SIZE - 8, sy + TILE_SIZE - 8, fill="#409840", outline="")
                elif tile == 'R':    # Techo rojo de casa
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_ROOF_RED, outline="#901818")
                elif tile == 'B':    # Techo azul laboratorio
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_ROOF_BLUE, outline="#184070")
                elif tile == 'L':    # Pared de edificio
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_WALL, outline="#C8B8A0")
                elif tile == 'D':    # Puerta
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_WALL, outline="")
                    self.canvas.create_rectangle(sx + 6, sy + 8, sx + TILE_SIZE - 6, sy + TILE_SIZE, fill=COLOR_DOOR, outline="#402010")
                elif tile == 'F':    # Valla de madera
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_GRASS, outline="")
                    self.canvas.create_rectangle(sx + 2, sy + 10, sx + TILE_SIZE - 2, sy + 18, fill=COLOR_FENCE, outline="#805020")
                    self.canvas.create_rectangle(sx + 6, sy + 4, sx + 12, sy + 28, fill=COLOR_FENCE, outline="#805020")
                    self.canvas.create_rectangle(sx + 20, sy + 4, sx + 26, sy + 28, fill=COLOR_FENCE, outline="#805020")
                elif tile == 'W':    # Agua
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_WATER, outline="")
                elif tile == 'S':    # Cartel informativo
                    self.canvas.create_rectangle(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE, fill=COLOR_GRASS, outline="")
                    self.canvas.create_rectangle(sx + 8, sy + 8, sx + 24, sy + 22, fill="#C08848", outline="#604018")
                    self.canvas.create_rectangle(sx + 14, sy + 22, sx + 18, sy + 30, fill="#604018", outline="")

        # Dibujar Jugador (Estilo Red GBA)
        px = SCREEN_WIDTH // 2 - TILE_SIZE // 2
        py = SCREEN_HEIGHT // 2 - TILE_SIZE // 2

        # Sombra del jugador
        self.canvas.create_oval(px + 4, py + 22, px + 28, py + 30, fill="#205020", outline="")

        # Cuerpo / Chaqueta roja
        self.canvas.create_rectangle(px + 8, py + 14, px + 24, py + 24, fill="#D83020", outline="#801010")
        # Pantalón azul
        self.canvas.create_rectangle(px + 9, py + 24, px + 23, py + 28, fill="#285090", outline="#183060")
        # Cabeza y Gorra roja con visera blanca
        self.canvas.create_oval(px + 9, py + 6, px + 23, py + 18, fill="#F8C898", outline="")
        self.canvas.create_rectangle(px + 8, py + 4, px + 24, py + 11, fill="#D83020", outline="#801010")
        self.canvas.create_rectangle(px + 10, py + 11, px + 22, py + 13, fill="#F8F8F8", outline="")

        # HUD superior con información y controles
        self.canvas.create_rectangle(0, 0, SCREEN_WIDTH, 26, fill="#000000", stipple="gray50", outline="")
        self.canvas.create_text(
            12, 13,
            text=f"PUEBLO PALETA | Equipo: {self.player_pokemon.nombre} Lv.{self.player_pokemon.nivel} (HP {self.player_pokemon.hp_actual}/{self.player_pokemon.hp_max})",
            anchor="w", fill="#FFFFFF", font=("Courier", 10, "bold")
        )

    # -------------------------------------------------------------------------
    # RENDERIZADO PIXEL ART POR MATRIZ DE PÍXELES (O CREATE_BITMAP)
    # -------------------------------------------------------------------------
    def dibujar_sprite_pixelart(self, cx, cy, nombre, pixel_size=3):
        """
        Dibuja el sprite del Pokémon a partir de su matriz de píxeles personalizada.
        Sustituye cualquier elipse u objeto amorfo por una silueta fiel pixel a pixel:
        cresta, pico y alas para Pidgey; orejas con punta negra, mejillas y cola para Pikachu, etc.
        (También compatible con create_bitmap o PhotoImage de Tkinter).
        """
        clave = None
        for k in PIXEL_ART_SPRITES.keys():
            if k.lower() in nombre.lower():
                clave = k
                break
        if not clave:
            clave = "Pidgey"

        sprite_data = PIXEL_ART_SPRITES[clave]
        palette = sprite_data["palette"]
        grid = sprite_data["grid"]
        h = len(grid)
        w = max(len(row) for row in grid)

        start_x = int(cx - (w * pixel_size) / 2)
        start_y = int(cy - (h * pixel_size) / 2)

        # Sombra en la base de la plataforma
        self.canvas.create_oval(
            cx - 26, start_y + h * pixel_size - 4,
            cx + 26, start_y + h * pixel_size + 8,
            fill="#508850", outline="", stipple="gray50"
        )

        # Renderizado de matriz optimizado por tramos contiguos (run-length)
        for r_idx, row in enumerate(grid):
            c_idx = 0
            while c_idx < len(row):
                char = row[c_idx]
                color = palette.get(char)
                if not color:
                    c_idx += 1
                    continue
                run = 1
                while c_idx + run < len(row) and row[c_idx + run] == char:
                    run += 1
                
                px1 = start_x + c_idx * pixel_size
                py1 = start_y + r_idx * pixel_size
                px2 = px1 + run * pixel_size
                py2 = py1 + pixel_size
                self.canvas.create_rectangle(px1, py1, px2, py2, fill=color, outline="")
                c_idx += run

    # -------------------------------------------------------------------------
    # RENDERIZADO DE LA BATALLA EN CANVAS
    # -------------------------------------------------------------------------
    def dibujar_batalla(self):
        self.canvas.delete("all")

        # Fondo de batalla estilo GBA (Cielo degradado y campo de combate)
        self.canvas.create_rectangle(0, 0, SCREEN_WIDTH, 200, fill="#D0E8D0", outline="")
        self.canvas.create_rectangle(0, 140, SCREEN_WIDTH, 200, fill="#B0D8B0", outline="")

        # Plataforma enemigo (arriba derecha)
        self.canvas.create_oval(280, 80, 440, 125, fill=COLOR_PLATFORM_ENEMY, outline="#88B870", width=2)
        # Plataforma jugador (abajo izquierda)
        self.canvas.create_oval(30, 150, 210, 200, fill=COLOR_PLATFORM_PLAYER, outline="#78A860", width=2)

        # ---------------------------------------------------------------------
        # SPRITE ENEMIGO (Sistema Pixel Art - Matriz GBA)
        # ---------------------------------------------------------------------
        if self.enemy_blink_timer % 4 < 2:
            ex, ey = 360, 85
            self.dibujar_sprite_pixelart(ex, ey, self.enemy_pokemon.nombre, pixel_size=3)

        # ---------------------------------------------------------------------
        # SPRITE JUGADOR (Sistema Pixel Art - Espalda GBA)
        # ---------------------------------------------------------------------
        if self.player_blink_timer % 4 < 2:
            px, py = 120, 160
            self.dibujar_sprite_pixelart(px, py, self.player_pokemon.nombre, pixel_size=3.4)

        # ---------------------------------------------------------------------
        # PLACAS DE ESTADO (HP, NOMBRE, NIVEL ESTILO GBA)
        # ---------------------------------------------------------------------
        # 1. Placa Enemigo (Arriba Izquierda)
        self.canvas.create_rectangle(24, 20, 220, 68, fill="#F8F8D8", outline="#303840", width=2)
        self.canvas.create_text(34, 32, text=self.enemy_pokemon.nombre.upper(), anchor="w", font=("Courier", 11, "bold"), fill=COLOR_TEXT)
        self.canvas.create_text(160, 32, text=f":L{self.enemy_pokemon.nivel}", anchor="w", font=("Courier", 10, "bold"), fill="#C04018")

        # Barra HP Enemigo
        self.canvas.create_rectangle(80, 48, 204, 58, fill=COLOR_HP_BG, outline="#202020")
        pct_enemy = max(0.0, min(1.0, self.enemy_hp_display / self.enemy_pokemon.hp_max))
        hp_color_enemy = COLOR_HP_GREEN if pct_enemy > 0.5 else (COLOR_HP_YELLOW if pct_enemy > 0.2 else COLOR_HP_RED)
        self.canvas.create_rectangle(82, 50, 82 + int(120 * pct_enemy), 56, fill=hp_color_enemy, outline="")
        self.canvas.create_text(50, 53, text="HP", font=("Courier", 9, "bold"), fill="#E08020")

        # 2. Placa Jugador (Abajo Derecha)
        self.canvas.create_rectangle(256, 120, 460, 186, fill="#F8F8D8", outline="#303840", width=2)
        self.canvas.create_text(268, 134, text=self.player_pokemon.nombre.upper(), anchor="w", font=("Courier", 11, "bold"), fill=COLOR_TEXT)
        self.canvas.create_text(398, 134, text=f":L{self.player_pokemon.nivel}", anchor="w", font=("Courier", 10, "bold"), fill="#C04018")

        # Barra HP Jugador
        self.canvas.create_rectangle(316, 150, 444, 160, fill=COLOR_HP_BG, outline="#202020")
        pct_player = max(0.0, min(1.0, self.player_hp_display / self.player_pokemon.hp_max))
        hp_color_player = COLOR_HP_GREEN if pct_player > 0.5 else (COLOR_HP_YELLOW if pct_player > 0.2 else COLOR_HP_RED)
        self.canvas.create_rectangle(318, 152, 318 + int(124 * pct_player), 158, fill=hp_color_player, outline="")
        self.canvas.create_text(286, 155, text="HP", font=("Courier", 9, "bold"), fill="#E08020")

        # Numérico de HP (solo jugador en estilo GBA)
        self.canvas.create_text(
            440, 172,
            text=f"{int(self.player_hp_display)}/ {self.player_pokemon.hp_max}",
            anchor="e", font=("Courier", 10, "bold"), fill=COLOR_TEXT
        )

        # ---------------------------------------------------------------------
        # CAJA DE TEXTO Y MENÚ INFERIOR ESTILO GBA
        # ---------------------------------------------------------------------
        tb_y = 202
        tb_h = 118
        # Fondo y marcos decorativos
        self.canvas.create_rectangle(4, tb_y, SCREEN_WIDTH - 4, SCREEN_HEIGHT - 4, fill=COLOR_TEXTBOX_BG, outline=COLOR_TEXTBOX_BORDER, width=4)
        self.canvas.create_rectangle(8, tb_y + 4, SCREEN_WIDTH - 8, SCREEN_HEIGHT - 8, fill=COLOR_TEXTBOX_BG, outline=COLOR_TEXTBOX_INNER, width=2)

        if self.battle_substate == "MESSAGE":
            # Cuadro de texto amplio para diálogos
            self.canvas.create_text(
                24, tb_y + 36,
                text=self.battle_message,
                anchor="w", font=("Courier", 13, "bold"), fill=COLOR_TEXT
            )
            # Flecha indicadora de continuar
            self.canvas.create_polygon(
                SCREEN_WIDTH - 28, tb_y + 76,
                SCREEN_WIDTH - 18, tb_y + 76,
                SCREEN_WIDTH - 23, tb_y + 84,
                fill="#D83020", outline=""
            )
            self.canvas.create_text(
                SCREEN_WIDTH - 36, tb_y + 94,
                text="[Z] Continuar", anchor="e", font=("Courier", 9), fill="#707070"
            )

        elif self.battle_substate == "ACTION":
            # Lado izquierdo: Pregunta
            self.canvas.create_text(
                24, tb_y + 40,
                text=f"¿Qué debe hacer\\n{self.player_pokemon.nombre}?",
                anchor="w", font=("Courier", 12, "bold"), fill=COLOR_TEXT
            )

            # Lado derecho: Menú 2x2
            # Caja del menú
            mx = 260
            my = tb_y + 8
            self.canvas.create_rectangle(mx, my, SCREEN_WIDTH - 12, SCREEN_HEIGHT - 12, fill="#FFFFFF", outline="#303840", width=2)

            opciones = [
                ("LUCHAR", mx + 24, my + 26, 0),
                ("MOCHILA", mx + 114, my + 26, 1),
                ("POKÉMON", mx + 24, my + 64, 2),
                ("HUIR", mx + 114, my + 64, 3)
            ]

            for texto, ox, oy, idx in opciones:
                color = "#D83820" if idx == self.battle_menu_selected else COLOR_TEXT
                self.canvas.create_text(ox, oy, text=texto, anchor="w", font=("Courier", 11, "bold"), fill=color)

                if idx == self.battle_menu_selected:
                    # Flecha selectora
                    self.canvas.create_polygon(
                        ox - 14, oy - 6,
                        ox - 4, oy,
                        ox - 14, oy + 6,
                        fill="#D83820", outline=""
                    )

        elif self.battle_substate == "MOVES":
            # Lista de movimientos del Pokémon
            for i, atk in enumerate(self.player_pokemon.ataques):
                col_offset = 24 if i % 2 == 0 else 230
                row_offset = tb_y + 30 if i < 2 else tb_y + 70

                color = "#D83820" if i == self.move_selected else COLOR_TEXT
                self.canvas.create_text(col_offset, row_offset, text=atk["nombre"].upper(), anchor="w", font=("Courier", 11, "bold"), fill=color)

                if i == self.move_selected:
                    self.canvas.create_polygon(
                        col_offset - 12, row_offset - 5,
                        col_offset - 4, row_offset,
                        col_offset - 12, row_offset + 5,
                        fill="#D83820", outline=""
                    )

            # Ayuda de botones
            self.canvas.create_text(
                SCREEN_WIDTH - 24, SCREEN_HEIGHT - 18,
                text="[Z] Seleccionar  [X] Volver",
                anchor="e", font=("Courier", 9), fill="#707070"
            )

    # -------------------------------------------------------------------------
    # BUCLE PRINCIPAL (GAME LOOP)
    # -------------------------------------------------------------------------
    def game_loop(self):
        """
        Bucle de juego accionado por .after() a ~60 FPS.
        Actualiza la lógica según el estado y redibuja la pantalla.
        """
        if self.estado == 'OVERWORLD':
            self.actualizar_overworld()
            self.dibujar_overworld()
        elif self.estado == 'BATTLE':
            self.actualizar_batalla()
            self.dibujar_batalla()

        # Próxima llamada del bucle
        self.root.after(FRAME_TIME_MS, self.game_loop)

    def run(self):
        self.root.mainloop()


# =============================================================================
# PUNTO DE ENTRADA
# =============================================================================
if __name__ == "__main__":
    app = Game()
    app.run()
`;
