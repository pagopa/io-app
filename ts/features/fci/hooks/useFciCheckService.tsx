import * as React from "react";
import { StyleSheet, View } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H3 } from "../../../components/core/typography/H3";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { confirmButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { H4 } from "../../../components/core/typography/H4";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { fciStartSigningRequest } from "../store/actions";
import { upsertServicePreference } from "../../../store/actions/services/servicePreference";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { isServicePreferenceResponseSuccess } from "../../../types/services/ServicePreferenceResponse";
import { servicePreferenceSelector } from "../../../store/reducers/entities/services/servicePreference";
import { fciMetadataServiceIdSelector } from "../store/reducers/fciMetadata";
import { trackFciUxConversion } from "../analytics";

const styles = StyleSheet.create({
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  }
});

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciCheckService = () => {
  const dispatch = useIODispatch();
  const fciServiceId = useIOSelector(fciMetadataServiceIdSelector);
  const servicePreference = useIOSelector(servicePreferenceSelector);
  const servicePreferenceValue = pot.getOrElse(servicePreference, undefined);
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <View style={styles.verticalPad}>
      <H4 weight={"Regular"}>{I18n.t("features.fci.checkService.content")}</H4>
    </View>,
    <View style={IOStyles.flex}>
      <H3 color={"bluegreyDark"} weight={"SemiBold"}>
        {I18n.t("features.fci.checkService.title")}
      </H3>
    </View>,
    280,
    <FooterWithButtons
      type={"TwoButtonsInlineThird"}
      leftButton={{
        onPressWithGestureHandler: true,
        bordered: true,
        onPress: () => {
          dispatch(fciStartSigningRequest());
          dismiss();
        },
        title: I18n.t("features.fci.checkService.cancel")
      }}
      rightButton={{
        ...confirmButtonProps(() => {
          if (
            fciServiceId &&
            servicePreferenceValue &&
            isServicePreferenceResponseSuccess(servicePreferenceValue)
          ) {
            const sp = { ...servicePreferenceValue.value, inbox: true };
            dispatch(
              upsertServicePreference.request({
                id: fciServiceId as ServiceId,
                ...sp
              })
            );
          }
          trackFciUxConversion();
          dispatch(fciStartSigningRequest());
          dismiss();
        }, I18n.t("features.fci.checkService.confirm")),
        onPressWithGestureHandler: true
      }}
    />
  );

  return {
    dismiss,
    present,
    bottomSheet
  };
};
