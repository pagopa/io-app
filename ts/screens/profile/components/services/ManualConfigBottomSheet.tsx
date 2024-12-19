import { FooterActionsInline, VSpacer } from "@pagopa/io-app-design-system";

import { ReactElement } from "react";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

const SNAP_POINT_VALUE = 250;

const ManualConfigConfirm = (): ReactElement => (
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
  } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t(
        "services.optIn.preferences.manualConfig.bottomSheet.title"
      ),
      component: <ManualConfigConfirm />,
      fullScreen: true,
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
    },
    SNAP_POINT_VALUE
  );

  return { present, manualConfigBottomSheet, dismiss };
};
