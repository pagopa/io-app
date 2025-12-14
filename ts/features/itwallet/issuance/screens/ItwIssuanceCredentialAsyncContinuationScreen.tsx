import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { itwCredentialSelector } from "../../credentials/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";

/**
 * @deprecated This screen is related to the dismissed async issuance flow.
 * It is left here to handle old messages that a user might still have.
 */
export const ItwIssuanceCredentialAsyncContinuationScreen = () => {
  const credentialType = CredentialType.DRIVING_LICENSE;
  const navigation = useIONavigation();
  const credentialOption = useIOSelector(itwCredentialSelector(credentialType));

  const isCredentialValid = pipe(
    credentialOption,
    O.map(getCredentialStatus),
    O.map(status => status === "valid"),
    O.getOrElse(() => false)
  );

  if (isCredentialValid) {
    return (
      <OperationResultScreenContent
        title={I18n.t(
          `features.itWallet.issuance.credentialAlreadyAdded.title`
        )}
        subtitle={I18n.t(
          `features.itWallet.issuance.credentialAlreadyAdded.body`
        )}
        pictogram="itWallet"
        action={{
          label: I18n.t(
            `features.itWallet.issuance.credentialAlreadyAdded.primaryAction`
          ),
          onPress: () =>
            navigation.replace(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
              params: { credentialType }
            })
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: () => navigation.popToTop()
        }}
      />
    );
  }

  return (
    <OperationResultScreenContent
      title={I18n.t("features.itWallet.issuance.mdlMessageExpired.title")}
      subtitle={[
        {
          text: I18n.t(
            "features.itWallet.issuance.mdlMessageExpired.subtitleStart"
          )
        },
        {
          text: I18n.t(
            "features.itWallet.issuance.mdlMessageExpired.subtitleBold"
          ),
          weight: "Semibold"
        }
      ]}
      pictogram="ended"
      action={{
        label: I18n.t(
          "features.itWallet.issuance.mdlMessageExpired.primaryAction"
        ),
        onPress: () =>
          navigation.replace(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ONBOARDING
          })
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.notNow"),
        onPress: () => navigation.popToTop()
      }}
    />
  );
};
