import { ContentWrapper, VStack } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { getHumanReadableParsedCredential } from "../../common/utils/debug";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwPresentationAlertsSection } from "../components/ItwPresentationAlertsSection";
import { ItwPresentationClaimsSection } from "../components/ItwPresentationClaimsSection";
import { ItwPresentationDetailsFooter } from "../components/ItwPresentationDetailsFooter";
import { ItwPresentationDetailsHeader } from "../components/ItwPresentationDetailsHeader";
import {
  CredentialCtaProps,
  ItwPresentationDetailsScreenBase
} from "../components/ItwPresentationDetailsScreenBase";
import { ItwPresentationAdditionalInfoSection } from "../components/ItwPresentationAdditionalInfoSection";
import { ItwCredentialTrustmark } from "../components/ItwCredentialTrustmark";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import I18n from "../../../../i18n";
import {
  trackCredentialDetail,
  trackWalletCredentialShowFAC_SIMILE
} from "../../analytics";

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_DETAIL"
>;

export const ItwPresentationCredentialDetailScreen = ({ route }: Props) => {
  const { credentialType } = route.params;
  const navigation = useIONavigation();
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );

  useDebugInfo({
    parsedCredential: pipe(
      credentialOption,
      O.map(credential =>
        getHumanReadableParsedCredential(credential.parsedCredential)
      ),
      O.toUndefined
    )
  });

  useFocusEffect(() => {
    if (O.isNone(credentialOption)) {
      return;
    }
    const credential = credentialOption.value;

    trackCredentialDetail({
      credential: credential.credential,
      credential_status:
        credential.storedStatusAttestation?.credentialStatus || "not_valid"
    });
  });

  if (O.isNone(credentialOption)) {
    // This is unlikely to happen, but we want to handle the case where the credential is not found
    // because of inconsistencies in the state, and assert that the credential is O.some
    return <ItwGenericErrorContent />;
  }

  const credential = credentialOption.value;

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
            <ItwPresentationAlertsSection credential={credential} />
            <ItwCredentialTrustmark credential={credential} />
            <ItwPresentationClaimsSection credential={credential} />
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
    if (credential.credential === "ITW_TS_V2") {
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
