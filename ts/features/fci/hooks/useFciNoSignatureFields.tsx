import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H3 } from "../../../components/core/typography/H3";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { confirmButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { H4 } from "../../../components/core/typography/H4";

const styles = StyleSheet.create({
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  }
});

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciNoSignatureFields = () => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <View style={styles.verticalPad}>
      <H4 weight={"Regular"}>{I18n.t("features.fci.noFields.content")}</H4>
    </View>,
    <View style={IOStyles.flex}>
      <H3 color={"bluegreyDark"} weight={"SemiBold"}>
        {I18n.t("features.fci.noFields.title")}
      </H3>
    </View>,
    280,
    <FooterWithButtons
      type={"TwoButtonsInlineThird"}
      leftButton={{
        onPressWithGestureHandler: true,
        bordered: true,
        onPress: () => {
          dismiss();
        },
        title: I18n.t("features.fci.noFields.leftButton")
      }}
      rightButton={{
        ...confirmButtonProps(() => {
          dismiss();
        }, I18n.t("features.fci.noFields.rightButton")),
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
