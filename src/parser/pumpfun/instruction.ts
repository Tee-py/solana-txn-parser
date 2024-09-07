import { PublicKey } from "@solana/web3.js";
import { BaseParsedAction } from "../../core/base";
import { BN } from "@coral-xyz/anchor";

type TradeInfo = {
    amountIn: bigint,
    amountOut: bigint,
    tokenMint: PublicKey,
    traderAta: PublicKey,
    trader: PublicKey
}

export type DecodedInstructionData = {
    amount: BN
}

export interface PumpFunAction extends BaseParsedAction {
    info: TradeInfo
}