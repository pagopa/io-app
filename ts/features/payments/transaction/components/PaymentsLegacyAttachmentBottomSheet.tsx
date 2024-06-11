import React from "react";
import { View } from "react-native";
import { Body, H4, VSpacer } from "@pagopa/io-app-design-system";
import {
  IOBottomSheetModal,
  useIOBottomSheetAutoresizableModal
} from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";

/**
 * This custom hook, usePaymentsLegacyAttachmentBottomSheet, is designed to display a bottom sheet
 * containing detailed information about where the user can find the legacy transaction recepit.
 */
const usePaymentsLegacyAttachmentBottomSheet = (): IOBottomSheetModal =>
  useIOBottomSheetAutoresizableModal({
    title: I18n.t("features.payments.transactions.legacy.bottomSheet.title"),
    component: (
      <View>
        <ParagraphWithTitle
          title={I18n.t(
            "features.payments.transactions.legacy.bottomSheet.noticeHeading"
          )}
          body={I18n.t(
            "features.payments.transactions.legacy.bottomSheet.noticeBody"
          )}
        />
        <VSpacer size={24} />
        <ParagraphWithTitle
          title={I18n.t(
            "features.payments.transactions.legacy.bottomSheet.allNoticesHeading"
          )}
          body={I18n.t(
            "features.payments.transactions.legacy.bottomSheet.allNoticesBody"
          )}
        />
        <VSpacer size={48} />
      </View>
    )
  });

type ParagraphWithTitleProps = {
  title: string;
  body: string;
};

const ParagraphWithTitle = ({ title, body }: ParagraphWithTitleProps) => (
  <View>
    <Body weight="SemiBold" color="black">
      {title}
    </Body>
    <VSpacer size={8} />
    <Body>{body}</Body>
  </View>
);

export { usePaymentsLegacyAttachmentBottomSheet };
