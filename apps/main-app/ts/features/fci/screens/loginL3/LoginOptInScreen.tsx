import {
  Body,
  FeatureInfo,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { View } from "react-native";

import { WhatsNewScreenContent } from "../../../../components/screens/WhatsNewScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { openWebUrl } from "../../../../utils/url";
import { setFastLoginOptSessionLogin } from "../../../authentication/activeSessionLogin/store/actions";
import { AUTHENTICATION_ROUTES } from "../../../authentication/common/navigation/routes";
import {
  trackLoginSessionOptIn,
  trackLoginSessionOptIn30,
  trackLoginSessionOptIn365,
  trackLoginSessionOptInInfo
} from "../../../authentication/fastLogin/analytics/optinAnalytics.ts";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";

const FciSecurityInfo = () => (
  <View>
    <FeatureInfo
      action={{
        label: i18n.t(
          "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo1Action"
        ),
        onPress: () =>
          openWebUrl("https://account.ioapp.it/it/esci/", () =>
            IOToast.error(i18n.t("global.jserror.title"))
          )
      }}
      body={i18n.t(
        "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo1"
      )}
      iconName="fingerprint"
    />
    <VSpacer size={24} />
    <FeatureInfo
      action={{
        label: i18n.t(
          "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo2Action"
        ),
        onPress: () =>
          openWebUrl("https://ioapp.it/esci-da-io", () =>
            IOToast.error(i18n.t("global.jserror.title"))
          )
      }}
      body={i18n.t(
        "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo2"
      )}
      iconName="locked"
    />
    <VSpacer size={24} />
    <FeatureInfo
      body={i18n.t(
        "features.fci.requestL3.optinLogin.securityBottomsheet.featureInfo3"
      )}
      iconName="device"
    />
    <VSpacer size={24} />
  </View>
);

export const LoginOptInScreen = () => {
  const navigation = useIONavigation();
  const store = useIOStore();
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

  useOnFirstRender(() => {
    trackLoginSessionOptIn("FCI_auth");
  });

  const navigateToLoginPage = (isLV: boolean) => {
    if (isLV) {
      void trackLoginSessionOptIn365(store.getState(), "FCI_auth");
    } else {
      void trackLoginSessionOptIn30(store.getState(), "FCI_auth");
    }
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
      action={{
        label: i18n.t("features.fci.requestL3.optinLogin.primaryAction"),
        fullWidth: true,
        onPress: () => navigateToLoginPage(true),
        testID: "FciLoginL3ContinueButton"
      }}
      pictogram="security"
      secondaryAction={{
        label: i18n.t("features.fci.requestL3.optinLogin.secondaryAction"),
        onPress: () => navigateToLoginPage(false),
        testID: "FciLoginL3HelpButton"
      }}
      testID="FciLoginL3ScreenContent"
      title={i18n.t("features.fci.requestL3.optinLogin.title")}
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
          asLink
          onPress={() => {
            trackLoginSessionOptInInfo("FCI_auth");
            presentFciSecurityBottomSheet();
          }}
          testID="FciLoginL3DescriptionButton"
          weight="Semibold"
        >
          {i18n.t("features.fci.requestL3.optinLogin.descriptionButton")}
        </Body>
      </View>
      <VSpacer />
      {fciSecurityBottomSheet}
    </WhatsNewScreenContent>
  );
};
