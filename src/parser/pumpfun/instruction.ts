import { PublicKey } from '@solana/web3.js';
import { BaseParsedAction } from '../../core/base';
import { BN } from '@coral-xyz/anchor';

type TradeInfo = {
    solAmount: bigint;
    tokenAmount: bigint;
    tokenMint: PublicKey;
    traderTokenAccount: PublicKey;
    trader: PublicKey;
};

export type DecodedInstructionData = {
    amount: BN;
};

export interface PumpFunAction extends BaseParsedAction {
    info: TradeInfo;
}
