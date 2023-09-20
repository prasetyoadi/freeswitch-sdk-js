
# Freeswitch SDK

This is library for freeswitch event socket using typescript.

# Environment
[![node version =16.0.0](https://img.shields.io/badge/node%3D16.0.0-blue)](https://img.shields.io/)


## Install

```
yarn install
```

## Build

```
yarn build
```

## How to use

```javascript
import FreeswitchEngine from 'freeswitch-sdk';
const fs = new FreeswitchEngine();

==== Execute command: Login
fs.agentLogin({
  server_ip: "127.0.0.1",
  agent_id: "ca03a883-a693-4a10-b798-ff76bd2e79d9",
  agent_extension: "555111162",
  sip_url: "dev-freeswitch.domain.com"
});

==== Execute command: Logout
fs.agentLogout({
  server_ip: "127.0.0.1",
  agent_id: "ca03a883-a693-4a10-b798-ff76bd2e79d9",
  domain_id: "2753d1fa-6e7b-44d8-b655-83940e164de9"
})
```
