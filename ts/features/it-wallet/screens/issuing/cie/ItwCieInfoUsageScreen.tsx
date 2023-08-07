import * as React from "react";
import { Image, View, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ScreenContent from "../../../../../components/screens/ScreenContent";
import { H4 } from "../../../../../components/core/typography/H4";
import ItwFooterInfoBox from "../../../components/ItwFooterInfoBox";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import authInfoCie from "../../../../../../img/features/it-wallet/auth-info-cie.png";
import { Link } from "../../../../../components/core/typography/Link";
import { openWebUrl } from "../../../../../utils/url";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { useIODispatch } from "../../../../../store/hooks";
import { itwActivationStop } from "../../../store/actions";

export type ItwCieInfoUsageScreenNavigationParams = Readonly<{
  ciePin: string;
  authorizationUri: string;
}>;

const ItwCieInfoUsageScreen = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<ItwParamsList, "ITW_ISSUING_CIE_INFO_USAGE_SCREEN">
    >();
  const route = useRoute();
  const dispatch = useIODispatch();

  const { ciePin, authorizationUri } =
    route.params as ItwCieInfoUsageScreenNavigationParams;

  /**
   * Containts the content of the screen.
   */
  const renderContent = () => {
    const cancelButtonProps = {
      block: true,
      light: false,
      bordered: true,
      onPress: () => {
        dispatch(itwActivationStop());
      },
      title: I18n.t("features.itWallet.issuing.infoCie.cancel")
    };

    const continueButtonProps = {
      block: true,
      primary: true,
      onPress: () => {
        if (authorizationUri !== undefined) {
          navigation.navigate(ITW_ROUTES.ISSUING.CIE.CARD_READER_SCREEN, {
            ciePin,
            authorizationUri
          });
        }
      },
      title: I18n.t("features.itWallet.issuing.infoCie.confirm")
    };

    return (
      <>
        <ScreenContent
          title={I18n.t("features.itWallet.issuing.infoCie.title")}
          subtitle={I18n.t("features.itWallet.issuing.infoCie.subTitle")}
        >
          <View style={IOStyles.horizontalContentPadding}>
            <H4 weight={"Regular"} color={"bluegrey"}>
              <Link
                onPress={() =>
                  openWebUrl(
                    I18n.t("features.itWallet.issuing.infoCie.readMoreUrl")
                  )
                }
              >
                {I18n.t("features.itWallet.issuing.infoCie.readMoreText")}
              </Link>
            </H4>

            {/* Wallet cards image */}
            <Image
              source={authInfoCie}
              resizeMode={"contain"}
              style={{ width: "100%", height: 200 }}
            />
          </View>
        </ScreenContent>
        {/* Footer Info Box */}
        <ItwFooterInfoBox
          content={I18n.t("features.itWallet.issuing.infoCie.footerBox")}
          infoIcon
        />
        <VSpacer />
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </>
    );
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.itWallet.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>{renderContent()}</SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwCieInfoUsageScreen;
