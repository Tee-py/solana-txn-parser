import { ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { flattenInnerInstructions, getAccountSOLBalanceChange } from '../../src/core/utils';

describe('Transaction Parser Utils', () => {
    describe('flattenInnerInstructions', () => {
        it('should flatten inner instructions', () => {
            const txnData = {
                meta: {
                    innerInstructions: [
                        {
                            index: 3,
                            instructions: [
                                {
                                    parsed: {
                                        info: {
                                            extensionTypes: ['immutableOwner'],
                                            mint: 'FstBRGMkNKf4wNvfieYUPS9YsbNoQJMCh6v89zajpump',
                                        },
                                        type: 'getAccountDataSize',
                                    },
                                    program: 'spl-token',
                                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    stackHeight: 2,
                                },
                                {
                                    parsed: {
                                        info: {
                                            lamports: 2039280,
                                            newAccount:
                                                'HoB5DAFC69L8SzD5F1uJDEFZ3CDFy4ceA7Z1kyNMKy7B',
                                            owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                            source: '4SrXdKFYoiUfYzWN7YV8kdJ2TkZieDmjVCEJg4mTAun6',
                                            space: 165,
                                        },
                                        type: 'createAccount',
                                    },
                                    program: 'system',
                                    programId: '11111111111111111111111111111111',
                                    stackHeight: 2,
                                },
                                {
                                    parsed: {
                                        info: {
                                            account: 'HoB5DAFC69L8SzD5F1uJDEFZ3CDFy4ceA7Z1kyNMKy7B',
                                        },
                                        type: 'initializeImmutableOwner',
                                    },
                                    program: 'spl-token',
                                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    stackHeight: 2,
                                },
                                {
                                    parsed: {
                                        info: {
                                            account: 'HoB5DAFC69L8SzD5F1uJDEFZ3CDFy4ceA7Z1kyNMKy7B',
                                            mint: 'FstBRGMkNKf4wNvfieYUPS9YsbNoQJMCh6v89zajpump',
                                            owner: '4SrXdKFYoiUfYzWN7YV8kdJ2TkZieDmjVCEJg4mTAun6',
                                        },
                                        type: 'initializeAccount3',
                                    },
                                    program: 'spl-token',
                                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    stackHeight: 2,
                                },
                            ],
                        },
                        {
                            index: 4,
                            instructions: [
                                {
                                    parsed: {
                                        info: {
                                            amount: '724879458841',
                                            authority:
                                                'BtMzrjEpmLTk4ZGdaS9VVp1jfneoyc1AWsU8ko7ffnug',
                                            destination:
                                                'HoB5DAFC69L8SzD5F1uJDEFZ3CDFy4ceA7Z1kyNMKy7B',
                                            source: '8NETDunyVnrNA44qUqUd8Km8XdfYyyujcWWVX7uDs9eE',
                                        },
                                        type: 'transfer',
                                    },
                                    program: 'spl-token',
                                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                    stackHeight: 2,
                                },
                                {
                                    parsed: {
                                        info: {
                                            destination:
                                                'BtMzrjEpmLTk4ZGdaS9VVp1jfneoyc1AWsU8ko7ffnug',
                                            lamports: 79645349,
                                            source: '4SrXdKFYoiUfYzWN7YV8kdJ2TkZieDmjVCEJg4mTAun6',
                                        },
                                        type: 'transfer',
                                    },
                                    program: 'system',
                                    programId: '11111111111111111111111111111111',
                                    stackHeight: 2,
                                },
                                {
                                    parsed: {
                                        info: {
                                            destination:
                                                'CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM',
                                            lamports: 796453,
                                            source: '4SrXdKFYoiUfYzWN7YV8kdJ2TkZieDmjVCEJg4mTAun6',
                                        },
                                        type: 'transfer',
                                    },
                                    program: 'system',
                                    programId: '11111111111111111111111111111111',
                                    stackHeight: 2,
                                },
                                {
                                    accounts: ['Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'],
                                    data: '2K7nL28PxCW8ejnyCeuMpbXuNBx6UiXevhCQQ1w3jKAeKaFaH7ikhYLsMshRzKzkbCVALEmd1UApmG3sFB22TosE2Dtys87YGfNa2TxnLSZvrzzmbmoU5DXeqJNDrauFJmNunBsDcWm8thbg44BhtkyLhTd4CfdBRENZw1enwnBhB1pY9CWo116fBP4j',
                                    programId: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
                                    stackHeight: 2,
                                },
                            ],
                        },
                    ],
                },
            } as unknown as ParsedTransactionWithMeta;
            const result = flattenInnerInstructions(txnData!);
            expect(result).toHaveLength(8);
        });

        it('should return an empty array if no inner instructions', () => {
            const mockTransaction = { meta: {} };
            const result = flattenInnerInstructions(mockTransaction as any);
            expect(result).toHaveLength(0);
        });
    });

    describe('getAccountSOLBalanceChange', () => {
        it('should calculate the correct balance change', () => {
            const txnData = {
                meta: {
                    postBalances: [
                        30129394, 3946560, 2039280, 310260922401375, 29512424817, 2039280, 1, 1,
                        731913600, 1461600, 934087680, 1141440, 5530000, 1009200, 0,
                    ],
                    preBalances: [
                        115657476, 946560, 0, 310260921604922, 29432779468, 2039280, 1, 1,
                        731913600, 1461600, 934087680, 1141440, 5530000, 1009200, 0,
                    ],
                },
                transaction: {
                    message: {
                        accountKeys: [
                            {
                                pubkey: new PublicKey(
                                    '4SrXdKFYoiUfYzWN7YV8kdJ2TkZieDmjVCEJg4mTAun6'
                                ),
                                signer: true,
                                source: 'transaction',
                                writable: true,
                            },
                            {
                                pubkey: new PublicKey(
                                    'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt'
                                ),
                                signer: false,
                                source: 'transaction',
                                writable: true,
                            },
                        ],
                    },
                },
            } as unknown as ParsedTransactionWithMeta;
            const result = getAccountSOLBalanceChange(
                txnData!,
                new PublicKey('ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt')
            );
            expect(result).toBe(3000000);
        });

        it('should return 0 if account not found', () => {
            const txnData = {
                transaction: {
                    message: {
                        accountKeys: [
                            {
                                pubkey: new PublicKey(
                                    '4SrXdKFYoiUfYzWN7YV8kdJ2TkZieDmjVCEJg4mTAun6'
                                ),
                                signer: true,
                                source: 'transaction',
                                writable: true,
                            },
                            {
                                pubkey: new PublicKey(
                                    'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt'
                                ),
                                signer: false,
                                source: 'transaction',
                                writable: true,
                            },
                        ],
                    },
                },
            } as unknown as ParsedTransactionWithMeta;
            const result = getAccountSOLBalanceChange(txnData!, PublicKey.default);
            expect(result).toBe(0);
        });
    });
});
