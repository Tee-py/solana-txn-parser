import { PublicKey } from '@solana/web3.js';
import { BaseParsedAction, BaseParsedTransaction } from '../../../core';

export const RayV4Program = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

export const INIT_LOG_TYPE = 0;
export const DEPOSIT_LOG_TYPE = 1;
export const WITHDRAW_LOG_TYPE = 2;
export const SWAP_BASE_IN_LOG_TYPE = 3;
export const SWAP_BASE_OUT_LOG_TYPE = 4;

export enum ActionType {
    CREATE = 'create',
    ADD = 'add',
    REMOVE = 'remove',
    SWAP = 'swap',
}

export type PoolInfo = {
    baseDecimal: bigint;
    quoteDecimal: bigint;
    baseMint: PublicKey;
    quoteMint: PublicKey;
};

export type InitPool = {
    logType: number;
    timestamp: bigint;
    quoteDecimals: number;
    baseDecimals: number;
    quoteLotSize: bigint;
    baseLotSize: bigint;
    quoteAmountIn: bigint;
    baseAmountIn: bigint;
    marketId: PublicKey;
};

export type Deposit = {
    logType: number;
    maxBaseAmount: bigint;
    maxQuoteAmount: bigint;
    fixedSide: bigint; // 0n, then baseToken else quoteToken
    baseReserve: bigint;
    quoteReserve: bigint;
    poolLpAmount: bigint;
    pnlX: bigint;
    pnlY: bigint;
    baseAmountIn: bigint;
    quoteAmountIn: bigint;
    mintedLpAmount: bigint;
};

export type Withdraw = {
    logType: number;
    withdrawLpAmount: bigint;
    userLpAmount: bigint;
    baseReserve: bigint;
    quoteReserve: bigint;
    poolLpAmount: bigint;
    pnlX: bigint;
    pnlY: bigint;
    baseAmountOut: bigint;
    quoteAmountOut: bigint;
};

export type SwapBaseIn = {
    logType: number;
    amountIn: bigint;
    minimumAmountOut: bigint;
    direction: bigint; // 0n, then baseToken else quoteToken
    userSource: bigint;
    baseReserve: bigint;
    quoteReserve: bigint;
    amountOut: bigint;
};

export type SwapBaseOut = {
    logType: number;
    maxAmountIn: bigint;
    amountOut: bigint;
    direction: bigint; // 0n, then baseToken else quoteToken
    userSource: bigint;
    baseReserve: bigint;
    quoteReserve: bigint;
    amountIn: bigint;
};

export type CreatePoolInfo = {
    baseDecimals: number;
    quoteDecimals: number;
    timestamp: bigint;
    baseAmountIn: bigint;
    quoteAmountIn: bigint;
    user: PublicKey;
    baseMint: PublicKey;
    quoteMint: PublicKey;
    poolId: PublicKey;
    marketId: PublicKey;
};

export type AddLiquidityInfo = {
    user: PublicKey;
    poolId: PublicKey;
    baseMint: PublicKey;
    quoteMint: PublicKey;
    baseDecimal: bigint;
    quoteDecimal: bigint;
    baseAmountIn: bigint;
    quoteAmountIn: bigint;
    mintedLpAmount: bigint;
};

export type RemoveLiquidityInfo = {
    lpAmountOut: bigint;
    poolLpAmount: bigint;
    baseReserve: bigint;
    quoteReserve: bigint;
    baseAmountOut: bigint;
    quoteAmountOut: bigint;
    baseDecimal: bigint;
    quoteDecimal: bigint;
    baseMint: PublicKey;
    quoteMint: PublicKey;
    user: PublicKey;
    poolId: PublicKey;
};

export type SwapInfo = {
    amountIn: bigint;
    amountOut: bigint;
    baseReserve: bigint;
    quoteReserve: bigint;
    tokenInDecimal: bigint;
    tokenOutDecimal: bigint;
    tokenIn: PublicKey;
    tokenOut: PublicKey;
    user: PublicKey;
    poolId: PublicKey;
};

export interface RaydiumV4Action extends BaseParsedAction {
    type: string;
    info: CreatePoolInfo | AddLiquidityInfo | RemoveLiquidityInfo | SwapInfo;
}

export interface RaydiumV4Transaction extends BaseParsedTransaction<RaydiumV4Action> {
    platform: 'raydiumv4';
    actions: RaydiumV4Action[];
}
