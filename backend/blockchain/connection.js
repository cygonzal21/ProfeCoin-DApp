// Importamos la libreria ethers
const { ethers } = require('ethers');

// Cargamos las variables de entorno desde el archivo .env
require('dotenv').config();

// --- Conexion al Provider (Lectura de la Blockchain) ---

// Obtenemos la URL de nuestro nodo RPC de Besu desde las variables de entorno.
const besuRpcUrl = process.env.BESU_RPC_URL;

// Verificamos que la variable de entorno exista para evitar errores.
if (!besuRpcUrl) {
  throw new Error("La variable de entorno BESU_RPC_URL no esta definida en el archivo .env");
}

// Creamos el "Provider". Este objeto es nuestra conexion de solo lectura a la blockchain.
// Usamos JsonRpcProvider porque nos conectamos a un nodo a traves de JSON-RPC (HTTP).
const provider = new ethers.JsonRpcProvider(besuRpcUrl);

console.log(" Conectado al nodo RPC de Besu en:", besuRpcUrl);


// --- Creacion del Signer/Wallet (Escritura en la Blockchain) ---

// Para ENVIAR transacciones que modifican el estado (como acunar tokens),
// necesitamos una "cartera" que pueda firmar digitalmente esas transacciones.

// Obtenemos la clave privada de la cuenta administradora.
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

// Verificamos que la clave exista.
if (!adminPrivateKey) {
  throw new Error("La variable de entorno ADMIN_PRIVATE_KEY no esta definida en el archivo .env");
}

// Creamos una instancia de Wallet. Esta representa nuestra cuenta administradora
// y la conectamos a nuestro provider. Ahora esta cartera puede tanto leer datos
// como firmar y enviar transacciones a nuestra red Besu.
const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

console.log(" Cartera de administrador cargada para la direccion:", adminWallet.address);


// --- Exportacion de los Modulos ---

// Exportamos el provider y la cartera para poder usarlos en otras partes
// de nuestra aplicacion (como en los endpoints de nuestra API).
module.exports = {
  provider,
  adminWallet,
};