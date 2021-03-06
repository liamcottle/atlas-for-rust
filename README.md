# Atlas for Rust

## TODO

- coloured icons for fcm, expo and companion status
- add name to add server modal
- show add server modal instead of immediately adding server
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
