// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Issuance is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 private _token;

    constructor(IERC20 token) public {
        _token = token;
    }

    /**
     * Issue miner tokens on a user's behalf.
     * @param recipient address The address of the token recipient.
     * @param amount uint256 The amount of Miner tokens ot purchase.
     */
    function issue(
        address recipient,
        uint256 amount
    ) public onlyOwner() {
        require(recipient != address(0), "Issuance/address-invalid");
        require(amount > 0, "Issuance/amount-invalid");
        require(
            _token.balanceOf(address(this)) >= amount,
            "Issuance/balance-exceeded"
        );

        _token.transfer(recipient, amount);

        emit Issued(recipient, amount);
    }

    event Issued(
        address indexed recipient,
        uint256 amount
    );
}
