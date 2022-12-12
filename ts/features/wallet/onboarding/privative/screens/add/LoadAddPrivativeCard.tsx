import * as React from "react";
import { connect } from "react-redux";
import { useHardwareBackButton } from "../../../../../../hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import I18n from "../../../../../../i18n";
import { WithTestID } from "../../../../../../types/WithTestID";

type Props = WithTestID<{
  isLoading: boolean;
  onCancel: () => void;
  onRetry: () => void;
}>;

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
      loadingCaption={I18n.t("wallet.onboarding.privative.add.loading")}
      onAbort={props.onCancel}
      onRetry={props.onRetry}
      testID={props.testID}
    />
  );
};

export default connect()(LoadAddPrivativeCard);
