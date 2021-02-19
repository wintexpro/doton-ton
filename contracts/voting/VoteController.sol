pragma ton-solidity ^0.36.0;

import "./Proposal.sol";

contract VoteController {

    // Controller basic state
    TvmCell proposalCode;
    uint256 publicKey;
    uint128 deployInitialValue;
    uint256 proposalPublicKey;

    // Proposal state
    uint256 proposalVotersAmount;

    constructor (
        TvmCell _proposalCode,
        uint128 _deployInitialValue,
        uint256 _publicKey,
        uint256 _proposalPublicKey,
        uint256 _proposalVotersAmount
    ) public {
        tvm.accept();
        proposalCode = _proposalCode;
        deployInitialValue = _deployInitialValue;
        publicKey = _publicKey;
        proposalPublicKey = _proposalPublicKey;
        proposalVotersAmount = _proposalVotersAmount;
    }

    modifier onlyOwner {
        require (msg.pubkey() == publicKey);
        _;
    }
    
    function createProposal(
        uint8 chainId,
        uint64 nonce,
        TvmCell data,
        uint8 initializerChoice,
        address initializerAddress,
        address handlerAddress,
        bytes32 messageType
    ) public returns (address proposalAddress) {
        tvm.accept();
        proposalAddress = new Proposal {
            code: proposalCode, 
            value: deployInitialValue,
            pubkey: tvm.pubkey(),
            varInit: {
                chainId: chainId,
                nonce: nonce,
                voteControllerAddress: address(this),
                data: data
            }
        } (
            proposalPublicKey,
            proposalVotersAmount,
            initializerChoice,
            initializerAddress,
            handlerAddress,
            messageType
        );
        return proposalAddress;
    }

    function getDeployInitialValue() public view returns (uint128) {
        return deployInitialValue;
    }

    function setDeployInitialValue(uint128 _deployInitialValue) public onlyOwner returns (uint128) {
        tvm.accept();
        deployInitialValue = _deployInitialValue;
        return deployInitialValue;
    }

    function getProposalAddress(uint8 chainId, uint64 nonce, TvmCell data) public view returns (address proposal) {
        TvmCell proposalStateInit = tvm.buildStateInit({
            code: proposalCode,
            pubkey: tvm.pubkey(),
            contr: Proposal,
            varInit: {
                chainId: chainId,
                nonce: nonce,
                voteControllerAddress: address(this),
                data: data
            }
        });
        return address(tvm.hash(proposalStateInit));
    }
}