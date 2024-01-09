import * as React from "react";
import { Image, SafeAreaView, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import {
  ButtonSolidProps,
  IconButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { useIODispatch } from "../../../../../store/hooks";
import { itwActivationStop } from "../../../store/actions/itwActivationActions";
import ItwTextInfo from "../../../components/ItwTextInfo";
import itwHeroImage from "../../../assets/img/issuing/itw_hero.png";
import itwCardImage from "../../../assets/img/issuing/itw_card.png";
import { isAndroid } from "../../../../../utils/platform";
import ItwFooterVerticalButtons from "../../../components/ItwFooterVerticalButtons";

const ItwIssuancePidInfoScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation();

  const bottomButtonProps: ButtonSolidProps = {
    fullWidth: true,
    color: "contrast",
    label: I18n.t("features.itWallet.activationScreen.cancel"),
    accessibilityLabel: I18n.t("features.itWallet.activationScreen.cancel"),
    onPress: () => {
      dispatch(itwActivationStop());
    }
  };

  const topButtonProps: ButtonSolidProps = {
    color: "primary",
    fullWidth: true,
    accessibilityLabel: I18n.t("features.itWallet.activationScreen.confirm"),
    onPress: () => navigation.navigate(ITW_ROUTES.ISSUANCE.PID.AUTH),
    label: I18n.t("features.itWallet.activationScreen.confirm")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      customGoBack={
        <IconButton
          onPress={bottomButtonProps.onPress}
          accessibilityLabel={I18n.t(
            "features.itWallet.activationScreen.cancel"
          )}
          icon={isAndroid ? "backAndroid" : "backiOS"}
        />
      }
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          {/* Header card image */}
          <Image source={itwHeroImage} style={{ width: "100%" }} />
          <VSpacer size={24} />

          <View style={IOStyles.horizontalContentPadding}>
            {/* Detail infobox */}
            <ItwTextInfo
              content={I18n.t("features.itWallet.activationScreen.intro")}
            />
            <VSpacer size={24} />

            {/* Online infobox */}
            <ItwTextInfo
              content={I18n.t(
                "features.itWallet.activationScreen.subContentOne"
              )}
            />
            <VSpacer size={24} />

            {/* Hero card image */}
            <Image source={itwCardImage} style={{ width: "100%" }} />
            <VSpacer size={24} />

            {/* Info activation */}
            <ItwTextInfo
              content={I18n.t(
                "features.itWallet.activationScreen.subContentTwo"
              )}
            />
          </View>
        </ScrollView>
        <VSpacer size={24} />
        <ItwFooterVerticalButtons
          topButtonProps={topButtonProps}
          bottomButtonProps={bottomButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwIssuancePidInfoScreen;
