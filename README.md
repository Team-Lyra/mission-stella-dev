# 🚀 Mission Stella — An Educational Space Game
>
> 🌐 **Play online (no installation needed):** <https://mission-stella-dev-server-p1qz8sr7w-juagostis-projects.vercel.app/>
 
**Mission Stella** (internal project name: *Missão Taquari*) is a 2D educational exploration and simulation game for children and teenagers **aged 8 to 15**. It is set in the **Taquari Valley (Vale do Taquari), Rio Grande do Sul, Brazil**, and was created by **TEAM LYRA** for the **NASA Space Apps Challenge**.
 
The player takes the role of a young leader of a space agency and uses satellite technology to solve real problems of the local community. Along the way, players discover how space agencies such as NASA work, which instruments they use, and how the data collected from space influences everyday life: the food we eat, the weather forecasts we rely on, the safety of our homes and the internet connection of rural schools.
 
---
 
## 📑 Table of Contents
 
0. [Play Online (Hosted Version)](#-play-online-hosted-version)
1. [Purpose and Educational Objectives](#1--purpose-and-educational-objectives)
2. [Why Space Technology Matters in Our Daily Lives](#2--why-space-technology-matters-in-our-daily-lives)
3. [How to Play — Step by Step](#3--how-to-play--step-by-step)
4. [Controls](#4--controls)
5. [The Four Missions](#5--the-four-missions)
6. [Data Sources and APIs](#6--data-sources-and-apis)
7. [Installation and Configuration](#7--installation-and-configuration)
8. [Architecture and Project Structure](#8--architecture-and-project-structure)
9. [Privacy and Safety for Young Players](#9--privacy-and-safety-for-young-players)
10. [Classroom Use](#10--classroom-use)
11. [Important Notes on Content Accuracy](#11--important-notes-on-content-accuracy)
12. [Credits, Use of AI and License](#12--credits-use-of-ai-and-license)
---
 
## 🌐 Play Online (Hosted Version)
 
Mission Stella is also available as a **hosted version on Vercel**, so you can play directly in your browser without installing Node.js or running a server:
 
👉 **<https://mission-stella-dev-server-p1qz8sr7w-juagostis-projects.vercel.app/>**
 
- Works in any modern desktop browser (Chrome, Edge, Firefox). A keyboard and a mouse are recommended.
- Ideal for **classrooms and quick demos**: just open the link and start playing.
- Progress is saved in your browser (`localStorage`), so use the same browser and device to continue your adventure.
- If real-time weather credentials are not configured on the hosted server, the top bar shows **simulated** weather values (see [section 6.2](#62-meteomatics-weather-api-real-time-weather)).
- Want to run the game on your own machine or modify it? See [Installation and Configuration](#7--installation-and-configuration).
---
 
## 1. 🎯 Purpose and Educational Objectives
 
**Objective of the game.** The player must complete four community missions. In each one, the player listens to a citizen of the Taquari Valley, understands the problem, designs and builds a satellite, passes a scientific challenge inspired by a real NASA instrument, launches the satellite and observes how the data helps the region.
 
The game follows a three-stage *core loop*:
 
| Stage | Name | What happens |
|---|---|---|
| 1 | 🌍 **Plan (on Earth)** | Explore the map, talk to residents and identify a local problem. |
| 2 | 🚀 **Accomplish (in space)** | Assemble the satellite, take the scientific challenge, launch and collect data. |
| 3 | 📊 **Impact (return)** | See how the solution changes the region and learn the science behind it. |
 
**What young players are expected to learn:**
 
- That space is not only "for looking at stars": satellites bring practical benefits to the economy and to safety.
- What **remote sensing** is and why different sensors (infrared camera, radar, thermal sensor, antennas) are used for different problems.
- The basic parts of a satellite (power, computer, communication, sensor) and why each one matters.
- That engineering involves **trade-offs** (budget, mass, energy, reliability) and that missions can fail and be tried again.
- That real weather data (temperature, rain, wind, humidity and pressure) is measured and delivered through **APIs**, and that technology teams combine several data sources.
---
 
## 2. 🌎 Why Space Technology Matters in Our Daily Lives
 
Agencies such as NASA design, launch and operate satellites and instruments that observe our planet continuously. The data they produce is shared with scientists, governments, companies and schools. Mission Stella illustrates four concrete ways this affects ordinary people:
 
- 🌾 **Food:** multispectral images measure the health of crops, helping farmers use water, fertilizer and pesticides more precisely (the NASA **Landsat** programme has observed the Earth since 1972).
- ⛰️ **Safety:** radar (SAR) can "see" through clouds, day and night, and detect small movements of the ground — useful for flood and landslide monitoring.
- 📡 **Communication:** relay satellites and ground networks (for example NASA's **TDRS** and **Deep Space Network**) keep data flowing between space and Earth; similar ideas connect isolated rural communities.
- 🌳 **Environment:** thermal and optical sensors help detect fire hotspots and deforestation (NASA **FIRMS** uses data from the MODIS and VIIRS instruments).
The weather information shown in the game's top bar is a further example: it is **real, live data** for the player's city, obtained from a professional weather API, showing that the same data-driven approach is used for everyday decisions.
 
---
 
## 3. 🕹️ How to Play — Step by Step
 
### Part A — Starting the game
 
1. **Open the game.** Either play the **[hosted version online](#-play-online-hosted-version)**, or **start the server** and open `http://localhost:3000` in your browser (see [Installation](#7--installation-and-configuration)). On Windows you can simply double-click `iniciar_jogo.bat`.
2. In the **main menu**, use the arrow keys (or the mouse) to choose an option:
   - 🚀 **Start Exploration** — begin or continue the adventure.
   - 🏆 **Leaderboard** — see the best scores.
   - 🛍️ **Space Shop** — spend Space Coins on equipment and space suits.
   - 🛰️ **Curiosities** — read short facts about satellites, space and NASA.
   - 📜 **Credits & Sources** — see the data sources used in the game.
3. *(Optional)* Press **L** in the menu, or click the language selector at the bottom, to switch between **English** and **Portuguese (Brazil)**.
4. On the first access, the game asks for your **explorer name** (up to 24 characters) and your **city**. While you type the city, a list of suggestions appears — choose one. This city is used to show the real weather of your region.
   > 👨‍🏫 *We recommend using a nickname instead of a full real name.*
5. **Lyra**, the star guide, introduces herself and explains the basics. Read each message and press **Space**, **Enter** or **E** to continue.
### Part B — Completing a mission
 
6. **Explore the map.** Walk around the Taquari Valley and find the residents who need help (Mrs. Marta, Captain Farias, Teacher Clara and Mr. Nilo).
7. **Talk to the resident** by standing next to them and pressing **E**. Read the problem carefully and **accept the mission**.
8. **Enter the STELLA Space Center.** Inside, you can talk to **Dr. Santos (Flight Director)**, who opens the mission operations panel, and to the guides. The **Engineering Workbench** is on the left side, the **Leaderboard screen** is at the top and the **Shop** is on the right.
9. **Build your satellite** at the Workbench. This stage has three steps:
   1. **Briefing and customization** — choose the satellite's name and its crew: an *Automatic Robotic Probe* (+efficiency) or the *Robot Co-pilot Bit* (+reliability).
   2. **Assembly** — with a budget of **1,000 Space Credits**, drag and drop one part into each slot: 🔋 **Battery**, 💻 **Computer**, 📡 **Communication** and 🔬 **Sensor**. Every part has energy, reliability and mass. The game suggests the **ideal sensor for the mission** — choosing it increases your chance of success.
   3. **Final review** — check the satellite's statistics and the **mission success chance** (shown as a percentage), then confirm.
10. **Pass the scientific challenge** (a different mini-game for each mission — see [The Four Missions](#5--the-four-missions)).
11. **Launch!** When the *"Launch Mission"* button appears, press **Space** (or click). Watch the rocket rise and the satellite reach orbit.
12. **Collect the data and see the impact.** The game reveals whether the mission was successful. If it was, you will see the result for the community, a "NASA curiosity" related to the mission, and you earn **points, XP and Space Coins**.
13. **If the mission fails, do not worry!** Engineers also learn from failures. Return to the Space Center, talk to the **Flight Director** and try again, perhaps with better parts.
14. **Repeat for the four missions.** After the last one, a celebration with fireworks, a final report and the credits (including the data sources) are shown.
### Tips for a better score
 
- Choose the sensor that matches the mission's problem.
- Balance **energy** and **reliability**: both increase the success chance.
- Spend Space Coins in the shop to unlock stronger parts and new space suits.
- Read the **Curiosities** — they are short and explain what you are doing.
---
 
## 4. ⌨️ Controls
 
| Key / Input | Action |
|---|---|
| ↑ ↓ ← → or **W A S D** | Move the character / navigate menus and dialogs |
| **E**, **Enter** or **Space** | Interact with residents and objects, confirm, advance dialogs |
| **Esc** or **P** | Pause (Continue • Back to Menu • Restart from Scratch) |
| **L** (in the main menu) | Switch language (English / Português) |
| **Mouse** | Click menu options, drag parts in the Workbench, and play some mini-games |
| **Backspace** | Erase a character in the telemetry typing challenge |
 
> 💡 A keyboard and a mouse are recommended. The game is designed to run in a desktop web browser.
 
---
 
## 5. 🛰️ The Four Missions
 
| # | Mission | Resident (city) | Problem | Ideal sensor | Scientific challenge (inspired by NASA) |
|---|---|---|---|---|---|
| 1 | **Operation Fertile Soil** | Mrs. Marta (Estrela) | A pest is attacking corn and soybean crops. | Multispectral Camera (NIR) | 🌿 *Landsat-9 NDVI scanner* — find the **3 pest hotspots** by clicking on the fields. |
| 2 | **Operation Hillside Sentinel** | Captain Farias (Lajeado) | Heavy rain threatens landslides on hillsides. | SAR Microwave Radar | ⛰️ *NISAR SAR radar* — press **Space** exactly when the beam is in the **green band**. |
| 3 | **Operation Taquari Connection** | Teacher Clara (Pouso Novo) | Rural students and producers have no internet or phone signal. | Rural Ku-band Transponder | 📡 *SCaN & TDRS telemetry console* — **type the uplink commands** and press **Enter**. |
| 4 | **Operation Guardian of Waters and Forests** | Mr. Nilo (Taquari River) | Fires and deforestation threaten the riparian forests. | Thermal Infrared Sensor | 🔥 *FIRMS thermal filter* — **drag the thermal lens** over the river to find the **3 fire hotspots**. |
 
*(The Portuguese names of the missions are: Operação Solo Fértil, Operação Sentinela das Encostas, Operação Conexão Taquari and Operação Guardião das Águas e Matas.)*
 
**How success is determined.** The satellite receives a *success chance* between 65% and 99%, calculated from its energy, its reliability and whether the ideal sensor was chosen (the ideal sensor adds a bonus). With a success chance below 75%, there is a 30% risk that the mission fails. A failed mission can be tried again.
 
---
 
## 6. 🌐 Data Sources and APIs
 
Mission Stella combines **external web services** (queried by the game's server) with **educational content** written by the team. The table below lists every external service that the game's code contacts, as well as the references that appear in the game's credits.
 
### 6.1 Summary
 
| # | Source | Type | Used for | Status in the game |
|---|---|---|---|---|
| 1 | **Meteomatics Weather & Climate API** — <https://www.meteomatics.com/en/api/getting-started/> | Weather API (third-party provider, requires credentials) | Real-time weather in the top bar | ✅ Queried by the server (`server/routes/weather.js`) |
| 2 | **Open-Meteo Geocoding API** — <https://geocoding-api.open-meteo.com/v1/search> | Geocoding API (free, no key) | Converts the city name typed by the player into latitude/longitude | ✅ Queried by the server (`server/routes/geocode.js`) |
| 3 | **BigDataCloud Reverse Geocoding API** — <https://api.bigdatacloud.net/data/reverse-geocode-client> | Reverse geocoding API (free, no key) | Converts coordinates back into the place name displayed next to the weather | ✅ Queried by the server (`server/routes/weather.js`) |
| 4 | **NASA Worldview** — <https://worldview.earthdata.nasa.gov/> | NASA Earth observation image browser | Listed in the in-game credits as inspiration (MODIS and FIRMS layers) | 📎 Reference only — **not** queried by the code |
| 5 | **NASA missions and instruments** (Landsat, NISAR, SCaN/TDRS, Deep Space Network, GPM, FIRMS/MODIS/VIIRS) | Educational content | Mission narratives, mini-game themes and "Curiosities" | 📚 Written text — **no live NASA data** is downloaded |
| 6 | **Generative Artificial Intelligence** (support tool) | AI assistance | Support during development and documentation, always reviewed by the team | 🤖 Supporting source — **not** a data source queried by the game |
 
<!--
TODO (TEAM LYRA): the remaining sources taken from the project PDF were not part of the
uploaded files. Add them to the table above, indicating the page/section of the PDF.
-->
 
> **Transparency note.** Meteomatics is a commercial weather-data provider and is **not operated by NASA**. The NASA connection of the game lies in the missions, instruments and educational content that inspire it (items 4 and 5 above).
 
### 6.2 Meteomatics Weather API (real-time weather)
 
- **Endpoint pattern:** `https://api.meteomatics.com/now/<parameters>/<latitude>,<longitude>/json`
- **Authentication:** HTTP Basic, using the credentials stored in the server's `.env` file (they are never exposed to the browser).
- **Parameters requested:**
| Meteomatics parameter | Meaning | Shown in the game as |
|---|---|---|
| `t_2m:C` | Air temperature at 2 m (°C) | 🌡️ Temperature |
| `precip_1h:mm` | Precipitation in the last hour (mm) | 🌧️ Rain |
| `relative_humidity_2m:p` | Relative humidity (%) | 💧 Humidity |
| `wind_speed_10m:ms` | Wind speed at 10 m (converted to km/h) | 💨 Wind |
| `windspeed_gust_10m:ms` | Wind gusts at 10 m (converted to km/h) | 💥 Gusts |
| `wind_dir_10m:d` | Wind direction (degrees) | 🧭 Direction |
| `msl_pressure:hPa` | Mean sea-level pressure (hPa) | 🌐 Pressure |
 
- **Behaviour:** the game's server acts as a *proxy* (`GET /api/weather`), stores each answer in memory for **10 minutes** to save the API quota, and the browser refreshes the information every 10 minutes.
- **Fallback:** if the credentials are missing or the service is unavailable, the server returns **plausible simulated values** and marks the response with `"simulated": true`, so the game never breaks. This also applies to the hosted version if the credentials are not set in its environment variables.
- **Locations:** four pre-configured cities of the valley (Estrela, Lajeado, Pouso Novo, Taquari) or any Brazilian city selected by the player.
### 6.3 Geocoding services
 
- **Open-Meteo Geocoding** (`GET /api/geocode?name=...`) powers the city suggestions in the registration screen. Results are restricted to Brazil (`countryCode=BR`), returned in Portuguese and cached for **1 hour**.
- **BigDataCloud Reverse Geocoding** gets the current place name from the coordinates; results are cached for **24 hours**.
- Neither service requires an API key in the way the project uses them.
### 6.4 Educational content
 
The "Curiosities" (12 short facts), the mission narratives and the mini-game themes were written by the team and are based on publicly known NASA programmes. They are simplified on purpose for the 8–15 age range.
 
### 6.5 Use of Artificial Intelligence
 
Artificial Intelligence (AI) tools were **also used as a source of support** during the project, and we state this openly for transparency. The AI never replaced the team's work: the idea of the game, its educational purpose, the design of the missions, the programming, the integration of the APIs, the decisions and the testing are the result of the **dedication of TEAM LYRA** throughout the whole development. Everything suggested by AI was **reviewed, adapted and approved by the team**. The game does not call any AI service while it runs.
 
---
 
## 7. ⚙️ Installation and Configuration
 
> 🌐 **Just want to play?** You do not need to install anything — use the **[hosted version](#-play-online-hosted-version)**. The steps below are for running the game locally, for development or offline classroom use.
 
### Requirements
 
- [Node.js](https://nodejs.org/) **version 18 or higher**
- A modern web browser (Chrome, Edge, Firefox)
- *(Optional)* A free account at [meteomatics.com](https://www.meteomatics.com/) to obtain credentials for real-time weather
> ℹ️ A PostgreSQL database is **not required**. Progress is stored in a local JSON file (`server/data/db.json`) and in the browser (`localStorage`). The files `schema.sql` and `seed.sql` are kept only as a historical reference.
 
### Step by step
 
```bash
# 1. Get the project
git clone https://github.com/Team-Lyra/mission-stella-dev.git
cd mission-stella-dev
 
# 2. Install the server dependencies
cd server
npm install
 
# 3. Create the environment file from the example
cp .env.example .env        # on Windows: copy .env.example .env
```
 
Edit `server/.env`:
 
```env
PORT=3000
METEOMATICS_USER=your_username
METEOMATICS_PASSWORD=your_password
```
 
> Without `METEOMATICS_USER` and `METEOMATICS_PASSWORD` the game still works, using **simulated** weather values.
> 🔒 **Never publish the `.env` file.** Add it to `.gitignore`.
 
```bash
# 4. Start the server
node server.js
```
 
Then open **<http://localhost:3000>** in your browser and enjoy the game.
 
**Shortcut for Windows:** double-click `iniciar_jogo.bat` — it opens the browser and starts the server.
 
---
 
## 8. 🏗️ Architecture and Project Structure
 
| Layer | Technology |
|---|---|
| Front end | HTML5 Canvas + plain JavaScript (no frameworks) |
| Back end | Node.js + Express |
| Hosting (online version) | Vercel |
| Storage | Local JSON file (`server/data/db.json`) + browser `localStorage` (offline fallback) |
| Languages | English and Portuguese (Brazil), through the `i18n.js` module |
| Audio | Sounds synthesized in the browser through the Web Audio API |
 
**The game's own REST API** (served by Express):
 
| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Checks whether the server is running |
| GET / POST | `/api/players` | Lists or creates players |
| GET / PUT | `/api/players/:id` | Reads or saves a player's progress |
| GET | `/api/missions` · `/api/missions/:id` | Lists missions or reads one mission |
| GET / POST | `/api/scores` | Reads the leaderboard or registers a score |
| GET | `/api/weather` · `/api/weather/cities` | Real-time weather (proxy of Meteomatics) · available cities |
| GET | `/api/geocode` | City search (proxy of Open-Meteo Geocoding) |
 
**Offline mode:** if the server is not reachable, the game continues to work, saving progress in the browser.
 
```
mission-stella-dev/
├── client/                  # Game front end
│   ├── index.html
│   ├── css/style.css
│   ├── assets/logo.jpg
│   └── js/
│       ├── main.js          # Entry point
│       ├── game.js          # Game engine, states, input
│       ├── map.js, player.js, npc.js     # World, character and residents
│       ├── mission.js       # Mission flow, success/failure, credits
│       ├── satellite.js     # Satellite builder (Workbench)
│       ├── minigame.js      # Four scientific challenges + launch
│       ├── shop.js, ui.js, lyra.js       # Shop, interface and guide
│       ├── nasaTips.js      # Space "Curiosities"
│       ├── weather.js       # Real-time weather in the top bar
│       ├── api.js           # Communication with the back end
│       └── i18n.js          # English / Portuguese texts
├── server/                  # Back end
│   ├── server.js            # Express server
│   ├── db.js                # JSON-file persistence
│   ├── routes/              # players, missions, scores, weather, geocode
│   ├── data/db.json         # Local data
│   ├── schema.sql, seed.sql # Historical PostgreSQL reference
│   └── .env.example         # Environment variables template
├── iniciar_jogo.bat         # Windows launcher
└── README.md
```
 
---
 
## 9. 🔒 Privacy and Safety for Young Players
 
- The game asks only for a **nickname** and a **city**. We recommend that adults supervise this step and that children do **not** use their full name.
- Progress (name, city, score, coins, items) is stored **locally**: in the browser and, when running locally, in the `db.json` file of the machine running the server. No account or e-mail is required.
- To display the weather, the **city name** is sent to the Open-Meteo geocoding service, and the **coordinates** of the city are sent to Meteomatics and BigDataCloud. No other personal information is sent. This is the same in the hosted version.
- Meteomatics credentials stay on the server and are never sent to the browser.
- The game contains no advertisements and no chat or messaging features between players.
---
 
## 10. 🏫 Classroom Use
 
Mission Stella was designed to be used in schools. The easiest way to start is to share the **[hosted version link](#-play-online-hosted-version)** with students — no installation is required. Suggested activities:
 
1. **Before playing:** ask students what satellites are used for.
2. **While playing:** each pair completes one mission and reads the "Curiosity" that appears.
3. **After playing:** discuss which sensor solved which problem and why; compare the real weather in the game's top bar with the weather outside the classroom.
4. **Extension:** explore [NASA Worldview](https://worldview.earthdata.nasa.gov/) with the students and look for the region of the Taquari Valley.
Estimated duration of a complete playthrough: *to be measured in classroom tests by the team.*
 
---
 
## 11. ⚠️ Important Notes on Content Accuracy
 
- The **community results** shown after each mission (for example, the percentage of saved crops, the number of protected residents or connected communities) are **fictional and illustrative**. They are part of the story and do not represent real measurements.
- The **mini-games are simplified simulations** inspired by NASA instruments; they are not actual scientific tools.
- Technical figures presented in the "Curiosities" are **simplified for children**. Teachers who need exact values should consult the original NASA sources.
- Weather values marked as simulated (when credentials are not configured) are **not real measurements**.
---
 
## 12. 👩‍🚀 Credits, Use of AI and License
 
- **Developed by:** **TEAM LYRA**, for the **NASA Space Apps Challenge** — Taquari Valley, Rio Grande do Sul, Brazil 🇧🇷. The concept, game design, programming, integration of the APIs, educational content and testing are the result of the team's commitment and hard work from the first idea to the final version.
- **Support from Artificial Intelligence:** AI tools were used as an additional source of support during development and documentation. All results were reviewed and validated by TEAM LYRA, who remain responsible for the project as a whole.
- **Weather data:** Meteomatics Weather & Climate API.
- **Geocoding:** Open-Meteo Geocoding API and BigDataCloud Reverse Geocoding API.
- **Inspiration and educational references:** NASA missions and programmes (Landsat, NISAR, SCaN/TDRS, GPM, FIRMS) and NASA Worldview.
- **Hosting:** the online version is hosted on Vercel.
- **License:** MIT (as declared in `server/package.json`).
> *NASA names and mission names are used for educational purposes only. This project is independent and is neither affiliated with nor endorsed by NASA.*
 
---
 
*Mission Stella — because space is not only for looking at stars. ⭐*
 