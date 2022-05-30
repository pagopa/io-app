### 2022-05-27
- Created a new structure `TransactionAmount` used to replace the generic `Amount` definition inside `Transaction`. This new structure differs from the normal `Amount` just on the `amount` property which is now **required**.
- Marked fields as **required** in the `Transaction` structure in order to replace the changes made manually in the code (take a look at https://github.com/pagopa/io-app/pull/3963):
  - `created`
  - `description`
  - `id`
  - `idPayment`
  - `idWallet`
  - `merchant`
  - `statusMessage`
  - `grandTotal`
  - `amount`

### 2021-12-03
- ignored `payPals` field in `Wallet` since the relative model is different from the one returned by the API and the app doesn't use it

### 2021-11-30
- add `/v2/payments/{idPayment}/psps` API definition
- add `PspDataListResponse` definition
- add `PspData` definition
----
### 2021-11-26
- add `PAYPAL` to `type` field in Wallet (V1) enum
- renamed `PayPalInfo` to `PayPalAccountPspInfo`
- sync `PayPalAccountPspInfo` with the last spec
- ignored `dataAssociazione` field in `PayPalPspInfo` since the app doesn't use it

### 2021-11-11
- add PayPal payment method in WalletV2. 
- `emailPp` and `psp` in `PayPalInfo` differently from the official specs are made as required ([more info](https://pagopa.atlassian.net/browse/IA-445))
- removed `creationDate` from `PayPalInfo` since the app doesn't use it
- add `Generic` to `WalletV2/walletType` in order to avoid decoding failure ([more info](https://github.com/pagopa/io-app/pull/3499#discussion_r754123656))
----
### 2021-11-04
- add PayPal search psp API `/v3/paypal/searchPSP`. All fields have been defined as required even if the original spec were not ([more info](https://pagopa.atlassian.net/browse/PM-253?focusedCommentId=22100))
----
### 2021-11-02
- `spec.json` moved from [io-service-metadata](https://github.com/pagopa/io-services-metadata) to io-app ([more info](https://pagopa.atlassian.net/browse/IA-409))
