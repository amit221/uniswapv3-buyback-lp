// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IWrappedToken.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract DexManager is Ownable, IERC721Receiver {

    ISwapRouter public immutable swapRouter;
    INonfungiblePositionManager public immutable nonfungiblePositionManager;

    IWrappedToken  public immutable IWrappedETH;


    address  public immutable WETH;
    address  public  TOKEN;

    bool public activated = false;
    uint24 public poolFee = 3000;

    struct Deposit {
        address owner;
        uint128 liquidity;
        address token0;
        address token1;
    }

    // deposits[tokenId] => Deposit
    mapping(uint256 => Deposit) public deposits;
    uint[] public contractTokenIds;

    address public allowedFeesCollector;

    uint public currentTokenId;

    constructor (ISwapRouter _swapRouter, INonfungiblePositionManager _nonfungiblePositionManager, address weth)  {
        swapRouter = _swapRouter;
        WETH = weth;
        poolFee = poolFee;
        nonfungiblePositionManager = _nonfungiblePositionManager;
        IWrappedETH = IWrappedToken(weth);
        allowedFeesCollector = msg.sender;
    }


    receive() external payable {
        swapAndLp();
    }


    function swapAndLp() public payable {
        if (activated == false) {
            revert("DexManager: not activated");
        }

        (uint tokenAmount,uint ethAmount) = _swapBalance();
        _increaseLiquidityCurrentRange(currentTokenId, tokenAmount, ethAmount);
    }

    function onERC721Received(address operator, address, uint256 tokenId, bytes calldata) external override returns (bytes4) {
        // get position information

        _createDeposit(operator, tokenId);

        return this.onERC721Received.selector;
    }

    function _createDeposit(address owner, uint256 tokenId) internal {
        (, , address token0, address token1, , , , uint128 liquidity, , , ,) =
        nonfungiblePositionManager.positions(tokenId);
        contractTokenIds.push(tokenId);
        deposits[tokenId] = Deposit({owner : owner, liquidity : liquidity, token0 : token0, token1 : token1});
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

    function collectAllFees(uint256 tokenId) external onlyOwner {

        require(msg.sender == allowedFeesCollector, "DexManager: not allowed to collect fees");

        INonfungiblePositionManager.CollectParams memory params =
        INonfungiblePositionManager.CollectParams({
        tokenId : tokenId,
        recipient : allowedFeesCollector,
        amount0Max : type(uint128).max,
        amount1Max : type(uint128).max
        });

        nonfungiblePositionManager.collect(params);

    }

    function depositNFT(uint256 tokenID) external onlyOwner {
        IERC721(address(nonfungiblePositionManager)).safeTransferFrom(msg.sender, address(this), tokenID);
        setCurrentTokenId(tokenID);
    }

    function activate(bool active) external onlyOwner {
        activated = active;
    }

    function setPoolFee(uint24 fee) external onlyOwner {
        poolFee = fee;
    }

    function setCurrentTokenId(uint tokenId) public onlyOwner {
        currentTokenId = tokenId;
    }

    function setAllowedFeesCollector(address _allowedFeesCollector) external onlyOwner {
        allowedFeesCollector = _allowedFeesCollector;
    }
    function setTokenAddress(address token) public onlyOwner {
        require(TOKEN == address(0), "DexManager: token already set");
        TOKEN = token;

        IERC20(token).approve(address(swapRouter), type(uint256).max);
        IERC20(WETH).approve(address(swapRouter), type(uint256).max);
        IERC20(token).approve(address(nonfungiblePositionManager), type(uint256).max);
        IERC20(WETH).approve(address(nonfungiblePositionManager), type(uint256).max);
    }
}
