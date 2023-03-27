import * as React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import InternationalCircuitIconsBar from "../../../../components/wallet/InternationalCircuitIconsBar";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../components/core/typography/Label";
import { H4 } from "../../../../components/core/typography/H4";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

/**
 * A bottomsheet that display generic information on bancomat and a cta to start the onboarding of a new
 * payment method.
 * This will be also visualized inside a bottomsheet after an addition of a new bancomat
 */
export default (onAdd?: () => void) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <View>
      <InternationalCircuitIconsBar />
      <VSpacer size={16} />
      <H4 weight={"Regular"} color={"bluegreyDark"}>
        {I18n.t("wallet.bancomat.details.debit.body")}
      </H4>
      <VSpacer size={16} />
      <ButtonDefaultOpacity
        primary={true}
        block={true}
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
    I18n.t("wallet.bancomat.details.debit.title"),
    385
  );
  return {
    present,
    bottomSheet,
    dismiss
  };
};
