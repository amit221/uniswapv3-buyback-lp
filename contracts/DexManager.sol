// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';
import '@uniswap/v3-periphery/contracts/base/LiquidityManagement.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IWrappedToken.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract DexManager is Ownable, IERC721Receiver {

    ISwapRouter public immutable swapRouter;
    INonfungiblePositionManager public immutable nonfungiblePositionManager;

    IWrappedToken  public immutable IWrappedETH;


    address  public immutable WETH;
    address  public immutable TOKEN;

    bool private _activated = false;
    uint24 public poolFee = 3000;

    struct Deposit {
        address owner;
        uint128 liquidity;
        address token0;
        address token1;
    }

    // deposits[tokenId] => Deposit
    mapping(uint256 => Deposit) public deposits;

    uint public currentTokenId;

    constructor (ISwapRouter _swapRouter, INonfungiblePositionManager _nonfungiblePositionManager, address token, address weth)  {
        swapRouter = _swapRouter;
        WETH = weth;
        TOKEN = token;
        poolFee = poolFee;
        nonfungiblePositionManager = _nonfungiblePositionManager;
        IWrappedETH = IWrappedToken(weth);

        IERC20(token).approve(address(_swapRouter), type(uint256).max);
        IERC20(weth).approve(address(_swapRouter), type(uint256).max);
        IERC20(token).approve(address(_nonfungiblePositionManager), type(uint256).max);
        IERC20(weth).approve(address(_nonfungiblePositionManager), type(uint256).max);
    }


    receive() external payable {
        swapAndLp();
    }

    function swapAndLp() public payable {
        if (_activated == false) {
            revert("DexManager: not activated");
        }

        (uint tokenAmount,uint ethAmount) = _swapBalance();
        _increaseLiquidityCurrentRange(currentTokenId, tokenAmount, ethAmount);
    }

    function depositNFT(uint256 tokenID) external onlyOwner {
        IERC721(address(nonfungiblePositionManager)).safeTransferFrom(msg.sender, address(this), tokenID);
        setCurrentTokenId(tokenID);
    }

    function onERC721Received(address operator, address, uint256 tokenId, bytes calldata) external override returns (bytes4) {
        // get position information

        _createDeposit(operator, tokenId);

        return this.onERC721Received.selector;
    }

    function _createDeposit(address owner, uint256 tokenId) internal {
        (, , address token0, address token1, , , , uint128 liquidity, , , ,) =
        nonfungiblePositionManager.positions(tokenId);

        // set the owner and data for position
        // operator is msg.sender
        deposits[tokenId] = Deposit({owner : owner, liquidity : liquidity, token0 : token0, token1 : token1});
    }

    function collectAllFees(uint256 tokenId) external returns (uint256 amount0, uint256 amount1) {
        // Caller must own the ERC721 position, meaning it must be a deposit

        // set amount0Max and amount1Max to uint256.max to collect all fees
        // alternatively can set recipient to msg.sender and avoid another transaction in `sendToOwner`
        INonfungiblePositionManager.CollectParams memory params =
        INonfungiblePositionManager.CollectParams({
        tokenId : tokenId,
        recipient : address(this),
        amount0Max : type(uint128).max,
        amount1Max : type(uint128).max
        });

        (amount0, amount1) = nonfungiblePositionManager.collect(params);

        // send collected feed back to owner
        _sendToOwner(tokenId, amount0, amount1);
    }
    function _increaseLiquidityCurrentRange(uint256 tokenId, uint256 amountAdd0, uint256 amountAdd1) public returns (uint128 liquidity, uint256 amount0, uint256 amount1) {


        INonfungiblePositionManager.IncreaseLiquidityParams memory params = INonfungiblePositionManager.IncreaseLiquidityParams({
        tokenId : tokenId,
        amount0Desired : amountAdd0,
        amount1Desired : amountAdd1,
        amount0Min : 0,
        amount1Min : 0,
        deadline : block.timestamp
        });

        (liquidity, amount0, amount1) = nonfungiblePositionManager.increaseLiquidity(params);

    }

    /// @notice Transfers funds to owner of NFT
    /// @param tokenId The id of the erc721
    /// @param amount0 The amount of token0
    /// @param amount1 The amount of token1
    function _sendToOwner(uint256 tokenId, uint256 amount0, uint256 amount1) internal {
        // get owner of contract
        address owner = deposits[tokenId].owner;

        address token0 = deposits[tokenId].token0;
        address token1 = deposits[tokenId].token1;
        // send collected fees to owner
        TransferHelper.safeTransfer(token0, owner, amount0);
        TransferHelper.safeTransfer(token1, owner, amount1);
    }

    function _swapBalance() private returns (uint tokenAmount, uint ethAmount) {
        uint balance = address(this).balance;
        uint firstHalf = balance / 2;
        ethAmount = balance - firstHalf;
        IWrappedETH.deposit{value : balance}();

        ISwapRouter.ExactInputSingleParams memory params =
        ISwapRouter.ExactInputSingleParams({
        tokenIn : WETH,
        tokenOut : TOKEN,
        fee : poolFee,
        recipient : address(this),
        deadline : block.timestamp,
        amountIn : firstHalf,
        amountOutMinimum : 0,
        sqrtPriceLimitX96 : 0
        });

        // The call to `exactInputSingle` executes the swap.
        return (swapRouter.exactInputSingle(params), ethAmount);

    }

    function activate(bool active) external onlyOwner {
        _activated = active;
    }

    function setPoolFee(uint24 fee) external onlyOwner {
        poolFee = fee;
    }

    function setCurrentTokenId(uint tokenId) public onlyOwner {
        currentTokenId = tokenId;
    }
}
