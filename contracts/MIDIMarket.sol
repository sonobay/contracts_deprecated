// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract MIDIMarket is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    address payable wallet;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    uint256 marketSalesFee = 200; // basis points -- this represents 2% -- 100.00% is 10000
    uint256 minListingPrice = .01 ether;
    // Escrow escrow;

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address payable seller,
        address payable owner,
        uint256 price,
        bool sold
    );

    constructor() {
        wallet = payable(owner());
    }

    function getMarketSalesFee() external view returns (uint256) {
        return marketSalesFee;
    }

    function setMarketSalesFee(uint256 _fee) external onlyOwner {
        marketSalesFee = _fee;
    }

    function getMinListingPrice() external view returns (uint256) {
        return minListingPrice;
    }

    function setMinListingPrice(uint256 _listingPrice) external onlyOwner {
        minListingPrice = _listingPrice;
    }

    function setWallet(address _address) external onlyOwner {
        wallet = payable(_address);
    }

    function createMarketItem(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant {
        require(_price > minListingPrice, "Listing price too low");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            _nftContract,
            _tokenId,
            payable(msg.sender),
            payable(address(0)),
            _price,
            false
        );

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        emit MarketItemCreated(
            itemId,
            _nftContract,
            _tokenId,
            payable(msg.sender),
            payable(address(0)),
            _price,
            false
        );
    }

    function createMarketSale(address _nftContract, uint256 _itemId)
        external
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[_itemId].price;

        require(msg.value == price, "Please submit the correct price");

        uint256 tokenId = idToMarketItem[_itemId].tokenId;
        uint256 feeAmount = (price * marketSalesFee) / 10000;

        idToMarketItem[_itemId].seller.transfer(price - feeAmount);
        wallet.transfer(feeAmount);

        IERC721(_nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[_itemId].owner = payable(msg.sender);
        idToMarketItem[_itemId].sold = true;
        _itemsSold.increment();
    }
}
