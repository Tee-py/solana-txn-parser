import { ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import {
    PumpFunTransaction,
    PumpFunAction,
    CREATE_EVENT_SIG,
    COMPLETE_EVENT_SIG,
    TRADE_EVENT_SIG,
    ActionType,
} from './types';
import { BaseParser, createAnchorSigHash, anchorLogScanner } from '../../core';
import { CREATE_EVENT_LAYOUT, COMPLETE_EVENT_LAYOUT, TRADE_EVENT_LAYOUT } from './layout';

export class PumpFunParser implements BaseParser<PumpFunTransaction> {
    private readonly discriminators = {
        create: createAnchorSigHash(CREATE_EVENT_SIG),
        trade: createAnchorSigHash(TRADE_EVENT_SIG),
        complete: createAnchorSigHash(COMPLETE_EVENT_SIG),
    } as const;
    readonly PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');

    private decodeEvent(event: string): PumpFunAction {
        const discriminator = Buffer.from(event, 'base64').slice(0, 8);
        const remainder = Buffer.from(event, 'base64').slice(8);
        if (discriminator.equals(this.discriminators.create)) {
            const createEvent = CREATE_EVENT_LAYOUT.decode(remainder);
            return {
                type: ActionType.CREATE,
                info: {
                    name: createEvent.name,
                    symbol: createEvent.symbol,
                    uri: createEvent.uri,
                    tokenMint: createEvent.mint,
                    createdBy: createEvent.user,
                    bondingCurve: createEvent.bondingCurve,
                    tokenDecimals: 6,
                },
            };
        }
        if (discriminator.equals(this.discriminators.trade)) {
            const tradeEvent = TRADE_EVENT_LAYOUT.decode(remainder);
            return {
                type: ActionType.TRADE,
                info: {
                    solAmount: tradeEvent.solAmount,
                    tokenAmount: tradeEvent.tokenAmount,
                    tokenMint: tradeEvent.mint,
                    trader: tradeEvent.user,
                    isBuy: tradeEvent.isBuy,
                    timestamp: tradeEvent.timestamp,
                    virtualSolReserves: tradeEvent.virtualSolReserves,
                    virtualTokenReserves: tradeEvent.virtualTokenReserves,
                },
            };
        }
        if (discriminator.equals(this.discriminators.complete)) {
            const completeEvent = COMPLETE_EVENT_LAYOUT.decode(remainder);
            return {
                type: ActionType.COMPLETE,
                info: {
                    user: completeEvent.user,
                    tokenMint: completeEvent.mint,
                    bondingCurve: completeEvent.bondingCurve,
                    timestamp: completeEvent.timestamp,
                },
            };
        }
        return {
            type: ActionType.UNKNOWN,
            info: {},
        } as PumpFunAction;
    }

    parse(transaction: ParsedTransactionWithMeta): PumpFunTransaction {
        const transactionResult: PumpFunTransaction = {
            actions: [],
            platform: 'pumpfun',
        };
        const events = anchorLogScanner(
            transaction.meta?.logMessages ?? [],
            this.PROGRAM_ID.toBase58()
        );
        const actions = events.map((event) => this.decodeEvent(event));
        transactionResult.actions = actions;
        return transactionResult;
    }

    parseMultiple(transactions: ParsedTransactionWithMeta[]): PumpFunTransaction[] {
        return transactions.map((txn) => this.parse(txn));
    }
}
