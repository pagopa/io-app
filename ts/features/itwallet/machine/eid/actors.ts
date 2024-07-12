import { fromPromise } from "xstate5";
import * as O from "fp-ts/lib/Option";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { assert } from "../../../../utils/assert";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import {
  getIntegrityHardwareKeyTag,
  registerWalletInstance
} from "../../common/utils/itwAttestationUtils";
import { useIOStore } from "../../../../store/hooks";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { type Identification } from "./context";

export type RequestEidActorParams = {
  integrityKeyTag: string | undefined;
  identification: Identification | undefined;
};

export const createEidIssuanceActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  createWalletInstance: fromPromise<string>(async () => {
    const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

    // If there is a stored key tag we assume the wallet instance was already created
    // so we just need to prepare the integrity service and return the existing key tag.
    if (O.isSome(storedIntegrityKeyTag)) {
      await ensureIntegrityServiceIsReady();
      return storedIntegrityKeyTag.value;
    }

    const hardwareKeyTag = await getIntegrityHardwareKeyTag();
    await registerWalletInstance(hardwareKeyTag);
    return hardwareKeyTag;
  }),

  requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
    async ({ input }) => {
      assert(
        input.integrityKeyTag !== undefined,
        "integrityKeyTag is undefined"
      );
      assert(input.identification !== undefined, "identification is undefined");

      return await issuanceUtils.getPid({
        integrityKeyTag: input.integrityKeyTag,
        identification: input.identification
      });
    }
  )
});
