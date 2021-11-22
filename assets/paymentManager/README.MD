### 2021-11-11
- add PayPal payment method in WalletV2. 
- `emailPp` and `psp` in `PayPalInfo` differently from the official specs are made as required ([more info](https://pagopa.atlassian.net/browse/IA-445))
- removed `creationDate` from `PayPalInfo` since the app doesn't use it
- add `Generic` to `WalletV2/walletType` in order to avoid decoding failure ([more info](https://github.com/pagopa/io-app/pull/3499#discussion_r754123656))
### 2021-11-04
- add PayPal search psp API `/v3/paypal/searchPSP`. All fields have been defined as required even if the original spec were not ([more info](https://pagopa.atlassian.net/browse/PM-253?focusedCommentId=22100))

### 2021-11-02
- `spec.json` moved from [io-service-metadata](https://github.com/pagopa/io-services-metadata) to io-app ([more info](https://pagopa.atlassian.net/browse/IA-409))
