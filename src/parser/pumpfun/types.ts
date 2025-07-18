import { PublicKey } from '@solana/web3.js';
import { BaseParsedTransaction, BaseParsedAction } from '../../core';

export const CREATE_EVENT_SIG = 'event:CreateEvent';
export const COMPLETE_EVENT_SIG = 'event:CompleteEvent';
export const TRADE_EVENT_SIG = 'event:TradeEvent';

export enum ActionType {
    CREATE = 'create',
    COMPLETE = 'complete',
    TRADE = 'trade',
    UNKNOWN = 'unknown',
}

export type CreateEvent = {
    name: string;
    symbol: string;
    uri: string;
    mint: PublicKey;
    bondingCurve: PublicKey;
    user: PublicKey;
};

export type CompleteEvent = {
    user: PublicKey;
    mint: PublicKey;
    bondingCurve: PublicKey;
    timestamp: bigint;
};

export type TradeEvent = {
    mint: PublicKey;
    solAmount: bigint;
    tokenAmount: bigint;
    isBuy: boolean;
    user: PublicKey;
    timestamp: bigint;
    virtualSolReserves: bigint;
    virtualTokenReserves: bigint;
};

export type TradeInfo = {
    solAmount: bigint;
    tokenAmount: bigint;
    tokenMint: PublicKey;
    trader: PublicKey;
    isBuy: boolean;
    timestamp: bigint;
    virtualSolReserves: bigint;
    virtualTokenReserves: bigint;
};

export type CreateInfo = {
    name: string;
    symbol: string;
    uri: string;
    tokenMint: PublicKey;
    bondingCurve: PublicKey;
    tokenDecimals: number;
    createdBy: PublicKey;
};

export type CompleteInfo = {
    user: PublicKey;
    tokenMint: PublicKey;
    bondingCurve: PublicKey;
    timestamp: BigInt;
};

export interface PumpFunAction extends BaseParsedAction {
    info: TradeInfo | CreateInfo | CompleteInfo;
}

export interface PumpFunTransaction extends BaseParsedTransaction<PumpFunAction> {
    actions: PumpFunAction[];
}
