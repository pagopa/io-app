import * as React from "react";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

const ManualConfigConfirm = (): React.ReactElement => (
  <>
    <VSpacer size={16} />
    <Markdown>
      {I18n.t("services.optIn.preferences.manualConfig.bottomSheet.body")}
    </Markdown>
  </>
);

export const useManualConfigBottomSheet = (onConfirm: () => void) => {
  const {
    present,
    bottomSheet: manualConfigBottomSheet,
    dismiss
  } = useIOBottomSheetModal(
    <ManualConfigConfirm />,
    I18n.t("services.optIn.preferences.manualConfig.bottomSheet.title"),
    350,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        ...cancelButtonProps(() => dismiss()),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        ...errorButtonProps(() => {
          onConfirm();
          dismiss();
        }),
        onPressWithGestureHandler: true
      }}
    />
  );

  return { present, manualConfigBottomSheet, dismiss };
};
