# 🚀 solana-txn-parser

An open-source transaction parser for popular DeFi applications on the Solana blockchain, written in TypeScript.

## 💪🏽 Supported DeFi Platforms

- PumpFun ✅
- Raydium 🔜
- Jupiter 🔜

## 👨‍🔧 Installation

```bash
npm install git+https://github.com/Tee-py/solana-txn-parser.git
```

## 👨🏽‍💻 Usage

### ▶️ PumpFun Parser

```typescript
import { PumpFunParser } from 'solana-txn-parser';
import { Connection, PublicKey, clusterApiUrl, ParsedTransactionWithMeta } from '@solana/web3.js';
import fs from "fs";

const connection = new Connection(clusterApiUrl('mainnet-beta'));
const parser = new PumpFunParser();

// Fetch a transaction
const txnSig = '<transaction_signature>'
const txn1 = await connection.getParsedTransaction(txnSig);

// Parse single transaction
const pumpTxn = parser.parse(transaction);
console.log(parsedTx);

// Parse multiple transactions
const txnSig2 = '<second transaction signature>'
const txn2 = await connection.getParsedTransaction(txnSig2)
const pumpTxns = parser.parseMultiple([txn1, txn2])

// Parse transaction from json file
const txn = JSON.parse(fs.readFileSync("<file_path>", "utf-8")) as unknown as ParsedTransactionWithMeta
const pumpTxn = parser.parse(txn)
```

#### Output Structure

The parser returns a `PumpFunTransaction` object (or an array of `PumpFunTransaction` objects if `parseMultiple` is called):

```typescript
interface PumpFunTransaction extends BaseParsedTransaction<PumpFunAction> {
    actions: PumpFunAction[];
}

type TradeInfo = {
    solAmount: bigint;    // Amount of SOL involved in the trade
    tokenAmount: bigint;  // Amount of tokens involved in the trade
    tokenMint: PublicKey; // Public key of the token mint
    traderTokenAccount: PublicKey; // Trader's associated token account
    trader: PublicKey;    // Public key of the trader
};

interface PumpFunAction extends BaseParsedAction {
    info: TradeInfo;
}
```

Each `PumpFunTransaction` contains an array of `PumpFunAction`s, representing the trades made in the transaction. The `TradeInfo` provides detailed information about each trade, including the amounts of SOL and tokens involved, and relevant public keys.

### ▶️ Raydium Parser [Comming soon]

### ▶️ Jupiter Parser [Coming soon]

### ▶️ Creating Custom Parsers

You can create custom parsers for other DeFi platforms by extending the `BaseParser` class:

```typescript
import { BaseParser, ParsedTransactionWithMeta } from 'solana-txn-parser';

// define action information
type ActionInfo = {
    // add neccessary fields for the action
};

// define your custom action
interface CustomAction extends BaseParsedAction {
    info: ActionInfo;
}

// define your custom transaction
interface CustomTransaction extends BaseParsedTransaction<CustomAction> {
    actions: CustomAction[];
}

// define your parser class
class CustomParser extends BaseParser<CustomTransaction> {
  parse(transaction: ParsedTransactionWithMeta): CustomTransaction {
    // Implement your parsing logic here
  }

  parseMultiple(transactions: ParsedTransactionWithMeta[]): CustomTransaction[] {
    return transactions.map((tx) => this.parse(tx));
  }
}
```

## 🤝 Contributing

Here's how you can contribute to the library:

### 🎉 Adding a New Parser

- Fork the repository and create a new branch for your parser.
- Create a new folder in the `src/parsers` directory for your parser (e.g., `newparser`).
- Add an index.ts file in the `src/parser/<newparser>` directory to hold your Parser logic
- Implement your parser by extending the `BaseParser` class.
- Write unit tests for your parser in the `tests/newparser` directory.
- Update the README.md to include documentation for your new parser.
- Submit a pull request with your changes.

You can check the parser directory for more information on how to implement your new parser

### ♻️ Modifying/Improving Existing Parsers

- Fork the repository and create a new branch for your modifications.
- Make your changes to the existing parser file.
- If you're adding new functionality, make sure to add corresponding unit tests.
- If you're fixing a bug, add a test case that would have caught the bug.
- Update the README.md if your changes affect the usage of the parser.
- Submit a pull request with your changes, explaining the modifications and their purpose.

For all contributions, please ensure your code passes all existing tests. You can also help in improving the tests for the existing parsers. 

## 🗂️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.