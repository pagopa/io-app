import { constVoid } from "fp-ts/lib/function";
import { Alert } from "@pagopa/io-app-design-system";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { GestureResponderEvent } from "react-native";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { sectionStatusByKeySelector } from "../../../../store/reducers/backendStatus/sectionStatus";
import { getFullLocale } from "../../../../utils/locale";
import { openWebUrl } from "../../../../utils/url";
import { getAlertVariant } from "../../common/utils";

export const PaymentsAlertStatus = () => {
  const alertInfo = useIOSelector(sectionStatusByKeySelector("payments"));
  if (!alertInfo || !alertInfo.is_visible) {
    return null;
  }

  const actionLabel = alertInfo.web_url
    ? I18n.t("features.payments.remoteAlert.cta")
    : undefined;

  const handleOnPressAlertStatusInfo = (_: GestureResponderEvent) => {
    if (alertInfo && alertInfo.web_url && alertInfo.web_url[getFullLocale()]) {
      openWebUrl(alertInfo.web_url[getFullLocale()]);
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Layout.duration(200)}
    >
      <Alert
        content={alertInfo.message[getFullLocale()]}
        variant={getAlertVariant(alertInfo.level)}
        action={actionLabel}
        onPress={
          alertInfo.web_url ? handleOnPressAlertStatusInfo : () => constVoid
        }
      />
    </Animated.View>
  );
};
