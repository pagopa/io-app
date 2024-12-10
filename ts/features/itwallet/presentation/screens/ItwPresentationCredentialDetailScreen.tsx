import { ContentWrapper, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/Option";
import React from "react";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  CREDENTIALS_MAP,
  trackCredentialDetail,
  trackWalletCredentialShowFAC_SIMILE
} from "../../analytics";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
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
  const { credentialType } = route.params;
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );

  if (O.isNone(credentialOption)) {
    // This is unlikely to happen, but we want to handle the case where the credential is not found
    // because of inconsistencies in the state, and assert that the credential is O.some
    return <ItwGenericErrorContent />;
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

  useFocusEffect(() => {
    trackCredentialDetail({
      credential: CREDENTIALS_MAP[credential.credentialType],
      credential_status:
        credential.storedStatusAttestation?.credentialStatus || "not_valid"
    });
  });

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
      <VStack space={16}>
        <ItwPresentationDetailsHeader credential={credential} />
        <ContentWrapper>
          <VStack space={16}>
            <ItwPresentationAdditionalInfoSection credential={credential} />
            <ItwPresentationCredentialStatusAlert credential={credential} />
            <ItwPresentationCredentialInfoAlert credential={credential} />
            <ItwPresentationClaimsSection credential={credential} />
            <ItwCredentialTrustmark credential={credential} />
          </VStack>
        </ContentWrapper>
        <ItwPresentationDetailsFooter credential={credential} />
      </VStack>
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
