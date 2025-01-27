import { ContentWrapper, VSpacer, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/Option";
import React from "react";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  CREDENTIALS_MAP,
  trackCredentialDetail,
  trackWalletCredentialShowFAC_SIMILE
} from "../../analytics";
import { WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  itwCredentialByTypeSelector,
  itwCredentialStatusSelector
} from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwPresentationAdditionalInfoSection } from "../components/ItwPresentationAdditionalInfoSection";
import { ItwPresentationClaimsSection } from "../components/ItwPresentationClaimsSection";
import { ItwPresentationCredentialInfoAlert } from "../components/ItwPresentationCredentialInfoAlert";
import { ItwPresentationCredentialStatusAlert } from "../components/ItwPresentationCredentialStatusAlert";
import { ItwPresentationCredentialVerificationExpired } from "../components/ItwPresentationCredentialVerificationExpired";
import { ItwPresentationDetailsFooter } from "../components/ItwPresentationDetailsFooter";
import { ItwPresentationDetailsHeader } from "../components/ItwPresentationDetailsHeader";
import {
  CredentialCtaProps,
  ItwPresentationDetailsScreenBase
} from "../components/ItwPresentationDetailsScreenBase";
import { ItwCredentialTrustmark } from "../../trustmark/components/ItwCredentialTrustmark";
import ItwCredentialNotFound from "../../common/components/ItwCredentialNotFound";
import { ItwPresentationCredentialUnknownStatus } from "../components/ItwPresentationCredentialUnknownStatus";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { itwSetReviewPending } from "../../common/store/actions/preferences";
import { itwIsPendingReviewSelector } from "../../common/store/selectors/preferences";

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
  const dispatch = useIODispatch();
  const { credentialType } = route.params;
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );
  const isPendingReview = useIOSelector(itwIsPendingReviewSelector);

  useFocusEffect(
    React.useCallback(() => {
      /* The initial state of isPendingReview is undefined,
       * it means the driving license detail has never been viewed.
       * It is set to true only the first time the driving license detail is viewed.
       */
      if (
        credentialType === CredentialType.DRIVING_LICENSE &&
        isPendingReview === undefined
      ) {
        dispatch(itwSetReviewPending(true));
      }
    }, [credentialType, isPendingReview, dispatch])
  );

  if (O.isNone(credentialOption)) {
    // If the credential is not found, we render a screen that allows the user to request that credential.
    return <ItwCredentialNotFound credentialType={credentialType} />;
  }

  return (
    <ItwPresentationCredentialDetail credential={credentialOption.value} />
  );
};

type ItwPresentationCredentialDetailProps = {
  credential: StoredCredential;
};

/**
 * Component that renders the credential detail content.
 */
const ItwPresentationCredentialDetail = ({
  credential
}: ItwPresentationCredentialDetailProps) => {
  const navigation = useIONavigation();
  const { status = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  useDebugInfo(credential);
  usePreventScreenCapture();

  useFocusEffect(() => {
    trackCredentialDetail({
      credential: CREDENTIALS_MAP[credential.credentialType],
      credential_status:
        credential.storedStatusAttestation?.credentialStatus || "not_valid"
    });
  });

  if (status === "unknown") {
    return <ItwPresentationCredentialUnknownStatus credential={credential} />;
  }

  if (status === "jwtExpired") {
    return (
      <ItwPresentationCredentialVerificationExpired credential={credential} />
    );
  }

  const ctaProps = getCtaProps(credential, navigation);

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
          <ItwCredentialTrustmark credential={credential} />
          <ItwPresentationDetailsFooter credential={credential} />
        </VStack>
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );
};

const getCtaProps = (
  credential: StoredCredential,
  navigation: ReturnType<typeof useIONavigation>
): CredentialCtaProps | undefined => {
  const { parsedCredential } = credential;

  const onPress = () => {
    if (CREDENTIALS_MAP[credential.credentialType] === "ITW_TS_V2") {
      trackWalletCredentialShowFAC_SIMILE();
    }

    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_ATTACHMENT,
      params: {
        attachmentClaim: parsedCredential[WellKnownClaim.content]
      }
    });
  };

  // If the "content" claim exists, return a CTA to view and download it.
  if (parsedCredential[WellKnownClaim.content]) {
    return {
      label: I18n.t("features.itWallet.presentation.ctas.openPdf"),
      icon: "docPaymentTitle",
      onPress
    };
  }

  return undefined;
};
