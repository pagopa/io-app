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
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { itwCredentialStatusSelector } from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

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
  const isWhitelisted = useIOSelector(itwIsL3EnabledSelector);
  const { status } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credentialType)
  );

  /**
   * Determines if the credential is still valid (JWT not expired nor expiring soon)
   * and thus does not need to be issued again.
   */
  const isCredentialValid = useMemo(
    () => (status ? !["jwtExpired", "jwtExpiring"].includes(status) : false),
    [status]
  );

  useEffect(() => {
    if (isCredentialValid) {
      // Credential already present and valid, no need to issue it again
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

    // ITW active, proceed to credential issuance
    navigation.replace(ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER, {
      animationEnabled: false,
      credentialType
    });
  }, [
    navigation,
    isItwValid,
    isWhitelisted,
    credentialType,
    isCredentialValid
  ]);

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
            credential: getCredentialNameFromType(credentialType)
          }
        )}
        action={{
          label: I18n.t(
            `features.itWallet.issuance.credentialAlreadyUpdated.action`
          ),
          onPress: () =>
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
            })
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.close"),
          onPress: () => navigation.popToTop()
        }}
      />
    );
  }

  return null;
};
