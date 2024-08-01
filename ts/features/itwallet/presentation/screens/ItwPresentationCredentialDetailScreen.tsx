import {
  ContentWrapper,
  IOSpacingScale,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../hooks/useScreenEndMargin";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { getHumanReadableParsedCredential } from "../../common/utils/debug";
import { getCredentialExpireStatus } from "../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwPresentationAlertsSection } from "../components/ItwPresentationAlertsSection";
import { ItwPresentationClaimsSection } from "../components/ItwPresentationClaimsSection";
import { ItwPresentationDetailFooter } from "../components/ItwPresentationDetailFooter";

// TODO: use the real credential update time
const today = new Date();

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_DETAIL"
>;

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

/**
 * This component renders the entire credential detail.
 */
const ContentView = ({ credential }: { credential: StoredCredential }) => {
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

  const credentialStatus = getCredentialExpireStatus(
    credential.parsedCredential
  );

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={themeColor}
        barStyle="light-content"
      />
      <ScrollView contentContainerStyle={{ paddingBottom: screenEndMargin }}>
        <View style={styles.cardContainer}>
          <ItwCredentialCard
            credentialType={credential.credentialType}
            status={credentialStatus}
          />
          <View
            style={[styles.cardBackdrop, { backgroundColor: themeColor }]}
          />
        </View>
        <ContentWrapper>
          <VSpacer size={16} />
          <ItwPresentationAlertsSection credential={credential} />
          <VSpacer size={16} />
          <ItwPresentationClaimsSection
            title={I18n.t(
              "features.itWallet.presentation.credentialDetails.documentDataTitle"
            )}
            data={credential}
            canHideValues={true}
          />
          <VSpacer size={24} />
          <ItwPresentationDetailFooter
            lastUpdateTime={today}
            issuerConf={credential.issuerConf}
          />
        </ContentWrapper>
      </ScrollView>
    </>
  );
};

const cardPaddingHorizontal: IOSpacingScale = 16;

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    paddingHorizontal: cardPaddingHorizontal
  },
  cardBackdrop: {
    height: "200%", // Twice the card in order to avoid the white background when the scrollview bounces
    position: "absolute",
    top: "-130%", // Offset by the card height + a 30%
    right: 0,
    left: 0,
    zIndex: -1
  }
});
