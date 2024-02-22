import * as React from "react";
import { VSpacer, FooterWithButtons } from "@pagopa/io-app-design-system";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

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
  } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t(
        "services.optIn.preferences.manualConfig.bottomSheet.title"
      ),
      component: <ManualConfigConfirm />,
      fullScreen: true,
      footer: (
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          primary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t("global.buttons.cancel"),
              onPress: () => dismiss(),
              accessibilityLabel: I18n.t("global.buttons.cancel")
            }
          }}
          secondary={{
            type: "Solid",
            buttonProps: {
              color: "danger",
              label: I18n.t("global.buttons.confirm"),
              accessibilityLabel: I18n.t("global.buttons.confirm"),
              onPress: () => {
                onConfirm();
                dismiss();
              }
            }
          }}
        />
      )
    },
    250
  );

  return { present, manualConfigBottomSheet, dismiss };
};
