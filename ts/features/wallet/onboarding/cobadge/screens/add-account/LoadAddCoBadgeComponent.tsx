import * as React from "react";
import { useHardwareBackButton } from "../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

export type Props = {
  isLoading: boolean;
  onCancel: () => void;
  onRetry: () => void;
};

/**
 * This screen displays a loading or error message while adding a co-badge card to the wallet
 * In error case a retry button will be shown
 * @constructor
 */
const LoadAddCoBadgeComponent = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.onCancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      // TODO: add caption
      loadingCaption={"TMP Load"}
      onAbort={props.onCancel}
      onRetry={props.onRetry}
    />
  );
};

export default LoadAddCoBadgeComponent;
