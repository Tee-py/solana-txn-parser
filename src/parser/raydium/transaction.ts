import { BaseParsedTransaction } from '../../core/base';
import { RaydiumAction } from './instruction';

export interface RaydiumTransaction extends BaseParsedTransaction<RaydiumAction> {
    platform: 'raydium';
    actions: RaydiumAction[];
}
