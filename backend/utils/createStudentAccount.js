const { ethers } = require('ethers');

// Esta funcion crea una nueva cartera de Ethereum de forma aleatoria.
function createNewStudent() {
  const wallet = ethers.Wallet.createRandom();

  console.log("Nueva cuenta de estudiante generada con exito!");
  console.log("-----------------------------------------------");
  console.log("Guarda estos datos de forma segura. La clave privada es un secreto!");
  console.log("");
  console.log("📚 Direccion del Estudiante (para enviar PFC):");
  console.log(wallet.address);
  console.log("");
  console.log("🔑 Clave Privada del Estudiante (SECRETO!):");
  console.log(wallet.privateKey);
  console.log("");
  console.log("🧠 Frase Mnemonica del Estudiante (Frase de recuperacion, ¡SECRETO!):");
  console.log(wallet.mnemonic.phrase);
  console.log("-----------------------------------------------");
}

// Ejecutamos la funcin.
createNewStudent();