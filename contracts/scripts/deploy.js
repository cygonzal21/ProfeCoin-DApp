// Importamos ethers desde Hardhat, que nos permite interactuar con la blockchain.
const { ethers } = require("hardhat");

async function main() {
  // Obtenemos la cuenta que va a desplegar los contratos.
  // Hardhat la toma de la `privateKey` que definimos en hardhat.config.js.
  const [deployer] = await ethers.getSigners();

  console.log(
    "Desplegando contratos con la cuenta:",
    deployer.address
  );

  // --- 1. Despliegue del contrato ProfeCoin (ERC-20) ---
  console.log("Obteniendo el factory para ProfeCoin...");
  const ProfeCoin = await ethers.getContractFactory("ProfeCoin");
  
  console.log("Desplegando ProfeCoin...");
  // Llamamos a deploy() y le pasamos la direccion del 'initialOwner'
  // que requiere nuestro constructor. Usaremos la misma cuenta del desplegador.
  const profeCoin = await ProfeCoin.deploy(deployer.address);
  
  // Esperamos a que la transaccion de despliegue sea minada y confirmada.
  await profeCoin.waitForDeployment();
  
  // Obtenemos la direccion del contrato recien desplegado.
  const profeCoinAddress = await profeCoin.getAddress();
  console.log(`Contrato ProfeCoin (PFC) desplegado en: ${profeCoinAddress}`);

  // --- 2. Despliegue del contrato LogroNFT (ERC-721) ---
  console.log("\nObteniendo el factory para LogroNFT...");
  const LogroNFT = await ethers.getContractFactory("LogroNFT");
  
  console.log("Desplegando LogroNFT...");
  // Hacemos lo mismo para el contrato de NFTs.
  const logroNFT = await LogroNFT.deploy(deployer.address);
  
  // Esperamos a que se confirme el despliegue.
  await logroNFT.waitForDeployment();
  
  const logroNFTAddress = await logroNFT.getAddress();
  console.log(`Contrato LogroNFT (LOGRO) desplegado en: ${logroNFTAddress}`);
}

// Patron estandar para ejecutar nuestro script y manejar errores.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });