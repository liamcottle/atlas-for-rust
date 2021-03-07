<p align="center">
<a href="https://github.com/liamcottle/atlas-for-rust"><img src="./public/icon_rounded.png" width="150"></a>
</p>

<h2 align="center">Atlas for Rust</h2>

<p align="center">
<a href="https://discord.com/channels/@me"><img src="https://img.shields.io/badge/Discord-Liam%20Cottle%230001-%237289DA?style=flat&logo=discord" alt="discord"/></a>
<a href="https://twitter.com/liamcottle"><img src="https://img.shields.io/badge/Twitter-@liamcottle-%231DA1F2?style=flat&logo=twitter" alt="twitter"/></a>
<br/>
<a href="https://ko-fi.com/liamcottle"><img src="https://img.shields.io/badge/Donate%20a%20Coffee-liamcottle-yellow?style=flat&logo=buy-me-a-coffee" alt="donate on ko-fi"/></a>
<a href="./donate.md"><img src="https://img.shields.io/badge/Donate%20Bitcoin-3FPBfiEwioWHFix3kZqe5bdU9F5o8mG8dh-%23FF9900?style=flat&logo=bitcoin" alt="donate bitcoin"/></a>
</p>

## What is Atlas

Atlas is an **unofficial** interactive map experience for [Rust](https://rust.facepunch.com/). It uses the same websocket protocol that the official [Rust+ Companion app](https://rust.facepunch.com/companion) uses to communicate with the Rust game servers.

## TODO

- handle not_found when credentials are wrong when fetching info
- handle auto updating map properly, instead of refresh icon

## Features

- Shows a realtime updating interactive map, including:
    - Hackable Crates
    - Cargo Ship
    - Chinook
    - Explosions
    - Vending Machines
    - Team Members
- Shows realtime server stats
    - Current player count
    - How long since last wipe
- Supports "Pairing" with Rust Servers from the in game menu
- Supports adding Rust servers manually without using the in game pairing menu
    - Useful if you run your own server and have access to server files

## Features to Implement

- Team Chat
    - Send and receive Team Chat messages. (Show as overlay in corner of map)
- Vending Machine features:
    - View Contents when clicked
    - Search map for a specific item to see if it's for sale
- Smart Devices
    - Pair with Smart Devices
    - View list of Smart Devices per server

## How to Install

- Download the latest installer from [Releases](https://github.com/liamcottle/atlas-for-rust/releases)
- After downloading, run `AtlasForRust-x.y.z-win.exe`
- Connect your Steam Account with Rust+ from the Atlas welcome screen
- Pair with your Rust server from the in game menu

## How to build for development

Download and Install Dependencies

```
git clone https://github.com/liamcottle/atlas-for-rust.git
cd atlas-for-rust
npm install
```

Run Electron app for Development

```
npm run electron:serve
```

## Build for Mac, Windows and Linux

At this stage, GitHub actions only builds and releases Windows versions of Atlas. However, if you want to run Atlas on Mac or Linux, you can use the command below.

```
npm run electron:build -- --mac --win --linux
```
