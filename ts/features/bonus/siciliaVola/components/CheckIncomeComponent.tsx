import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  RadioButtonList,
  RadioItem
} from "../../../../components/core/selection/RadioButtonList";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import SV_ROUTES from "../navigation/routes";
import {
  svGenerateVoucherCancel,
  svGenerateVoucherUnderThresholdIncome
} from "../store/actions/voucherGeneration";

type OwnProps = {
  onContinuePress: () => void;
};
type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const threshold = 25000;
const getCheckIncomeUnderThresholdItems = (): ReadonlyArray<
  RadioItem<boolean>
> => [
  {
    body: I18n.t("bonus.sv.voucherGeneration.checkIncome.threshold.under", {
      amount: formatNumberAmount(threshold, true)
    }),
    id: true
  },
  {
    body: I18n.t("bonus.sv.voucherGeneration.checkIncome.threshold.over", {
      amount: formatNumberAmount(threshold, true)
    }),
    id: false
  }
];

const CheckIncomeComponent = (props: Props): React.ReactElement => {
  const [incomeUnderThreshold, setIncomeUnderThreshold] = React.useState<
    boolean | undefined
  >();
  const navigation = useNavigation();

  const handleContinue = () => {
    if (incomeUnderThreshold === undefined) {
      return;
    }
    props.underThresholdIncome(incomeUnderThreshold);

    if (incomeUnderThreshold) {
      props.onContinuePress();
      return;
    }

    navigation.navigate(SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_INCOME_THRESHOLD);
  };

  const cancelButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.cancel,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    bordered: false,
    onPress: handleContinue,
    title: I18n.t("global.buttons.continue"),
    disabled: incomeUnderThreshold === undefined
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"CheckIncomeComponent"}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("bonus.sv.voucherGeneration.checkIncome.title")}</H1>
          <VSpacer size={16} />
          <RadioButtonList<boolean>
            key="check_income"
            items={getCheckIncomeUnderThresholdItems()}
            selectedItem={incomeUnderThreshold}
            onPress={setIncomeUnderThreshold}
          />
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(svGenerateVoucherCancel()),
  underThresholdIncome: (isUnderThresholdIncome: boolean) =>
    dispatch(svGenerateVoucherUnderThresholdIncome(isUnderThresholdIncome))
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckIncomeComponent);
