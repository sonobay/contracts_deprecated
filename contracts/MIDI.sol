// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

/// @title Tradeable MIDI data token
/// @author Stuart Kuentzel
contract MIDI is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _patchIds;
    Counters.Counter private _deviceIds;

    struct Patch {
        uint8[] data;
        string patchName;
        uint256 deviceId;
    }

    struct Device {
        string manufacturer;
        string deviceName;
    }

    Device[] public devices;
    address marketContractAddress;

    mapping(uint256 => Patch) tokenIdToPatch;
    mapping(uint256 => uint256) devicePatchCount;

    constructor(address marketPlaceAddress) ERC721("MIDI Token", "MIDI") {
        marketContractAddress = marketPlaceAddress;
    }

    function setContractAddress(address _address) external onlyOwner {
        marketContractAddress = _address;
    }

    function getMarketContractAddress() public view returns (address) {
        return marketContractAddress;
    }

    function createPatch(
        string memory _patchName,
        uint256 _deviceId,
        uint8[] memory _data
    ) external returns (uint256) {
        require(
            devices.length > 0 && (devices.length - 1 >= _deviceId),
            "No Device ID found"
        );
        _patchIds.increment();
        uint256 newPatchId = _patchIds.current();
        _safeMint(msg.sender, newPatchId);

        tokenIdToPatch[newPatchId] = Patch(_data, _patchName, _deviceId);
        devicePatchCount[_deviceId]++;

        setApprovalForAll(marketContractAddress, true);
        return newPatchId;
    }

    function createDevice(
        string memory _manufacturer,
        string memory _deviceName
    ) external returns (uint256) {
        devices.push(Device(_manufacturer, _deviceName));
        _deviceIds.increment();
        uint256 newDeviceId = _deviceIds.current();
        return newDeviceId;
    }

    function fetchPatch(uint256 _tokenId) public view returns (Patch memory) {
        return tokenIdToPatch[_tokenId];
    }

    function getPatchIdsByDeviceId(uint256 _deviceId)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory results = new uint256[](devicePatchCount[_deviceId]);
        uint256 counter = 0;
        for (uint256 i = 0; i < totalSupply(); i++) {
            uint256 tokenId = tokenByIndex(i);
            Patch memory patch = tokenIdToPatch[tokenId];
            if (patch.deviceId == _deviceId) {
                results[counter] = tokenId;
            }
        }
        return results;
    }

    function getDevicePatchCount(uint256 _deviceId)
        public
        view
        returns (uint256)
    {
        return devicePatchCount[_deviceId];
    }

    function getPatchesByOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 balance = balanceOf(_owner);
        uint256[] memory result = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            result[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return result;
    }

    function getPatchDataByIds(uint256[] memory _tokenIds)
        public
        view
        returns (uint8[][] memory)
    {
        uint8[][] memory results = new uint8[][](_tokenIds.length);

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            Patch memory patch = tokenIdToPatch[_tokenIds[i]];
            results[i] = patch.data;
        }

        return results;
    }

    function getDevices() public view returns (Device[] memory) {
        return devices;
    }
}
