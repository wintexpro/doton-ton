pragma solidity >=0.6.0;

library BetterRequire {
    function revertIfNot(bool predicate, uint errorCode) internal pure {
        if (predicate == false) {
            revert(errorCode);
        }
    }
}