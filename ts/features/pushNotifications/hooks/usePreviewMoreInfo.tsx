import { Body } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import {
  IOBottomSheetModal,
  useIOBottomSheetModal
} from "../../../utils/hooks/bottomSheet";

/**
 * Return on object to open an IO bottom sheet modal
 * which content is shared between the notification
 * preferences views
 */
export const usePreviewMoreInfo = (): IOBottomSheetModal => {
  const { bottomSheet, dismiss, present } = useIOBottomSheetModal({
    component: (
      <Body>
        {I18n.t(
          "profile.preferences.notifications.preview.bottomSheet.content"
        )}
      </Body>
    ),
    snapPoint: [340],
    title: I18n.t("profile.preferences.notifications.preview.bottomSheet.title")
  });
  return { bottomSheet, dismiss, present };
};
