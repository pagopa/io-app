import * as React from "react";
import { connect } from "react-redux";
import { useHardwareBackButton } from "../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../../../../../i18n";

type Props = {
  isLoading: boolean;
  onCancel: () => void;
  onRetry: () => void;
};

/**
 * Loading screen while adding the privative card to the wallet
 * @param _
 * @constructor
 */
const LoadAddPrivativeCard = (props: Props): React.ReactElement => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.onCancel();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={I18n.t("wallet.onboarding.coBadge.add.loading")}
      onAbort={props.onCancel}
      onRetry={props.onRetry}
    />
  );
};

export default connect()(LoadAddPrivativeCard);
