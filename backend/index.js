// --- 1. Importaciones ---
// Importamos la libreria Express para crear nuestro servidor.
const express = require('express');
const cors = require('cors');

// Importamos 'dotenv' y lo configuramos para que cargue
// las variables de nuestro archivo .env en process.env.
require('dotenv').config();

// Importamos 'ethers' aqui tambien para poder usar sus utilidades como 'formatUnits'
const { ethers } = require('ethers'); 

// Importamos nuestro modulo de conexion. Al hacer esto, el codigo en 
// connection.js se ejecutara una vez, estableciendo la conexion al arrancar.
const { provider } = require('./blockchain/connection');

//Importamos ambos ocntratos
const { profeCoinContract, logroNFTContract } = require('./blockchain/contracts');

// --- 2. Inicializacion de la Aplicacion Express ---
const app = express();

// --- MIDDLEWARES ---

// 2.1. Habilitamos CORS con una configuración explícita.
// Esto debe ir primero para manejar las peticiones de pre-vuelo (OPTIONS) del navegador.
const corsOptions = {
  // Permitimos peticiones SÓLO desde el origen donde corre nuestro frontend.
  origin: 'http://localhost:3001', 
  optionsSuccessStatus: 200 // Para compatibilidad
};
app.use(cors(corsOptions));

// 2.2. Habilitamos el parsing de cuerpos de petición en formato JSON.
// Esto nos permite leer los datos enviados en peticiones POST, PUT, etc. (req.body).
app.use(express.json());


// --- CONFIGURACIÓN DEL SERVIDOR ---
const PORT = process.env.PORT || 8080; // Usaremos 8080 para el backend como habíamos definido.

    

// --- 3. Definicion de una Ruta de Prueba ---
// Creamos un "endpoint" o ruta de prueba en la raiz ('/').
// Cuando alguien haga una peticion GET a http://localhost:3000/,
// este codigo se ejecutara.
app.get('/', (req, res) => {
  // req: objeto de la peticion (request)
  // res: objeto de la respuesta (response)
  
  // Enviamos una respuesta simple en formato JSON.
  res.json({
    message: "El servidor del proyecto ProfeCoin esta funcionando",
    status: "OK"
  });
});

// NUEVA RUTA: Endpoint para obtener el estado de la red
app.get('/api/status-red', async (req, res) => {
  try {
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    const feeData = await provider.getFeeData();

    res.json({
      status: "Conectado",
      chainId: chainId.toString(),
      ultimoBloque: blockNumber.toString(),
      precioGas: ethers.formatUnits(feeData.gasPrice, "gwei") + " Gwei"
    });

  } catch (error) {
    console.error("Error al obtener el estado de la red:", error);
    res.status(500).json({
      status: "Error",
      message: "No se pudo conectar con la red de Besu."
    });
  }
});

// NUEVA RUTA: Endpoint para leer datos del contrato ProfeCoin
app.get('/api/profecoin/total-supply', async (req, res) => {
  try {
    // Llamamos a una funcion de solo lectura del contrato ERC20: totalSupply()
    // Esta funcion nos devuelve cuantos tokens PFC existen en total.
    const totalSupply = await profeCoinContract.totalSupply();

    // El resultado es un BigInt, lo formateamos a un string legible.
    // Como PFC tiene 18 decimales (estandar ERC20), usamos formatUnits.
    const formattedTotalSupply = ethers.formatUnits(totalSupply, 18);

    res.json({
      totalSupply: formattedTotalSupply,
      totalSupplyRaw: totalSupply.toString() // Tambien devolvemos el valor en bruto
    });
  } catch (error) {
    console.error("Error al obtener el total supply de ProfeCoin:", error);
    res.status(500).json({ status: "Error", message: "No se pudo interactuar con el contrato ProfeCoin." });
  }
});

// NUEVA RUTA DE ESCRITURA: Endpoint para acuñar nuevos tokens PFC
app.post('/api/profecoin/mint', async (req, res) => {
  // 1. Extraemos los datos del cuerpo de la peticion.
  // Esperamos recibir un JSON como: { "to": "0x...", "amount": "100" }
  const { to, amount } = req.body;

  // 2. Validamos los datos de entrada.
  if (!to || !amount) {
    return res.status(400).json({ status: "Error", message: "Faltan los parametros 'to' o 'amount'." });
  }

  try {
    console.log(`Peticion para acunar ${amount} PFC para la direccion ${to}`);

    // 3. Convertimos la cantidad al formato correcto.
    // Los contratos de Solidity trabajan con la unidad mas pequena (wei), no con ether.
    // Si nos pasan "100", debemos convertirlo a 100 con 18 ceros.
    const amountInWei = ethers.parseUnits(amount, 18);

    // 4. Ejecutamos la transaccion de escritura.
    // Llamamos a la funcion 'mint' de nuestro contrato.
    // Como 'profeCoinContract' fue inicializado con 'adminWallet',
    // ethers.js se encargara automaticamente de firmar la transaccion.
    console.log("Enviando transaccion a la blockchain...");
    const tx = await profeCoinContract.mint(to, amountInWei);

    // 5. Esperamos la confirmacion de la transaccion.
    // Es una buena practica esperar a que la transaccion sea minada en un bloque.
    console.log(`Transaccion enviada. Hash: ${tx.hash}. Esperando confirmacion...`);
    const receipt = await tx.wait();
    console.log(`Transaccion confirmada en el bloque numero: ${receipt.blockNumber}`);

    // 6. Enviamos una respuesta de exito.
    res.json({
      status: "Exito",
      message: `${amount} PFC acunados exitosamente para ${to}.`,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error("Error al acunar tokens:", error);
    res.status(500).json({ status: "Error", message: "Ocurrio un error en el servidor al procesar la transaccion." });
  }
});

// NUEVA RUTA: Endpoint para consultar el saldo de PFC de una direccion especifica
app.get('/api/profecoin/balance/:address', async (req, res) => {
  try {
    // 1. Obtenemos la direccion de los parametros de la URL.
    const addressToCheck = req.params.address;

    // 2. Verificamos que la dirección sea válida (opcional pero recomendado).
    if (!ethers.isAddress(addressToCheck)) {
      return res.status(400).json({ status: "Error", message: "La direccion proporcionada no es valida." });
    }

    // 3. Llamamos a la funcion 'balanceOf' de nuestro contrato.
    // Esta es una funcion estandar del ERC-20.
    const balance = await profeCoinContract.balanceOf(addressToCheck);

    // 4. Formateamos la respuesta para que sea legible.
    const formattedBalance = ethers.formatUnits(balance, 18);

    res.json({
      address: addressToCheck,
      balance: formattedBalance,
      balanceRaw: balance.toString()
    });

  } catch (error) {
    console.error(`Error al obtener el saldo para ${req.params.address}:`, error);
    res.status(500).json({ status: "Error", message: "Ocurrio un error en el servidor." });
  }
});

// NUEVA RUTA DE ESCRITURA: Endpoint para otorgar un logro NFT
app.post('/api/logronft/award', async (req, res) => {
  // 1. Extraemos los datos del cuerpo de la peticion.
  // Esperamos un JSON como: { "student": "0x...", "tokenURI": "https://..." }
  const { student, tokenURI } = req.body;

  // 2. Validamos los datos de entrada.
  if (!student || !tokenURI) {
    return res.status(400).json({ status: "Error", message: "Faltan los parametros 'student' o 'tokenURI'." });
  }
  if (!ethers.isAddress(student)) {
    return res.status(400).json({ status: "Error", message: "La direccion del estudiante no es valida." });
  }

  try {
    console.log(`Peticion para otorgar un logro a ${student} con URI: ${tokenURI}`);

    // 3. Ejecutamos la transaccion de escritura en el contrato LogroNFT.
    // Llamamos a la funcion 'awardAchievement' con los datos proporcionados.
    // ethers.js usara la 'adminWallet' para firmar la transaccion.
    console.log("Enviando transaccion para otorgar NFT...");
    const tx = await logroNFTContract.awardAchievement(student, tokenURI);

    // 4. Esperamos la confirmacion de la transaccion.
    console.log(`Transaccion enviada. Hash: ${tx.hash}. Esperando confirmacion...`);
    const receipt = await tx.wait();

    // El evento 'AchievementAwarded' que creamos en el contrato nos da el tokenId.
    // Buscamos en los logs del recibo para encontrarlo.
    const awardedEvent = receipt.logs.find(e => e.fragment && e.fragment.name === 'AchievementAwarded');
    const tokenId = awardedEvent ? awardedEvent.args.tokenId.toString() : "No se pudo determinar";
    
    console.log(`Transaccion confirmada en el bloque: ${receipt.blockNumber}. Token ID: ${tokenId}`);

    // 5. Enviamos una respuesta de exito.
    res.json({
      status: "Exito",
      message: `Logro NFT (ID: ${tokenId}) otorgado exitosamente a ${student}.`,
      transactionHash: tx.hash,
      tokenId: tokenId
    });

  } catch (error) {
    console.error("Error al otorgar el logro NFT:", error);
    res.status(500).json({ status: "Error", message: "Ocurrio un error en el servidor al procesar la transaccion." });
  }
});

// NUEVA RUTA: Endpoint para consultar cuantos NFTs de logro tiene una direccion
app.get('/api/logronft/balance/:address', async (req, res) => {
  try {
    const addressToCheck = req.params.address;
    if (!ethers.isAddress(addressToCheck)) {
      return res.status(400).json({ status: "Error", message: "La direccion proporcionada no es valida." });
    }

    // Llamamos a la funcion 'balanceOf' del contrato ERC-721.
    const balance = await logroNFTContract.balanceOf(addressToCheck);

    res.json({
      address: addressToCheck,
      nftCount: balance.toString() // El balance de NFTs no tiene decimales
    });

  } catch (error) {
    console.error(`Error al obtener el balance de NFTs para ${req.params.address}:`, error);
    res.status(500).json({ status: "Error", message: "Ocurrio un error en el servidor." });
  }
});


// NUEVA RUTA: Endpoint para consultar quien es el dueno de un NFT especifico
app.get('/api/logronft/owner/:tokenId', async (req, res) => {
  try {
    const tokenId = req.params.tokenId;

    // Llamamos a la funcion 'ownerOf' del contrato ERC-721.
    const ownerAddress = await logroNFTContract.ownerOf(tokenId);

    res.json({
      tokenId: tokenId,
      owner: ownerAddress
    });

  } catch (error) {
    // Este error es comun si se consulta un tokenId que no existe
    console.error(`Error al obtener el dueño del tokenId ${req.params.tokenId}:`, error);
    res.status(500).json({ status: "Error", message: `No se pudo encontrar el dueño del Token ID ${req.params.tokenId}. ¿Estas seguro de que existe?` });
  }
});

// NUEVA RUTA DE ACTUALIZACION: Endpoint para actualizar la URI de un NFT
app.put('/api/logronft/update/:tokenId', async (req, res) => {
  // Usamos PUT porque es el metodo HTTP estandar para actualizar un recurso existente.
  
  const { tokenId } = req.params;
  const { newTokenURI } = req.body;

  if (!newTokenURI) {
    return res.status(400).json({ status: "Error", message: "Falta el parametro 'newTokenURI' en el cuerpo de la peticion." });
  }

  try {
    console.log(`Peticion para actualizar la URI del Token ID ${tokenId} a: ${newTokenURI}`);

    // Llamamos a la nueva funcion 'updateAchievementURI' de nuestro contrato.
    const tx = await logroNFTContract.updateAchievementURI(tokenId, newTokenURI);

    console.log(`Transaccion enviada. Hash: ${tx.hash}. Esperando confirmacion...`);
    await tx.wait();
    console.log(`URI del Token ID ${tokenId} actualizada exitosamente.`);

    res.json({
      status: "Éxito",
      message: `La URI del Token ID ${tokenId} ha sido actualizada.`,
      transactionHash: tx.hash
    });

  } catch (error) {
    console.error(`Error al actualizar la URI del NFT ${tokenId}:`, error);
    res.status(500).json({ status: "Error", message: "Ocurrio un error al procesar la transaccion de actualizacion." });
  }
});

// --- 4. Iniciar el Servidor ---
// Le decimos a nuestra aplicacion que empiece a escuchar peticiones
// en el puerto que definimos.
app.listen(PORT, () => {
  // Este mensaje se mostrara en nuestra terminal una vez que el servidor
  // se haya iniciado correctamente.
  console.log(`Servidor ProfeCoin corriendo en el puerto ${PORT}`);
});