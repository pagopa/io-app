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
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { type IdentificationContext } from "./context";

export type RequestEidActorParams = {
  integrityKeyTag: string | undefined;
  identification: IdentificationContext | undefined;
};

export const createEidIssuanceActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  createWalletInstance: fromPromise<string>(async () => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");
    const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

    // If there is a stored key tag we assume the wallet instance was already created
    // so we just need to prepare the integrity service and return the existing key tag.
    if (O.isSome(storedIntegrityKeyTag)) {
      await ensureIntegrityServiceIsReady();
      return storedIntegrityKeyTag.value;
    }

    const hardwareKeyTag = await getIntegrityHardwareKeyTag();
    await registerWalletInstance(hardwareKeyTag, sessionToken);

    return hardwareKeyTag;
  }),

  requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
    async ({ input }) => {
      const sessionToken = sessionTokenSelector(store.getState());
      assert(sessionToken, "sessionToken is undefined");
      assert(input.integrityKeyTag, "integrityKeyTag is undefined");
      assert(input.identification, "identification is undefined");

      return await issuanceUtils.getPid({
        integrityKeyTag: input.integrityKeyTag,
        sessionToken,
        identification: input.identification
      });
    }
  )
});
