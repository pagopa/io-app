import React from "react";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import {
  ContentWrapper,
  Divider,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ScrollView, StyleSheet, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ItwReleaserName } from "../../common/components/ItwReleaserName";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import {
  CredentialType,
  ItwCredentialsMocks
} from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../hooks/useScreenEndMargin";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { ItwClaimsSections } from "../components/ItwClaimsSections";
import { ItwPresentationDetailFooter } from "../components/ItwPresentationDetailFooter";

// TODO: use the real credential update time
const today = new Date();
const credentialCardData: ReadonlyArray<string> = [];

/**
 * This component renders the entire credential detail.
 */
const ContentView = ({ eid }: { eid: StoredCredential }) => {
  const { screenEndMargin } = useScreenEndMargin();
  const themeColor = getThemeColorByCredentialType(
    eid.credentialType as CredentialType
  );

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    variant: "contrast",
    backgroundColor: themeColor
  });

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={themeColor}
        barStyle="light-content"
      />
      <ScrollView contentContainerStyle={{ paddingBottom: screenEndMargin }}>
        <View style={styles.cardContainer}>
          <ItwCredentialCard
            credentialType={CredentialType.PID}
            data={credentialCardData}
          />
          <View
            style={[styles.cardBackdrop, { backgroundColor: themeColor }]}
          />
        </View>

        <ContentWrapper>
          <ItwClaimsSections credential={eid} />
          <Divider />
          <ItwReleaserName credential={eid} />
          <VSpacer size={40} />
          <ItwPresentationDetailFooter lastUpdateTime={today} />
        </ContentWrapper>
      </ScrollView>
    </>
  );
};

export const ItwPresentationEidDetailScreen = () => {
  const navigation = useIONavigation();
  const eidOption = O.some(ItwCredentialsMocks.eid);

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <OperationResultScreenContent {...mappedError} />;
  };

  return pipe(
    eidOption,
    O.fold(
      () => <ErrorView />,
      eid => <ContentView eid={eid} />
    )
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    paddingHorizontal: IOVisualCostants.appMarginDefault
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
