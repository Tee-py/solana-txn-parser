export * from "./parser/pumpfun"

import { clusterApiUrl, Connection } from "@solana/web3.js";
import {PumpFunParser} from "./parser/pumpfun";

const run = async () => {
    const sig1 = "3tJczs8y2bR8tVALRQZBZFihn2gZ9EWJuHgKQiyiWawr3aCNekd76BNX78fero23nv4afmsuE5Rsa99RccCijWy5";
    const sig2 = "4XQZckrFKjaLHM68kJH7dpSPo2TCfMkwjYhLdcNRu5QdJTjAEehsS5UMaZKDXADD46d8v4XnuyuvLV36rNRTKhn7";
    const conn = new Connection(clusterApiUrl("mainnet-beta"));

    const parsedTxn1 = await conn.getParsedTransaction(sig1, { commitment: "confirmed", maxSupportedTransactionVersion: 0});
    const parsedTxn2 = await conn.getParsedTransaction(sig2, { commitment: "confirmed", maxSupportedTransactionVersion: 0});
    //const txn = await conn.getTransaction(sig, {commitment: "confirmed", maxSupportedTransactionVersion: 0});

    // fs.writeFileSync("parsed-sell-txn.json", JSON.stringify(parsedTxn, null, 2));
    // fs.writeFileSync("txn.json", JSON.stringify(txn, null, 2));

    const parser = new PumpFunParser();
    const results = parser.parseMultiple([parsedTxn1!, parsedTxn2!])
    console.log(results)
    //console.log(txn)
}

run()