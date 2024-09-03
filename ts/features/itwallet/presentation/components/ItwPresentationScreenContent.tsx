import { ContentWrapper, Divider, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import { ScrollView } from "react-native";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useScreenEndMargin } from "../../../../hooks/useScreenEndMargin";
import I18n from "../../../../i18n";
import { ItwCredentialClaimsSection } from "../../common/components/ItwCredentialClaimsSection";
import { ItwReleaserName } from "../../common/components/ItwReleaserName";
import { parseClaims } from "../../common/utils/itwClaimsUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwPresentationAlertsSection } from "../components/ItwPresentationAlertsSection";
import { ItwPresentationDetailsFooter } from "../components/ItwPresentationDetailsFooter";
import { ItwPresentationDetailsHeader } from "../components/ItwPresentationDetailsHeader";

// TODO: use the real credential update time
const today = new Date();

/**
 * This component renders the entire credential detail.
 */
const ItwPresentationScreenContent = ({
  credential
}: {
  credential: StoredCredential;
}) => {
  const { screenEndMargin } = useScreenEndMargin();

  useDebugInfo({
    parsedCredential: credential.parsedCredential
  });

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: screenEndMargin }}>
      <ItwPresentationDetailsHeader credential={credential} />
      <ContentWrapper>
        <VSpacer size={16} />
        <ItwPresentationAlertsSection credential={credential} />
        <VSpacer size={16} />
        <ItwCredentialClaimsSection
          title={I18n.t(
            "features.itWallet.presentation.credentialDetails.documentDataTitle"
          )}
          claims={parseClaims(credential.parsedCredential, {
            exclude: ["unique_id"]
          })}
          canHideValues={true}
        />
        <Divider />
        <ItwReleaserName credential={credential} />
        <VSpacer size={24} />
        <ItwPresentationDetailsFooter
          lastUpdateTime={today}
          issuerConf={credential.issuerConf}
        />
      </ContentWrapper>
    </ScrollView>
  );
};

const MemoizedItwPresentationScreenContent = React.memo(
  ItwPresentationScreenContent
);

export { MemoizedItwPresentationScreenContent as ItwPresentationScreenContent };
