// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Univ3ERC20TestToken is ERC20 {


    constructor(address admin) ERC20("Univ3ERC20TestToken", "Univ3ERC20TestToken") {
        _mint(admin, 10 ** 18 * 1000000000);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }


}
