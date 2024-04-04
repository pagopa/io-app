import {
  ContentWrapper,
  IOColors,
  IOSpacingScale,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  PaymentCard,
  PaymentCardProps
} from "../../common/components/PaymentCard";

type Props = {
  card: PaymentCardProps;
  headerTitle?: string;
};

/**
 * Base layout for payment methods screen & legacy delete handling
 */
const PaymentsMethodDetailsBaseScreenComponent = ({
  card,
  headerTitle = "",
  children
}: React.PropsWithChildren<Props>) => {
  const isDSenabled = useIOSelector(isDesignSystemEnabledSelector);
  const blueHeaderColor = isDSenabled ? IOColors["blueIO-600"] : IOColors.blue;

  return (
    <BaseScreenComponent
      contextualHelp={emptyContextualHelp}
      headerTitle={headerTitle}
      faqCategories={["wallet_methods"]}
      goBack={true}
      titleColor="white"
      dark={true}
      headerBackgroundColor={blueHeaderColor}
    >
      <FocusAwareStatusBar
        backgroundColor={blueHeaderColor}
        barStyle="light-content"
      />
      <ScrollView>
        <View style={[styles.blueHeader, { backgroundColor: blueHeaderColor }]}>
          <View style={styles.cardContainer}>
            <PaymentCard {...card} />
          </View>
        </View>
        <VSpacer size={24} />
        <ContentWrapper>{children}</ContentWrapper>
        <VSpacer size={40} />
      </ScrollView>
    </BaseScreenComponent>
  );
};

const cardContainerHorizontalSpacing: IOSpacingScale = 16;

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: cardContainerHorizontalSpacing,
    alignSelf: "center",
    marginBottom: "-15%",
    aspectRatio: 1.7,
    width: "100%"
  },
  blueHeader: {
    paddingTop: "75%",
    marginTop: "-75%",
    marginBottom: "15%"
  }
});

export { PaymentsMethodDetailsBaseScreenComponent };
