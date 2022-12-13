import * as React from "react";
import I18n from "../../../../../../i18n";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

export type Props = {
  isLoading: boolean;
  onCancel: () => void;
  onRetry: () => void;
};

/**
 * This screen displays a loading or error message while saving a bancomat
 * In error case a retry button will be shown
 * @constructor
 */
const LoadAddBancomatComponent: React.FunctionComponent<Props> = props => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.onCancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t("wallet.onboarding.bancomat.add.loading")}
      onAbort={props.onCancel}
      onRetry={props.onRetry}
    />
  );
};

export default LoadAddBancomatComponent;
