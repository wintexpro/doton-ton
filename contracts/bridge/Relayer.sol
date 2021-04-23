pragma ton-solidity ^0.40.0;

import "../rbac/AccessCard.sol";

interface IBridge {
    function adminSetHandler(bytes32 messageType, address handlerAddress, uint256 relayerPubKey) external;
    function relayerVoteForProposal(uint64 epochNumber, uint8 choice, uint8 chainId, bytes32 messageType, uint64 nonce, TvmCell data, uint256 relayerPubKey) external;
}

interface IEpoch {
    function signup(address registeringRelayer, uint256 signHighPart, uint256 signLowPart, uint256 pubkey) external;
}

contract Relayer is AccessCard {
    
    address bridgeAddress;

    uint8 error_unsuitable_role = 121;
    uint8 error_invalid_choice  = 122;

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

    function bridgeSetHandler(bytes32 messageType, address handlerAddress) onlyOwner external view {
        require(myRole == 2 || myRole == 1, error_unsuitable_role);
        tvm.accept();
        IBridge(bridgeAddress).adminSetHandler{bounce:true, flag: 1, value:200000000}(messageType, handlerAddress, tvm.pubkey());
    }

    function voteThroughBridge(uint64 epochNumber, uint8 choice, uint8 chainId, bytes32 messageType, uint64 nonce, TvmCell data) onlyOwner external view {
        require(choice == 0 || choice == 1, error_invalid_choice);
        tvm.accept();
        IBridge(bridgeAddress).relayerVoteForProposal{bounce:true, flag: 1, value:400000000}(epochNumber, choice, chainId, messageType, nonce, data, tvm.pubkey());
    }

    function signUpForEpoch(address epochAddress, uint256 signHighPart, uint256 signLowPart, uint256 pubkey) onlyOwner external view {
        tvm.accept();
        IEpoch(epochAddress).signup{bounce:true, flag: 1, value:400000000}(address(this), signHighPart, signLowPart, pubkey);
    }
}