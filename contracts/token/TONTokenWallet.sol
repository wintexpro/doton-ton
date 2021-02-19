pragma solidity >= 0.6.0;
pragma AbiHeader time;
pragma AbiHeader expire;

import "./interfaces/ITONTokenWallet.sol";
import "./interfaces/ITONTokenWalletWithNotifiableTransfers.sol";
import "./interfaces/IBurnableByOwnerTokenWallet.sol";
import "./interfaces/IBurnableByRootTokenWallet.sol";
import "./interfaces/IBurnableTokenRootContract.sol";
import "./interfaces/ITokenWalletDeployedCallback.sol";
import "./interfaces/ITokensReceivedCallback.sol";

contract TONTokenWallet is ITONTokenWallet, ITONTokenWalletWithNotifiableTransfers, IBurnableByOwnerTokenWallet, IBurnableByRootTokenWallet {

    address static root_address;
    TvmCell static code;
    //for external owner
    uint256 static wallet_public_key;
    //for internal owner
    address static owner_address;

    uint128 public balance;
    optional(AllowanceInfo) allowance_;

    bytes name;
    bytes symbol;
    uint8 decimals;
    uint256 root_public_key;

    address public receive_callback = address.makeAddrStd(0, 0);

    uint8 error_message_sender_is_not_my_owner            = 100;
    uint8 error_not_enough_balance                        = 101;
    uint8 error_message_sender_is_not_my_root             = 102;
    uint8 error_message_sender_is_not_good_wallet         = 103;
    uint8 error_wrong_bounced_header                      = 104;
    uint8 error_wrong_bounced_args                        = 105;
    uint8 error_non_zero_remaining                        = 106;
    uint8 error_no_allowance_set                          = 107;
    uint8 error_wrong_spender                             = 108;
    uint8 error_not_enough_allowance                      = 109;
    uint8 error_low_message_value                         = 110;
    uint8 error_define_wallet_public_key_or_owner_address = 111;

    uint128 public target_gas_balance                      = 0.1 ton;

    constructor(
        bytes _name,
        bytes _symbol,
        uint8 _decimals,
        uint256 _root_public_key
    ) public {
        require((wallet_public_key != 0 && owner_address.value == 0) ||
                (wallet_public_key == 0 && owner_address.value != 0),
                error_define_wallet_public_key_or_owner_address);
        tvm.accept();
        if (owner_address.value != 0) {
            ITokenWalletDeployedCallback(owner_address).notifyWalletDeployed{value: 0.00001 ton}(root_address);
        }
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        root_public_key = _root_public_key;
    }

    function getDetails() override external view returns (ITONTokenWalletDetails){
        return ITONTokenWalletDetails(
            root_address,
            code,
            wallet_public_key,
            owner_address,
            balance
        );
    }

    function getBalance() override external view returns (uint128){
        return balance;
    }

    function getWalletKey() override external view returns (uint256){
        return wallet_public_key;
    }

    function getRootAddress() override external view returns (address){
        return root_address;
    }

    function getOwnerAddress() override external view returns (address){
        return owner_address;
    }

    function getName() override external view returns (bytes){
        return name;
    }

    function getSymbol() override external view returns (bytes){
        return symbol;
    }

    function getDecimals() override external view returns (uint8){
        return decimals;
    }

    function getRootPublicKey() override external view returns (uint256){
        return root_public_key;
    }

    function accept(uint128 tokens) override external onlyRoot {
        balance += tokens;
    }


    function allowance() override external view returns (AllowanceInfo) {
        return allowance_.hasValue() ? allowance_.get() : AllowanceInfo(0, address.makeAddrStd(0, 0));
    }

    function approve(address spender, uint128 remaining_tokens, uint128 tokens) override external onlyOwner {
        if (owner_address.value != 0 ) {
            tvm.rawReserve(math.max(target_gas_balance, address(this).balance - msg.value), 2);
        } else {
            tvm.accept();
        }

        if (allowance_.hasValue()) {
            if (allowance_.get().remaining_tokens == remaining_tokens) {
                allowance_.set(AllowanceInfo(tokens, spender));
            }
        } else {
            require(remaining_tokens == 0, error_non_zero_remaining);
            allowance_.set(AllowanceInfo(tokens, spender));
        }

        if (owner_address.value != 0 ) {
            msg.sender.transfer({ value: 0, flag: 128 });
        }
    }

    function disapprove() override external onlyOwner {
        if (owner_address.value != 0 ) {
            tvm.rawReserve(math.max(target_gas_balance, address(this).balance - msg.value), 2);
        } else {
            tvm.accept();
        }

        allowance_.reset();

        if (owner_address.value != 0 ) {
            msg.sender.transfer({ value: 0, flag: 128 });
        }
    }

    function transfer(
        address to,
        uint128 tokens,
        uint128 grams
    ) override external onlyOwner {
        TvmBuilder builder;
        _transfer(to, tokens, grams, false, builder.toCell());
    }

    function transferWithNotify(
        address to,
        uint128 tokens,
        uint128 grams,
        TvmCell payload
    ) override external onlyOwner {
        _transfer(to, tokens, grams, true, payload);
    }

    function _transfer(
        address to,
        uint128 tokens,
        uint128 grams,
        bool notify_receiver,
        TvmCell payload
    ) private inline {
        require(tokens > 0);
        require(tokens <= balance, error_not_enough_balance);
        require(to.value != 0);

        if (owner_address.value != 0 ) {
            uint128 reserve = math.max(target_gas_balance, address(this).balance - msg.value);
            require(address(this).balance > reserve + target_gas_balance, error_low_message_value);
            tvm.rawReserve(reserve, 2);
            balance -= tokens;
            ITONTokenWallet(to).internalTransfer{ value: 0, flag: 128, bounce: true }(
                tokens,
                wallet_public_key,
                owner_address,
                owner_address,
                notify_receiver,
                payload
            );
        } else {
            require(address(this).balance > grams, error_low_message_value);
            require(grams > target_gas_balance, error_low_message_value);
            tvm.accept();
            balance -= tokens;
            ITONTokenWallet(to).internalTransfer{ value: grams, bounce: true }(
                tokens,
                wallet_public_key,
                owner_address,
                address(this),
                notify_receiver,
                payload
            );
        }
    }

    function transferFrom(
        address from,
        address to,
        uint128 tokens,
        uint128 grams
    ) override external onlyOwner {
        TvmBuilder builder;
        _transferFrom(from, to, tokens, grams, false, builder.toCell());
    }

    function transferFromWithNotify(
        address from,
        address to,
        uint128 tokens,
        uint128 grams,
        TvmCell payload
    ) override external onlyOwner {
        _transferFrom(from, to, tokens, grams, true, payload);
    }

    function _transferFrom(
        address from,
        address to,
        uint128 tokens,
        uint128 grams,
        bool notify_receiver,
        TvmCell payload
    ) private inline view {
        require(to.value != 0);
        require(tokens > 0);

        if (owner_address.value != 0 ) {
            uint128 reserve = math.max(target_gas_balance, address(this).balance - msg.value);
            require(address(this).balance > reserve + (target_gas_balance * 2), error_low_message_value);
            tvm.rawReserve(reserve, 2);
            ITONTokenWallet(from).internalTransferFrom{ value: 0, flag: 128 }(
                to,
                tokens,
                owner_address,
                notify_receiver,
                payload
            );
        } else {
            require(address(this).balance > grams, error_low_message_value);
            require(grams > target_gas_balance * 2, error_low_message_value);
            tvm.accept();
            ITONTokenWallet(from).internalTransferFrom{ value: grams }(
                to,
                tokens,
                address(this),
                notify_receiver,
                payload
            );
        }
    }

    function internalTransfer(
        uint128 tokens,
        uint256 sender_public_key,
        address sender_address,
        address send_gas_to,
        bool notify_receiver,
        TvmCell payload
    ) override external {
        address expectedSenderAddress = getExpectedAddress(sender_public_key, sender_address);
        require(msg.sender == expectedSenderAddress, error_message_sender_is_not_good_wallet);

        if (owner_address.value != 0 ) {
            uint128 reserve = math.max(target_gas_balance, address(this).balance - msg.value);
            require(address(this).balance > reserve, error_low_message_value);
            tvm.rawReserve(reserve, 2);
        } else {
            tvm.rawReserve(address(this).balance - msg.value, 2);
        }

        balance += tokens;

        if (notify_receiver && receive_callback.value != 0) {
            ITokensReceivedCallback(receive_callback).tokensReceivedCallback{ value: 0, flag: 128 }(
                address(this),
                root_address,
                tokens,
                sender_public_key,
                sender_address,
                msg.sender,
                send_gas_to,
                balance,
                payload
            );
        } else {
            send_gas_to.transfer({ value: 0, flag: 128 });
        }
    }

    function internalTransferFrom(
        address to,
        uint128 tokens,
        address send_gas_to,
        bool notify_receiver,
        TvmCell payload
    ) override external {
        require(allowance_.hasValue(), error_no_allowance_set);
        require(msg.sender == allowance_.get().spender, error_wrong_spender);
        require(tokens <= allowance_.get().remaining_tokens, error_not_enough_allowance);
        require(tokens <= balance, error_not_enough_balance);
        require(tokens > 0);

        if (owner_address.value != 0 ) {
            uint128 reserve = math.max(target_gas_balance, address(this).balance - msg.value);
            require(address(this).balance > reserve + target_gas_balance, error_low_message_value);
            tvm.rawReserve(reserve, 2);
            tvm.rawReserve(math.max(target_gas_balance, address(this).balance - msg.value), 2);
        } else {
            require(msg.value > target_gas_balance, error_low_message_value);
            tvm.rawReserve(address(this).balance - msg.value, 2);
        }

        balance -= tokens;

        allowance_.set(AllowanceInfo(allowance_.get().remaining_tokens - tokens, allowance_.get().spender));

        ITONTokenWallet(to).internalTransfer{ value: 0, bounce: true, flag: 128 }(
            tokens,
            wallet_public_key,
            owner_address,
            send_gas_to,
            notify_receiver,
            payload
        );
    }

    function burnByOwner(
        uint128 tokens,
        uint128 grams,
        address callback_address,
        TvmCell callback_payload
    ) override external onlyOwner {
        require(tokens > 0);
        require(tokens <= balance, error_not_enough_balance);
        require((owner_address.value != 0 && msg.value > 0) ||
                (owner_address.value == 0 && grams <= address(this).balance && grams > 0), error_low_message_value);
        if (owner_address.value != 0 ) {
            tvm.rawReserve(math.max(target_gas_balance, address(this).balance - msg.value), 2);
            balance -= tokens;
            IBurnableTokenRootContract(root_address)
                .tokensBurned{ value: 0, flag: 128 }(
                    tokens,
                    wallet_public_key,
                    owner_address,
                    callback_address,
                    callback_payload
                );
        } else {
            tvm.accept();
            balance -= tokens;
            IBurnableTokenRootContract(root_address)
                .tokensBurned{ value: grams }(
                    tokens,
                    wallet_public_key,
                    owner_address,
                    callback_address,
                    callback_payload
                );
        }
    }

    function burnByRoot(
        uint128 tokens,
        address callback_address,
        TvmCell callback_payload
    ) override external onlyRoot {
        require(tokens > 0);
        require(tokens <= balance, error_not_enough_balance);

        tvm.rawReserve(address(this).balance - msg.value, 2);

        balance -= tokens;

        IBurnableTokenRootContract(root_address)
            .tokensBurned{ value: 0, flag: 128 }(
                tokens,
                wallet_public_key,
                owner_address,
                callback_address,
                callback_payload
            );
    }

    function setReceiveCallback(address receive_callback_) override external onlyOwner {
        tvm.accept();
        receive_callback = receive_callback_;
    }

    function destroy(address gas_dest) public onlyOwner {
        require(balance == 0);
        tvm.accept();
        selfdestruct(gas_dest);
    }

    // =============== Support functions ==================

    modifier onlyRoot() {
        require(isRoot(), error_message_sender_is_not_my_root);
        _;
    }

    modifier onlyOwner() {
        require(isOwner(), error_message_sender_is_not_my_owner);
        _;
    }

    modifier onlyInternalOwner() {
        require(isInternalOwner());
        _;
    }

    function isRoot() private inline view returns (bool) {
        return root_address == msg.sender;
    }

    function isOwner() private inline view returns (bool) {
        return isInternalOwner() || isExternalOwner();
    }

    function isInternalOwner() private inline view returns (bool) {
        return owner_address.value != 0 && owner_address == msg.sender;
    }

    function isExternalOwner() private inline view returns (bool) {
        return wallet_public_key != 0 && wallet_public_key == tvm.pubkey();
    }

    function getExpectedAddress(uint256 wallet_public_key_, address owner_address_) private inline view returns (address)  {

        TvmCell stateInit = tvm.buildStateInit({
            contr: TONTokenWallet,
            varInit: {
                root_address: root_address,
                code: code,
                wallet_public_key: wallet_public_key_,
                owner_address: owner_address_
            },
            pubkey: wallet_public_key_,
            code: code
        });

        return address(tvm.hash(stateInit));
    }

    onBounce(TvmSlice body) external {
        tvm.accept();
        uint32 functionId = body.decode(uint32);
        if (functionId == tvm.functionId(ITONTokenWallet.internalTransfer)) {
            balance += body.decode(uint128);
        }
    }

    fallback() external {
    }
}