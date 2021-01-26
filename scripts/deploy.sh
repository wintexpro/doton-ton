#!/bin/bash
source ./scripts/local_variables.sh
echo "Deploying components"
source ./scripts/addresses.sh
# Deploy AC
echo `tonos-cli deploy --sign ./keys/AccessController.keys.json --abi ./rbac/AccessController.abi.json ./rbac/AccessController.tvc '{"_accessCardInitState":"'$(base64 -w 0 ./bridge/Relayer.tvc)'", "_initialValue": 1000000}'`
echo `tonos-cli deploy --sign ./keys/BridgeVoteController.keys.json --abi ./bridge/BridgeVoteController.abi.json ./bridge/BridgeVoteController.tvc '{"_proposalStateInit":"'$(base64 -w 0 ./smv/Proposal.tvc)'","_ballotInitState":"'$(base64 -w 0 ./bridge/Relayer.tvc)'","_deployInitialValue": 2000000000,"_publicKey":"0x'$bridgeVoteControllerPublicKey'","_proposalVotersAmount":'$proposalVotersAmount',"_bridgeAddress":"'$bridgeAddress'"}'`
echo `tonos-cli deploy --sign ./keys/Bridge.keys.json --abi ./bridge/Bridge.abi.json ./bridge/Bridge.tvc '{"_relayerInitState":"'$(base64 -w 0 ./bridge/Relayer.tvc)'","_accessControllerAddress":"'$accessControllerAddress'","_voteControllerAddress": "'$bridgeVoteControllerAddress'"}'`
echo `tonos-cli deploy --sign ./keys/Handler.keys.json --abi ./bridge/Handler.abi.json ./bridge/Handler.tvc '{"_proposalStateInit":"'$(base64 -w 0 ./smv/Proposal.tvc)'"}'`
