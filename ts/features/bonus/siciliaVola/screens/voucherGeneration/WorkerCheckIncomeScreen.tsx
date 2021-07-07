import * as React from "react";
import { useRef } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { NavigationEvents } from "react-navigation";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherFailure,
  svGenerateVoucherUnderThresholdIncome
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { navigateToSvWorkerSelectDestinationScreen } from "../../navigation/actions";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherRequest";
import { isSome } from "fp-ts/lib/Option";
import I18n from "../../../../../i18n";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const WorkerCheckIncomeScreen = (props: Props): React.ReactElement | null => {
  const elementRef = useRef(null);
  const backButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.back,
    title: "Back"
  };
  const continueButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.navigateToSvWorkerSelectDestination,
    title: "Continue"
  };

  if (
    isSome(props.selectedBeneficiaryCategory) &&
    props.selectedBeneficiaryCategory.value !== "worker"
  ) {
    props.failure("The selected category is not Worker");
    return null;
  }

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <NavigationEvents onDidFocus={() => setAccessibilityFocus(elementRef)} />
      <SafeAreaView
        style={IOStyles.flex}
        testID={"WorkerCheckIncomeScreen"}
        ref={elementRef}
      >
        <H1>{I18n.t("bonus.sv.voucherGeneration.worker.checkIncome.title")}</H1>
      </SafeAreaView>
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={backButtonProps}
        rightButton={continueButtonProps}
      />
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(svGenerateVoucherBack()),
  cancel: () => dispatch(svGenerateVoucherCancel()),
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason)),
  underThresholdIncome: () =>
    dispatch(svGenerateVoucherUnderThresholdIncome(true)),
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
