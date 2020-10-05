import { fromNullable } from "fp-ts/lib/Option";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Iban } from "../../../../../../definitions/backend/Iban";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  bpdIbanInsertionCancel,
  bpdUpsertIban
} from "../../store/actions/iban";
import {
  bpdUpsertIbanIsError,
  bpdUpsertIbanSelector
} from "../../store/reducers/details/activation/payoffInstrument";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * displays to the user a loading screen while sending the new iban or
 * possibly an error screen in case of unmanaged errors.
 * @param props
 * @constructor
 */
const IbanLoadingUpsert: React.FunctionComponent<Props> = props => {
  const loading = I18n.t("bonus.bpd.title");

  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.onAbort();
    }
    return true;
  });
  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={loading}
      onAbort={props.onAbort}
      onRetry={() => fromNullable(props.ibanValue.value).map(props.onRetry)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAbort: () => dispatch(bpdIbanInsertionCancel()),
  onRetry: (iban: Iban) => dispatch(bpdUpsertIban.request(iban))
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: !bpdUpsertIbanIsError(state),
  ibanValue: bpdUpsertIbanSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(IbanLoadingUpsert);
