import {
    ParsedTransactionWithMeta,
    PublicKey,
    TransactionResponse,
    VersionedTransactionResponse,
} from '@solana/web3.js';
import fs from 'fs';
import {
    getAccountSOLBalanceChange,
    flattenTransactionInstructions,
    parseRawTransaction,
} from '../../src/core';
import { LRUCache } from '../../src/core/lru';

describe('Transaction Parser Utils', () => {
    describe('flattenTransactionInstructions', () => {
        it('should handle empty inner instructions', () => {
            const mockTransaction = {
                transaction: {
                    message: {
                        instructions: [
                            {
                                accounts: ['acct-1', 'acct-2', 'acct-3'],
                                data: '0xray-test',
                                programId: new PublicKey(
                                    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
                                ),
                            },
                            {
                                accounts: ['acct-1', 'acct-2', 'acct-3'],
                                data: '0xray-test',
                                programId: new PublicKey(
                                    'B9ktH3g7mwgdoDgCgGRim6qeqPcyRVWJueXS12CMpump'
                                ),
                            },
                        ],
                    },
                },
                meta: {},
            };

            const result = flattenTransactionInstructions(mockTransaction as any);
            expect(result.length).toEqual(2);
            expect((result as { programId: PublicKey }[])[0].programId.toString()).toEqual(
                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
            );
            expect((result as { programId: PublicKey }[])[1].programId.toString()).toEqual(
                'B9ktH3g7mwgdoDgCgGRim6qeqPcyRVWJueXS12CMpump'
            );
        });

        it('should handle instructions with inner cpi calls', () => {
            const testTxn = JSON.parse(
                fs.readFileSync('tests/raydium/parsed-swap-txn.json', 'utf-8')
            ) as unknown as ParsedTransactionWithMeta;

            const result = flattenTransactionInstructions(testTxn);
            expect(result.length).toEqual(15);
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

    describe('LRUCache Tests', () => {
        let cache: LRUCache<number>;

        beforeEach(() => {
            cache = new LRUCache<number>(3);
        });

        test('should initialize with correct capacity', () => {
            expect(cache.size).toBe(0);
            const cache2 = new LRUCache<number>(5);
            expect(cache2.size).toBe(0);
        });

        test('should set and get values correctly', () => {
            cache.set('a', 1);
            expect(cache.get('a')).toBe(1);
            expect(cache.size).toBe(1);
        });

        test('should return null for non-existent keys', () => {
            expect(cache.get('missing')).toBeNull();
        });

        test('should update existing keys', () => {
            cache.set('a', 1);
            cache.set('a', 2);
            expect(cache.get('a')).toBe(2);
            expect(cache.size).toBe(1);
        });

        test('should evict least recently used item when capacity is reached', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);
            cache.set('d', 4);

            expect(cache.get('a')).toBeNull();
            expect(cache.head?.key).toBe('d');
            expect(cache.tail?.key).toBe('b');
            expect(cache.get('b')).toBe(2);
            expect(cache.get('c')).toBe(3);
            expect(cache.get('d')).toBe(4);
            expect(cache.size).toBe(3);
        });

        test('should maintain LRU order with gets', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3);

            cache.get('a');

            cache.set('d', 4);

            expect(cache.get('b')).toBeNull();
            expect(cache.get('a')).toBe(1);
            expect(cache.get('c')).toBe(3);
            expect(cache.get('d')).toBe(4);
        });

        test('should clear the cache', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.clear();

            expect(cache.size).toBe(0);
            expect(cache.get('a')).toBeNull();
            expect(cache.get('b')).toBeNull();
        });

        test('should handle complex sequence of operations', () => {
            cache.set('a', 1);
            cache.set('b', 2);
            cache.get('a');
            cache.set('c', 3);
            cache.set('d', 4);

            expect(cache.get('b')).toBeNull();
            expect(cache.get('a')).toBe(1);
            expect(cache.get('c')).toBe(3);
            expect(cache.get('d')).toBe(4);

            cache.set('e', 5);

            expect(cache.get('a')).toBeNull();
            expect(cache.get('c')).toBe(3);
            expect(cache.get('d')).toBe(4);
            expect(cache.get('e')).toBe(5);
        });
    });

    describe('Raw Txn Test', () => {
        test('raw versioned txn test', async () => {
            const rawTxn = JSON.parse(
                fs.readFileSync('tests/core/raw-versioned.json', 'utf-8')
            ) as unknown as VersionedTransactionResponse;
            const parsed = parseRawTransaction(rawTxn!);

            // verify number of cpi calls (inner instructions) and instructions
            expect(parsed.meta.innerInstructions.length).toEqual(
                rawTxn.meta?.innerInstructions?.length
            );
            expect(rawTxn.transaction.message.compiledInstructions.length).toEqual(
                parsed.transaction.message.instructions.length
            );

            // verify each individual inner instructions
            // expected ix according to (https://solscan.io/tx/jyEcdyKkZbZRu1CSqSu28CAPiAmZFtJ3DVejLkEhYVkZtsBrznXUAGfTGvvBmEcqmiS3bqYcY7cFEJgPhLQnP3b)
            const expectedInnerIxs = [
                {
                    index: 3,
                    instructions: [
                        {
                            programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
                            accounts: [
                                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                'N4UXh61ifRriJN9g8ZPCeNdyNy7EzCq3mW3iWNS6S2S',
                                '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
                                'E6UhcZ1LsMZdCQjzdgDUafrMTEcFoeDRyKb5HA828L7Q',
                                'McJD2qeU3QXDysPNtbdZA6mNgK2XjdJbeNab8B7AZsZ',
                                'A66RJVnjd3SwmPrr9aNSitGJzddarMNzTwrsYiFjdHo3',
                                'FSKb18jroXxQFf4f18HYYwgzTZJmy7pNf8SBHLBY2KiP',
                                'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
                                'DuU6qMpwHn329UoTcUZWbwGmBPgKzn2WpALuoisd4Zvx',
                                '9S5a6eM2WTz2em6GK9zjrPB3Pfxsq9NVNe1E5YCCrDJP',
                                '6DJtkQHQYFVF2hHBMDpZ7uzkWf8fUMKRVg6KNwkZ1VHp',
                                '8GNnRiAKykFmFoKj84YChoCp89dwbwSyGMPyrswLU82Y',
                                'CwSJDuoJvzdaiYdScjrJknu8zFDFSjkVR2E5UiggZyMg',
                                '2aHXwtgZgpF73YC2o6snqBkthA4oeytVkHtUEZRmq1g1',
                                '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
                                'JWt97sN73FfLv3rS6QEQH5ki9qje2sF3eGjyF6bTWMo',
                                '2rikd7tzPbmowhUJzPNVtX7fuUGcnBa8jqJnx6HbtHeE',
                                'CiMyNyCrnHCgkcR39Vxv2LbXSjbdgL15PDwJds6ZaiPT',
                            ],
                            data: '6FLPFmCQaXnUUaaMRwbKe1V',
                        },
                        {
                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            accounts: [
                                'JWt97sN73FfLv3rS6QEQH5ki9qje2sF3eGjyF6bTWMo',
                                'A66RJVnjd3SwmPrr9aNSitGJzddarMNzTwrsYiFjdHo3',
                                'CiMyNyCrnHCgkcR39Vxv2LbXSjbdgL15PDwJds6ZaiPT',
                            ],
                            data: '3gKBXWuhpDtj',
                        },
                        {
                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            accounts: [
                                'FSKb18jroXxQFf4f18HYYwgzTZJmy7pNf8SBHLBY2KiP',
                                '2rikd7tzPbmowhUJzPNVtX7fuUGcnBa8jqJnx6HbtHeE',
                                '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
                            ],
                            data: '3iKybc46oGST',
                        },
                        {
                            programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
                            accounts: [
                                'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                                'DjQpzLq1yXsZ6SZt5MQP4yWgxRmL7RKMiu5VYoC8Usbv',
                                '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
                                'Boc5XtrQBFmBs8PnR9TGMJ9NE4XAhVwNeM2dqWkLJENa',
                                '7qp5uThBtCqNwMTCz2Ynuw8LT7wS1MGSYFgMfWKK2Xsh',
                                'HgBKpnGLreR6QNBrBwNUqExFddA6piV7yE8zMGsZbt4c',
                                '2RVDdw8FGocF3ZaXDej5R7rBhJDoc8GDCT8EGd7suuSW',
                                'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
                                '4WPAK8mGrFU4xqsdVVLZhn2kJ9L6xF4En225CUgLi1pB',
                                'CTF2PKLDXpDRY1yx5R6dkTgtsNNqnbvinsC3QpQbAEA8',
                                '9WrG9qG9nzBYEkeot7ZLdnxpmpPZNoby8jT5mjeUN6AC',
                                '4r1H7AWXs5ZSMkrAM3gJ2CGpzqFXwjZiRQHfAJWuUX3u',
                                'AgKAHLeGjEWycrfuRdEduL1gabAPayZrnhRdNxK1bpBq',
                                'BDZhZ74xr74PQ1WmTL83uTUKo3baHtYBdMLWNtNpuTfL',
                                '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
                                '2rikd7tzPbmowhUJzPNVtX7fuUGcnBa8jqJnx6HbtHeE',
                                'Ge3apdyTidx88bZjMZaXevvGvze1oxAJWewGYJ6DXGBi',
                                'HV1KXxWFaSeriyFvXyx48FqG9BoFbfinB8njCJonqP7K',
                            ],
                            data: '6GpcJsMFeTvFRRxUR2aoXQs',
                        },
                        {
                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            accounts: [
                                '2rikd7tzPbmowhUJzPNVtX7fuUGcnBa8jqJnx6HbtHeE',
                                'HgBKpnGLreR6QNBrBwNUqExFddA6piV7yE8zMGsZbt4c',
                                'HV1KXxWFaSeriyFvXyx48FqG9BoFbfinB8njCJonqP7K',
                            ],
                            data: '3iKybc46oGST',
                        },
                        {
                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            accounts: [
                                '2RVDdw8FGocF3ZaXDej5R7rBhJDoc8GDCT8EGd7suuSW',
                                'Ge3apdyTidx88bZjMZaXevvGvze1oxAJWewGYJ6DXGBi',
                                '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
                            ],
                            data: '3mcJFEBemvkX',
                        },
                        {
                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            accounts: [
                                'JWt97sN73FfLv3rS6QEQH5ki9qje2sF3eGjyF6bTWMo',
                                '8c71AvjQeKKeWRe8jtTGG1bJ2WiYXQdbjqFbUfhHgSVk',
                                'AoqP3HmYm5W2wJMny5PWQg8zbMS2VGTQ77r5SedHAf9M',
                                'CiMyNyCrnHCgkcR39Vxv2LbXSjbdgL15PDwJds6ZaiPT',
                            ],
                            data: 'hLL2Ls1hQcApx',
                        },
                    ],
                },
            ];
            for (let i = 0; i < expectedInnerIxs.length; i++) {
                const expectedInnerIx = expectedInnerIxs[i];
                const parsedInnerIx = parsed.meta.innerInstructions[i];
                expect(expectedInnerIx.index).toEqual(parsedInnerIx.index);
                expect(expectedInnerIx.instructions.length).toEqual(
                    parsedInnerIx.instructions.length
                );
                for (let k = 0; k < expectedInnerIx.instructions.length; k++) {
                    const eIx = expectedInnerIx.instructions[k];
                    const pIx = parsedInnerIx.instructions[k];
                    expect(eIx.accounts.length).toEqual(pIx.accounts.length);
                    expect(eIx.data).toEqual(pIx.data);
                    for (let j = 0; j < eIx.accounts.length; j++) {
                        expect(eIx.accounts[j].toString()).toEqual(pIx.accounts[j].toString());
                    }
                }
            }

            // verify actual transaction instructions
            const expectedTransactionInstructions = [
                {
                    programId: 'ComputeBudget111111111111111111111111111111',
                    data: 'E7Sc3y',
                    accounts: [],
                },
                {
                    programId: 'ComputeBudget111111111111111111111111111111',
                    data: '3sFdV3DXantP',
                    accounts: [],
                },
                {
                    programId: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                    data: '',
                    accounts: [
                        'CiMyNyCrnHCgkcR39Vxv2LbXSjbdgL15PDwJds6ZaiPT',
                        'Ge3apdyTidx88bZjMZaXevvGvze1oxAJWewGYJ6DXGBi',
                        'CiMyNyCrnHCgkcR39Vxv2LbXSjbdgL15PDwJds6ZaiPT',
                        'BfxhMerBkBhRUGn4tX5YrBRqLqN8VjvUXHhU7K9Fpump',
                        '11111111111111111111111111111111',
                        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    ],
                },
                {
                    programId: '6m2CDdhRgxpH4WjvdzxAYbGxwdGUz5MziiL5jek2kBma',
                    data: '3oanNfRnEmjHSNqoG8cvGnC6D7gKDQa79Uy6Q8TTLm4gCbR71DS418KubN31gUHPYaN7Ln5jnGX37rtXYthaELjZVjDYRYSkvA7MpyMUWD5LTtw3mZ',
                    accounts: [],
                },
            ];
            for (let i = 0; i < expectedTransactionInstructions.length; i++) {
                const tIx = parsed.transaction.message.instructions[i];
                const eIx = expectedTransactionInstructions[i];
                expect(tIx.programId.toString()).toEqual(eIx.programId.toString());
            }
        });

        test('raw legacy txn test', async () => {
            const rawTxn = JSON.parse(
                fs.readFileSync('tests/core/raw-legacy.json', 'utf-8')
            ) as unknown as TransactionResponse;
            const parsed = parseRawTransaction(rawTxn!);
            expect(parsed.meta.innerInstructions.length).toEqual(
                rawTxn.meta?.innerInstructions?.length
            );
            expect(rawTxn.transaction.message.instructions.length).toEqual(
                parsed.transaction.message.instructions.length
            );
        });
    });
});
