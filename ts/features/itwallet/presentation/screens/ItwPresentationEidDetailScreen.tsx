import React from "react";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import {
  ContentWrapper,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { EidCard } from "../../common/components/EidCard";
import { ItwPidAssuranceLevel } from "../../common/components/ItwPidAssuranceLevel";
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
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { ItwClaimsSections } from "../components/ItwClaimsSections";
import { ItwPresentationDetailFooter } from "../components/ItwPresentationDetailFooter";

// TODO: use the real credential update time
const today = new Date();

/**
 * @deprecated Still using `BaseScreenComponent`
 *
 * This component renders the entire credential detail.
 * `BaseScreenComponent` is used because it offers the colored header with contrast icons out of the box.
 */
const ContentView = ({ eid }: { eid: StoredCredential }) => {
  const insets = useSafeAreaInsets();
  const themeColor = getThemeColorByCredentialType(
    eid.credentialType as CredentialType
  );

  return (
    <BaseScreenComponent
      headerTitle=""
      headerBackgroundColor={themeColor}
      titleColor="white"
      goBack={true}
      dark={true}
      contextualHelp={emptyContextualHelp}
    >
      <StatusBar backgroundColor={themeColor} barStyle="light-content" />
      <ScrollView
        style={{
          marginBottom:
            IOVisualCostants.headerHeight + insets.top + insets.bottom // Compensate for the header
        }}
      >
        <View style={styles.cardContainer}>
          <EidCard />
          <View
            style={[styles.cardBackdrop, { backgroundColor: themeColor }]}
          />
        </View>

        <ContentWrapper>
          <ItwClaimsSections credential={eid} />
          <ItwPidAssuranceLevel credential={eid} />
          <ItwReleaserName credential={eid} />
          <VSpacer size={40} />
          <ItwPresentationDetailFooter lastUpdateTime={today} />
        </ContentWrapper>
      </ScrollView>
    </BaseScreenComponent>
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
