# MIDI Token and Marketplace

## Abstract

The MIDI token and MIDI Marketplace enable musicians and artists to own and sell the MIDI data they create on digital instruments. The market for MIDI patches are niche but established, with an array of centralized sites selling MIDI patches and collections. MIDI token and MIDI Marketplace is the first decentralized way to mint MIDI tokens and sell them in a decentralized manner, allowing true ownership.

How does this work? The MIDI data itself consists and an array of bytes, making it easy to store on-chain. A Web3 interface allows users to connect their synthesizer, upload a patch, and mint the patch data to Ethereum.
The MIDI data can then be queried from Ethereum and loaded into any MIDI-compliant synthesizer or digital instrument.

## Motivation

- Digital musicians love exploring sounds crafted by other artists. We create libraries of sounds we like, some self-made, some made by others. With the advent of NFTs, for the first time, users will be able to create libraries of MIDI data they can use in their music and truly own.

- At the moment, musicians are restricted to a loose collection of centralized services to explore, upload, and download MIDI patches for digital instruments. A decentralized marketplace for MIDI data is a perfect match for this niche market, allowing users to explore on-chain patches and profit off of the patches and collections they create.

## MIDI ERC-721 Token

The MIDI Token is the way users mint their MIDI patches and collections. Users are free to create as many tokens for a patch as they would like. Since MIDI data simply consists of UInt8Array, it is lightweight and not prohibitively expensive to store on-chain. Once the data is minted, users can transfer the token to other users to use, receive other MIDI tokens, or burn the tokens they own. Dapps will allow users to take the MIDI patch data, and load it into their compliant MIDI devices. This allows users to collect patches for the MIDI devices they own.

The MIDI data minted consists of several parts. Users can add a name for the patch, the MIDI data itself, and a reference to the associated MIDI device. MIDI devices also must be minted. This will tie into the marketplace, where devices are paid a small piece of every MIDI NFT transaction, and devices themselves can be traded.

## MIDI Marketplace

The MIDI marketplace will be one of the interfaces users can use to exchange the MIDI token. It will allow users to browse, mint, and trade MIDI data, as well as load the data into their MIDI-compliant device. Users will be able to create MIDI patch data as well as mint and trade MIDI devices. Device ownership will let users implement an optional fee for all patches traded on the marketplace. There will be an additional marketplace fee for all trades to fund ongoing development for the team.
