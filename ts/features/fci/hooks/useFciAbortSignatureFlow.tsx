import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H3 } from "../../../components/core/typography/H3";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { errorButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { fciEndRequest } from "../store/actions";
import { useIODispatch } from "../../../store/hooks";
import { H4 } from "../../../components/core/typography/H4";
import { trackFciUserExit } from "../analytics";

const styles = StyleSheet.create({
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  }
});

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciAbortSignatureFlow = () => {
  const dispatch = useIODispatch();
  const route = useRoute();
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <View style={styles.verticalPad}>
      <H4 weight={"Regular"}>{I18n.t("features.fci.abort.content")}</H4>
    </View>,
    <View style={IOStyles.flex}>
      <H3 color={"bluegreyDark"} weight={"SemiBold"}>
        {I18n.t("features.fci.abort.title")}
      </H3>
    </View>,
    280,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        testID: "FciStopAbortingSignatureTestID",
        onPressWithGestureHandler: true,
        bordered: true,
        onPress: () => dismiss(),
        title: I18n.t("features.fci.abort.confirm")
      }}
      rightButton={{
        ...errorButtonProps(() => {
          trackFciUserExit(route.name);
          dispatch(fciEndRequest());
          dismiss();
        }, I18n.t("features.fci.abort.cancel")),
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
