pragma ton-solidity ^0.40.0;
pragma AbiHeader expire;

interface IPausedCallback {
    function pausedCallback(uint64 callback_id, bool value) external;
}