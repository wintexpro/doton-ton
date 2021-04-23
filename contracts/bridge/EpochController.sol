pragma ton-solidity ^0.40.0;

import "./Epoch.sol";

interface IEpoch {
    function voteByEpochController(address voter, uint8 choice, uint8 chainId, bytes32 messageType, address handlerAddress, uint64 nonce, TvmCell data) external;
}

contract EpochController {

    uint8 error_wrong_sender      = 111;
    uint8 error_invalid_choice    = 112;
    uint8 error_era_requested     = 113;

    address bridgeAddress;
    TvmCell epochCode;
    TvmCell proposalCode;
    uint128 deployInitialValue;
    uint256 publicKey;
    uint256 proposalVotersAmount;

    uint32 public firstEraDuration;
    uint32 public secondEraDuration;
    uint256 public publicRandomness;
    uint64 public currentEpochNumber;

    constructor (
        TvmCell _epochCode,
        TvmCell _proposalCode,
        uint128 _deployInitialValue,
        uint256 _publicKey,
        uint256 _proposalVotersAmount,
        address _bridgeAddress,
        uint32 _firstEraDuration,
        uint32 _secondEraDuration
    ) public {
        deployInitialValue = _deployInitialValue;
        publicKey = _publicKey;
        bridgeAddress = _bridgeAddress;
        epochCode = _epochCode;
        proposalCode = _proposalCode;
        proposalVotersAmount = _proposalVotersAmount;
        firstEraDuration = _firstEraDuration;
        secondEraDuration = _secondEraDuration;
        publicRandomness = rnd.next();
        currentEpochNumber = 1;
        createEpoch(1, publicRandomness);
    }

    function createEpoch(uint64 epochNumber, uint256 newPublicRandomness) private returns (address epochAddress) {
        tvm.accept();
        epochAddress = new Epoch {
            code: epochCode, 
            value: deployInitialValue,
            pubkey: tvm.pubkey(),
            varInit: {
                number: epochNumber,
                voteControllerAddress: address(this)
            }
        } (
            proposalCode,
            deployInitialValue,
            tvm.pubkey(),
            proposalVotersAmount,
            firstEraDuration,
            secondEraDuration,
            newPublicRandomness
        );
        return epochAddress;
    }

    function getEpochAddress(uint64 number) public view returns (address epoch) {
        TvmCell epochStateInit = tvm.buildStateInit({
            code: epochCode,
            pubkey: tvm.pubkey(),
            contr: Epoch,
            varInit: {
                number: number,
                voteControllerAddress: address(this)
            }
        });
        return address(tvm.hash(epochStateInit));
    }

    function voteByBridge(uint64 epochNumber, address voter, uint8 choice, uint8 chainId, bytes32 messageType, address handlerAddress, uint64 nonce, TvmCell data) external {
        require (msg.sender == bridgeAddress, error_wrong_sender);
        require(choice == 0 || choice == 1, error_invalid_choice);
        tvm.accept();
        IEpoch(getEpochAddress(epochNumber)).voteByEpochController{bounce:true, flag: 1, value:350000000}(voter, choice, chainId, messageType, handlerAddress, nonce, data);
    }

    function newEpoch(uint256 newPublicrandomness) external {
        require(msg.sender == getEpochAddress(currentEpochNumber), error_era_requested);
        tvm.accept(); // TODO: return era gas?
        publicRandomness = newPublicrandomness;
        createEpoch(currentEpochNumber + 1, newPublicrandomness);
        currentEpochNumber++; // TODO: onBounce with reverse number?
    }

}