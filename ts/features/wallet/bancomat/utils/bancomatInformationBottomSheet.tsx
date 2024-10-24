import * as React from "react";
import { View } from "react-native";
import { ButtonOutline, H6, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import InternationalCircuitIconsBar from "../../../../components/wallet/InternationalCircuitIconsBar";
import { useLegacyIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

/**
 * A bottomsheet that display generic information on bancomat and a cta to start the onboarding of a new
 * payment method.
 * This will be also visualized inside a bottomsheet after an addition of a new bancomat
 */
export default (onAdd?: () => void) => {
  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    <View>
      <InternationalCircuitIconsBar />
      <VSpacer size={16} />
      <H6 color={"bluegreyDark"}>
        {I18n.t("wallet.bancomat.details.debit.body")}
      </H6>
      <VSpacer size={16} />
      <ButtonOutline
        fullWidth
        onPress={() => {
          onAdd?.();
          dismiss();
        }}
        label={I18n.t("wallet.bancomat.details.debit.addCta")}
      />
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
