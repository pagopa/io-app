import {
  ContentWrapper,
  Divider,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useScreenEndMargin } from "../../../../hooks/useScreenEndMargin";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { ItwReleaserName } from "../../common/components/ItwReleaserName";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwClaimsSections } from "../components/ItwClaimsSections";
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
      () => <ErrorView />,
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

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={themeColor}
        barStyle="light-content"
      />
      <ScrollView contentContainerStyle={{ paddingBottom: screenEndMargin }}>
        <View style={styles.cardContainer}>
          <ItwCredentialCard credentialType={credential.credentialType} />
          <View
            style={[styles.cardBackdrop, { backgroundColor: themeColor }]}
          />
        </View>

        <ContentWrapper>
          <ItwClaimsSections credential={credential} />
          <Divider />
          <ItwReleaserName credential={credential} />
          <VSpacer size={40} />
          <ItwPresentationDetailFooter
            lastUpdateTime={today}
            issuerConf={credential.issuerConf}
          />
        </ContentWrapper>
      </ScrollView>
    </>
  );
};

/**
 * Error view component which currently displays a generic error.
 * @param error - optional ItWalletError to be displayed.
 */
const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
  const navigation = useIONavigation();
  const mappedError = getItwGenericMappedError(() => navigation.goBack());
  return <OperationResultScreenContent {...mappedError} />;
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
