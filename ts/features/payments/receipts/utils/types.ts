import * as t from "io-ts";

/**
 * Receipts headers
 * This is the type of the headers returned by the BizEvents API
 * due to resolve wrong type error in the auto-generated client
 */
export const ReceiptsHeaders = t.type({
  map: t.type({
    "x-continuation-token": t.string
  })
});

export const DownloadReceiptHeaders = t.type({
  map: t.type({
    "content-disposition": t.string
  })
});

export type DownloadReceiptHeaders = t.TypeOf<typeof DownloadReceiptHeaders>;
