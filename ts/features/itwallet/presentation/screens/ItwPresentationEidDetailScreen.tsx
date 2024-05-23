import React from "react";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import {
  ContentWrapper,
  VSpacer,
  Divider,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { EidCard } from "../../common/components/EidCard";
import { ItwCredentialClaimsSection } from "../../common/components/ItwCredentialClaimsSection";
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

/* const ContentView = ({ eid }: { eid: StoredCredential }) => {
  const { top } = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ paddingTop: IOVisualCostants.headerHeight }}>
      <View style={[styles.upperSection, { height: IOVisualCostants.headerHeight + top }]} />
      <ContentWrapper>
        <ScrollView>
          <EidCard />
          <VSpacer size={24} />
          <ItwCredentialClaimsSection
            title={I18n.t("features.itWallet.presentation.personalDataTitle")}
            canHideValues
            claims={[]}
          />
          <VSpacer size={24} />
          <ItwCredentialClaimsSection
            title={I18n.t("features.itWallet.presentation.documentDataTitle")}
            claims={[]}
          />
          <Divider />
          <ItwPidAssuranceLevel credential={eid} />
          <Divider />
          <ItwReleaserName credential={eid} />
        </ScrollView>
      </ContentWrapper>
    </SafeAreaView>
  )
}; */

const ContentView = ({ eid }: { eid: StoredCredential }) => {
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
      <ScrollView endFillColor={themeColor}>
        <View style={styles.cardContainer}>
          <EidCard />
          <View
            style={[styles.cardBackdrop, { backgroundColor: themeColor }]}
          />
        </View>
        <VSpacer size={24} />
        <ContentWrapper>
          <ItwCredentialClaimsSection
            title={I18n.t("features.itWallet.presentation.personalDataTitle")}
            canHideValues
            claims={[]}
          />
          <VSpacer size={24} />
          <ItwCredentialClaimsSection
            title={I18n.t("features.itWallet.presentation.documentDataTitle")}
            claims={[]}
          />
          <Divider />
          <ItwPidAssuranceLevel credential={eid} />
          <Divider />
          <ItwReleaserName credential={eid} />
        </ContentWrapper>
      </ScrollView>
    </BaseScreenComponent>
  );
};

export const ItwPresentationEidDetailScreen = () => {
  // const contentOffsetY = useSharedValue(0);
  const navigation = useIONavigation();
  const eidOption = O.some(ItwCredentialsMocks.eid);

  /* useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    transparent: true,
    scrollValues: {
      contentOffsetY,
      triggerOffset: 0
    }
  }); */

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
