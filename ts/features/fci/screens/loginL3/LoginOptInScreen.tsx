import i18n from "i18next";
import { View } from "react-native";
import {
  Body,
  FeatureInfo,
  VSpacer,
  IOToast
} from "@pagopa/io-app-design-system";
import { WhatsNewScreenContent } from "../../../../components/screens/WhatsNewScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../utils/url";
import { useIODispatch } from "../../../../store/hooks";
import { setFastLoginOptSessionLogin } from "../../../authentication/activeSessionLogin/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../authentication/common/navigation/routes";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";

const FciSecurityInfo = () => (
  <View>
    <FeatureInfo
      iconName="fingerprint"
      body={i18n.t(
        "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo1"
      )}
      action={{
        label: i18n.t(
          "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo1Action"
        ),
        onPress: () =>
          openWebUrl("https://account.ioapp.it/it/esci/", () =>
            IOToast.error(i18n.t("global.jserror.title"))
          )
      }}
    />
    <VSpacer size={24} />
    <FeatureInfo
      iconName="locked"
      body={i18n.t(
        "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo2"
      )}
      action={{
        label: i18n.t(
          "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo2Action"
        ),
        onPress: () =>
          openWebUrl("https://ioapp.it/esci-da-io", () =>
            IOToast.error(i18n.t("global.jserror.title"))
          )
      }}
    />
    <VSpacer size={24} />
    <FeatureInfo
      iconName="device"
      body={i18n.t(
        "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo3"
      )}
    />
    <VSpacer size={24} />
  </View>
);

export const LoginOptInScreen = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const {
    present: presentFciSecurityBottomSheet,
    bottomSheet: fciSecurityBottomSheet
  } = useIOBottomSheetModal({
    title: i18n.t(
      "features.fci.requestL3.optinLogin.securityBottomsheet.title"
    ),
    component: <FciSecurityInfo />
  });

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  // TODO: Tracking will be added to a separate branch or pull request.
  // The task is: https://pagopa.atlassian.net/browse/IEL-458
  //   useOnFirstRender(() => {
  //     trackLoginSessionOptIn("fci");
  //   });

  const navigateToLoginPage = (isLV: boolean) => {
    // TODO: Tracking will be added to a separate branch or pull request.
    // The task is: https://pagopa.atlassian.net/browse/IEL-458
    // if (isLV) {
    //   void trackLoginSessionOptIn365(store.getState(), "fci");
    // } else {
    //   void trackLoginSessionOptIn30(store.getState(), "fci");
    // }
    dispatch(setFastLoginOptSessionLogin(isLV));
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.AUTHENTICATION,
      params: {
        screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
      }
    });
  };

  return (
    <WhatsNewScreenContent
      testID="FciLoginL3ScreenContent"
      pictogram="security"
      title={i18n.t("features.fci.requestL3.optinLogin.title")}
      action={{
        label: i18n.t("features.fci.requestL3.optinLogin.primaryAction"),
        fullWidth: true,
        onPress: () => navigateToLoginPage(true),
        testID: "FciLoginL3ContinueButton"
      }}
      secondaryAction={{
        label: i18n.t("features.fci.requestL3.optinLogin.secondaryAction"),
        onPress: () => navigateToLoginPage(false),
        testID: "FciLoginL3HelpButton"
      }}
    >
      <Body style={{ textAlign: "center" }} testID="FciLoginL3SubtitleText">
        {i18n.t("features.fci.requestL3.optinLogin.description")}
      </Body>
      <View
        style={{
          alignSelf: "center"
        }}
      >
        <Body
          testID="FciLoginL3DescriptionButton"
          weight="Semibold"
          asLink
          onPress={() => {
            // TODO: Tracking will be added to a separate branch or pull request.
            // The task is: https://pagopa.atlassian.net/browse/IEL-458
            // trackLoginSessionOptInInfo("fci");
            presentFciSecurityBottomSheet();
          }}
        >
          {i18n.t("features.fci.requestL3.optinLogin.descriptionButton")}
        </Body>
      </View>
      <VSpacer />
      {fciSecurityBottomSheet}
    </WhatsNewScreenContent>
  );
};
