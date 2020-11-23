// file MathHelper.sol
pragma solidity >=0.6.0;


// Library declaration 
library MathHelper {
    // State variables are forbidden in library but constants are not
    uint constant MAX_VALUE = 300;

    // Library function
    function sum(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        require(c < MAX_VALUE);
        return c;
    }
}
