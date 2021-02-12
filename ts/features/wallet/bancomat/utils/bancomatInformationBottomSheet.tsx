import * as React from "react";
import { StyleSheet } from "react-native";
import { View } from "native-base";
import I18n from "../../../../i18n";
import {
  bottomSheetContent,
  useIOBottomSheetRaw
} from "../../../../utils/bottomSheet";
import InternationalCircuitIconsBar from "../../../../components/wallet/InternationalCircuitIconsBar";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../components/core/typography/Label";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { H4 } from "../../../../components/core/typography/H4";

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderColor: IOColors.blue
  }
});

/**
 * A bottomsheet that display generic information on bancomat and a cta to start the onboarding of a new
 * payment method.
 * This will be also visualized inside a bottomsheet after an addition of a new bancomat
 */
export default (onAdd?: () => void) => {
  const { present: openBottomSheet, dismiss } = useIOBottomSheetRaw(
    385,
    bottomSheetContent
  );
  return {
    present: () =>
      openBottomSheet(
        <View>
          <InternationalCircuitIconsBar />
          <View spacer={true} />
          <H4 weight={"Regular"} color={"bluegreyDark"}>
            {I18n.t("wallet.bancomat.details.debit.body")}
          </H4>
          <View spacer={true} />
          <ButtonDefaultOpacity
            style={styles.button}
            bordered={true}
            onPress={() => {
              onAdd?.();
              dismiss();
            }}
            onPressWithGestureHandler={true}
          >
            <Label>{I18n.t("wallet.bancomat.details.debit.addCta")}</Label>
          </ButtonDefaultOpacity>
        </View>,
        I18n.t("wallet.bancomat.details.debit.title")
      ),
    dismiss
  };
};
