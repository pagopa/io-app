import * as React from "react";
import { Image, SafeAreaView, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import walletCards from "../../../../../img/features/it-wallet/wallet-cards.png";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import I18n from "../../../../i18n";
import ScreenContent from "../../../../components/screens/ScreenContent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { H4 } from "../../../../components/core/typography/H4";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import ItwFooterInfoBox from "../../components/ItwFooterInfoBox";
import { ITW_ROUTES } from "../../navigation/routes";

const ItwActivationDetailsScreen = () => {
  const navigation = useNavigation();
  const cancelButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: navigation.goBack,
    title: I18n.t("features.itWallet.activationScreen.cancel")
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => navigation.navigate(ITW_ROUTES.ACTIVATION.INFO),
    title: I18n.t("features.itWallet.activationScreen.confirm")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.itWallet.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScreenContent
          title={I18n.t("features.itWallet.activationScreen.title")}
          subtitle={I18n.t("features.itWallet.activationScreen.subTitle")}
        >
          <View style={IOStyles.horizontalContentPadding}>
            {/* Wallet cards image */}
            <Image
              source={walletCards}
              resizeMode={"contain"}
              style={{ width: "100%", height: 250 }}
            />

            {/* Info activation */}
            <H4 weight={"SemiBold"} color={"bluegreyDark"}>
              {I18n.t("features.itWallet.activationScreen.howActivate")}
            </H4>
            <VSpacer />
            <H4 weight={"Regular"} color={"bluegrey"}>
              {I18n.t(
                "features.itWallet.activationScreen.howActivateDescription"
              )}
            </H4>
          </View>

          {/* Footer ToS and privacy link */}
          <ItwFooterInfoBox
            content={I18n.t("features.itWallet.activationScreen.tos")}
          />
        </ScreenContent>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwActivationDetailsScreen;
