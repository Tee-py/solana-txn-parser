import { ParsedInstruction, ParsedMessageAccount, ParsedTransactionWithMeta, PartiallyDecodedInstruction, PublicKey } from "@solana/web3.js";

export const flattenInnerInstructions = (transaction: ParsedTransactionWithMeta) => {
    const flattended = [];
    for (const innerIx of transaction.meta?.innerInstructions || []) {
        flattended.push(...innerIx.instructions)
    }
    return flattended
}

export const getAccountIndex = (accounts: ParsedMessageAccount[], target: string) => {
    return accounts.findIndex((acct) => acct.pubkey.toString() == target)
}

export const getAccountSOLBalanceChange = (transaction: ParsedTransactionWithMeta, account: PublicKey) => {
    const accountIndex = transaction.transaction.message.accountKeys.findIndex(acct => acct.pubkey.equals(account));
    if (accountIndex == -1) return 0
    const preBalances = transaction.meta?.preBalances || []
    const postBalances = transaction.meta?.postBalances || []
    return Math.abs(postBalances[accountIndex] - preBalances[accountIndex]) 
}

export const getAccountTokenBalanceChange = (transaction: ParsedTransactionWithMeta, account: PublicKey) => {
    const accountIndex = transaction.transaction.message.accountKeys.findIndex(acct => acct.pubkey.equals(account));
    if (accountIndex == -1) return 0
    const preBalances = transaction.meta?.preBalances || []
    const postBalances = transaction.meta?.postBalances || []
    return Math.abs(postBalances[accountIndex] - preBalances[accountIndex]) 
}

export const getSplTransfers = (instructions: (ParsedInstruction | PartiallyDecodedInstruction)[]) => {
    // @ts-ignore
    return instructions.filter(ix=>ix.programId.toString() == "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" && ix.parsed.type == "transfer")
}

export const getSOLTransfers = (instructions: (ParsedInstruction | PartiallyDecodedInstruction)[]) => {
    // @ts-ignore
    return instructions.filter(ix=>ix.programId.toString() == "11111111111111111111111111111111" && ix.parsed.type == "transfer")
}