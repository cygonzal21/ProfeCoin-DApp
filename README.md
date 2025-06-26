# Proyecto ProfeCoin

Una aplicación descentralizada (DApp) para incentivos académicos, construida sobre una red privada Hyperledger Besu. El sistema permite a los docentes recompensar la participación de los estudiantes con tokens fungibles (PFC - ERC-20) y logros especiales como NFTs (ERC-721).

## Arquitectura

El proyecto se compone de tres partes principales:
*   **Contratos Inteligentes:** Desarrollados con Hardhat y Solidity, implementando los estándares ERC-20 y ERC-721.
*   **Backend:** Un servidor Node.js con Express que expone una API REST para interactuar de forma segura con la blockchain.
*   **Frontend:** Una interfaz de usuario simple construida con HTML y JavaScript puro para administrar y consultar el sistema.

La infraestructura de la blockchain se despliega con Docker y Hyperledger Besu, usando el [Quorum-Dev-Quickstart](https://github.com/ConsenSys/quorum-dev-quickstart).

## Guía de Instalación y Ejecución

### Prerrequisitos
- Docker y Docker Compose
- Node.js y npm

### 1. Desplegar la Red Blockchain
Sigue las instrucciones del `quorum-dev-quickstart` para generar y lanzar una red Besu sin privacidad.
```bash
git clone https://github.com/ConsenSys/quorum-dev-quickstart.git
cd quorum-dev-quickstart
npm install
npm start -- --clientType besu --privacy false
cd quorum-test-network
docker compose up -d

### 2. Desplegar los Contratos Inteligentes
cd contracts
npm install
npx hardhat compile
# Apunta a la red Besu local para desplegar
npx hardhat run scripts/deploy.js --network profeNet 

###3. Configurar y Ejecutar el Backend
cd backend
npm install
# Copia la plantilla de entorno
cp .env.example .env 
# Inicia el servidor backend
node index.js

### 4. Lanzar el Frontend
cd frontend
# Instala un servidor web estático si no lo tienes
npm install -g serve
# Sirve la carpeta en el puerto 3001
serve -p 3001 
