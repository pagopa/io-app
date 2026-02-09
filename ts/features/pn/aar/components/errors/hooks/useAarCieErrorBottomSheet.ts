import { Optional } from "@pagopa/io-app-design-system";
import { isFunction } from "lodash";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import { sendAarErrorSupportBottomSheetComponent } from "../SendAARErrorComponent";
import { useAarStartSendZendeskSupport } from "./useAarStartSendZendeskSupport";

type Props = {
  errorName: Optional<string>;
  zendeskSecondLevelTag: Parameters<typeof useAarStartSendZendeskSupport>[0];
  onCopyToClipboard?: (errorName: string) => void;
  onStartAssistance?: (errorName: string) => void;
};

/**
 * Hook that configures and exposes a bottom sheet for AAR CIE error support.
 *
 * @param errorName - Optional error code associated with the CIE failure
 * @param zendeskSecondLevelTag - Zendesk second-level tag used to classify the support request
 * @param onCopyToClipboard - Optional callback invoked when the error code is copied
 * @param onStartAssistance - Optional callback invoked before starting the Zendesk flow
 */
export const useAarCieErrorBottomSheet = ({
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
      onStartAssistance(errorName ?? "");
    }

    dismiss();
    startZendeskSupport(errorName);
  };

  const handleCopyToClipboard = () => {
    if (isFunction(onCopyToClipboard)) {
      onCopyToClipboard(errorName ?? "");
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
