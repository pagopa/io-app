import React, { useEffect, useState } from "react";
import * as t from "io-ts";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
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
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { CREDENTIALS_MAP, trackItwHasAlreadyCredential } from "../../analytics";
import { ItwIssuanceCredentialTrustIssuerScreen } from "./ItwIssuanceCredentialTrustIssuerScreen";

export type ItwIssuanceCredentialAsyncContinuationNavigationParams = {
  credentialType: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_ASYNC_FLOW_CONTINUATION"
>;

const routeParams = t.type({
  credentialType: t.literal("MDL") // Only MDL supports the async issuance flow
});

const getCredentialType = (params: unknown) =>
  pipe(
    params,
    routeParams.decode,
    O.fromEither,
    O.map(x => x.credentialType)
  );

/**
 * Landing screen to resume the async issuance flow from a deep link.
 * We can not assume the route params will be of the expected shape,
 * so we guard against invalid values in this screen.
 */
export const ItwIssuanceCredentialAsyncContinuationScreen = ({
  route
}: ScreenProps) => {
  const credentialType = getCredentialType(route.params);
  const navigation = useIONavigation();

  return pipe(
    credentialType,
    O.fold(
      () => (
        <OperationResultScreenContent
          pictogram="umbrellaNew"
          title={I18n.t("genericError")}
          action={{
            label: I18n.t("global.buttons.close"),
            onPress: () => navigation.popToTop()
          }}
        />
      ),
      value => <InnerComponent credentialType={value} />
    )
  );
};

const InnerComponent = ({ credentialType }: { credentialType: string }) => {
  const navigation = useIONavigation();
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  const isCredentialValid = pipe(
    credentialOption,
    O.map(getCredentialStatus),
    O.map(status => status === "valid"),
    O.getOrElse(() => false)
  );

  useEffect(() => {
    if (isCredentialValid) {
      trackItwHasAlreadyCredential({
        credential: CREDENTIALS_MAP[credentialType],
        credential_status: "valid"
      });
    }
  }, [credentialType, isCredentialValid]);

  if (!isWalletValid) {
    const ns = "features.itWallet.issuance.walletInstanceNotActive" as const;
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
        action={{
          label: I18n.t(`${ns}.primaryAction`),
          onPress: () =>
            navigation.replace(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.DISCOVERY.INFO
            })
        }}
        secondaryAction={{
          label: I18n.t(`${ns}.secondaryAction`),
          onPress: () => navigation.popToTop()
        }}
      />
    );
  }

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
  const [isMachineReady, setIsMachineReady] = useState(false);

  // Transition the credential machine to the correct state when the credential selection screen is bypassed.
  // During this transition we should not render ItwIssuanceCredentialTrustIssuerScreen to avoid the generic error screen.
  useOnFirstRender(() => {
    machineRef.send({
      type: "select-credential",
      credentialType,
      skipNavigation: true
    });
    setIsMachineReady(true);
  });

  return isMachineReady ? (
    <ItwIssuanceCredentialTrustIssuerScreen />
  ) : (
    <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
  );
};
