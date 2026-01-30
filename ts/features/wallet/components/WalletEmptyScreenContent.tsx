import {
  Body,
  IOButton,
  IOVisualCostants,
  Pictogram
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";
import ItwDeckImage from "../../../../img/features/itWallet/brand/itw_deck_wallet.svg";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { trackWalletAdd } from "../../itwallet/analytics";
import { PoweredByItWalletText } from "../../itwallet/common/components/PoweredByItWalletText";
import { itwIsL3EnabledSelector } from "../../itwallet/common/store/selectors/preferences";
import { ITW_ROUTES } from "../../itwallet/navigation/routes";

const WalletEmptyScreenContent = () => {
  const navigation = useIONavigation();
  const isItWalletEnabled = useIOSelector(itwIsL3EnabledSelector);

  const handleAddToWalletButtonPress = () => {
    trackWalletAdd();
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  // For user with IT-Wallet enabled we show a different empty state with the new
  // brand identity. To be removed once IT-Wallet is generally available.
  if (isItWalletEnabled) {
    return (
      <View
        style={styles.container}
        testID="walletEmptyScreenContentItWalletTestID"
      >
        <ItwDeckImage width={140} height={80} />
        <Body color="grey-650" weight="Regular" style={styles.text}>
          {I18n.t("features.wallet.home.screen.emptyMessage")}
        </Body>
        <IOButton
          fullWidth
          variant="solid"
          label={I18n.t("features.wallet.home.screen.cta")}
          onPress={handleAddToWalletButtonPress}
        />
        <PoweredByItWalletText />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="walletEmptyScreenContentTestID">
      <Pictogram name="cardAdd" />
      <Body color="grey-650" weight="Regular" style={styles.text}>
        {I18n.t("features.wallet.home.screen.legacy.emptyMessage")}
      </Body>
      <IOButton
        fullWidth
        variant="solid"
        label={I18n.t("features.wallet.home.screen.legacy.cta")}
        onPress={handleAddToWalletButtonPress}
        icon="addSmall"
        iconPosition="end"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    justifyContent: "center",
    alignItems: "center"
  },
  text: { textAlign: "center" }
});

export { WalletEmptyScreenContent };
