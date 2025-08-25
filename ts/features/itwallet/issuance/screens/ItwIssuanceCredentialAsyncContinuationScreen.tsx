import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { useCallback } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { CREDENTIALS_MAP, trackItwHasAlreadyCredential } from "../../analytics";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { itwCredentialSelector } from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { CredentialType } from "../../common/utils/itwMocksUtils";
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
 * @deprecated [SIW-2839] This screen is going to be removed soon along with the async issuance
 *
 * Landing screen to resume the async issuance flow from a deep link.
 * We can not assume the route params will be of the expected shape,
 * so we guard against invalid values in this screen.
 */
export const ItwIssuanceCredentialAsyncContinuationScreen = ({
  navigation,
  route
}: ScreenProps) => {
  const credentialType = getCredentialType(route.params);

  return pipe(
    credentialType,
    O.fold(
      () => (
        <OperationResultScreenContent
          pictogram="umbrella"
          title={I18n.t("genericError")}
          action={{
            label: I18n.t("global.buttons.close"),
            onPress: () => navigation.popToTop()
          }}
        />
      ),
      () => <InnerComponent />
    )
  );
};

const InnerComponent = () => {
  /**
   * Since only MDL supports the async flow, we can safely hardcode the credential type.
   * The credential type received as a route param is validated before this component,
   * so it is possible to directly use the correct type for the issuance flow.
   */
  const credentialType = CredentialType.DRIVING_LICENSE;
  const navigation = useIONavigation();
  const credentialOption = useIOSelector(itwCredentialSelector(credentialType));
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  const isCredentialValid = pipe(
    credentialOption,
    O.map(getCredentialStatus),
    O.map(status => status === "valid"),
    O.getOrElse(() => false)
  );

  useFocusEffect(
    useCallback(() => {
      if (isCredentialValid) {
        trackItwHasAlreadyCredential({
          credential: CREDENTIALS_MAP[credentialType],
          credential_status: "valid"
        });
      }
    }, [credentialType, isCredentialValid])
  );

  if (!isWalletValid) {
    const ns = "features.itWallet.issuance.walletInstanceNotActive" as const;
    return (
      <OperationResultScreenContent
        title={I18n.t(`${ns}.title`)}
        subtitle={[
          { text: I18n.t(`${ns}.body`) },
          {
            text: I18n.t(`${ns}.bodyBold`),
            weight: "Semibold"
          }
        ]}
        pictogram="itWallet"
        action={{
          label: I18n.t(`${ns}.primaryAction`),
          onPress: () =>
            navigation.replace(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.DISCOVERY.INFO,
              params: {}
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
    <ItwIssuanceCredentialTrustIssuerScreen
      credentialType={credentialType}
      asyncContinuation
    />
  );
};
