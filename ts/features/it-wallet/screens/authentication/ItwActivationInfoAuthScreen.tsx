import * as React from "react";
import { Image, View, SafeAreaView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import ScreenContent from "../../../../components/screens/ScreenContent";
import { H4 } from "../../../../components/core/typography/H4";
import ItwFooterInfoBox from "../../components/ItwFooterInfoBox";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import authInfoCie from "../../../../../img/features/it-wallet/auth-info-cie.png";
import { Link } from "../../../../components/core/typography/Link";

const ItwActivationInfoAuthScreen = () => {
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => undefined,
    title: I18n.t("features.itWallet.infoAuthScreen.confirm")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.itWallet.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScreenContent
          title={I18n.t("features.itWallet.infoAuthScreen.title")}
          subtitle={I18n.t("features.itWallet.infoAuthScreen.subTitle")}
        >
          <View style={IOStyles.horizontalContentPadding}>
            <H4 weight={"Regular"} color={"bluegrey"}>
              {"Non hai la CIE? "}
              <Link onPress={() => undefined}>{"Scopri come ottenerla"}</Link>
            </H4>

            {/* Wallet cards image */}
            <Image
              source={authInfoCie}
              resizeMode={"contain"}
              style={{ width: "100%", height: 200 }}
            />

            {/* Info activation */}
            <H4 weight={"Regular"} color={"bluegrey"}>
              {I18n.t("features.itWallet.infoAuthScreen.howAuth")}
            </H4>
          </View>

          {/* Footer Info Box */}
          <ItwFooterInfoBox
            content={I18n.t("features.itWallet.infoAuthScreen.footerBox")}
            infoIcon
          />
        </ScreenContent>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwActivationInfoAuthScreen;
