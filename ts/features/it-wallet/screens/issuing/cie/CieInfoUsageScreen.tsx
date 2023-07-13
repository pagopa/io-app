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
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useIODispatch } from "../../../../../store/hooks";
import { itwRequirementsRequest } from "../../../store/actions";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwParamsList } from "../../../navigation/params";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import ROUTES from "../../../../../navigation/routes";

export type CieInfoUsageNavigationParams = Readonly<{
  ciePin: string;
  authorizationUri: string;
}>;

const CieInfoUsageScreen = () => {
  const navigation =
    useNavigation<
      IOStackNavigationProp<ItwParamsList, "ITW_CIE_INFO_USAGE_SCREEN">
    >();
  const route = useRoute();

  const dispatch = useIODispatch();
  const { ciePin, authorizationUri } =
    route.params as CieInfoUsageNavigationParams;

  useOnFirstRender(() => {
    dispatch(itwRequirementsRequest.request());
  });

  /**
   * Containts the content of the screen.
   */
  const renderContent = () => {
    const cancelButtonProps = {
      block: true,
      light: false,
      bordered: true,
      onPress: () =>
        navigation.navigate(ROUTES.MAIN, {
          screen: ROUTES.MESSAGES_HOME
        }),
      title: I18n.t("features.itWallet.activationScreen.cancel")
    };

    const continueButtonProps = {
      block: true,
      primary: true,
      onPress: () => {
        if (authorizationUri !== undefined) {
          navigation.navigate(ITW_ROUTES.ACTIVATION.CIE_CARD_READER_SCREEN, {
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
                {"Guarda come fare"}
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

export default CieInfoUsageScreen;
