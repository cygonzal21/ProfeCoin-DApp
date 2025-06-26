const { ethers } = require('ethers');
require('dotenv').config();

// Importamos la conexion (provider) y la cartera (wallet) que ya creamos.
const { provider, adminWallet } = require('./connection');

// Importamos las ABIs que acabamos de copiar.
const profeCoinABI = require('../abi/ProfeCoin.json').abi;
const logroNFTABI = require('../abi/LogroNFT.json').abi;

// Obtenemos las direcciones de los contratos desde las variables de entorno.
const profeCoinAddress = process.env.PROFECOIN_CONTRACT_ADDRESS;
const logroNFTAddress = process.env.LOGRONFT_CONTRACT_ADDRESS;

// --- Creacion de las Instancias de los Contratos ---

// Creamos un objeto para interactuar con el contrato ProfeCoin.
// Necesita 3 cosas: la direccion, la ABI (el manual) y un "conector" (provider o wallet).
// Conectandolo a 'adminWallet', este objeto podra tanto leer datos como ENVIAR transacciones.
const profeCoinContract = new ethers.Contract(profeCoinAddress, profeCoinABI, adminWallet);

// Hacemos lo mismo para el contrato LogroNFT.
const logroNFTContract = new ethers.Contract(logroNFTAddress, logroNFTABI, adminWallet);

console.log(" Contratos inteligentes cargados y listos para interactuar.");
console.log(`   - ProfeCoin (PFC) en: ${profeCoinAddress}`);
console.log(`   - LogroNFT (LOGRO) en: ${logroNFTAddress}`);

// Exportamos las instancias de los contratos para usarlas en nuestra API.
module.exports = {
  profeCoinContract,
  logroNFTContract,
};