import React from "react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { getCredentialStatus } from "../../common/utils/itwClaimsUtils";
import { isItwTrialActiveSelector } from "../../../trialSystem/store/reducers";
import { isItwEnabledSelector } from "../../../../store/reducers/backendStatus";
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
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwTrialActive = useIOSelector(isItwTrialActiveSelector);
  const isItwEnabled = useIOSelector(isItwEnabledSelector);

  if (!isWalletValid) {
    const ns = "features.itWallet.issuance.walletInstanceNotActive" as const;

    const primaryAction: OperationResultScreenContentProps["action"] = {
      label: I18n.t(`${ns}.primaryAction`),
      onPress: () =>
        navigation.replace(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.DISCOVERY.INFO
        })
    };

    return (
      <OperationResultScreenContent
        title={I18n.t(`${ns}.title`)}
        subtitle={[
          { text: I18n.t(`${ns}.body`) },
          {
            text: I18n.t(`${ns}.bodyBold`),
            weight: "Bold"
          }
        ]}
        pictogram="itWallet"
        action={isItwEnabled && isItwTrialActive ? primaryAction : undefined}
        secondaryAction={{
          label: I18n.t(`${ns}.secondaryAction`),
          onPress: () => navigation.popToTop()
        }}
      />
    );
  }

  const isCredentialValid = pipe(
    credentialOption,
    O.map(getCredentialStatus),
    O.map(status => status === "valid"),
    O.getOrElse(() => false)
  );

  if (isCredentialValid) {
    const ns = "features.itWallet.issuance.credentialAlreadyAdded" as const;
    return (
      <OperationResultScreenContent
        title={I18n.t(`${ns}.title`)}
        subtitle={I18n.t(`${ns}.body`)}
        pictogram="itWallet"
        action={{
          label: I18n.t(`${ns}.primaryAction`),
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
