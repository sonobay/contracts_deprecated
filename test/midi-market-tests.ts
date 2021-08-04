import { expect } from 'chai';
import { ethers } from "hardhat";
import { BigNumber, Signer } from "ethers";

describe("MIDI Marketplace", function () {
    let accounts: Signer[];
    const MARKET_SALES_FEE = 200;
    const MIN_LISTING_PRICE_ETHER = 0.01;
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

    it("should fail updating marketSalesFee from non-owner", async function () {
        const [_, addr2] = await ethers.getSigners();
        expect(this.midiMarket.connect(addr2).setMarketSalesFee(1)).to.be.revertedWith("caller is not the owner");
    });

    it("shoulf fetch the current marketSalesFee", async function () {
        expect(await this.midiMarket.getMarketSalesFee()).to.eq(MARKET_SALES_FEE);
    });

    it("should update the marketSalesFee", async function () {
        const basisPoints = 100;
        await this.midiMarket.setMarketSalesFee(basisPoints);
        const newFee = await this.midiMarket.getMarketSalesFee();
        expect(newFee).to.eq(basisPoints);
    });

    it("should fetch minimum listing price", async function () {
        expect(+ethers.utils.formatEther(await this.midiMarket.getMinListingPrice())).to.eq(MIN_LISTING_PRICE_ETHER);
    });

    it("should fail setting minimum price from non-owner", async function () {
        const [_, addr2] = await ethers.getSigners();
        expect(this.midiMarket.connect(addr2).setMinListingPrice(1)).to.be.revertedWith("caller is not the owner");
    });

    it("should set new minimum listing price", async function () {
        await this.midiMarket.setMinListingPrice(1);
        const minListingPrice = await this.midiMarket.getMinListingPrice();
        expect(minListingPrice).to.eq(1);
    });

    it("should fail setting wallet from non-owner", async function () {
        const [_, addr2] = await ethers.getSigners();
        const addr = await addr2.getAddress()
        expect(this.midiMarket.connect(addr2).setWallet(addr)).to.be.revertedWith("caller is not the owner");
    });

    it("should create new market item", async function () {

        const [owner] = await ethers.getSigners();
        const addr = await owner.getAddress();

        const tokenAddress = this.midi.address;

        // create device
        const tx = await this.midi.createDevice(MANUFACTURER, DEVICE);
        await tx.wait();

        // create patch
        const createPatch = await this.midi.createPatch("Test Patch", 0, midiData);
        await createPatch.wait();

        expect(this.midiMarket.createMarketItem(tokenAddress, 1, ethers.utils.parseEther("1")))
            .to.emit(this.midiMarket, "MarketItemCreated").withArgs(
                1, // marketplace item id
                tokenAddress, // erc contract address
                1, // erc token id
                addr, // seller
                "0x0000000000000000000000000000000000000000", // owner
                "1000000000000000000", // 1 ETH
                false
            );
    });

    it("should fail creating new market item due to low price", async function () {
        const tokenAddress = this.midi.address;

        // create device
        const tx = await this.midi.createDevice(MANUFACTURER, DEVICE);
        await tx.wait();

        // create patch
        const createPatch = await this.midi.createPatch("Test Patch", 0, midiData);
        await createPatch.wait();

        expect(
            this.midiMarket.createMarketItem(
                tokenAddress, 1, +ethers.utils.parseEther(String(MIN_LISTING_PRICE_ETHER - 0.01))
            ))
            .to.be.revertedWith("Listing price too low");
    });
});