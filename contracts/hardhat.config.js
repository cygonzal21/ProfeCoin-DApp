require("@nomicfoundation/hardhat-toolbox");

// NOTA: Para desplegar, necesitamos una cuenta con fondos.
// El quickstart de Quorum genera una cuenta pre-financiada.
// Su clave privada es:
// 0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63
// Esta es una clave de DESARROLLO, NUNCA la uses en una red real.
const DEPLOYER_PRIVATE_KEY = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    // Red para desarrollo y pruebas rápidas en memoria
    hardhat: {},
    // Nuestra red privada de Besu (ProfeCoin)
    profeNet: {
      url: "http://localhost:8545", // El endpoint del nodo RPC que expusimos
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 1337 // El Chain ID de nuestra red
    },
  },
};