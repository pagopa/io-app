import { IOToast } from "@pagopa/io-app-design-system";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ActionArgs } from "xstate5";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { walletUpsertCard } from "../../../newWallet/store/actions/cards";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { itwCredentialNameByCredentialType } from "../../common/utils/itwMocksUtils";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { ITW_ROUTES } from "../../navigation/routes";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";

export default (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>,
  toast: IOToast
) => ({
  navigateToTrustIssuerScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER
    });
  },

  navigateToCredentialPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE
    });
  },

  navigateToWallet: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    const credentialName = pipe(
      O.fromNullable(context.credentialType),
      O.map(type => itwCredentialNameByCredentialType[type]),
      O.toUndefined
    );

    toast.success(
      I18n.t("features.itWallet.issuance.credentialResult.toast", {
        credentialName
      })
    );
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME
          }
        }
      ]
    });
  },

  storeCredential: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credential, "credential is undefined");
    assert(context.credentialType, "credentialType is undefined");

    dispatch(itwCredentialsStore(context.credential));
    dispatch(
      walletUpsertCard({
        key: context.credential.keyTag,
        type: "itw",
        category: "itw",
        credentialType: context.credentialType
      })
    );
  },

  disposeWallet: () => {
    credentialIssuanceUtils.disposeWallet().then(constNull).catch(constNull);
  },

  closeIssuance: () => {
    navigation.popToTop();
  }
});
