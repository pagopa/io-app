import {
  Banner,
  IOVisualCostants,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { openWebUrl } from "../../../utils/url";
import I18n from "../../../i18n";
import { closeSessionExpirationBanner } from "../store/actions/sessionExpirationActions";
import { formattedExpirationDateSelector } from "../../../store/reducers/authentication";

const SESSION_EXPIRED_EDUCATIONAL_URL =
  "https://assistenza.ioapp.it/hc/it/articles/32616176301713-Cosa-fare-quando-la-sessione-scade";

type Props = {
  handleOnClose: () => void;
};
/**
 * to use in case the banner's visibility has to be handled externally
 * (see MultiBanner feature for the landing screen)
 */
export const FastLoginExpirationBanner = ({ handleOnClose }: Props) => {
  const expirationDate = useIOSelector(formattedExpirationDateSelector);
  const { error } = useIOToast();
  const dispatch = useIODispatch();

  const handleOnPress = () => {
    openWebUrl(SESSION_EXPIRED_EDUCATIONAL_URL, () => {
      error(I18n.t("global.jserror.title"));
    });
  };
  const closeHandler = useCallback(() => {
    dispatch(closeSessionExpirationBanner());
    handleOnClose();
  }, [dispatch, handleOnClose]);

  return (
    <View style={styles.margins}>
      <Banner
        content={I18n.t("fastLogin.expirationBanner.content", {
          date: expirationDate
        })}
        action={I18n.t("fastLogin.expirationBanner.action.label")}
        pictogramName="identityCheck"
        color="neutral"
        size="big"
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
