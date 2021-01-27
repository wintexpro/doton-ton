#!/bin/bash
source ./scripts/local_variables.sh
# Structure
rm -rf ./build/*
# components
# rbac
cd ./contracts/rbac
## AccessCard
$solcExec AccessCard.sol
AccessCardLinkCommand=`tvm_linker compile AccessCard.code --abi-json AccessCard.abi.json`
AccessCardLinkName=`echo $AccessCardLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $AccessCardLinkName AccessCard.tvc
## AccessController
$solcExec AccessController.sol
AccessControllerLinkCommand=`tvm_linker compile AccessController.code --abi-json AccessController.abi.json`
AccessControllerLinkName=`echo $AccessControllerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $AccessControllerLinkName AccessController.tvc
rm *.code
mv *.tvc ./../../build
mv *.abi.json ./../../build
cd ./../../


# bridge
cd ./contracts/bridge
## Bridge
$solcExec Bridge.sol
BridgeLinkCommand=`tvm_linker compile Bridge.code --abi-json Bridge.abi.json`
BridgeLinkName=`echo $BridgeLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $BridgeLinkName Bridge.tvc
## BridgeVoteController
$solcExec BridgeVoteController.sol
BridgeVoteControllerLinkCommand=`tvm_linker compile BridgeVoteController.code --abi-json BridgeVoteController.abi.json`
BridgeVoteControllerLinkName=`echo $BridgeVoteControllerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $BridgeVoteControllerLinkName BridgeVoteController.tvc
## Handler
$solcExec Handler.sol
HandlerLinkCommand=`tvm_linker compile Handler.code --abi-json Handler.abi.json`
HandlerLinkName=`echo $HandlerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $HandlerLinkName Handler.tvc
## Relayer
$solcExec Relayer.sol
RelayerLinkCommand=`tvm_linker compile Relayer.code --abi-json Relayer.abi.json`
RelayerLinkName=`echo $RelayerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $RelayerLinkName Relayer.tvc
rm *.code
mv *.tvc ./../../build
mv *.abi.json ./../../build
cd ./../../


# transmitter
cd ./contracts/transmitter
## Receiver
$solcExec Receiver.sol
ReceiverLinkCommand=`tvm_linker compile Receiver.code --abi-json Receiver.abi.json`
ReceiverLinkName=`echo $ReceiverLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $ReceiverLinkName Receiver.tvc
## Sender
$solcExec Sender.sol
SenderLinkCommand=`tvm_linker compile Sender.code --abi-json Sender.abi.json`
SenderLinkName=`echo $SenderLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $SenderLinkName Sender.tvc
rm *.code
mv *.tvc ./../../build
mv *.abi.json ./../../build
cd ./../../

# voting
cd ./contracts/voting
## Proposal
$solcExec Proposal.sol
ProposalLinkCommand=`tvm_linker compile Proposal.code --abi-json Proposal.abi.json`
ProposalLinkName=`echo $ProposalLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $ProposalLinkName Proposal.tvc
## VoteController
$solcExec VoteController.sol
VoteControllerLinkCommand=`tvm_linker compile VoteController.code --abi-json VoteController.abi.json`
VoteControllerLinkName=`echo $VoteControllerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $VoteControllerLinkName VoteController.tvc
rm *.code
mv *.tvc ./../../build
mv *.abi.json ./../../build
cd ./../../