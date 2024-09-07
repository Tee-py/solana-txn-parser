import {
    ParsedTransaction,
    ParsedTransactionMeta,
    ParsedTransactionWithMeta,
} from '@solana/web3.js';
import { BaseParser } from '../../core/base';
import { RaydiumTransaction } from './transaction';

export class RaydiumParser implements BaseParser<RaydiumTransaction> {
    parse(transaction: ParsedTransactionWithMeta): RaydiumTransaction | null {
        console.log('Raydium transaction parser called...');
        console.log(transaction.transaction.message.instructions);
        return null;
    }
    parseMultiple(transactions: ParsedTransactionWithMeta[]): RaydiumTransaction[] | null {
        return null;
    }
}
