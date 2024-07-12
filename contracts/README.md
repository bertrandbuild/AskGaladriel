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

### Generate ABIs

```shell
forge build --silent && jq '.abi' contracts/out/OpenAiChatGptVision.sol/OpenAiChatGptVision.json
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
