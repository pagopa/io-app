import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import CheckIncomeComponent from "../../components/CheckIncomeComponent";
import SV_ROUTES from "../../navigation/routes";
import {
  svGenerateVoucherFailure,
  svGenerateVoucherSelectCategory
} from "../../store/actions/voucherGeneration";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import { SvBeneficiaryCategory } from "../../types/SvVoucherRequest";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const SickCheckIncomeScreen = (props: Props): React.ReactElement | null => {
  const navigation = useNavigation();

  if (
    O.isSome(props.selectedBeneficiaryCategory) &&
    props.selectedBeneficiaryCategory.value !== "sick"
  ) {
    props.failure("The selected category is not Sick");
    return null;
  }

  return (
    <CheckIncomeComponent
      onContinuePress={() =>
        navigation.navigate(
          SV_ROUTES.VOUCHER_GENERATION.SICK_SELECT_DESTINATION
        )
      }
    />
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason)),
  selectCategory: (category: SvBeneficiaryCategory) =>
    dispatch(svGenerateVoucherSelectCategory(category))
});
const mapStateToProps = (state: GlobalState) => ({
  selectedBeneficiaryCategory: selectedBeneficiaryCategorySelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SickCheckIncomeScreen);
