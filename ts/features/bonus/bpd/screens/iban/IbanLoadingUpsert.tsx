import { fromNullable } from "fp-ts/lib/Option";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Iban } from "../../../../../../definitions/backend/Iban";
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
} from "../../store/reducers/details/activation";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const IbanLoadingUpsert: React.FunctionComponent<Props> = props => {
  useHardwareBackButton(() => {
    if (!props.isLoading) {
      props.onAbort();
    }
    return true;
  });
  console.log("asdasdasddsa" + props.isLoading);

  return (
    <LoadingErrorComponent
      {...props}
      loadingCaption={"asd loading..."}
      onAbort={props.onAbort}
      onRetry={() =>
        fromNullable(props.ibanValue.value).map(iban => props.onRetry(iban))
      }
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
