import { Optional } from "@pagopa/io-app-design-system";
import { isFunction } from "lodash";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import { sendAarErrorSupportBottomSheetComponent } from "../sendAarErrorSupportBottomSheetComponent";
import {
  SendAarZendeskSecondLevelTag,
  useAarStartSendZendeskSupport
} from "./useAarStartSendZendeskSupport";

type Props = {
  errorName: Optional<string>;
  zendeskSecondLevelTag: SendAarZendeskSecondLevelTag;
  onCopyToClipboard?: () => void;
  onStartAssistance?: () => void;
};

/**
 * Hook that configures and exposes a bottom sheet for AAR CIE error support.
 *
 * @param errorName - Optional error code associated with the CIE failure
 * @param zendeskSecondLevelTag - Zendesk second-level tag used to classify the support request
 * @param onCopyToClipboard - Optional callback invoked when the error code is copied
 * @param onStartAssistance - Optional callback invoked before starting the Zendesk flow
 */
export const useAarGenericErrorBottomSheet = ({
  errorName,
  zendeskSecondLevelTag,
  onCopyToClipboard,
  onStartAssistance
}: Props) => {
  const startZendeskSupport = useAarStartSendZendeskSupport(
    zendeskSecondLevelTag
  );

  const handleAssistance = () => {
    if (isFunction(onStartAssistance)) {
      onStartAssistance();
    }

    dismiss();
    startZendeskSupport(errorName);
  };

  const handleCopyToClipboard = () => {
    if (isFunction(onCopyToClipboard)) {
      onCopyToClipboard();
    }
  };

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    component: sendAarErrorSupportBottomSheetComponent(
      handleAssistance,
      errorName,
      handleCopyToClipboard
    ),
    title: ""
  });
  return { bottomSheet, present };
};
