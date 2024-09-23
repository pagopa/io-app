import React from "react";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwCredentialsTypesSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { ItwIssuanceCredentialTrustIssuerScreen } from "./ItwIssuanceCredentialTrustIssuerScreen";

export type ItwIssuanceCredentialAsyncContinuationNavigationParams = {
  credentialType: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_ASYNC_FLOW_CONTINUATION"
>;

/**
 * Landing screen to resume the async issuance flow from a deep link.
 */
export const ItwIssuanceCredentialAsyncContinuationScreen = ({
  route
}: ScreenProps) => {
  const { credentialType } = route.params;
  const navigation = useIONavigation();
  const itwCredentialsTypes = useIOSelector(itwCredentialsTypesSelector);

  if (itwCredentialsTypes.includes(credentialType)) {
    return (
      <OperationResultScreenContent
        title={I18n.t(
          "features.itWallet.issuance.credentialAlreadyAdded.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.issuance.credentialAlreadyAdded.body"
        )}
        pictogram="itWallet"
        action={{
          label: I18n.t(
            "features.itWallet.issuance.credentialAlreadyAdded.primaryAction"
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
    <WrappedItwIssuanceCredentialTrustIssuerScreen
      credentialType={credentialType}
    />
  );
};

const WrappedItwIssuanceCredentialTrustIssuerScreen = ({
  credentialType
}: {
  credentialType: string;
}) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  // Transition the credential machine to the correct state
  // when the credential selection screen is bypassed.
  useOnFirstRender(() => {
    machineRef.send({
      type: "select-credential",
      credentialType,
      skipNavigation: true
    });
  });

  return <ItwIssuanceCredentialTrustIssuerScreen />;
};
