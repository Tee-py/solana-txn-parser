import {
    ParsedInstruction,
    ParsedTransactionWithMeta,
    PartiallyDecodedInstruction,
    PublicKey,
} from '@solana/web3.js';

export const flattenInnerInstructions = (transaction: ParsedTransactionWithMeta) => {
    const flattended = [];
    for (const innerIx of transaction.meta?.innerInstructions || []) {
        flattended.push(...innerIx.instructions);
    }
    return flattended;
};

export const getAccountSOLBalanceChange = (
    transaction: ParsedTransactionWithMeta,
    account: PublicKey
) => {
    const accountIndex = transaction.transaction.message.accountKeys.findIndex(
        (acct) => acct.pubkey.toString() == account.toString()
    );
    if (accountIndex == -1) return 0;
    const preBalances = transaction.meta?.preBalances || [];
    const postBalances = transaction.meta?.postBalances || [];
    return Math.abs(postBalances[accountIndex] - preBalances[accountIndex]);
};

export const getSplTransfers = (
    instructions: (ParsedInstruction | PartiallyDecodedInstruction)[]
) => {
    return instructions.filter(
        (ix) =>
            ix.programId.toString() == 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' &&
            // @ts-ignore
            ix.parsed.type == 'transfer'
    );
};

export const getSOLTransfers = (
    instructions: (ParsedInstruction | PartiallyDecodedInstruction)[]
) => {
    return instructions.filter(
        (ix) =>
            ix.programId.toString() == '11111111111111111111111111111111' &&
            // @ts-ignore
            ix.parsed.type == 'transfer'
    );
};
