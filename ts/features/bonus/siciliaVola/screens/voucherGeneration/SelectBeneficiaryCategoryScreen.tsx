import * as React from "react";
import { useRef, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, Text } from "react-native";
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
  svGenerateVoucherSelectCategory
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { SvBeneficiaryCategory } from "../../types/SvVoucherRequest";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherRequest";
import {
  navigateToSvDisableAdditionalInfoScreen,
  navigateToSvSickCheckIncomeThresholdScreen,
  navigateToSvStudentSelectDestinationScreen,
  navigateToSvWorkerCheckIncomeThresholdScreen
} from "../../navigation/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const SelectBeneficiaryCategoryScreen = (props: Props): React.ReactElement => {
  const elementRef = useRef(null);

  const [categoryBeneficiary, setCategoryBeneficiary] = useState<
    SvBeneficiaryCategory | "other" | undefined
  >(undefined);

  const routeNextScreen = () => {
    switch (categoryBeneficiary) {
      case "student":
        props.selectCategory(categoryBeneficiary);
        props.navigateToSvStudentSelectDestination();
        return;
      case "disable":
        props.selectCategory(categoryBeneficiary);
        props.navigateToSvDisableAdditionalInfo();
        return;
      case "worker":
        props.selectCategory(categoryBeneficiary);
        props.navigateToSvWorkerCheckIncomeThreshold();
        return;
      case "sick":
        props.selectCategory(categoryBeneficiary);
        props.navigateToSvSickCheckIncomeThreshold();
        return;
      case "other":
        // TODO: go to ko screen
        return;
    }
  };

  const backButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.back,
    title: "Back"
  };
  const continueButtonProps = {
    primary: false,
    bordered: true,
    onPress: routeNextScreen,
    title: "Continue",
    disabled: categoryBeneficiary === undefined
  };

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <NavigationEvents onDidFocus={() => setAccessibilityFocus(elementRef)} />
      <SafeAreaView
        style={IOStyles.flex}
        testID={"SelectBeneficiaryCategory"}
        ref={elementRef}
      >
        <H1>SelectBeneficiaryCategoryScreen</H1>

        <ButtonDefaultOpacity onPress={() => setCategoryBeneficiary("student")}>
          <Text>Student</Text>
        </ButtonDefaultOpacity>

        <ButtonDefaultOpacity onPress={() => setCategoryBeneficiary("disable")}>
          <Text>Disable</Text>
        </ButtonDefaultOpacity>

        <ButtonDefaultOpacity onPress={() => setCategoryBeneficiary("worker")}>
          <Text>Worker</Text>
        </ButtonDefaultOpacity>

        <ButtonDefaultOpacity onPress={() => setCategoryBeneficiary("sick")}>
          <Text>Sick</Text>
        </ButtonDefaultOpacity>
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
  selectCategory: (category: SvBeneficiaryCategory) =>
    dispatch(svGenerateVoucherSelectCategory(category)),
  navigateToSvStudentSelectDestination: () =>
    dispatch(navigateToSvStudentSelectDestinationScreen()),
  navigateToSvDisableAdditionalInfo: () =>
    dispatch(navigateToSvDisableAdditionalInfoScreen()),
  navigateToSvWorkerCheckIncomeThreshold: () =>
    dispatch(navigateToSvWorkerCheckIncomeThresholdScreen()),
  navigateToSvSickCheckIncomeThreshold: () =>
    dispatch(navigateToSvSickCheckIncomeThresholdScreen())
});
const mapStateToProps = (state: GlobalState) => ({
  selectedBeneficiaryCategory: selectedBeneficiaryCategorySelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectBeneficiaryCategoryScreen);
