import {
  BodySmall,
  ContentWrapper,
  H3,
  IOButton,
  IODimensions,
  VSpacer,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ItWalletDeck from "../../../../../img/features/itWallet/brand/itw_deck_wallet.svg";
import { ItWalletLogo } from "../../common/components/ItWalletLogo";

type Props = {
  onActivate: () => void;
  onDismiss: () => void;
};

export const ItwEngagementScreenContent = ({
  onActivate,
  onDismiss
}: Props) => (
  <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView
      alwaysBounceVertical={false}
      contentContainerStyle={styles.container}
    >
      <ContentWrapper
        margin={IODimensions.padding.screen.centred}
        style={styles.content}
      >
        <VStack space={32}>
          <VStack space={16} style={styles.centered}>
            <ItWalletLogo height={16} width={79} />
            <ItWalletDeck height={68} width={120} />
            <VSpacer size={8} />
            <VStack space={8}>
              <H3 accessibilityRole="header" style={styles.textCentered}>
                {I18n.t("features.itWallet.loginEngagement.title")}
              </H3>
              <BodySmall style={styles.textCentered}>
                {I18n.t("features.itWallet.loginEngagement.description")}
              </BodySmall>
            </VStack>
          </VStack>
          <VStack space={16}>
            <IOButton
              fullWidth
              label={I18n.t("features.itWallet.loginEngagement.action")}
              onPress={onActivate}
              testID="itwEngagementAction"
              variant="solid"
            />
            <View style={styles.centeredSelf}>
              <IOButton
                label={I18n.t(
                  "features.itWallet.loginEngagement.secondaryAction"
                )}
                onPress={onDismiss}
                testID="itwEngagementSecondaryAction"
                variant="link"
              />
            </View>
          </VStack>
        </VStack>
      </ContentWrapper>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flexGrow: 1,
    justifyContent: "center"
  },
  content: {
    // Uneven padding shifts the centered content slightly upwards, as in Figma
    paddingTop: IODimensions.padding.screen.end,
    paddingBottom: 72
  },
  centered: {
    alignItems: "center"
  },
  centeredSelf: {
    alignSelf: "center"
  },
  textCentered: {
    textAlign: "center"
  }
});
