export const VerifyWorkAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "initialOracleAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getMessageHistory",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct IOracle.Message[]",
        "components": [
          {
            "name": "role",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "content",
            "type": "tuple[]",
            "internalType": "struct IOracle.Content[]",
            "components": [
              {
                "name": "contentType",
                "type": "string",
                "internalType": "string"
              },
              {
                "name": "value",
                "type": "string",
                "internalType": "string"
              }
            ]
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "message",
    "inputs": [],
    "outputs": [
      {
        "name": "role",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "onOracleOpenAiLlmResponse",
    "inputs": [
      {
        "name": "runId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_response",
        "type": "tuple",
        "internalType": "struct IOracle.OpenAiResponse",
        "components": [
          {
            "name": "id",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "content",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "functionName",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "functionArguments",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "created",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "model",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "systemFingerprint",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "object",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "completionTokens",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "promptTokens",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "totalTokens",
            "type": "uint32",
            "internalType": "uint32"
          }
        ]
      },
      {
        "name": "_errorMessage",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "response",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "sendMessage",
    "inputs": [
      {
        "name": "_message",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]