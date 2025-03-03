import { clusterApiUrl, Connection, ParsedTransactionWithMeta } from '@solana/web3.js';
import fs from 'fs';
import { RaydiumV4Parser } from '../../src/parser/raydium';
import {
    AddLiquidityInfo,
    CreatePoolInfo,
    RemoveLiquidityInfo,
    SwapInfo,
} from '../../src/parser/raydium/v4/types';

describe('Raydium Parser', () => {
    const swapBaseInTransaction = JSON.parse(
        fs.readFileSync('tests/raydium/parsed-swap-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const swapBaseOutTransaction = JSON.parse(
        fs.readFileSync('tests/raydium/parsed-swap-base-out-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const createPoolTransaction = JSON.parse(
        fs.readFileSync('tests/raydium/parsed-init-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const addLiquidityTransaction = JSON.parse(
        fs.readFileSync('tests/raydium/parsed-deposit-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const removeLiquidityTransaction = JSON.parse(
        fs.readFileSync('tests/raydium/parsed-withdraw-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const parser = new RaydiumV4Parser(connection, { maxPoolCache: 100 });

    test('parse should correctly identify swap action [base in]', async () => {
        const result = await parser.parse(swapBaseInTransaction);
        expect(result?.platform).toEqual('raydiumv4');
        expect(result?.actions.length).toEqual(5);
        for (const action of result?.actions || []) {
            expect(action.type).toEqual('swap');
            expect(action.info.poolId.toString()).toEqual(
                'ZFBZunJyh7HZWJrrUUazZiVegN8SXXBrHYVYMEeWG4T'
            );
            expect((action.info as SwapInfo).tokenIn.toString()).toEqual(
                'So11111111111111111111111111111111111111112'
            );
            expect((action.info as SwapInfo).tokenOut.toString()).toEqual(
                'GPrF7LXiQAY8Y9Fci7et2C7a9JsrCBDRvEAKLCjLpump'
            );
            expect((action.info as SwapInfo).tokenInDecimal).toEqual(BigInt(9));
            expect((action.info as SwapInfo).tokenOutDecimal).toEqual(BigInt(6));
        }
    });

    test('parse should correctly identify swap action [base out]', async () => {
        const result = await parser.parse(swapBaseOutTransaction);
        expect(result?.platform).toEqual('raydiumv4');
        expect(result?.actions.length).toEqual(1);
        for (const action of result?.actions || []) {
            expect(action.type).toEqual('swap');
            expect(action.info.poolId.toString()).toEqual(
                '43QDFSth4Fu2JFVKto13zASQu8Dc7RL6wkUqksgeYvqq'
            );
            expect((action.info as SwapInfo).tokenIn.toString()).toEqual(
                '9Zw3CR7NPD6hXNk5PZYpYKsvWv9puwr1eEaPxXRapump'
            );
            expect((action.info as SwapInfo).tokenOut.toString()).toEqual(
                'So11111111111111111111111111111111111111112'
            );
            expect((action.info as SwapInfo).tokenInDecimal).toEqual(BigInt(9));
            expect((action.info as SwapInfo).tokenOutDecimal).toEqual(BigInt(9));
        }
    });

    test('parse create pool info', async () => {
        const result = await parser.parse(createPoolTransaction);
        expect(result?.platform).toEqual('raydiumv4');
        expect(result?.actions.length).toEqual(1);
        for (const action of result?.actions || []) {
            expect(action.type).toEqual('create');
            expect(action.info.poolId.toString()).toEqual(
                '43QDFSth4Fu2JFVKto13zASQu8Dc7RL6wkUqksgeYvqq'
            );
            expect((action.info as CreatePoolInfo).baseMint.toString()).toEqual(
                '9Zw3CR7NPD6hXNk5PZYpYKsvWv9puwr1eEaPxXRapump'
            );
            expect((action.info as CreatePoolInfo).quoteMint.toString()).toEqual(
                'So11111111111111111111111111111111111111112'
            );
            expect((action.info as CreatePoolInfo).baseDecimals).toEqual(9);
            expect((action.info as CreatePoolInfo).quoteDecimals).toEqual(9);
            expect((action.info as CreatePoolInfo).baseAmountIn).toEqual(
                BigInt('4000000000000000')
            );
            expect((action.info as CreatePoolInfo).quoteAmountIn).toEqual(BigInt('100000000'));
            expect((action.info as CreatePoolInfo).marketId.toString()).toEqual(
                'Cux4RjDHhRUYkNLePxrRo97ppg3LopHfg1mE2RF2gPY'
            );
            expect((action.info as CreatePoolInfo).user.toString()).toEqual(
                '5z4giZ7YjS7LMGYfPjCUA8qUUxNSFm3Ru3xGtKCziqb6'
            );
        }
    });

    test('parse add liquidity action', async () => {
        const result = await parser.parse(addLiquidityTransaction);
        expect(result?.platform).toEqual('raydiumv4');
        expect(result?.actions.length).toEqual(1);
        for (const action of result?.actions || []) {
            expect(action.type).toEqual('add');
            expect(action.info.poolId.toString()).toEqual(
                '43QDFSth4Fu2JFVKto13zASQu8Dc7RL6wkUqksgeYvqq'
            );
            expect((action.info as AddLiquidityInfo).baseMint.toString()).toEqual(
                '9Zw3CR7NPD6hXNk5PZYpYKsvWv9puwr1eEaPxXRapump'
            );
            expect((action.info as AddLiquidityInfo).quoteMint.toString()).toEqual(
                'So11111111111111111111111111111111111111112'
            );
            expect((action.info as AddLiquidityInfo).baseDecimal).toEqual(BigInt(9));
            expect((action.info as AddLiquidityInfo).quoteDecimal).toEqual(BigInt(9));
            expect((action.info as AddLiquidityInfo).baseAmountIn).toEqual(
                BigInt('214323699689057')
            );
            expect((action.info as AddLiquidityInfo).quoteAmountIn).toEqual(BigInt('1000000'));
            expect((action.info as AddLiquidityInfo).mintedLpAmount).toEqual(BigInt('14561191343'));
            expect((action.info as AddLiquidityInfo).user.toString()).toEqual(
                '5z4giZ7YjS7LMGYfPjCUA8qUUxNSFm3Ru3xGtKCziqb6'
            );
        }
    });

    test('parse remove liquidity action', async () => {
        const result = await parser.parse(removeLiquidityTransaction);
        expect(result?.platform).toEqual('raydiumv4');
        expect(result?.actions.length).toEqual(1);
        for (const action of result?.actions || []) {
            expect(action.type).toEqual('remove');
            expect(action.info.poolId.toString()).toEqual(
                '43QDFSth4Fu2JFVKto13zASQu8Dc7RL6wkUqksgeYvqq'
            );
            expect((action.info as RemoveLiquidityInfo).baseMint.toString()).toEqual(
                '9Zw3CR7NPD6hXNk5PZYpYKsvWv9puwr1eEaPxXRapump'
            );
            expect((action.info as RemoveLiquidityInfo).quoteMint.toString()).toEqual(
                'So11111111111111111111111111111111111111112'
            );
            expect((action.info as RemoveLiquidityInfo).baseDecimal).toEqual(BigInt(9));
            expect((action.info as RemoveLiquidityInfo).quoteDecimal).toEqual(BigInt(9));
            expect((action.info as RemoveLiquidityInfo).baseAmountOut).toEqual(
                BigInt('590358717042758')
            );
            expect((action.info as RemoveLiquidityInfo).quoteAmountOut).toEqual(BigInt('2457502'));
            expect((action.info as RemoveLiquidityInfo).lpAmountOut).toEqual(BigInt('37887331922'));
            expect((action.info as RemoveLiquidityInfo).user.toString()).toEqual(
                '5z4giZ7YjS7LMGYfPjCUA8qUUxNSFm3Ru3xGtKCziqb6'
            );
        }
    });

    test('parseMultiple should parse multiple transactions', async () => {
        const result = await parser.parseMultiple([
            swapBaseInTransaction,
            swapBaseOutTransaction,
            createPoolTransaction,
            addLiquidityTransaction,
            removeLiquidityTransaction,
        ]);
        expect(result?.length).toEqual(5);
    });

    test('Edge cases tests', async () => {
        const txn1 = JSON.parse(
            fs.readFileSync('tests/raydium/swap-edge-1.json', 'utf-8')
        ) as unknown as ParsedTransactionWithMeta;
        const txn2 = JSON.parse(
            fs.readFileSync('tests/raydium/swap-edge-2.json', 'utf-8')
        ) as unknown as ParsedTransactionWithMeta;
        const parsed = await parser.parseMultiple([txn1!, txn2!]);

        // checks for the first
        expect((parsed || [])[0].platform).toEqual('raydiumv4');
        expect((parsed || [])[0].actions.length).toEqual(1);
        for (const action of (parsed || [])[0].actions || []) {
            expect(action.type).toEqual('swap');
            expect(action.info.poolId.toString()).toEqual(
                'FeMTcuyjT3KWd1f1f5n5MaXnUZRSwchtwtwV6R7XPk86'
            );
            expect((action.info as SwapInfo).tokenIn.toString()).toEqual(
                '4qu5jPY7dDkmtB6Q4iECFyWjaESTfwiAK86g99yPpump'
            );
            expect((action.info as SwapInfo).tokenOut.toString()).toEqual(
                'So11111111111111111111111111111111111111112'
            );
            expect((action.info as SwapInfo).tokenInDecimal).toEqual(BigInt(6));
            expect((action.info as SwapInfo).tokenOutDecimal).toEqual(BigInt(9));
        }

        // checks for the second
        expect((parsed || [])[1].platform).toEqual('raydiumv4');
        expect((parsed || [])[1].actions.length).toEqual(1);
        for (const action of (parsed || [])[1].actions || []) {
            expect(action.type).toEqual('swap');
            expect(action.info.poolId.toString()).toEqual(
                'FeMTcuyjT3KWd1f1f5n5MaXnUZRSwchtwtwV6R7XPk86'
            );
            expect((action.info as SwapInfo).tokenIn.toString()).toEqual(
                'So11111111111111111111111111111111111111112'
            );
            expect((action.info as SwapInfo).tokenOut.toString()).toEqual(
                '4qu5jPY7dDkmtB6Q4iECFyWjaESTfwiAK86g99yPpump'
            );
            expect((action.info as SwapInfo).tokenInDecimal).toEqual(BigInt(9));
            expect((action.info as SwapInfo).tokenOutDecimal).toEqual(BigInt(6));
        }
    });
});
