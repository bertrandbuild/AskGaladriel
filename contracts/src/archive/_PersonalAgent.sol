// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Agent.sol";

contract PersonalAgent is Agent {
    address public targetAgentAddress;
    address public owner;

    constructor(
        address initialOracleAddress,
        string memory systemPrompt,
        address _targetAgentAddress
    ) Agent(initialOracleAddress, systemPrompt) {
        targetAgentAddress = _targetAgentAddress;
        owner = msg.sender;
    }

    function updateTargetAgentAddress(address newTargetAgentAddress) public onlyOwner {
        targetAgentAddress = newTargetAgentAddress;
    }

    function onOracleOpenAiLlmResponse(
        uint runId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage
    ) public override onlyOracle {
        super.onOracleOpenAiLlmResponse(runId, response, errorMessage);

        if (isRunFinished(runId)) {
            AgentRun storage run = agentRuns[runId];
            string memory lastResponse = run.messages[run.messages.length - 1].content[0].value;
            
            // Call the target agent with the last response
            Agent(targetAgentAddress).runAgent(lastResponse, run.max_iterations);
        }
    }
}