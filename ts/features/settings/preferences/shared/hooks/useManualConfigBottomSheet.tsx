import { FooterActionsInline } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import IOMarkdown from "../../../../../components/IOMarkdown";

const ManualConfigConfirm = (): React.ReactElement => (
  <IOMarkdown
    content={I18n.t("services.optIn.preferences.manualConfig.bottomSheet.body")}
  />
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
