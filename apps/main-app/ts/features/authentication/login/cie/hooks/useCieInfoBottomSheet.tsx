import { Body, IOMarkdown, VSpacer } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { View } from "react-native";

import { pinPukHelpUrl } from "../../../../../config";
import { useIOStore } from "../../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../../utils/url";
import { cieLoginFlowSelector } from "../../../activeSessionLogin/store/selectors";
import { trackLoginCiePinInfo } from "../../../common/analytics/cieAnalytics";

export const useCieInfoBottomSheet = () => {
  const store = useIOStore();

  const handlePress = useCallback(() => {
    openWebUrl(pinPukHelpUrl);
  }, []);

  const bottomSheet = useIOBottomSheetModal({
    component: (
      <View>
        <IOMarkdown content={I18n.t("bottomSheets.ciePin.content")} />
        <VSpacer size={24} />
        <Body asLink onPress={handlePress} weight="Semibold">
          {I18n.t("authentication.cie.pin.bottomSheetCTA")}
        </Body>
        <VSpacer size={24} />
      </View>
    ),
    title: I18n.t("bottomSheets.ciePin.title")
  });

  return {
    ...bottomSheet,
    present: () => {
      const loginFlow = cieLoginFlowSelector(store.getState());
      trackLoginCiePinInfo(loginFlow);
      bottomSheet.present();
    }
  };
};
