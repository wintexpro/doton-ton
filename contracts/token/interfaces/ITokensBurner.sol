pragma ton-solidity ^0.40.0;
pragma AbiHeader expire;

interface ITokensBurner {
    function burnMyTokens(uint128 tokens, address callback_address, TvmCell callback_payload) external;
}
