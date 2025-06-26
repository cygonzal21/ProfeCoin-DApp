// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Counters.sol ya no se necesita, se elimina la importacion.

contract LogroNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    // NUEVO: Un mapping para almacenar la URI de cada token.
    // Asocia un tokenId (uint256) con su URI (string).
    mapping(uint256 => string) private _tokenURIs;

    event LogroNFTContractCreated(address indexed owner, uint256 timestamp);
    event AchievementAwarded(address indexed student, uint256 indexed tokenId, string tokenURI);

    constructor(address initialOwner)
        ERC721("Logros ProfeCoin", "LOGRO")
        Ownable(initialOwner)
    {
        emit LogroNFTContractCreated(initialOwner, block.timestamp);
    }

    function awardAchievement(address student, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        // En lugar de llamar a _setTokenURI, ahora guardamos la URI en nuestro mapping.
        _tokenURIs[tokenId] = tokenURI;

        _safeMint(student, tokenId);
        emit AchievementAwarded(student, tokenId, tokenURI);

        return tokenId;
    }

    /**
    * @dev Permite al owner actualizar la URI de metadatos de un NFT existente.
    * Útil para corregir enlaces rotos o para implementar NFTs "evolutivos".
    */
    function updateAchievementURI(uint256 tokenId, string memory newTokenURI) public onlyOwner {
    // _requireOwned es una funcion interna de ERC721 que verifica si el token existe.
    // Si no existe, la transaccion fallara, lo cual es el comportamiento deseado.
    _requireOwned(tokenId);
    
    // Actualizamos el valor en nuestro mapping.
    _tokenURIs[tokenId] = newTokenURI;
    }

    // NUEVO y CRUCIAL: Sobrescribimos la funcion tokenURI.
    // Esta funcion es la que las DApps y exploradores llaman para obtener los metadatos de un NFT.
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        // Verificamos que el token exista.
        _requireOwned(tokenId);
        // Devolvemos la URI que guardamos en nuestro mapping.
        return _tokenURIs[tokenId];
    }
}