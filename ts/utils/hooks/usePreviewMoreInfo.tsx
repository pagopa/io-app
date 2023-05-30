import * as React from "react";
import I18n from "../../i18n";
import { Body } from "../../components/core/typography/Body";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOBottomSheetModal, useLegacyIOBottomSheetModal } from "./bottomSheet";

/**
 * Return on object to open an IO bottom sheet modal
 * which content is shared between the notification
 * preferences views
 */
export const usePreviewMoreInfo = (): IOBottomSheetModal => {
  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    <Body>
      {I18n.t("profile.preferences.notifications.preview.bottomSheet.content")}
    </Body>,
    I18n.t("profile.preferences.notifications.preview.bottomSheet.title"),
    400,
    <FooterWithButtons
      type="SingleButton"
      leftButton={confirmButtonProps(() => {
        dismiss();
      }, I18n.t("profile.preferences.notifications.preview.bottomSheet.cta"))}
    />
  );

  return { present, bottomSheet, dismiss };
};
