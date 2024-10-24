import React from "react";
import { View } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import {
  IOBottomSheetModal,
  useIOBottomSheetModal
} from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";
import IOMarkdown from "../../../../components/IOMarkdown";

/**
 * This custom hook, usePaymentsLegacyAttachmentBottomSheet, is designed to display a bottom sheet
 * containing detailed information about where the user can find the legacy transaction recepit.
 */
const usePaymentsLegacyAttachmentBottomSheet = (): IOBottomSheetModal =>
  useIOBottomSheetModal({
    title: I18n.t("features.payments.transactions.legacy.bottomSheet.title"),
    component: (
      <View>
        <IOMarkdown
          content={I18n.t(
            "features.payments.transactions.legacy.bottomSheet.notice"
          )}
        />
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t(
            "features.payments.transactions.legacy.bottomSheet.allNotices"
          )}
        />
        <VSpacer size={48} />
      </View>
    )
  });

export { usePaymentsLegacyAttachmentBottomSheet };
