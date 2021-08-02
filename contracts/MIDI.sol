// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
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

    // mapping(uint256 => uint256) patchToDevice;
    // mapping(uint256 => address) patchToOwner;

    function createPatch(
        string memory _patchName,
        uint256 _deviceId,
        uint8[] memory _data
    )
        external
        returns (
            // bytes calldata _data,
            // bytes memory _data
            uint256
        )
    {
        // console.log(_data);
        // console.log("hello world", string(_data));
        require(
            devices.length > 0 && (devices.length - 1 >= _deviceId),
            "No Device ID found"
        );
        _patchIds.increment();
        uint256 newPatchId = _patchIds.current();
        _safeMint(msg.sender, newPatchId);

        // patches.push(Patch(_data, _patchName, _deviceId));
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
        // require(patches[_tokenId].isPublic || ownerOf(_tokenId) == msg.sender);
        // return patches[_tokenId];
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

    // function getPatchesByDeviceId(uint256 _deviceId)
    //     public
    //     view
    //     returns (Patch[] memory)
    // {
    //     Patch[] memory devicePatches;
    //     uint256 counter = 0;
    //     for (uint256 i = 0; i < patches.length; i++) {
    //         if (patches[i].deviceId == _deviceId) {
    //             devicePatches[counter] = patches[i];
    //             counter++;
    //         }
    //     }
    //     return devicePatches;
    // }

    // function getPatchesByOwner(address _owner)
    //     external
    //     view
    //     returns (uint256[] memory)
    // {
    //     uint256[] memory result = new uint256[](balanceOf(_owner));
    //     uint256 counter = 0;
    //     for (uint256 i = 1; i < patches.length; i++) {
    //         if (ownerOf(i) == _owner) {
    //             result[counter] = i;
    //             counter++;
    //         }
    //     }
    //     return result;
    // }

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

    // function setPatchVisibility(uint256 _tokenId, bool _isPublic) public {
    //     require(ownerOf(_tokenId) == msg.sender);
    //     patches[_tokenId].isPublic = _isPublic;
    // }

    function getDevices() public view returns (Device[] memory) {
        return devices;
    }

    // function transfer(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) public {
    //     safeTransferFrom(from, to, tokenId);
    // }
}
