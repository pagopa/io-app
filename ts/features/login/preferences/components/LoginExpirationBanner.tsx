import {
  Banner,
  IOVisualCostants,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import I18n from "../../../../i18n";
import { closeSessionExpirationBanner } from "../store/actions";
import { formattedExpirationDateSelector } from "../../../authentication/store/selectors";
import { helpCenterHowToDoWhenSessionIsExpiredUrl } from "../../../../config";
import { trackHelpCenterCtaTapped } from "../../../../utils/analytics";
import {
  BANNER_ID,
  trackLoginExpirationBannerClosure,
  trackLoginExpirationBannerPrompt
} from "../analytics";

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
  const { error } = useIOToast();
  const dispatch = useIODispatch();

  useEffect(() => {
    trackLoginExpirationBannerPrompt();
  }, []);

  const handleOnPress = useCallback(() => {
    trackHelpCenterCtaTapped(
      BANNER_ID,
      helpCenterHowToDoWhenSessionIsExpiredUrl,
      routeName
    );
    openWebUrl(helpCenterHowToDoWhenSessionIsExpiredUrl, () => {
      error(I18n.t("global.jserror.title"));
    });
  }, [error, routeName]);

  const closeHandler = useCallback(() => {
    trackLoginExpirationBannerClosure();
    dispatch(closeSessionExpirationBanner());
    handleOnClose();
  }, [dispatch, handleOnClose]);

  return (
    <View style={styles.margins}>
      <Banner
        title={I18n.t("loginFeatures.loginPreferences.expirationBanner.title")}
        content={I18n.t(
          "loginFeatures.loginPreferences.expirationBanner.content",
          {
            date: expirationDate
          }
        )}
        action={I18n.t(
          "loginFeatures.loginPreferences.expirationBanner.action.label"
        )}
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
