import {
  ContentWrapper,
  IOButton,
  Optional,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/Option";
import I18n from "i18next";
import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList.ts";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { identificationRequest } from "../../../../identification/store/actions";
import { trackCredentialRenewStart } from "../../../analytics";
import { getMixPanelCredential } from "../../../analytics/utils";
import { CREDENTIAL_STATUS_MAP } from "../../../analytics/utils/types.ts";
import ItwCredentialNotFound from "../../../common/components/ItwCredentialNotFound.tsx";
import { PoweredByItWalletText } from "../../../common/components/PoweredByItWalletText.tsx";
import { itwSetReviewPending } from "../../../common/store/actions/preferences.ts";
import {
  itwIsL3EnabledSelector,
  itwIsPendingReviewSelector
} from "../../../common/store/selectors/preferences.ts";
import { WellKnownClaim } from "../../../common/utils/itwClaimsUtils.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import {
  CredentialMetadata,
  isMultiLevelCredential
} from "../../../common/utils/itwTypesUtils.ts";
import {
  itwCredentialSelector,
  itwCredentialStatusSelector
} from "../../../credentials/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../../lifecycle/store/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { ItwCredentialTrustmark } from "../../../trustmark/components/ItwCredentialTrustmark.tsx";
import { trackItwProximityShowQrCode } from "../../proximity/analytics";
import { ITW_PROXIMITY_ROUTES } from "../../proximity/navigation/routes";
import {
  trackCredentialDetail,
  trackWalletCredentialShowFAC_SIMILE,
  trackWalletCredentialShowTrustmark
} from "../analytics";
import { ItwPresentationAdditionalInfoSection } from "../components/ItwPresentationAdditionalInfoSection.tsx";
import { ItwPresentationClaimsSection } from "../components/ItwPresentationClaimsSection.tsx";
import { ItwPresentationCredentialInfoAlert } from "../components/ItwPresentationCredentialInfoAlert.tsx";
import { ItwPresentationCredentialStatusAlert } from "../components/ItwPresentationCredentialStatusAlert.tsx";
import { ItwPresentationCredentialUnknownStatus } from "../components/ItwPresentationCredentialUnknownStatus.tsx";
import { ItwPresentationDetailsFooter } from "../components/ItwPresentationDetailsFooter.tsx";
import {
  ItwPresentationDetailsHeader,
  ItwPresentationDetailsHeaderLegacy
} from "../components/ItwPresentationDetailsHeader.tsx";
import {
  CredentialCtaProps,
  ItwPresentationDetailsScreenBase
} from "../components/ItwPresentationDetailsScreenBase.tsx";
import { useItwDisplayCredentialStatus } from "../hooks/useItwDisplayCredentialStatus.tsx";
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
  const dispatch = useIODispatch();
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

  const credentialOption = useIOSelector(
    itwCredentialSelector(normalizedCredentialType)
  );
  const isPendingReview = useIOSelector(itwIsPendingReviewSelector);

  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);

  useFocusEffect(
    React.useCallback(() => {
      /* The initial state of isPendingReview is undefined,
       * it means the driving license detail has never been viewed.
       * It is set to true only the first time the driving license detail is viewed.
       */
      if (
        normalizedCredentialType === CredentialType.DRIVING_LICENSE &&
        isPendingReview === undefined
      ) {
        dispatch(itwSetReviewPending(true));
      }
    }, [normalizedCredentialType, isPendingReview, dispatch])
  );

  if (!isWalletValid) {
    return (
      <OperationResultScreenContent
        title={
          isL3
            ? I18n.t(
                "features.itWallet.issuance.walletInstanceNotActive.itWallet.title"
              )
            : I18n.t(
                "features.itWallet.issuance.walletInstanceNotActive.documentiSuIo.title"
              )
        }
        subtitle={
          isL3
            ? I18n.t(
                "features.itWallet.issuance.walletInstanceNotActive.itWallet.subtitle"
              )
            : I18n.t(
                "features.itWallet.issuance.walletInstanceNotActive.documentiSuIo.subtitle"
              )
        }
        pictogram="itWallet"
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
        secondaryAction={{
          label: I18n.t(
            "features.itWallet.issuance.walletInstanceNotActive.secondaryAction"
          ),
          onPress: () => navigation.popToTop()
        }}
      />
    );
  }

  if (O.isNone(credentialOption)) {
    // If the credential is not found, we render a screen that allows the user to request that credential.
    return <ItwCredentialNotFound credentialType={normalizedCredentialType} />;
  }
  return (
    <ItwPresentationCredentialDetail credential={credentialOption.value} />
  );
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
  const { status = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const displayStatus = useItwDisplayCredentialStatus(status);
  const contentClaim = credential.parsedCredential[WellKnownClaim.content];
  const hasSkeumorphicCard = credentialsWithSkeumorphicCard.includes(
    credential.credentialType
  );
  const showInlineCta =
    isL3Credential && (hasSkeumorphicCard || !!contentClaim);

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

    if (
      credentialType === CredentialType.DRIVING_LICENSE &&
      itwFeaturesEnabled
    ) {
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

    if (!isL3Credential && contentClaim) {
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
    itwFeaturesEnabled,
    isL3Credential,
    contentClaim,
    navigation,
    mixPanelCredential,
    status
  ]);

  if (status === "unknown") {
    return <ItwPresentationCredentialUnknownStatus credential={credential} />;
  }

  const handleOpenCard = () => {
    if (contentClaim) {
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
    } else {
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_SCREEN,
        params: { credentialType: credential.credentialType }
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
              variant="link"
              label={I18n.t(
                "features.itWallet.presentation.credentialDetails.openCardDocument"
              )}
              icon="creditCard"
              iconPosition="start"
              onPress={handleOpenCard}
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
