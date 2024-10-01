import { CryptoContext } from "@pagopa/io-react-native-jwt";
import { createCryptoContextFor } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { assert } from "../../../../utils/assert";
import { trackItwRequest } from "../../analytics";
import {
  getAttestation,
  getIntegrityHardwareKeyTag,
  registerWalletInstance,
  WalletAttestationResult
} from "../../common/utils/itwAttestationUtils";
import { WIA_KEYTAG } from "../../common/utils/itwCryptoContextUtils";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/reducers";
import type { CieAuthContext, IdentificationContext } from "./context";

export type OnInitActorOutput = {
  integrityKeyTag: string | undefined;
  wiaCryptoContext: CryptoContext;
  walletInstanceAttestation: string | undefined;
};

export type RequestEidActorParams = {
  identification: IdentificationContext | undefined;
  wiaCryptoContext: CryptoContext | undefined;
  walletInstanceAttestation: string | undefined;
  cieAuthContext: CieAuthContext | undefined;
};

export type StartCieAuthFlowActorParams = {
  wiaCryptoContext: CryptoContext | undefined;
  walletInstanceAttestation: string | undefined;
};

export type CompleteCieAuthFlowActorParams = {
  cieAuthContext: CieAuthContext | undefined;
  wiaCryptoContext: CryptoContext | undefined;
  walletInstanceAttestation: string | undefined;
};

export type GetWalletAttestationActorParams = {
  integrityKeyTag: string | undefined;
};

export const createEidIssuanceActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  onInit: fromPromise<OnInitActorOutput>(async () => {
    const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);
    const walletInstanceAttestation = itwWalletInstanceAttestationSelector(
      store.getState()
    );
    const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

    return {
      integrityKeyTag: O.toUndefined(storedIntegrityKeyTag),
      wiaCryptoContext,
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
      await ensureIntegrityServiceIsReady();
      return storedIntegrityKeyTag.value;
    }

    // Reset the wallet store to prevent having dirty state before registering a new wallet instance
    store.dispatch(itwLifecycleStoresReset());
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
      assert(input.wiaCryptoContext, "wiaCryptoContext is undefined");
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
          walletAttestation: input.walletInstanceAttestation,
          wiaCryptoContext: input.wiaCryptoContext
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
        walletAttestation: input.walletInstanceAttestation,
        wiaCryptoContext: input.wiaCryptoContext
      });

      trackItwRequest(input.identification.mode);

      return issuanceUtils.getPid(authParams);
    }
  ),

  startCieAuthFlow: fromPromise<CieAuthContext, StartCieAuthFlowActorParams>(
    async ({ input }) => {
      assert(input.wiaCryptoContext, "wiaCryptoContext is undefined");
      assert(
        input.walletInstanceAttestation,
        "walletInstanceAttestation is undefined"
      );

      const cieAuthContext = await issuanceUtils.startCieAuthFlow({
        walletAttestation: input.walletInstanceAttestation,
        wiaCryptoContext: input.wiaCryptoContext
      });

      return {
        ...cieAuthContext,
        callbackUrl: "" // This is not important in this phase, it will be set after completing the CIE auth flow
      };
    }
  )
});
