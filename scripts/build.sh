#!/bin/bash
source ./scripts/local_variables.sh
root=$(pwd)
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
mv *.tvc "$root/build"
mv *.abi.json "$root/build"
cd "$root"

# token
cd ./contracts/token
## RootTokenContract
$solcExec RootTokenContract.sol 
RootTokenContractLinkCommand=`tvm_linker compile RootTokenContract.code --abi-json RootTokenContract.abi.json`
RootTokenContractLinkName=`echo $RootTokenContractLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $RootTokenContractLinkName RootTokenContract.tvc
## TONTokenWallet
$solcExec TONTokenWallet.sol
TONTokenWalletLinkCommand=`tvm_linker compile TONTokenWallet.code --abi-json TONTokenWallet.abi.json`
TONTokenWalletLinkName=`echo $TONTokenWalletLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $TONTokenWalletLinkName TONTokenWallet.tvc
rm *.code
mv *.tvc "$root/build"
mv *.abi.json "$root/build"
cd "$root"


# bridge
cd ./contracts/bridge
## Epoch
$solcExec Epoch.sol
EpochLinkCommand=`tvm_linker compile Epoch.code --abi-json Epoch.abi.json`
EpochLinkName=`echo $EpochLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $EpochLinkName Epoch.tvc
## FeeStorage
$solcExec FeeStorage.sol
FeeStorageLinkCommand=`tvm_linker compile FeeStorage.code --abi-json FeeStorage.abi.json`
FeeStorageLinkName=`echo $FeeStorageLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $FeeStorageLinkName FeeStorage.tvc
## Bridge
$solcExec Bridge.sol
BridgeLinkCommand=`tvm_linker compile Bridge.code --abi-json Bridge.abi.json`
BridgeLinkName=`echo $BridgeLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $BridgeLinkName Bridge.tvc
## EpochController
$solcExec EpochController.sol
EpochControllerLinkCommand=`tvm_linker compile EpochController.code --abi-json EpochController.abi.json`
EpochControllerLinkName=`echo $EpochControllerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $EpochControllerLinkName EpochController.tvc
## Relayer
$solcExec Relayer.sol
RelayerLinkCommand=`tvm_linker compile Relayer.code --abi-json Relayer.abi.json`
RelayerLinkName=`echo $RelayerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $RelayerLinkName Relayer.tvc
rm *.code
mv *.tvc "$root/build"
mv *.abi.json "$root/build"
cd "$root"

# handlers
cd ./contracts/bridge/handlers
## BurnedTokensHandler
$solcExec BurnedTokensHandler.sol
BurnedTokensHandlerLinkCommand=`tvm_linker compile BurnedTokensHandler.code --abi-json BurnedTokensHandler.abi.json`
BurnedTokensHandlerLinkName=`echo $BurnedTokensHandlerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $BurnedTokensHandlerLinkName BurnedTokensHandler.tvc
## MessageHandler
$solcExec MessageHandler.sol
MessageHandlerLinkCommand=`tvm_linker compile MessageHandler.code --abi-json MessageHandler.abi.json`
MessageHandlerLinkName=`echo $MessageHandlerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $MessageHandlerLinkName MessageHandler.tvc
## Tip3Handler
$solcExec Tip3Handler.sol
Tip3HandlerLinkCommand=`tvm_linker compile Tip3Handler.code --abi-json Tip3Handler.abi.json`
Tip3HandlerLinkName=`echo $Tip3HandlerLinkCommand | grep -o -P '(?<=Saved contract to file ).*(?=testnet)'`
mv $Tip3HandlerLinkName Tip3Handler.tvc
rm *.code
mv *.tvc "$root/build"
mv *.abi.json "$root/build"
cd "$root"


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
mv *.tvc "$root/build"
mv *.abi.json "$root/build"
cd "$root"

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
mv *.tvc "$root/build"
mv *.abi.json "$root/build"
cd "$root"