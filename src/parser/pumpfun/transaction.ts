import { BaseParsedTransaction } from "../../core/base";
import { PumpFunAction } from "./instruction";

export interface PumpFunTransaction extends BaseParsedTransaction<PumpFunAction> {
    actions: PumpFunAction[]
}