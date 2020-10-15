import * as React from "react";
import I18n from "../../../../../../i18n";
import { useHardwareBackButton } from "../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

export type Props = {
  isLoading: boolean;
  onCancel: () => void;
  onRetry: () => void;
};

/**
 * This screen is displayed when adding a new Bancomat
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
      loadingCaption={I18n.t("wallet.onboarding.bancomat.loadingSearch.title")}
      onAbort={props.onCancel}
      onRetry={props.onRetry}
    />
  );
};

export default LoadAddBancomatComponent;
