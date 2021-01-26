pragma solidity >= 0.6.0;

import "../rbac/AccessCard.sol";

interface IBridge {
    function adminSetHandler(bytes32 messageType, address handlerAddress, uint256 relayerPubKey) external;
    function relayerVoteForProposal(uint8 choice, uint8 chainId, bytes32 messageType, uint64 nonce, bytes32 data, uint256 relayerPubKey) external;
}

contract Relayer is AccessCard {
    
    address bridgeAddress;

    constructor (
        address _accessControllerAddress,
        uint256 _myPublicKey,
        TvmCell _myInitState,
        address _bridgeAddress
    ) AccessCard (
        _accessControllerAddress,
        _myPublicKey,
        _myInitState
    ) public {
        bridgeAddress = _bridgeAddress;
    }

    function bridgeSetHandler(bytes32 messageType, address handlerAddress) onlyOwner external {
        require(myRole == 2 || myRole == 1, 101);
        tvm.accept();
        IBridge(bridgeAddress).adminSetHandler{bounce:true, value:200000000}(messageType, handlerAddress, tvm.pubkey());
    }

    function voteThroughBridge(uint8 choice, uint8 chainId, bytes32 messageType, uint64 nonce, bytes32 data) onlyOwner external {
        require(choice == 0 || choice == 1);
        tvm.accept();
        IBridge(bridgeAddress).relayerVoteForProposal{bounce:true, value:400000000}(choice, chainId, messageType, nonce, data, tvm.pubkey());
    }
}