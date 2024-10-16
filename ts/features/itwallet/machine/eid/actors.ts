import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { assert } from "../../../../utils/assert";
import { trackItwRequest } from "../../analytics";
import {
  getAttestation,
  getIntegrityHardwareKeyTag,
  registerWalletInstance
} from "../../common/utils/itwAttestationUtils";
import { revokeCurrentWalletInstance } from "../../common/utils/itwRevocationUtils";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/reducers";
import type { CieAuthContext, IdentificationContext } from "./context";

export type OnInitActorOutput = {
  integrityKeyTag: string | undefined;
  walletInstanceAttestation: string | undefined;
};

export type RequestEidActorParams = {
  identification: IdentificationContext | undefined;
  walletInstanceAttestation: string | undefined;
  cieAuthContext: CieAuthContext | undefined;
};

export type StartCieAuthFlowActorParams = {
  walletInstanceAttestation: string | undefined;
};

export type CompleteCieAuthFlowActorParams = {
  cieAuthContext: CieAuthContext | undefined;
  walletInstanceAttestation: string | undefined;
};

export type GetWalletAttestationActorParams = {
  integrityKeyTag: string | undefined;
};

export const createEidIssuanceActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  onInit: fromPromise<OnInitActorOutput>(async () => {
    const walletInstanceAttestation = itwWalletInstanceAttestationSelector(
      store.getState()
    );
    const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

    return {
      integrityKeyTag: O.toUndefined(storedIntegrityKeyTag),
      walletInstanceAttestation
    };
  }),

  createWalletInstance: fromPromise<string>(async () => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");
    const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

    // If there is a stored key tag we assume the wallet instance was already created
    // so we just need to prepare the integrity service and return the existing key tag.
    if (O.isSome(storedIntegrityKeyTag)) {
      return storedIntegrityKeyTag.value;
    }

    // Reset the wallet store to prevent having dirty state before registering a new wallet instance
    store.dispatch(itwLifecycleStoresReset());
    const hardwareKeyTag = await getIntegrityHardwareKeyTag();
    await registerWalletInstance(hardwareKeyTag, sessionToken);

    return hardwareKeyTag;
  }),

  getWalletAttestation: fromPromise<string, GetWalletAttestationActorParams>(
    ({ input }) => {
      const sessionToken = sessionTokenSelector(store.getState());
      assert(sessionToken, "sessionToken is undefined");
      assert(input.integrityKeyTag, "integrityKeyTag is undefined");

      return getAttestation(input.integrityKeyTag, sessionToken);
    }
  ),

  requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
    async ({ input }) => {
      assert(input.identification, "identification is undefined");
      assert(
        input.walletInstanceAttestation,
        "walletInstanceAttestation is undefined"
      );

      // When using CIE + PIN the authorization flow was already started, we just need to complete it
      if (input.identification.mode === "ciePin") {
        assert(
          input.cieAuthContext,
          "cieAuthContext must exist when the identification mode is ciePin"
        );

        const authParams = await issuanceUtils.completeCieAuthFlow({
          ...input.cieAuthContext,
          walletAttestation: input.walletInstanceAttestation
        });
        trackItwRequest("ciePin");
        return issuanceUtils.getPid({
          ...authParams,
          ...input.cieAuthContext
        });
      }

      // SPID & CieID flow
      const authParams = await issuanceUtils.startAndCompleteFullAuthFlow({
        identification: input.identification,
        walletAttestation: input.walletInstanceAttestation
      });

      trackItwRequest(input.identification.mode);

      return issuanceUtils.getPid(authParams);
    }
  ),

  startCieAuthFlow: fromPromise<CieAuthContext, StartCieAuthFlowActorParams>(
    async ({ input }) => {
      assert(
        input.walletInstanceAttestation,
        "walletInstanceAttestation is undefined"
      );

      const cieAuthContext = await issuanceUtils.startCieAuthFlow({
        walletAttestation: input.walletInstanceAttestation
      });

      return {
        ...cieAuthContext,
        callbackUrl: "" // This is not important in this phase, it will be set after completing the CIE auth flow
      };
    }
  ),

  revokeWalletInstance: fromPromise(async () => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");

    await revokeCurrentWalletInstance(sessionToken);
  })
});
