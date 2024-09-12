import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView } from "react-native";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../hooks/useScreenEndMargin";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { getHumanReadableParsedCredential } from "../../common/utils/debug";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwPresentationAlertsSection } from "../components/ItwPresentationAlertsSection";
import { ItwPresentationClaimsSection } from "../components/ItwPresentationClaimsSection";
import { ItwPresentationCredentialCard } from "../components/ItwPresentationCredentialCard";
import { ItwPresentationDetailFooter } from "../components/ItwPresentationDetailFooter";
import { ItwCredentialTrustmark } from "../components/ItwCredentialTrustmark";

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_DETAIL"
>;

const trustmarkEnabledCredentials = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
];

export const ItwPresentationCredentialDetailScreen = ({ route }: Props) => {
  const { credentialType } = route.params;
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );

  return pipe(
    credentialOption,
    O.fold(
      () => <ItwGenericErrorContent />,
      credential => <ContentView credential={credential} />
    )
  );
};

type ContentProps = { credential: StoredCredential };

/**
 * This component renders the entire credential detail.
 */
const ContentView = ({ credential }: ContentProps) => {
  const { screenEndMargin } = useScreenEndMargin();
  const themeColor = getThemeColorByCredentialType(
    credential.credentialType as CredentialType
  );

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    variant: "contrast",
    backgroundColor: themeColor
  });

  useDebugInfo({
    parsedCredential: getHumanReadableParsedCredential(
      credential.parsedCredential
    )
  });

  const renderTrustmark = () =>
    trustmarkEnabledCredentials.includes(
      credential.credentialType as CredentialType
    ) ? (
      <>
        <ItwCredentialTrustmark credential={credential} />
        <VSpacer size={16} />
      </>
    ) : null;

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={themeColor}
        barStyle="light-content"
      />
      <ScrollView contentContainerStyle={{ paddingBottom: screenEndMargin }}>
        <ItwPresentationCredentialCard credential={credential} />
        <ContentWrapper>
          <VSpacer size={16} />
          <ItwPresentationAlertsSection credential={credential} />
          <VSpacer size={16} />
          {renderTrustmark()}
          <ItwPresentationClaimsSection
            title={I18n.t(
              "features.itWallet.presentation.credentialDetails.documentDataTitle"
            )}
            data={credential}
            canHideValues={true}
          />
          <VSpacer size={24} />
          <ItwPresentationDetailFooter credential={credential} />
        </ContentWrapper>
      </ScrollView>
    </>
  );
};
