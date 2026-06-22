import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { useEffect, useMemo } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { getMixPanelCredential } from "../../analytics/utils";
import { useItwCredentialName } from "../../common/hooks/useItwCredentialName";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import {
  itwCredentialsEidStatusSelector,
  itwCredentialStatusSelector
} from "../../credentials/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  trackItwAlreadyHasCredential,
  trackItwIssuanceFromMsgFailure
} from "../analytics";

export type ItwIssuanceCredentialLandingScreenNavigationParams = {
  credentialType: string;
};

export type ItwIssuanceCredentialLandingScreenProps =
  IOStackNavigationRouteProps<
    ItwParamsList,
    "ITW_LANDING_SCREEN_CREDENTIAL_ISSUANCE"
  >;

/**
 * Landing screen to route credential issuance deeplink based on the ITW activation status and level
 */
export const ItwIssuanceCredentialLandingScreen = ({
  route
}: ItwIssuanceCredentialLandingScreenProps) => {
  const { credentialType } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isWhitelisted = useIOSelector(itwIsL3EnabledSelector);
  const { status: credentialStatus } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credentialType)
  );
  const pidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const credentialName = useItwCredentialName(credentialType);
  const mixPanelCredential = useMemo(
    () => getMixPanelCredential(credentialType, isItwL3),
    [credentialType, isItwL3]
  );

  /**
   * Determines if the credential is still valid (JWT not expired nor expiring soon)
   * and thus does not need to be issued again.
   */
  const isCredentialValid = useMemo(
    () =>
      credentialStatus
        ? !["jwtExpired", "jwtExpiring"].includes(credentialStatus)
        : false,
    [credentialStatus]
  );

  /**
   * Wether the PID is not expired/expiring and still valid
   */
  const isEidExpiredOrExpiring = useMemo(
    () =>
      pidStatus ? ["jwtExpired", "jwtExpiring"].includes(pidStatus) : false,
    [pidStatus]
  );

  useEffect(() => {
    if (isCredentialValid) {
      if (!isEidExpiredOrExpiring) {
        trackItwAlreadyHasCredential(mixPanelCredential);
      }
      // Credential already present and valid, no need to issue it again
      return;
    }

    if (isEidExpiredOrExpiring) {
      // PID not valid, show PID renewal screen before proceeding with credential issuance
      return;
    }

    if (!isItwValid) {
      // ITW not active, redirect to discovery info screen
      navigation.replace(ITW_ROUTES.DISCOVERY.INFO, {
        animationEnabled: false,
        level: isWhitelisted ? "l3" : "l2",
        credentialType
      });
      return;
    }

    if (isItwValid) {
      // ITW active, proceed to credential issuance
      navigation.replace(ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER, {
        animationEnabled: false,
        credentialType
      });
      return;
    }

    // No branch handled this state — track the error
    trackItwIssuanceFromMsgFailure(
      getMixPanelCredential(credentialType, isWhitelisted)
    );
  }, [
    navigation,
    isItwValid,
    isWhitelisted,
    credentialType,
    isCredentialValid,
    isEidExpiredOrExpiring,
    mixPanelCredential
  ]);

  if (isEidExpiredOrExpiring) {
    return (
      <OperationResultScreenContent
        pictogram="identity"
        title={I18n.t(`features.itWallet.issuance.confirmIdentity.title`, {
          credential: credentialName
        })}
        subtitle={I18n.t(
          `features.itWallet.issuance.confirmIdentity.subtitle`,
          {
            wallet: isWhitelisted ? "IT Wallet" : "Documenti su IO"
          }
        )}
        action={{
          label: I18n.t(
            `features.itWallet.issuance.confirmIdentity.primaryAction`
          ),
          onPress: () =>
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
              params: {
                eidReissuing: true,
                credentialType,
                level: isWhitelisted ? "l3" : "l2"
              }
            })
        }}
        secondaryAction={{
          label: I18n.t(
            `features.itWallet.issuance.confirmIdentity.secondaryAction`
          ),
          onPress: () => navigation.popToTop()
        }}
      />
    );
  }

  if (isCredentialValid) {
    return (
      <OperationResultScreenContent
        pictogram="success"
        title={I18n.t(
          `features.itWallet.issuance.credentialAlreadyUpdated.title`
        )}
        subtitle={I18n.t(
          `features.itWallet.issuance.credentialAlreadyUpdated.subtitle`,
          {
            credential: credentialName
          }
        )}
        action={{
          label: I18n.t(
            `features.itWallet.issuance.credentialAlreadyUpdated.action`
          ),
          onPress: () =>
            navigation.popTo(ROUTES.MAIN, {
              screen: ROUTES.WALLET_HOME,
              params: {}
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
      pictogram="umbrella"
      title={I18n.t(`features.itWallet.issuance.landingError.title`)}
      subtitle={I18n.t(`features.itWallet.issuance.landingError.body`)}
      action={{
        label: I18n.t(`features.itWallet.issuance.landingError.action`),
        onPress: () => navigation.popToTop()
      }}
    />
  );
};
