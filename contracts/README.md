# Contracts

Deployed on galadriel devnet: 0xBA08f7433d858b0cEB682adbFbC871cd1AA52B50 with dev oracle : 0x0352b37E5680E324E804B5A6e1AddF0A064E201D

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Deploy

```shell
forge create --rpc-url https://devnet.galadriel.com/ --gas-price 1000000000 --gas-limit 3000000 --private-key <your_private_key> src/OpenAiChatGptVision.sol:OpenAiChatGptVision --constructor-args 0x0352b37E5680E324E804B5A6e1AddF0A064E201D
```

// Agent 1 - personal agent - 0xC75d84cefbb9efcf5396e4976Fd77D2991d2DbaF
// Agent 2 - data gathering agent - 0xb40E715b6a7Dd34d58002BF092884Ae04AA0133e
// Agent 3 - rating agent - 0x2AA8B6C72AEa3c26e68bb4Af1dcF3b681b9104b6
// Agent 4 - verify work agent - 0x5b11aa370de48C46000E30c6B3Cb1D3c1a084dB4
```shell
forge create --rpc-url https://devnet.galadriel.com/ --gas-price 1000000000 --gas-limit 3000000 --private-key <your_private_key> src/PersonalAgent.sol:PersonalAgent --constructor-args 0x0352b37E5680E324E804B5A6e1AddF0A064E201D
```

### Generate ABIs

```shell
forge build --silent && jq '.abi' contracts/out/OpenAiChatGptVision.sol/OpenAiChatGptVision.json
forge build --silent && jq '.abi' contracts/out/Agent.sol/Agent.json
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
