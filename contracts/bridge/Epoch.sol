pragma ton-solidity ^0.40.0;

import "../voting/VoteController.sol";

interface IProposal {
    function voteByController(address voter, uint8 choice, bytes32 messageType, address handlerAddress) external;
}

interface IEpochController {
    function newEpoch(uint256 newPublicrandomness) external;
}

contract Epoch is VoteController {
    uint64 static number;
    address static voteControllerAddress;

    uint8 error_bad_proof                  = 101;
    uint8 error_bad_era                    = 102;
    uint8 error_signature_already_provided = 103;
    uint8 error_wrong_sender               = 104;
    uint8 error_invalid_choice             = 105;
    uint8 error_relayer_was_not_passed     = 106;

    struct Signature {
        uint256 sign_high_part;
        uint256 sign_low_part;
    }

    uint32 firstEraDuration;
    uint32 secondEraDuration;

    uint256 randomness;

    uint32 public firstEraEndsAt;
    uint32 public secondEraEndsAt;
    uint32 proposalsAmount = 0;
    uint256 nextRandomness;

    mapping (Signature => address) registered_relayers;
    mapping (address => Signature) choosen_relayers;

    constructor (
        TvmCell _proposalCode,
        uint128 _deployInitialValue,
        uint256 _publicKey,
        uint256 _proposalVotersAmount, // TODO 256?????
        uint32 _firstEraDuration,
        uint32 _secondEraDuration,
        uint256 _publicRandomness
    ) VoteController (
        _proposalCode,
        _deployInitialValue,
        _publicKey,
        _proposalVotersAmount
    ) public {
        require(voteControllerAddress == msg.sender, 103);
        tvm.accept();
        firstEraDuration = _firstEraDuration;
        secondEraDuration = _secondEraDuration;
        randomness = _publicRandomness;
        nextRandomness = randomness;
        firstEraEndsAt = msg.createdAt + firstEraDuration;
        secondEraEndsAt = firstEraEndsAt + secondEraDuration;
    }

    function signup(address registeringRelayer, uint256 signHighPart, uint256 signLowPart, uint256 pubkey) external {
        require(msg.createdAt < firstEraEndsAt || choosen_relayers.empty(), error_bad_era);
        require(tvm.checkSign(randomness, signHighPart, signLowPart, pubkey), error_bad_proof);
        require(!registered_relayers.exists(Signature(signHighPart, signLowPart)), error_signature_already_provided);
        registered_relayers[Signature(signHighPart, signLowPart)] = registeringRelayer;
        TvmBuilder builder;
        builder.store(nextRandomness, signHighPart, signLowPart);
        nextRandomness = sha256(builder.toSlice());
        if (msg.createdAt >= firstEraEndsAt) {
            tvm.accept(); // TODO this contract pays from collected?
            uint8 counter = 0;
            optional(Signature, address) relayer = registered_relayers.delMax();
            while (counter < 3 && relayer.hasValue()) { // TODO counter: static or dynamic? from where?
                (Signature signature, address relayerAddress) = relayer.get();
                choosen_relayers[relayerAddress] = signature;
                relayer = registered_relayers.delMax();
                counter++;
            }
            IEpochController(voteControllerAddress).newEpoch(nextRandomness);
        }
    }

    function voteByEpochController(address voter, uint8 choice, uint8 chainId, bytes32 messageType, address handlerAddress, uint64 nonce, TvmCell data) external {
        require(msg.sender == voteControllerAddress, error_wrong_sender);
        require(choice == 0 || choice == 1, error_invalid_choice);
        require(choosen_relayers.exists(voter), error_relayer_was_not_passed);
        tvm.accept();
        // 2 calls (1 with error, 1 is ok); If second era ends we should allow ONLY to vote for exists!
        if (msg.createdAt <= secondEraEndsAt) {
            createProposal(chainId, nonce, data, choice, voter, handlerAddress, messageType);
        }
        IProposal(getProposalAddress(chainId, nonce, data)).voteByController{bounce:true, flag: 1, value:300000000}(voter, choice, messageType, handlerAddress);
    }

    function isChoosen(address relayer) public view returns (bool) {
        return choosen_relayers.exists(relayer);
    }

}