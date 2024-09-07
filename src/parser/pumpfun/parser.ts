import { ParsedTransactionWithMeta, PartiallyDecodedInstruction } from '@solana/web3.js';
import { BaseParser } from '../../core/base';
import { PumpFunTransaction } from './transaction';
import * as anchor from '@coral-xyz/anchor';
import { PumpIDL } from './idl';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { sha256 } from '@noble/hashes/sha256';
import { DecodedInstructionData, PumpFunAction } from './instruction';
import { getAccountSOLBalanceChange } from '../../core/utils';

export class PumpFunParser implements BaseParser<PumpFunTransaction> {
    readonly coder = new anchor.BorshInstructionCoder(PumpIDL as unknown as anchor.Idl);
    readonly buyDiscriminator = Buffer.from(sha256('global:buy').slice(0, 8));
    readonly sellDiscriminator = Buffer.from(sha256('global:sell').slice(0, 8));

    parse(transaction: ParsedTransactionWithMeta): PumpFunTransaction {
        const transactionResult: PumpFunTransaction = {
            actions: [],
            platform: 'pumpfun',
        };
        const instructions = this.getInstructions(transaction);
        for (const ix of instructions) {
            const discriminator = this.getDiscriminator(ix as PartiallyDecodedInstruction);
            if (discriminator.equals(this.buyDiscriminator)) {
                transactionResult.actions.push(
                    this.getTradeAction(transaction, ix as PartiallyDecodedInstruction, 'buy')
                );
            } else if (discriminator.equals(this.sellDiscriminator)) {
                transactionResult.actions.push(
                    this.getTradeAction(transaction, ix as PartiallyDecodedInstruction, 'sell')
                );
            }
        }
        return transactionResult;
    }

    parseMultiple(transactions: ParsedTransactionWithMeta[]): PumpFunTransaction[] {
        const results = [];
        for (const txn of transactions) {
            results.push(this.parse(txn));
        }
        return results;
    }

    getTradeAction(
        transaction: ParsedTransactionWithMeta,
        instruction: PartiallyDecodedInstruction,
        type: 'buy' | 'sell'
    ): PumpFunAction {
        const accounts = this.getAccounts(instruction);
        const solAmount = getAccountSOLBalanceChange(transaction, accounts.bondingCurve);
        const tradeData = {
            solAmount: BigInt(0),
            tokenAmount: BigInt(0),
            ...accounts,
        };
        const decoded = this.decodeInstructionData(instruction.data);
        let amount = BigInt(0);
        if (decoded) {
            const data = decoded.data as unknown as DecodedInstructionData;
            amount = BigInt(data.amount.toString());
        }
        tradeData.solAmount = BigInt(solAmount);
        tradeData.tokenAmount = amount;
        return {
            type,
            info: tradeData,
        };
    }

    getInstructions(transaction: ParsedTransactionWithMeta) {
        return transaction.transaction.message.instructions.filter(
            (ix) => ix.programId.toString() == PumpIDL.metadata.address
        );
    }

    getDiscriminator(instruction: PartiallyDecodedInstruction) {
        return bs58.decode(instruction.data).slice(0, 8);
    }

    getAccounts(instruction: PartiallyDecodedInstruction) {
        return {
            bondingCurve: instruction.accounts[3],
            tokenMint: instruction.accounts[2],
            traderTokenAccount: instruction.accounts[5],
            trader: instruction.accounts[6],
        };
    }

    decodeInstructionData(data: string) {
        return this.coder.decode(data, 'base58');
    }
}
