import * as React from "react";
import { VSpacer } from "@pagopa/io-app-design-system";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../../../components/buttons/ButtonConfigurations";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../i18n";
import { useLegacyIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

const ManualConfigConfirm = (): React.ReactElement => (
  <>
    <VSpacer size={16} />
    <LegacyMarkdown>
      {I18n.t("services.optIn.preferences.manualConfig.bottomSheet.body")}
    </LegacyMarkdown>
  </>
);

export const useManualConfigBottomSheet = (onConfirm: () => void) => {
  const {
    present,
    bottomSheet: manualConfigBottomSheet,
    dismiss
  } = useLegacyIOBottomSheetModal(
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
