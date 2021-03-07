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

## TODO

- add name to add server modal
- handle not_found when credentials are wrong when fetching info
- handle auto updating map properly, instead of refresh icon

## Current Features

- Supports "Pairing" with Rust Servers automatically from in game menu
- Shows a realtime updating map, including:
    - Hackable Crates, Cargo Ship, Chinook, Explosions, Vending Machine and Team Members (with online status)
- Shows realtime server stats: current player count, last wiped
- You can add multiple Rust Servers
- Rust servers can be added manually without using in game pairing
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
- GitHub actions for auto building and releasing updates to app

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run electron:serve
```

### Compiles and minifies for production

```
npm run electron:build
```

### Build for Mac, Windows and Linux

```
npm run electron:build -- --mac --win --linux
```
