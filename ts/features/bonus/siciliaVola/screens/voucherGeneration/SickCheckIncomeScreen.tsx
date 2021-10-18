import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { isSome } from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  svGenerateVoucherFailure,
  svGenerateVoucherSelectCategory
} from "../../store/actions/voucherGeneration";
import { SvBeneficiaryCategory } from "../../types/SvVoucherRequest";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import { navigateToSvSickSelectDestinationScreen } from "../../navigation/actions";
import CheckIncomeComponent from "../../components/CheckIncomeComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const SickCheckIncomeScreen = (props: Props): React.ReactElement | null => {
  if (
    isSome(props.selectedBeneficiaryCategory) &&
    props.selectedBeneficiaryCategory.value !== "sick"
  ) {
    props.failure("The selected category is not Sick");
    return null;
  }

  return (
    <CheckIncomeComponent
      onContinuePress={props.navigateToSvSickSelectDestination}
    />
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason)),
  selectCategory: (category: SvBeneficiaryCategory) =>
    dispatch(svGenerateVoucherSelectCategory(category)),
  navigateToSvSickSelectDestination: () =>
    dispatch(navigateToSvSickSelectDestinationScreen())
});
const mapStateToProps = (state: GlobalState) => ({
  selectedBeneficiaryCategory: selectedBeneficiaryCategorySelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SickCheckIncomeScreen);
