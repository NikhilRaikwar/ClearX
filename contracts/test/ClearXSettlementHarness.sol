// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ClearXSettlement} from "../ClearXSettlement.sol";
import {IPayment} from "@flarenetwork/flare-periphery-contracts/coston2/IPayment.sol";

contract ClearXSettlementHarness is ClearXSettlement {
    bool public proofValid = true;
    constructor(address token) ClearXSettlement(token) {}
    function setProofValid(bool value) external { proofValid = value; }
    function _verifyPayment(IPayment.Proof calldata) internal view override returns (bool) { return proofValid; }
}
