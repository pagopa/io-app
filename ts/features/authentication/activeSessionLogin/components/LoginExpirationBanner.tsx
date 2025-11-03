import {
  Banner,
  IOVisualCostants,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import { formattedExpirationDateSelector } from "../../common/store/selectors";
import { helpCenterHowToDoWhenSessionIsExpiredUrl } from "../../../../config";
import { trackHelpCenterCtaTapped } from "../../../../utils/analytics";
import {
  BANNER_ID,
  trackLoginExpirationBannerClosure,
  trackLoginExpirationBannerPrompt
} from "../analytics";
import { isActiveSessionLoginEnabledSelector } from "../../activeSessionLogin/store/selectors";
import {
  closeSessionExpirationBanner,
  setStartActiveSessionLogin
} from "../../activeSessionLogin/store/actions";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

type Props = {
  handleOnClose: () => void;
};
/**
 * to use in case the banner's visibility has to be handled externally
 * (see MultiBanner feature for the landing screen)
 */
export const LoginExpirationBanner = ({ handleOnClose }: Props) => {
  const { name: routeName } = useRoute();
  const expirationDate = useIOSelector(formattedExpirationDateSelector);
  const isActiveSessionLoginEnabled = useIOSelector(
    isActiveSessionLoginEnabledSelector
  );
  const { error } = useIOToast();
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  useEffect(() => {
    trackLoginExpirationBannerPrompt();
  }, []);

  const handleOnPress = useCallback(() => {
    if (isActiveSessionLoginEnabled) {
      dispatch(setStartActiveSessionLogin());
      navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
        screen: SETTINGS_ROUTES.AUTHENTICATION,
        params: {
          screen: AUTHENTICATION_ROUTES.LANDING_ACTIVE_SESSION_LOGIN
        }
      });
    } else {
      trackHelpCenterCtaTapped(
        BANNER_ID,
        helpCenterHowToDoWhenSessionIsExpiredUrl,
        routeName
      );
      openWebUrl(helpCenterHowToDoWhenSessionIsExpiredUrl, () => {
        error(I18n.t("global.jserror.title"));
      });
    }
  }, [dispatch, error, isActiveSessionLoginEnabled, navigation, routeName]);

  const closeHandler = useCallback(() => {
    trackLoginExpirationBannerClosure();
    dispatch(closeSessionExpirationBanner());
    handleOnClose();
  }, [dispatch, handleOnClose]);

  const title = isActiveSessionLoginEnabled
    ? I18n.t("loginFeatures.loginPreferences.expirationBannerNew.title", {
        date: expirationDate
      })
    : I18n.t("loginFeatures.loginPreferences.expirationBanner.title");

  const content = isActiveSessionLoginEnabled
    ? I18n.t("loginFeatures.loginPreferences.expirationBannerNew.content")
    : I18n.t("loginFeatures.loginPreferences.expirationBanner.content", {
        date: expirationDate
      });

  const action = isActiveSessionLoginEnabled
    ? I18n.t("loginFeatures.loginPreferences.expirationBannerNew.action.label")
    : I18n.t("loginFeatures.loginPreferences.expirationBanner.action.label");

  return (
    <View style={styles.margins}>
      <Banner
        testID="loginExpirationBanner"
        title={title}
        content={content}
        action={action}
        pictogramName="identityCheck"
        color="neutral"
        onClose={closeHandler}
        labelClose={I18n.t("global.buttons.close")}
        onPress={handleOnPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
