pragma solidity >= 0.6.0;

import "./Proposal.sol";

contract VoteController {
    TvmCell proposalInitState;
    TvmCell ballotInitState;
    uint256 publicKey;
    uint128 deployInitialValue;

    constructor (TvmCell _proposalInitState, TvmCell _ballotInitState, uint128 _deployInitialValue, uint256 _publicKey) public {
        tvm.accept();
        proposalInitState = _proposalInitState;
        ballotInitState = _ballotInitState;
        deployInitialValue = _deployInitialValue;
        publicKey = _publicKey;
    }

    modifier onlyOwner {
        require (msg.pubkey() == publicKey);
        tvm.accept();
        _;
    }

    // TODO not a public
    function createProposal(uint256 proposalPublicKey, uint256 proposalId, uint256 votersAmount) public returns (address proposalAddress) {
        tvm.accept();
        TvmCell proposalStateWithPublicKey = tvm.insertPubkey(proposalInitState, proposalPublicKey);
        proposalAddress = new Proposal{stateInit: proposalStateWithPublicKey, value: deployInitialValue}(
            ballotInitState,
            proposalPublicKey,
            proposalId,
            votersAmount
        );
        return proposalAddress;
    }

    function getDeployInitialValue() public view returns (uint128) {
        return deployInitialValue;
    }

    function setDeployInitialValue(uint128 _deployInitialValue) public onlyOwner returns (uint128) {
        deployInitialValue = _deployInitialValue;
        return deployInitialValue;
    }

    function getBallotCode() public view returns (TvmCell ballotCode) {
        return ballotInitState;
    }
}