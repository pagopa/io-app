import { fromPromise } from "xstate5";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { assert } from "../../../../utils/assert";
import {
  getIntegrityHardwareKeyTag,
  registerWalletInstance
} from "../../common/utils/itwAttestationUtils";
import { type Identification } from "./context";

export type RequestEidActorParams = {
  integrityKeyTag: string | undefined;
  identification: Identification | undefined;
};

export const createEidIssuanceActorsImplementation = () => ({
  createWalletInstance: fromPromise<string>(async () => {
    try {
      const hardwareKeyTag = await getIntegrityHardwareKeyTag();
      await registerWalletInstance(hardwareKeyTag);
      return Promise.resolve(hardwareKeyTag);
    } catch (e) {
      return Promise.reject(e);
    }
  }),

  requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
    async ({ input }) => {
      assert(input.integrityKeyTag, "integrityKeyTag is undefined");
      assert(input.identification, "identification is undefined");

      return await issuanceUtils.getPid({
        integrityKeyTag: input.integrityKeyTag,
        identification: input.identification
      });
    }
  )
});
