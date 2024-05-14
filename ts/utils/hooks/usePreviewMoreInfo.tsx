import { ButtonSolid, ContentWrapper } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Body } from "../../components/core/typography/Body";
import I18n from "../../i18n";
import { IOBottomSheetModal, useIOBottomSheetModal } from "./bottomSheet";

/**
 * Return on object to open an IO bottom sheet modal
 * which content is shared between the notification
 * preferences views
 */
export const usePreviewMoreInfo = (): IOBottomSheetModal => {
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "profile.preferences.notifications.preview.bottomSheet.title"
    ),
    component: (
      <Body>
        {I18n.t(
          "profile.preferences.notifications.preview.bottomSheet.content"
        )}
      </Body>
    ),
    snapPoint: [400],
    footer: (
      <ContentWrapper>
        <ButtonSolid
          fullWidth
          label={I18n.t(
            "profile.preferences.notifications.preview.bottomSheet.cta"
          )}
          accessibilityLabel={I18n.t(
            "profile.preferences.notifications.preview.bottomSheet.cta"
          )}
          onPress={() => {
            dismiss();
          }}
        />
      </ContentWrapper>
    )
  });

  return { present, bottomSheet, dismiss };
};
