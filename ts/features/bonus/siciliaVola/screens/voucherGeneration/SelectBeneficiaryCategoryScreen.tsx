import * as React from "react";
import { useRef, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView } from "react-native";
import { View } from "native-base";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherSelectCategory
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { SvBeneficiaryCategory } from "../../types/SvVoucherRequest";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import {
  navigateToSvDisabledAdditionalInfoScreen,
  navigateToSvKoSelectBeneficiaryCategoryScreen,
  navigateToSvSickCheckIncomeThresholdScreen,
  navigateToSvStudentSelectDestinationScreen,
  navigateToSvWorkerCheckIncomeThresholdScreen
} from "../../navigation/actions";
import I18n from "../../../../../i18n";
import {
  RadioButtonList,
  RadioItem
} from "../../../../../components/core/selection/RadioButtonList";

type BeneficiaryCategory = SvBeneficiaryCategory | "other";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const getCategoryBeneficiaryItems = (): ReadonlyArray<
  RadioItem<BeneficiaryCategory>
> => [
  {
    body: I18n.t(
      "bonus.sv.voucherGeneration.selectBeneficiaryCategory.categories.student"
    ),
    id: "student"
  },
  {
    body: I18n.t(
      "bonus.sv.voucherGeneration.selectBeneficiaryCategory.categories.disabled"
    ),
    id: "disabled"
  },
  {
    body: I18n.t(
      "bonus.sv.voucherGeneration.selectBeneficiaryCategory.categories.worker"
    ),
    id: "worker"
  },
  {
    body: I18n.t(
      "bonus.sv.voucherGeneration.selectBeneficiaryCategory.categories.sick"
    ),
    id: "sick"
  },
  {
    body: I18n.t(
      "bonus.sv.voucherGeneration.selectBeneficiaryCategory.categories.other"
    ),
    id: "other"
  }
];

const SelectBeneficiaryCategoryScreen = (props: Props): React.ReactElement => {
  const elementRef = useRef(null);

  const [categoryBeneficiary, setCategoryBeneficiary] = useState<
    BeneficiaryCategory | undefined
  >(undefined);

  const routeNextScreen = () => {
    switch (categoryBeneficiary) {
      case "student":
        props.selectCategory(categoryBeneficiary);
        props.navigateToSvStudentSelectDestination();
        return;
      case "disabled":
        props.selectCategory(categoryBeneficiary);
        props.navigateToSvDisabledAdditionalInfo();
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
        props.navigateToSvKoSelectBeneficiaryCategory();
        return;
    }
  };

  const backButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.back,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    primary: false,
    bordered: false,
    onPress: routeNextScreen,
    title: I18n.t("global.buttons.continue"),
    disabled: categoryBeneficiary === undefined
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"SelectBeneficiaryCategory"}
        ref={elementRef}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>
            {I18n.t(
              "bonus.sv.voucherGeneration.selectBeneficiaryCategory.title"
            )}
          </H1>

          <View spacer={true} />
          <RadioButtonList<BeneficiaryCategory>
            key="delete_reason"
            items={getCategoryBeneficiaryItems()}
            selectedItem={categoryBeneficiary}
            onPress={setCategoryBeneficiary}
          />
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={backButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
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
  navigateToSvDisabledAdditionalInfo: () =>
    dispatch(navigateToSvDisabledAdditionalInfoScreen()),
  navigateToSvWorkerCheckIncomeThreshold: () =>
    dispatch(navigateToSvWorkerCheckIncomeThresholdScreen()),
  navigateToSvSickCheckIncomeThreshold: () =>
    dispatch(navigateToSvSickCheckIncomeThresholdScreen()),
  navigateToSvKoSelectBeneficiaryCategory: () =>
    dispatch(navigateToSvKoSelectBeneficiaryCategoryScreen())
});
const mapStateToProps = (state: GlobalState) => ({
  selectedBeneficiaryCategory: selectedBeneficiaryCategorySelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectBeneficiaryCategoryScreen);
