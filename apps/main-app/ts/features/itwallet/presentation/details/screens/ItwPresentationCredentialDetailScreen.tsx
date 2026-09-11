import {
  ContentWrapper,
  IOButton,
  Optional,
  VStack
} from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { View } from "react-native";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture";
import { identificationRequest } from "../../../../identification/store/actions";
import { trackCredentialRenewStart } from "../../../analytics";
import { getMixPanelCredential } from "../../../analytics/utils";
import { CREDENTIAL_STATUS_MAP } from "../../../analytics/utils/types";
import ItwCredentialNotFound from "../../../common/components/ItwCredentialNotFound";
import { PoweredByItWalletText } from "../../../common/components/PoweredByItWalletText";
import { isItwProximityEnabledSelector } from "../../../common/store/selectors";
import { itwIsL3EnabledSelector } from "../../../common/store/selectors/index";
import { WellKnownClaim } from "../../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  isMultiLevelCredential
} from "../../../common/utils/itwTypesUtils";
import {
  itwCredentialSelector,
  itwCredentialStatusSelector
} from "../../../credentials/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../../lifecycle/store/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwCredentialTrustmark } from "../../../trustmark/components/ItwCredentialTrustmark";
import { trackItwProximityShowQrCode } from "../../proximity/analytics";
import { ITW_PROXIMITY_ROUTES } from "../../proximity/navigation/routes";
import { isPresentableCredentialSelector } from "../../proximity/store/selectors/credentials";
import {
  trackCredentialDetail,
  trackWalletCredentialShowFAC_SIMILE,
  trackWalletCredentialShowTrustmark
} from "../analytics";
import { ItwPresentationAdditionalInfoSection } from "../components/ItwPresentationAdditionalInfoSection";
import { ItwPresentationClaimsSection } from "../components/ItwPresentationClaimsSection";
import { ItwPresentationCredentialInfoAlert } from "../components/ItwPresentationCredentialInfoAlert";
import { ItwPresentationCredentialStatusAlert } from "../components/ItwPresentationCredentialStatusAlert";
import { ItwPresentationCredentialUnknownStatus } from "../components/ItwPresentationCredentialUnknownStatus";
import { ItwPresentationDetailsFooter } from "../components/ItwPresentationDetailsFooter";
import {
  ItwPresentationDetailsHeader,
  ItwPresentationDetailsHeaderLegacy
} from "../components/ItwPresentationDetailsHeader";
import {
  CredentialCtaProps,
  ItwPresentationDetailsScreenBase
} from "../components/ItwPresentationDetailsScreenBase";
import { useItwDisplayCredentialStatus } from "../hooks/useItwDisplayCredentialStatus";
import { shouldShowMdlUpdateDigitalCredential } from "../utils";

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_DETAIL"
>;

/**
 * Component that renders the credential detail screen.
 */
export const ItwPresentationCredentialDetailScreen = ({ route }: Props) => {
  const navigation = useIONavigation();
  const { credentialType } = route.params;

  const isL3 = useIOSelector(itwIsL3EnabledSelector);

  /**
   * Since the driver’s license is mapped as mDL but from the deeplink provided by iPatente
   * come in as presentation/credential-detail/MDL, it is necessary to enforce a lowercase
   * check for this case so the correct key is resolved.
   */
  const normalizedCredentialType = credentialType.replace(
    /^mdl$/i,
    CredentialType.DRIVING_LICENSE
  );

  const credential = useIOSelector(
    itwCredentialSelector(normalizedCredentialType)
  );

  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  if (!isWalletValid) {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t(
            "features.itWallet.issuance.walletInstanceNotActive.primaryAction"
          ),
          onPress: () =>
            navigation.replace(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.DISCOVERY.INFO,
              params: {
                level: isL3 ? "l3" : "l2"
              }
            })
        }}
        pictogram="itWallet"
        secondaryAction={{
          label: I18n.t(
            "features.itWallet.issuance.walletInstanceNotActive.secondaryAction"
          ),
          onPress: () => navigation.popToTop()
        }}
        subtitle={
          isL3
            ? I18n.t(
                "features.itWallet.issuance.walletInstanceNotActive.itWallet.subtitle"
              )
            : I18n.t(
                "features.itWallet.issuance.walletInstanceNotActive.documentiSuIo.subtitle"
              )
        }
        title={
          isL3
            ? I18n.t(
                "features.itWallet.issuance.walletInstanceNotActive.itWallet.title"
              )
            : I18n.t(
                "features.itWallet.issuance.walletInstanceNotActive.documentiSuIo.title"
              )
        }
      />
    );
  }

  if (credential === undefined) {
    // If the credential is not found, we render a screen that allows the user to request that credential.
    return <ItwCredentialNotFound credentialType={normalizedCredentialType} />;
  }
  return <ItwPresentationCredentialDetail credential={credential} />;
};

const credentialsWithSkeumorphicCard: ReadonlyArray<string> = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD
];

type ItwPresentationCredentialDetailProps = {
  credential: CredentialMetadata;
};

/**
 * Component that renders the credential detail content.
 */
export const ItwPresentationCredentialDetail = ({
  credential
}: ItwPresentationCredentialDetailProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const itwFeaturesEnabled = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isL3Credential = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isProximityEnabled = useIOSelector(isItwProximityEnabledSelector);
  const { status = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const isPresentableCredential = useIOSelector(
    isPresentableCredentialSelector(credential.credentialType)
  );
  const displayStatus = useItwDisplayCredentialStatus(
    status,
    credential.credentialType
  );
  const contentClaim = credential.parsedCredential[WellKnownClaim.content];
  const hasSkeumorphicCard = credentialsWithSkeumorphicCard.includes(
    credential.credentialType
  );
  const showInlineCta =
    isL3Credential && (hasSkeumorphicCard || contentClaim !== undefined);

  const mixPanelCredential = useMemo(
    () => getMixPanelCredential(credential.credentialType, isL3Credential),
    [credential.credentialType, isL3Credential]
  );
  const shouldShowMdlUpdateCta = shouldShowMdlUpdateDigitalCredential(
    credential,
    status
  );

  useDebugInfo(credential);
  usePreventScreenCapture();

  useFocusEffect(
    useCallback(() => {
      const isMultilevel = isMultiLevelCredential(credential);
      trackCredentialDetail({
        credential: mixPanelCredential,
        credential_status: CREDENTIAL_STATUS_MAP[status],
        credential_type: isMultilevel ? "multiple" : "unique"
      });
    }, [status, credential, mixPanelCredential])
  );

  /**
   * Show the credential trustmark screen after user identification
   */
  const handleTrustmarkPress = () => {
    trackWalletCredentialShowTrustmark(mixPanelCredential);
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: () => {
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_TRUSTMARK,
              params: {
                credentialType: credential.credentialType
              }
            });
          }
        }
      )
    );
  };

  const ctaProps = useMemo<Optional<CredentialCtaProps>>(() => {
    const credentialType = credential.credentialType;

    if (shouldShowMdlUpdateCta) {
      return {
        label: I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.updateDigitalCredential"
        ),
        onPress: () => {
          trackCredentialRenewStart(mixPanelCredential, {
            credential_status: CREDENTIAL_STATUS_MAP[status],
            position: "screen"
          });
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
            params: {
              credentialType,
              mode: "reissuance"
            }
          });
        }
      };
    }

    if (isProximityEnabled && isPresentableCredential) {
      return {
        label: I18n.t("features.itWallet.presentation.ctas.present"),
        icon: "productITWallet",
        iconPosition: "end",
        onPress: () => {
          trackItwProximityShowQrCode({
            credential: mixPanelCredential,
            position: "ITW_CREDENTIAL_DETAIL"
          });
          navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
            screen: ITW_PROXIMITY_ROUTES.PRESENTMENT,
            params: {
              source: "ITW_CREDENTIAL_DETAIL"
            }
          });
        }
      };
    }

    if (!isL3Credential && contentClaim !== undefined) {
      return {
        label: I18n.t("features.itWallet.presentation.ctas.openPdf"),
        icon: "docPaymentTitle",
        onPress: () => {
          if (mixPanelCredential === "ITW_TS_V2") {
            trackWalletCredentialShowFAC_SIMILE();
          }
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT,
            params: { attachmentClaim: contentClaim }
          });
        }
      };
    }

    return undefined;
  }, [
    credential.credentialType,
    shouldShowMdlUpdateCta,
    isL3Credential,
    isPresentableCredential,
    isProximityEnabled,
    contentClaim,
    navigation,
    mixPanelCredential,
    status
  ]);

  if (status === "unknown") {
    return <ItwPresentationCredentialUnknownStatus credential={credential} />;
  }

  const handleOpenCard = () => {
    if (contentClaim !== undefined) {
      if (mixPanelCredential === "ITW_TS_V2") {
        trackWalletCredentialShowFAC_SIMILE();
      }
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT,
        params: { attachmentClaim: contentClaim }
      });
    } else {
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL,
        params: {
          credential,
          status: displayStatus
        }
      });
    }
  };

  return (
    <ItwPresentationDetailsScreenBase
      credential={credential}
      ctaProps={ctaProps}
      headerTransparent={isL3Credential}
    >
      {itwFeaturesEnabled ? (
        <ItwPresentationDetailsHeader credential={credential} />
      ) : (
        <ItwPresentationDetailsHeaderLegacy credential={credential} />
      )}
      <View style={{ paddingVertical: 16 }}>
        {showInlineCta && (
          <View style={{ alignSelf: "center", paddingVertical: 8 }}>
            <IOButton
              icon="creditCard"
              iconPosition="start"
              label={I18n.t(
                "features.itWallet.presentation.credentialDetails.openCardDocument"
              )}
              onPress={handleOpenCard}
              variant="link"
            />
          </View>
        )}
      </View>
      <ContentWrapper>
        <VStack space={24}>
          <ItwPresentationAdditionalInfoSection credential={credential} />
          <ItwPresentationCredentialStatusAlert credential={credential} />
          <ItwPresentationCredentialInfoAlert credential={credential} />
          <ItwPresentationClaimsSection credential={credential} />
          {!itwFeaturesEnabled && (
            <ItwCredentialTrustmark
              credential={credential}
              onPress={handleTrustmarkPress}
            />
          )}
          <ItwPresentationDetailsFooter credential={credential} />
          {isL3Credential && (
            <View style={{ alignItems: "center" }}>
              <PoweredByItWalletText />
            </View>
          )}
        </VStack>
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );
};
