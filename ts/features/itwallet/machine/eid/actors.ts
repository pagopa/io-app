/* eslint-disable @typescript-eslint/no-empty-function */
import { fromPromise } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export default () => ({
  registerWalletInstance: fromPromise<string>(async () => ""),
  requestEid: fromPromise<StoredCredential, string | undefined>(
    async () => ({} as StoredCredential)
  )
});
