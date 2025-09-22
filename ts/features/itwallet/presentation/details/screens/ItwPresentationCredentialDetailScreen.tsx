import {
  ContentWrapper,
  Optional,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/Option";
import I18n from "i18next";
import React, { useMemo } from "react";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo.ts";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList.ts";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { identificationRequest } from "../../../../identification/store/actions/index.ts";
import {
  CREDENTIAL_STATUS_MAP,
  getMixPanelCredential,
  trackCredentialDetail,
  trackWalletCredentialShowFAC_SIMILE,
  trackWalletCredentialShowTrustmark
} from "../../../analytics";
import ItwCredentialNotFound from "../../../common/components/ItwCredentialNotFound.tsx";
import { useItwFeaturesEnabled } from "../../../common/hooks/useItwFeaturesEnabled.ts";
import { itwSetReviewPending } from "../../../common/store/actions/preferences.ts";
import { itwIsPendingReviewSelector } from "../../../common/store/selectors/preferences.ts";
import { WellKnownClaim } from "../../../common/utils/itwClaimsUtils.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import {
  isMultiLevelCredential,
  StoredCredential
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
import { useItwPresentQRCode } from "../../proximity/hooks/useItwPresentQRCode.tsx";
import { ItwProximityMachineContext } from "../../proximity/machine/provider.tsx";
import { selectIsLoading } from "../../proximity/machine/selectors.ts";
import { ItwPresentationAdditionalInfoSection } from "../components/ItwPresentationAdditionalInfoSection.tsx";
import { ItwPresentationClaimsSection } from "../components/ItwPresentationClaimsSection.tsx";
import { ItwPresentationCredentialInfoAlert } from "../components/ItwPresentationCredentialInfoAlert.tsx";
import { ItwPresentationCredentialStatusAlert } from "../components/ItwPresentationCredentialStatusAlert.tsx";
import { ItwPresentationCredentialUnknownStatus } from "../components/ItwPresentationCredentialUnknownStatus.tsx";
import { ItwPresentationCredentialVerificationExpired } from "../components/ItwPresentationCredentialVerificationExpired.tsx";
import { ItwPresentationDetailsFooter } from "../components/ItwPresentationDetailsFooter.tsx";
import { ItwPresentationDetailsHeader } from "../components/ItwPresentationDetailsHeader.tsx";
import {
  CredentialCtaProps,
  ItwPresentationDetailsScreenBase
} from "../components/ItwPresentationDetailsScreenBase.tsx";

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
  const { bottomSheet } = useItwPresentQRCode();
  const { credentialType } = route.params;

  /**
   * Since the driver’s license is mapped as mDL but from the deeplink provided by iPatente
   * come in as presentation/credential-detail/MDL, it is necessary to enforce a lowercase
   * check for this case so the correct key is resolved.
   */
  const normalizedCredentialType =
    credentialType.toLowerCase() ===
    CredentialType.DRIVING_LICENSE.toLowerCase()
      ? CredentialType.DRIVING_LICENSE
      : credentialType;

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
        credentialType.toLowerCase() ===
          CredentialType.DRIVING_LICENSE.toLowerCase() &&
        isPendingReview === undefined
      ) {
        dispatch(itwSetReviewPending(true));
      }
    }, [credentialType, isPendingReview, dispatch])
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

  if (O.isNone(credentialOption)) {
    // If the credential is not found, we render a screen that allows the user to request that credential.
    return <ItwCredentialNotFound credentialType={credentialType} />;
  }
  return (
    <>
      <ItwPresentationCredentialDetail credential={credentialOption.value} />
      {bottomSheet}
    </>
  );
};

type ItwPresentationCredentialDetailProps = {
  credential: StoredCredential;
};

/**
 * Component that renders the credential detail content.
 */
export const ItwPresentationCredentialDetail = ({
  credential
}: ItwPresentationCredentialDetailProps) => {
  const itwProximityMachineRef = ItwProximityMachineContext.useActorRef();
  const isCheckingPermissions =
    ItwProximityMachineContext.useSelector(selectIsLoading);
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isMultilevel = isMultiLevelCredential(credential);
  const isL3Credential = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const { status = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const mixPanelCredential = getMixPanelCredential(
    credential.credentialType,
    isL3Credential
  );
  const itwFeaturesEnabled = useItwFeaturesEnabled(credential);

  useDebugInfo(credential);
  usePreventScreenCapture();

  useFocusEffect(() => {
    if (status !== "jwtExpired") {
      trackCredentialDetail({
        credential: mixPanelCredential,
        credential_status: CREDENTIAL_STATUS_MAP[status],
        credential_type: isMultilevel ? "multiple" : "unique"
      });
    }
  });

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
    const { parsedCredential } = credential;
    const credentialType = credential.credentialType;
    const contentClaim = parsedCredential[WellKnownClaim.content];

    if (
      credentialType.toLowerCase() ===
        CredentialType.DRIVING_LICENSE.toLowerCase() &&
      itwFeaturesEnabled
    ) {
      return {
        label: I18n.t("features.itWallet.presentation.ctas.showQRCode"),
        icon: "qrCode",
        iconPosition: "end",
        loading: isCheckingPermissions,
        onPress: () => {
          trackItwProximityShowQrCode();
          itwProximityMachineRef.send({ type: "start" });
        }
      };
    }

    // If the "content" claim exists, return a CTA to view and download it.
    if (contentClaim) {
      return {
        label: I18n.t("features.itWallet.presentation.ctas.openPdf"),
        icon: "docPaymentTitle",
        onPress: () => {
          if (mixPanelCredential === "ITW_TS_V2") {
            trackWalletCredentialShowFAC_SIMILE();
          }

          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT,
            params: {
              attachmentClaim: contentClaim
            }
          });
        }
      };
    }

    return undefined;
  }, [
    credential,
    itwFeaturesEnabled,
    navigation,
    isCheckingPermissions,
    itwProximityMachineRef,
    mixPanelCredential
  ]);

  if (status === "unknown") {
    return <ItwPresentationCredentialUnknownStatus credential={credential} />;
  }

  if (status === "jwtExpired") {
    return (
      <ItwPresentationCredentialVerificationExpired credential={credential} />
    );
  }

  return (
    <ItwPresentationDetailsScreenBase
      credential={credential}
      ctaProps={ctaProps}
    >
      <ItwPresentationDetailsHeader credential={credential} />
      <VSpacer size={24} />
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
        </VStack>
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );
};
