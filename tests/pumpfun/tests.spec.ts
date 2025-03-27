import { ParsedTransactionWithMeta } from '@solana/web3.js';
import { PumpFunParser } from '../../src';
import fs from 'fs';
import { CompleteInfo, CreateInfo, TradeInfo } from '../../src/parser/pumpfun/types';
describe('PumpFunParser', () => {
    const buyTransaction = JSON.parse(
        fs.readFileSync('tests/pumpfun/parsed-buy-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const sellTransaction = JSON.parse(
        fs.readFileSync('tests/pumpfun/parsed-sell-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const createTransaction = JSON.parse(
        fs.readFileSync('tests/pumpfun/parsed-create-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const completeTransaction = JSON.parse(
        fs.readFileSync('tests/pumpfun/parsed-complete-txn.json', 'utf-8')
    ) as unknown as ParsedTransactionWithMeta;
    const parser = new PumpFunParser();

    test('parse should correctly identify trade action [buy]', async () => {
        const result = parser.parse(buyTransaction);
        const expectedActionInfos = [
            {
                tokenMint: '63XVR6bgnKN8Mpt6iavzQH5Z2ig5EGd4sHvrGFuBpump',
                solAmount: '3766555',
                tokenAmount: '134031426910',
                trader: 'CBFCFmju7azw3pDHXWre24PjvDVrYwDdfgiKejmvJJqj',
                isBuy: true,
                timestamp: '1737713686',
                virtualSolReserves: '30078520006',
                virtualTokenReserves: '1070198932876269',
            },
            {
                tokenMint: '63XVR6bgnKN8Mpt6iavzQH5Z2ig5EGd4sHvrGFuBpump',
                solAmount: '7255022',
                tokenAmount: '258072669121',
                trader: 'AhRYQBSvkAR5WEr1hDFEz6NwfVKkcS5G37ZM14yFUE8A',
                isBuy: true,
                timestamp: '1737713686',
                virtualSolReserves: '30085775028',
                virtualTokenReserves: '1069940860207148',
            },
            {
                tokenMint: '63XVR6bgnKN8Mpt6iavzQH5Z2ig5EGd4sHvrGFuBpump',
                solAmount: '2170530',
                tokenAmount: '77185002179',
                trader: 'FspiJ3b2s3xoaGVWVidhi5kKhxuzGUMmk7qGGsF3Bpjv',
                isBuy: true,
                timestamp: '1737713686',
                virtualSolReserves: '30087945558',
                virtualTokenReserves: '1069863675204969',
            },
            {
                tokenMint: '63XVR6bgnKN8Mpt6iavzQH5Z2ig5EGd4sHvrGFuBpump',
                solAmount: '2600404',
                tokenAmount: '92456837488',
                trader: 'HAZyn8MtsGucsi6kJxwybnVjJxi7BtwriRU1SNB6NVft',
                isBuy: true,
                timestamp: '1737713686',
                virtualSolReserves: '30090545962',
                virtualTokenReserves: '1069771218367481',
            },
        ];

        expect(result.platform).toBe('pumpfun');
        expect(result.actions).toHaveLength(4);
        expect(result.actions.filter((a) => a.type == 'trade').length).toBe(4);
        expect(result.actions.filter((a) => (a.info as TradeInfo).isBuy).length).toBe(4);

        for (let i = 0; i < result.actions.length; i++) {
            expect((result.actions[i].info as TradeInfo).solAmount.toString()).toBe(
                expectedActionInfos[i].solAmount
            );
            expect((result.actions[i].info as TradeInfo).tokenAmount.toString()).toBe(
                expectedActionInfos[i].tokenAmount
            );
            expect((result.actions[i].info as TradeInfo).tokenMint.toString()).toBe(
                expectedActionInfos[i].tokenMint
            );
            expect((result.actions[i].info as TradeInfo).trader.toString()).toBe(
                expectedActionInfos[i].trader
            );
            expect((result.actions[i].info as TradeInfo).timestamp.toString()).toBe(
                expectedActionInfos[i].timestamp
            );
            expect((result.actions[i].info as TradeInfo).virtualSolReserves.toString()).toBe(
                expectedActionInfos[i].virtualSolReserves
            );
            expect((result.actions[i].info as TradeInfo).virtualTokenReserves.toString()).toBe(
                expectedActionInfos[i].virtualTokenReserves
            );
        }
    });

    test('parse should correctly identify trade action [sell]', () => {
        const result = parser.parse(sellTransaction);
        const expectedActionInfos = [
            {
                tokenMint: 'FstBRGMkNKf4wNvfieYUPS9YsbNoQJMCh6v89zajpump',
                solAmount: '3556271',
                tokenAmount: '94443000000',
                trader: '3P2pmfQAFTwcC1xWtYbVYoRn3hngya8Kd9jMaF5GfnUa',
                isBuy: false,
                timestamp: '1725658406',
                virtualSolReserves: '34813758823',
                virtualTokenReserves: '924634659228038',
            },
        ];

        expect(result.platform).toBe('pumpfun');
        expect(result.actions).toHaveLength(1);
        expect(result.actions.filter((a) => a.type == 'trade')).toHaveLength(1);
        expect(result.actions.filter((a) => !(a.info as TradeInfo).isBuy)).toHaveLength(1);

        for (let i = 0; i < result.actions.length; i++) {
            expect((result.actions[i].info as TradeInfo).solAmount.toString()).toBe(
                expectedActionInfos[i].solAmount
            );
            expect((result.actions[i].info as TradeInfo).tokenAmount.toString()).toBe(
                expectedActionInfos[i].tokenAmount
            );
            expect((result.actions[i].info as TradeInfo).tokenMint.toString()).toBe(
                expectedActionInfos[i].tokenMint
            );
            expect((result.actions[i].info as TradeInfo).trader.toString()).toBe(
                expectedActionInfos[i].trader
            );
            expect((result.actions[i].info as TradeInfo).timestamp.toString()).toBe(
                expectedActionInfos[i].timestamp
            );
            expect((result.actions[i].info as TradeInfo).virtualSolReserves.toString()).toBe(
                expectedActionInfos[i].virtualSolReserves
            );
            expect((result.actions[i].info as TradeInfo).virtualTokenReserves.toString()).toBe(
                expectedActionInfos[i].virtualTokenReserves
            );
        }
    });

    test('parse should correctly identify complete action', () => {
        const result = parser.parse(completeTransaction);
        const expectedActionInfos = [
            {
                tokenMint: 'B9ktH3g7mwgdoDgCgGRim6qeqPcyRVWJueXS12CMpump',
                bondingCurve: '5dhRAEw3LfUMTJcPqYSyasH45jHnWeZQmM2Hccic59SZ',
                user: 'd597QYedtvjQDVHZTCCGyJrwHNm2i49dkm5zS',
                timestamp: '1738104027',
            },
        ];
        const completeActions = result.actions.filter((a) => a.type == 'complete');
        expect(completeActions).toHaveLength(1);
        expect((completeActions[0].info as CompleteInfo).tokenMint.toString()).toBe(
            expectedActionInfos[0].tokenMint
        );
        expect((completeActions[0].info as CompleteInfo).bondingCurve.toString()).toBe(
            expectedActionInfos[0].bondingCurve
        );
        expect((completeActions[0].info as CompleteInfo).user.toString()).toBe(
            expectedActionInfos[0].user
        );
        expect((completeActions[0].info as CompleteInfo).timestamp.toString()).toBe(
            expectedActionInfos[0].timestamp
        );
    });

    test('parse should correctly identify create action', () => {
        const result = parser.parse(createTransaction);
        const expectedActionInfos = [
            {
                name: 'Blue Strip Fiend',
                symbol: 'Mosey',
                uri: 'https://ipfs.io/ipfs/QmQQAzxeHfPDRma1dNhcBP4k9ej4epU9U2T818FyEG7izP',
                tokenMint: '7F7TeMsGutc2YpxeH7U3PiFLwG2FygN2jMLeDKAXNbwu',
                bondingCurve: '6qK8Cazc6dqMSCfgN455J7aw1hHgknb6PeY8gjkAL4BE',
                tokenDecimals: 6,
                createdBy: 'FiYwf895W6ntoitNvhVwBLS4uwKZmMhsxiQmYY44488U',
            },
        ];
        const createActions = result.actions.filter((a) => a.type == 'create');
        expect(createActions).toHaveLength(1);
        expect((createActions[0].info as CreateInfo).name).toBe(expectedActionInfos[0].name);
        expect((createActions[0].info as CreateInfo).symbol).toBe(expectedActionInfos[0].symbol);
        expect((createActions[0].info as CreateInfo).uri).toBe(expectedActionInfos[0].uri);
        expect((createActions[0].info as CreateInfo).tokenMint.toString()).toBe(
            expectedActionInfos[0].tokenMint
        );
        expect((createActions[0].info as CreateInfo).bondingCurve.toString()).toBe(
            expectedActionInfos[0].bondingCurve
        );
        expect((createActions[0].info as CreateInfo).createdBy.toString()).toBe(
            expectedActionInfos[0].createdBy
        );
        expect((createActions[0].info as CreateInfo).tokenDecimals).toBe(
            expectedActionInfos[0].tokenDecimals
        );
    });

    test('parseMultiple should parse multiple transactions', () => {
        const results = parser.parseMultiple([buyTransaction, sellTransaction]);
        expect(results).toHaveLength(2);
        expect(results[0].platform).toBe('pumpfun');
        expect(results[1].platform).toBe('pumpfun');
        expect(results[0].actions[0].type == 'buy');
        expect(results[1].actions[0].type == 'sell');
    });
});
