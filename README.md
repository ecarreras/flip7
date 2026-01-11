# Flip 7 - Gestor de Puntuacions

[![PWA](https://img.shields.io/badge/PWA-Enabled-blue.svg)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Aplicació web progressiva (PWA) per portar les puntuacions del joc de cartes **Flip 7**. Amb bona usabilitat web, funcionalitat offline i disseny responsive.

## 🎴 Característiques

- ✅ **Gestió de Jugadors**: Afegir i eliminar jugadors de la partida
- ✅ **Seguiment de Puntuacions**: Registrar punts per cada jugador
- ✅ **Taula de Puntuació**: Visualitzar el rànquing amb posicions destacades (1r, 2n, 3r lloc)
- ✅ **Historial de Rondes**: Veure tots els canvis de puntuació amb marca de temps
- ✅ **Calculadora de Punts**: Eina integrada per calcular punts fàcilment
- ✅ **PWA**: Instal·lable com una aplicació nativa
- ✅ **Mode Offline**: Funciona sense connexió a internet
- ✅ **Disseny Responsive**: Optimitzat per a mòbils, tauletes i escriptori
- ✅ **Persistència**: Les dades es guarden localment al navegador

## 🚀 Ús

### Opció 1: Ús directe (recomanat)

1. Obre `index.html` en un navegador web modern
2. Per instal·lar com a PWA, utilitza l'opció "Afegir a la pantalla d'inici" o "Instal·la l'aplicació" del navegador

### Opció 2: Servidor local

Si vols provar la funcionalitat PWA completa amb service worker:

```bash
# Amb Python 3
python3 -m http.server 8080

# O amb Node.js (npx)
npx http-server -p 8080
```

Després obre http://localhost:8080 al navegador.

## 📱 Com utilitzar l'aplicació

### 1. Afegir Jugadors
- A la pestanya "Partida", escriu el nom del jugador
- Fes clic a "Afegir Jugador"
- Repeteix per afegir més jugadors

### 2. Registrar Puntuacions
- Selecciona un jugador del desplegable
- Introdueix els punts (positius o negatius)
- Fes clic a "Afegir Punts"

### 3. Veure la Taula de Puntuació
- Ves a la pestanya "Taula"
- Consulta el rànquing de jugadors
- Revisa l'historial de rondes

### 4. Utilitzar la Calculadora
- Ves a la pestanya "Calculadora"
- Realitza els càlculs necessaris
- Fes clic a "Usar Resultat" per transferir el resultat al camp de punts

### 5. Nova Partida
- Fes clic a "Nova Partida" per començar de zero
- Això eliminarà tots els jugadors i puntuacions actuals

## 🛠️ Tecnologies

- **HTML5**: Estructura semàntica
- **CSS3**: Disseny modern amb variables CSS i Flexbox/Grid
- **JavaScript (ES6+)**: Lògica de l'aplicació amb classes i LocalStorage
- **PWA**: Manifest i Service Worker per a funcionalitat offline
- **Python PIL**: Generació d'icones de l'aplicació

## 📦 Estructura del projecte

```
flip7/
├── index.html          # Pàgina principal de l'aplicació
├── styles.css          # Estils de l'aplicació
├── app.js             # Lògica de l'aplicació
├── manifest.json      # Manifest PWA
├── service-worker.js  # Service Worker per a funcionalitat offline
├── icon-192.png       # Icona 192x192
├── icon-512.png       # Icona 512x512
├── .gitignore         # Fitxers a ignorar per Git
├── LICENSE            # Llicència MIT
└── README.md          # Aquest fitxer
```

## 💾 Emmagatzematge de Dades

L'aplicació utilitza `localStorage` del navegador per guardar:
- Llista de jugadors i les seves puntuacions
- Historial de rondes

Les dades es mantenen entre sessions fins que:
- Es faci clic a "Nova Partida"
- S'esborrin les dades del navegador
- S'utilitzi un altre navegador o dispositiu

## 🌐 Compatibilitat

- ✅ Chrome/Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Opera 67+
- ✅ Navegadors mòbils moderns

## 📄 Llicència

Aquest projecte està llicenciat sota la llicència MIT. Consulta el fitxer [LICENSE](LICENSE) per a més detalls.

## 👤 Autor

Eduard Carreras

---

**Gaudeix jugant al Flip 7! 🎴**
