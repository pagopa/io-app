import { FooterActionsInline, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../i18n";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

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
  } = useIOBottomSheetModal({
    title: I18n.t("services.optIn.preferences.manualConfig.bottomSheet.title"),
    component: <ManualConfigConfirm />,
    footer: (
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: I18n.t("global.buttons.cancel"),
          onPress: () => dismiss()
        }}
        endAction={{
          color: "danger",
          label: I18n.t("global.buttons.confirm"),
          onPress: () => {
            onConfirm();
            dismiss();
          }
        }}
      />
    )
  });

  return { present, manualConfigBottomSheet, dismiss };
};
