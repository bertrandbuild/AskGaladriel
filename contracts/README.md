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

// Agent 1 - personal agent - 0x4EA414CfF46C371c3F1fDf57A66CC9E3cBB883DD
// input : You are a personal asset manager agent. To evaluate a token, define a research plan of 5 web searches including at least teams, tokenomics and price. 
Selected token : dymension - DYM

```shell
forge create --rpc-url https://devnet.galadriel.com/ --gas-price 1000000000 --gas-limit 3000000 --private-key <your_private_key> src/PersonalAgent.sol:PersonalAgent --constructor-args 0x0352b37E5680E324E804B5A6e1AddF0A064E201D
```

// Agent 3 - verify work agent - 0x88013633e360d5782dCE646Dd6562E8560730A75
```shell
forge create --rpc-url https://devnet.galadriel.com/ --gas-price 1000000000 --gas-limit 3000000 --private-key <your_private_key> src/VerifyWork.sol:VerifyWork --constructor-args 0x0352b37E5680E324E804B5A6e1AddF0A064E201D
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
