import { expect } from 'chai';
import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";

describe("MIDI", function () {
    let accounts: Signer[];
    const MANUFACTURER = 'Yamaha'; // example manufacturer
    const DEVICE = 'TG-33'; // example device
    const midiData = [240, 1, 40, 96, 0, 36, 25, 0, 16, 73, 6, 0, 6, 4, 20, 89, 5, 32, 80, 6, 6, 0, 0, 0, 0, 1, 120, 60, 20, 0, 96, 6, 2, 124, 1, 0, 120, 1, 0, 0, 80, 96, 125, 33, 64, 0, 0, 64, 1, 0, 80, 124, 0, 1, 0, 0, 0, 0, 0, 0, 121, 72, 0, 0, 64, 97, 118, 39, 0, 1, 127, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 41, 0, 63, 0, 124, 1, 96, 15, 40, 0, 127, 0, 120, 3, 64, 31, 10, 0, 126, 0, 112, 7, 0, 0, 0, 0, 0, 0, 24, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 66, 112, 8, 60, 61, 6, 1, 64, 32, 16, 8, 8, 4, 2, 1, 64, 32, 16, 0, 8, 4, 2, 0, 64, 0, 16, 247];

    before(async function () {
        this.MIDI = await ethers.getContractFactory('MIDI');
        this.MIDIMarket = await ethers.getContractFactory('MIDIMarket');
    });

    beforeEach(async function () {
        this.midiMarket = await this.MIDIMarket.deploy();
        // console.log('midi mark etis: ', this.midiMarket);
        await this.midiMarket.deployed();

        this.midi = await this.MIDI.deploy(this.midiMarket.address);
        await this.midi.deployed();
        accounts = await ethers.getSigners();
    });

    it("should update the contract address", async function() {
        const randomWallet = ethers.Wallet.createRandom();
        const randomAddress = await randomWallet.getAddress();
        await this.midi.setContractAddress(randomAddress);
        const getAddress = await this.midi.getMarketContractAddress();

        expect(getAddress).to.eq(randomAddress);
    });

    it("should fail updating the contract address from non-owner", async function() {
        const randomWallet = ethers.Wallet.createRandom();
        const randomAddress = await randomWallet.getAddress();
        const [_, addr2] = await ethers.getSigners();
        expect(this.midi.connect(addr2).setContractAddress(randomAddress)).to.be.revertedWith("caller is not the owner");
    });

    it("should create a new device", async function () {
        const tx = await this.midi.createDevice(MANUFACTURER, DEVICE);
        await tx.wait();
        const devices = await this.midi.getDevices();
        expect(devices.length).gt(0);
    });

    it("should fetch patch count for device", async function () {
        const device1 = await this.midi.createDevice(MANUFACTURER, DEVICE);
        await device1.wait();

        const device2 = await this.midi.createDevice("Roland", "D50");
        await device2.wait();

        // create patches
        const createPatch1 = await this.midi.createPatch("Yamaha Patch 1", 0, midiData);
        await createPatch1.wait();
        const createPatch2 = await this.midi.createPatch("Yamaha Patch 2", 0, midiData);
        await createPatch2.wait();
        const createPatch3 = await this.midi.createPatch("Roland Patch 1", 1, midiData);
        await createPatch3.wait();

        const yamahaCount = await this.midi.getDevicePatchCount(0);
        const rolandCount = await this.midi.getDevicePatchCount(1);
        expect(yamahaCount.toNumber()).to.eq(2);
        expect(rolandCount.toNumber()).to.eq(1);
    });

    it("should fail creating a patch due to no devices", async function () {
        expect(this.midi.createPatch("Test Patch", 0, midiData)).to.be.revertedWith("No Device ID found");
    });

    it("should create a patch", async function () {
        // create device
        const tx = await this.midi.createDevice(MANUFACTURER, DEVICE);
        await tx.wait();

        // create patch
        const createPatch = await this.midi.createPatch("Test Patch", 0, midiData);
        await createPatch.wait();

        // fetch balance
        const balance = await this.midi.balanceOf(await accounts[0].getAddress());
        expect(balance).eq(1);
    });

    it("should fetch patch by owner", async function () {
        // setup addresses
        const [owner, addr2] = await ethers.getSigners();
        const ownerAddress = await owner.getAddress();
        const user2Address = await addr2.getAddress();

        // create device
        const tx = await this.midi.createDevice(MANUFACTURER, DEVICE);
        await tx.wait();

        // create patch 1
        const createPatch1 = await this.midi.createPatch("Owner Patch 1", 0, midiData);
        await createPatch1.wait();

        // create user 1 second address
        const createPatch2 = await this.midi.connect(addr2).createPatch("User 2 Patch 1", 0, midiData);
        await createPatch2.wait();

        // create owner patch 2
        const createPatch3 = await this.midi.connect(owner).createPatch("Owner Patch 2", 0, midiData);
        await createPatch3.wait();

        // owner should have tokens 0 and 2
        const user1PatchIds = await this.midi.getPatchesByOwner(ownerAddress);
        const user2PatchIds = await this.midi.getPatchesByOwner(user2Address);
        expect(user1PatchIds.length).to.eq(2);
        expect(user1PatchIds.map((id: BigNumber) => id.toNumber())).to.include(1).and.to.include(3);

        // user 2 should have tokens 1
        expect(user2PatchIds.length).to.eq(1);
        expect(user2PatchIds.map((id: BigNumber) => id.toNumber())).to.include(2);
    });

    it("should mint and transfer MIDI patch to different account", async function () {
        // setup addresses
        const [owner, user2] = await ethers.getSigners();
        const ownerAddress = await owner.getAddress();
        const user2Address = await user2.getAddress();

        // create device
        const tx = await this.midi.createDevice(MANUFACTURER, DEVICE);
        await tx.wait();

        // create patch
        const createPatch = await this.midi.createPatch("Test Patch", 0, midiData);
        await createPatch.wait();

        let ownerPatchIds = await this.midi.getPatchesByOwner(ownerAddress);

        // send patch
        const sendTx = await this.midi['safeTransferFrom(address,address,uint256)'](ownerAddress, user2Address, ownerPatchIds[0]);
        await sendTx.wait();

        ownerPatchIds = await this.midi.getPatchesByOwner(ownerAddress);
        const user2PatchIds = await this.midi.getPatchesByOwner(user2Address);

        expect(ownerPatchIds.length).to.eq(0);
        expect(user2PatchIds.length).to.eq(1);
        expect(user2PatchIds.map((id: BigNumber) => id.toNumber())).to.include(1);
    });

    it("should fetch patch MIDI data", async function() {
        // create device
        const tx = await this.midi.createDevice(MANUFACTURER, DEVICE);
        await tx.wait();

        // create patch
        const createPatch = await this.midi.createPatch("Test Patch", 0, midiData);
        await createPatch.wait();

        // fetch patch
        const fetchPatch = await this.midi.fetchPatch(1);
        const _midiData = fetchPatch[0];
        const test = Uint8Array.from(_midiData);
        expect(String(fetchPatch.data)).to.eq(String(midiData));
    });
});