import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { isSome } from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { svGenerateVoucherFailure } from "../../store/actions/voucherGeneration";
import { navigateToSvWorkerSelectDestinationScreen } from "../../navigation/actions";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import CheckIncomeComponent from "../../components/CheckIncomeComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const WorkerCheckIncomeScreen = (props: Props): React.ReactElement | null => {
  if (
    isSome(props.selectedBeneficiaryCategory) &&
    props.selectedBeneficiaryCategory.value !== "worker"
  ) {
    props.failure("The selected category is not Worker");
    return null;
  }

  return (
    <CheckIncomeComponent
      onContinuePress={props.navigateToSvWorkerSelectDestination}
    />
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason)),
  navigateToSvWorkerSelectDestination: () =>
    dispatch(navigateToSvWorkerSelectDestinationScreen())
});
const mapStateToProps = (state: GlobalState) => ({
  selectedBeneficiaryCategory: selectedBeneficiaryCategorySelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkerCheckIncomeScreen);
