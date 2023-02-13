import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useRef, useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  RadioButtonList,
  RadioItem
} from "../../../../../components/core/selection/RadioButtonList";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import SV_ROUTES from "../../navigation/routes";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherSelectCategory
} from "../../store/actions/voucherGeneration";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import { SvBeneficiaryCategory } from "../../types/SvVoucherRequest";

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

  const navigation = useNavigation();

  const routeNextScreen = () => {
    switch (categoryBeneficiary) {
      case "student":
        props.selectCategory(categoryBeneficiary);
        navigation.navigate(
          SV_ROUTES.VOUCHER_GENERATION.STUDENT_SELECT_DESTINATION
        );
        return;
      case "disabled":
        props.selectCategory(categoryBeneficiary);
        navigation.navigate(
          SV_ROUTES.VOUCHER_GENERATION.DISABLED_ADDITIONAL_INFO
        );
        return;
      case "worker":
        props.selectCategory(categoryBeneficiary);
        navigation.navigate(
          SV_ROUTES.VOUCHER_GENERATION.WORKER_CHECK_INCOME_THRESHOLD
        );
        return;
      case "sick":
        props.selectCategory(categoryBeneficiary);
        navigation.navigate(
          SV_ROUTES.VOUCHER_GENERATION.SICK_CHECK_INCOME_THRESHOLD
        );
        return;
      case "other":
        navigation.navigate(
          SV_ROUTES.VOUCHER_GENERATION.KO_SELECT_BENEFICIARY_CATEGORY
        );
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
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>
            {I18n.t(
              "bonus.sv.voucherGeneration.selectBeneficiaryCategory.title"
            )}
          </H1>

          <VSpacer size={16} />
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
    dispatch(svGenerateVoucherSelectCategory(category))
});
const mapStateToProps = (state: GlobalState) => ({
  selectedBeneficiaryCategory: selectedBeneficiaryCategorySelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectBeneficiaryCategoryScreen);
