import { fromPromise } from "xstate5";
import { deleteKey } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { assert } from "../../../../utils/assert";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import {
  getAttestation,
  getIntegrityHardwareKeyTag,
  registerWalletInstance,
  WalletAttestationResult
} from "../../common/utils/itwAttestationUtils";
import { useIOStore } from "../../../../store/hooks";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import type {
  WalletAttestationContext,
  IdentificationContext,
  CieAuthContext
} from "./context";

export type RequestEidActorParams = {
  identification: IdentificationContext | undefined;
  walletAttestationContext: WalletAttestationContext | undefined;
  cieAuthContext: CieAuthContext | undefined;
};

export type StartCieAuthFlowActorParams = {
  walletAttestationContext: WalletAttestationContext | undefined;
};

export type CompleteCieAuthFlowActorParams = {
  cieAuthContext: CieAuthContext | undefined;
  walletAttestationContext: WalletAttestationContext | undefined;
};

export type GetWalletAttestationActorParams = {
  integrityKeyTag: string | undefined;
};

export type CleanUpActorParams = {
  walletAttestationKeyTag: string | undefined;
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

  getWalletAttestation: fromPromise<
    WalletAttestationResult,
    GetWalletAttestationActorParams
  >(({ input }) => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");
    assert(input.integrityKeyTag, "integrityKeyTag is undefined");

    return getAttestation(input.integrityKeyTag, sessionToken);
  }),

  requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
    async ({ input }) => {
      assert(input.identification, "identification is undefined");
      assert(
        input.walletAttestationContext,
        "walletAttestationContext is undefined"
      );

      // When using CIE + PIN the authorization flow was already started, we just need to complete it
      if (input.identification.mode === "ciePin") {
        assert(
          input.cieAuthContext,
          "cieAuthContext must exist when the identification mode is ciePin"
        );

        const authParams = await issuanceUtils.completeCieAuthFlow({
          ...input.cieAuthContext,
          ...input.walletAttestationContext
        });
        return issuanceUtils.getPid({
          ...authParams,
          ...input.cieAuthContext
        });
      }

      // SPID & CieID flow
      const authParams = await issuanceUtils.startAndCompleteFullAuthFlow({
        identification: input.identification,
        ...input.walletAttestationContext
      });
      return issuanceUtils.getPid(authParams);
    }
  ),

  startCieAuthFlow: fromPromise<CieAuthContext, StartCieAuthFlowActorParams>(
    async ({ input }) => {
      assert(
        input.walletAttestationContext,
        "walletAttestationContext is undefined"
      );

      const cieAuthContext = await issuanceUtils.startCieAuthFlow(
        input.walletAttestationContext
      );

      return {
        ...cieAuthContext,
        callbackUrl: "" // This is not important in this phase, it will be set after completing the CIE auth flow
      };
    }
  ),

  /**
   * Actor used to perform any clean up logic at the end of the issuance flow.
   */
  cleanUp: fromPromise<void, CleanUpActorParams>(async ({ input }) => {
    if (input.walletAttestationKeyTag) {
      return deleteKey(input.walletAttestationKeyTag);
    }
  })
});
