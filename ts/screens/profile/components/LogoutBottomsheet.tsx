import { FooterActions } from "@pagopa/io-app-design-system";
import IOMarkdown from "../../../components/IOMarkdown";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";

export const useLogoutBottomsheet = (handleContinue: () => void) => {
  const modal = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("profile.logout.alertTitle"),
      component: (
        <IOMarkdown content={I18n.t("profile.logout.bottomsheetMessage")} />
      ),
      footer: (
        <FooterActions
          actions={{
            type: "TwoButtons",
            primary: {
              label: I18n.t("global.buttons.confirm"),
              onPress: () => {
                modal.dismiss();
                handleContinue();
              }
            },
            secondary: {
              label: I18n.t("global.buttons.cancel"),
              onPress: () => modal.dismiss()
            }
          }}
        />
      )
    },
    200
  );
  return { ...modal };
};
