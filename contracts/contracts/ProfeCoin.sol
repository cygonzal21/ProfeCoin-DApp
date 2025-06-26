// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProfeCoin
 * @dev Token ERC-20 para incentivar la participacion de estudiantes.
 * La cuenta que despliega el contrato (la profesora) sera la owner y
 * podra acunar (mint) nuevos tokens para distribuirlos.
 */
contract ProfeCoin is ERC20, Ownable {
    // --- PASO 1: DECLARAR EL EVENTO ---
    // Este evento se emitira una vez, cuando el contrato se cree.
    // Indexamos 'owner' para que sea mas facil buscar eventos por el creador.

    event ProfeCoinContractCreated(address indexed owner, uint256 timestamp);

    /**
     * @dev Constructor que establece el nombre y simbolo del token.
     * La profesora (owner) recibe un suministro inicial de 0 tokens.
     */
     constructor(address initialOwner)
        ERC20("ProfeCoin", "PFC")
        Ownable(initialOwner)

    {
        // --- PASO 2: EMITIR EL EVENTO ---
        // Emitimos el evento con la direccion del dueno y la marca de tiempo del bloque.

        emit ProfeCoinContractCreated(initialOwner, block.timestamp);
    }

    /**
     * @dev Permite al owner acunar una cantidad especifica de tokens
     * y asignarlos a una cuenta (un estudiante).
     * Solo la profesora puede llamar a esta funcion.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}