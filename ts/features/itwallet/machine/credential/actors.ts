import { fromPromise } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export default () => ({
  registerWalletInstance: fromPromise<string>(async () => ""),
  requestCredential: fromPromise<
    StoredCredential,
    StoredCredential | undefined
  >(async () => ({} as StoredCredential))
});
