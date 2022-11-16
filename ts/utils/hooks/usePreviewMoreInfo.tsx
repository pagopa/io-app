import * as React from "react";
import I18n from "../../i18n";
import { Body } from "../../components/core/typography/Body";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { IOBottomSheetModal, useIOBottomSheetModal } from "./bottomSheet";

/**
 * Return on object to open an IO bottom sheet modal
 * which content is shared between the notification
 * preferences views
 */
export const usePreviewMoreInfo = (): IOBottomSheetModal => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <Body>
      {I18n.t("profile.preferences.notifications.preview.bottomSheet.content")}
    </Body>,
    I18n.t("profile.preferences.notifications.preview.bottomSheet.title"),
    400,
    <FooterWithButtons
      type="SingleButton"
      leftButton={{
        block: true,
        primary: true,
        onPress: () => dismiss(),
        title: I18n.t(
          "profile.preferences.notifications.preview.bottomSheet.cta"
        )
      }}
    />
  );

  return { present, bottomSheet, dismiss };
};
