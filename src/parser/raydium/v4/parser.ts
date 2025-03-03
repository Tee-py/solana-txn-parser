import { Connection, ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { AsyncBaseParser } from '../../../core/base';
import { LRUCache } from '../../../core/lru';
import {
    ActionType,
    DEPOSIT_LOG_TYPE,
    INIT_LOG_TYPE,
    InitPool,
    RaydiumV4Transaction,
    RayV4Program,
    SWAP_BASE_IN_LOG_TYPE,
    SWAP_BASE_OUT_LOG_TYPE,
    Withdraw,
    WITHDRAW_LOG_TYPE,
    PoolInfo,
    SwapBaseIn,
    SwapBaseOut,
    Deposit,
} from './types';
import {
    DEPOSIT_LAYOUT,
    INIT_POOL_LAYOUT,
    RAY_AMM_V4_POOL_LAYOUT,
    SWAP_BASE_IN_LAYOUT,
    SWAP_BASE_OUT_LAYOUT,
    WITHDRAW_LAYOUT,
} from './layout';
import { flattenTransactionInstructions } from '../../../core/utils';

export class RaydiumV4Parser implements AsyncBaseParser<RaydiumV4Transaction> {
    private poolInfoCache: LRUCache<PoolInfo>;
    private connection: Connection;

    constructor(rpcConnection: Connection, options: { maxPoolCache?: number }) {
        this.connection = rpcConnection;
        this.poolInfoCache = new LRUCache(options.maxPoolCache || 100);
    }

    getRayLogs(transaction: ParsedTransactionWithMeta) {
        return transaction.meta?.logMessages?.filter((msg) => msg.includes('ray_log'));
    }

    decodeRayLog(msg: string) {
        const logData = msg.match(/^Program log: ray_log: (.+)$/)?.[1] ?? msg;
        const logBuffer = Buffer.from(logData, 'base64');
        const logType = logBuffer.slice(0, 1).readInt8();
        const dataBuffer = logBuffer.slice(1);

        switch (logType) {
            case INIT_LOG_TYPE:
                return { ...INIT_POOL_LAYOUT.decode(dataBuffer), logType };
            case DEPOSIT_LOG_TYPE:
                return { ...DEPOSIT_LAYOUT.decode(dataBuffer), logType };
            case WITHDRAW_LOG_TYPE:
                return { ...WITHDRAW_LAYOUT.decode(dataBuffer), logType };
            case SWAP_BASE_IN_LOG_TYPE:
                return { ...SWAP_BASE_IN_LAYOUT.decode(dataBuffer), logType };
            case SWAP_BASE_OUT_LOG_TYPE:
                return { ...SWAP_BASE_OUT_LAYOUT.decode(dataBuffer), logType };
            default:
                return null;
        }
    }

    async getPoolInfo(poolId: string) {
        const info = this.poolInfoCache.get(poolId);
        if (info) return info;
        const poolInfo = await this.connection.getAccountInfo(new PublicKey(poolId));
        if (!poolInfo) return null;
        const parsedInfo = RAY_AMM_V4_POOL_LAYOUT.decode(poolInfo.data);
        this.poolInfoCache.set(poolId, {
            baseMint: parsedInfo.baseMint,
            quoteMint: parsedInfo.quoteMint,
            baseDecimal: parsedInfo.baseDecimal,
            quoteDecimal: parsedInfo.quoteDecimal,
        });
        return parsedInfo;
    }

    private async handleSwap(
        parsedLog: SwapBaseIn | SwapBaseOut,
        instruction: { accounts: PublicKey[] }
    ) {
        const poolId = instruction.accounts[1];
        const user = instruction.accounts[instruction.accounts.length - 1];
        const poolInfo = await this.getPoolInfo(poolId.toString());
        if (!poolInfo) return null;
        return {
            type: ActionType.SWAP,
            info: {
                amountIn: parsedLog.amountIn,
                amountOut: parsedLog.amountOut,
                baseReserve: parsedLog.baseReserve,
                quoteReserve: parsedLog.quoteReserve,
                tokenIn: parsedLog.direction == 1n ? poolInfo.quoteMint : poolInfo.baseMint,
                tokenInDecimal:
                    parsedLog.direction == 1n ? poolInfo.quoteDecimal : poolInfo.baseDecimal,
                tokenOut: parsedLog.direction == 1n ? poolInfo.baseMint : poolInfo.quoteMint,
                tokenOutDecimal:
                    parsedLog.direction == 1n ? poolInfo.baseDecimal : poolInfo.quoteDecimal,
                user,
                poolId,
            },
        };
    }

    private handleCreatePool(parsedLog: InitPool, instruction: { accounts: PublicKey[] }) {
        return {
            type: ActionType.CREATE,
            info: {
                baseDecimals: parsedLog.baseDecimals,
                quoteDecimals: parsedLog.quoteDecimals,
                timestamp: parsedLog.timestamp,
                baseAmountIn: parsedLog.baseAmountIn,
                quoteAmountIn: parsedLog.quoteAmountIn,
                baseMint: instruction.accounts[8],
                quoteMint: instruction.accounts[9],
                marketId: parsedLog.marketId,
                user: instruction.accounts[17],
                poolId: instruction.accounts[4],
            },
        };
    }

    private async handleDeposit(parsedLog: Deposit, instruction: { accounts: PublicKey[] }) {
        const poolId = instruction.accounts[1];
        const user = instruction.accounts[12];
        const poolInfo = await this.getPoolInfo(poolId.toString());
        if (!poolInfo) return null;
        return {
            type: ActionType.ADD,
            info: {
                user,
                poolId,
                baseMint: poolInfo.baseMint,
                quoteMint: poolInfo.quoteMint,
                baseDecimal: poolInfo.baseDecimal,
                quoteDecimal: poolInfo.quoteDecimal,
                baseAmountIn: parsedLog.baseAmountIn,
                quoteAmountIn: parsedLog.quoteAmountIn,
                mintedLpAmount: parsedLog.mintedLpAmount,
            },
        };
    }

    private async handleWithdraw(parsedLog: Withdraw, instruction: { accounts: PublicKey[] }) {
        const poolId = instruction.accounts[1];
        const user = instruction.accounts[18];
        const poolInfo = await this.getPoolInfo(poolId.toString());
        if (!poolInfo) return null;
        return {
            type: ActionType.REMOVE,
            info: {
                lpAmountOut: parsedLog.withdrawLpAmount,
                poolLpAmount: parsedLog.poolLpAmount,
                baseReserve: parsedLog.baseReserve,
                quoteReserve: parsedLog.quoteReserve,
                baseAmountOut: parsedLog.baseAmountOut,
                quoteAmountOut: parsedLog.quoteAmountOut,
                baseMint: poolInfo.baseMint,
                quoteMint: poolInfo.quoteMint,
                baseDecimal: poolInfo.baseDecimal,
                quoteDecimal: poolInfo.quoteDecimal,
                user,
                poolId,
            },
        };
    }

    async parse(transaction: ParsedTransactionWithMeta): Promise<RaydiumV4Transaction | null> {
        const logs = this.getRayLogs(transaction);
        if (!logs) {
            return null;
        }
        const decodedLogs = logs.map((msg) => this.decodeRayLog(msg));
        const instructions = flattenTransactionInstructions(transaction).filter(
            (ix) => ix.programId.toString() === RayV4Program.toString()
        );
        if (instructions.length == 0) return null;
        const result: RaydiumV4Transaction = {
            platform: 'raydiumv4',
            actions: [],
        };
        for (let i = 0; i < decodedLogs.length; i++) {
            let ixLog = decodedLogs[i];
            let ix = instructions[i] as { accounts: PublicKey[] };
            let action;
            if (!ixLog) continue;
            switch (ixLog.logType) {
                case SWAP_BASE_IN_LOG_TYPE:
                    action = await this.handleSwap(ixLog as SwapBaseIn | SwapBaseOut, ix);
                    if (!action) continue;
                    result.actions.push(action);
                    break;
                case SWAP_BASE_OUT_LOG_TYPE:
                    action = await this.handleSwap(ixLog as SwapBaseIn | SwapBaseOut, ix);
                    if (!action) continue;
                    result.actions.push(action);
                    break;
                case INIT_LOG_TYPE:
                    result.actions.push(this.handleCreatePool(ixLog as unknown as InitPool, ix));
                    break;

                case WITHDRAW_LOG_TYPE:
                    action = await this.handleWithdraw(ixLog as Withdraw, ix);
                    if (!action) continue;
                    result.actions.push(action);
                    break;

                case DEPOSIT_LOG_TYPE:
                    action = await this.handleDeposit(ixLog as Deposit, ix);
                    if (!action) continue;
                    result.actions.push(action);
                    break;
                default:
                    continue;
            }
        }
        return result;
    }

    async parseMultiple(
        transactions: ParsedTransactionWithMeta[]
    ): Promise<RaydiumV4Transaction[] | null> {
        return (
            await Promise.all(
                transactions.map(async (txn) => {
                    return await this.parse(txn);
                })
            )
        ).filter((res) => res !== null);
    }
}
