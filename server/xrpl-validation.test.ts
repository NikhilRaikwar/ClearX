import { describe, expect, it } from "vitest";
import { validatePaymentResult } from "./xrpl-validation.js";

const memo = "A".repeat(64); const source = "rSource"; const destination = "rDestination";
const expected = { source, destination, amountDrops: 10_000_000n, paymentReference: `0x${memo}` };
const valid = { validated:true, tx_json:{TransactionType:"Payment",Account:source,Destination:destination,Amount:"10000000",Memos:[{Memo:{MemoData:memo}}]},meta:{TransactionResult:"tesSUCCESS",delivered_amount:"10000000"} };
describe("XRPL payment preflight",()=>{
  it("accepts the exact direct payment",()=>expect(validatePaymentResult("B".repeat(64),valid,expected).amountDrops).toBe(10_000_000n));
  it.each([
    ["XRPL_TX_NOT_VALIDATED",{...valid,validated:false}],
    ["XRPL_SOURCE_MISMATCH",{...valid,tx_json:{...valid.tx_json,Account:"rWrong"}}],
    ["XRPL_DESTINATION_MISMATCH",{...valid,tx_json:{...valid.tx_json,Destination:"rWrong"}}],
    ["XRPL_AMOUNT_TOO_LOW",{...valid,meta:{...valid.meta,delivered_amount:"9999999"}}],
    ["XRPL_MEMO_COUNT_INVALID",{...valid,tx_json:{...valid.tx_json,Memos:[]}}],
    ["XRPL_MEMO_MISMATCH",{...valid,tx_json:{...valid.tx_json,Memos:[{Memo:{MemoData:"C".repeat(64)}}]}}],
    ["XRPL_PARTIAL_PAYMENT_NOT_ALLOWED",{...valid,tx_json:{...valid.tx_json,Flags:0x00020000}}],
  ])("rejects %s",(message,result)=>expect(()=>validatePaymentResult("B".repeat(64),result,expected)).toThrow(message));
});
