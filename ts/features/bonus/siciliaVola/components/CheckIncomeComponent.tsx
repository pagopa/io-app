import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView } from "react-native";
import { View } from "native-base";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import { GlobalState } from "../../../../store/reducers/types";
import {
  svGenerateVoucherCancel,
  svGenerateVoucherUnderThresholdIncome
} from "../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { navigateToSvKoCheckIncomeThresholdScreen } from "../navigation/actions";
import I18n from "../../../../i18n";
import {
  RadioButtonList,
  RadioItem
} from "../../../../components/core/selection/RadioButtonList";
import { formatNumberAmount } from "../../../../utils/stringBuilder";

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

  const handleContinue = () => {
    if (incomeUnderThreshold === undefined) {
      return;
    }
    props.underThresholdIncome(incomeUnderThreshold);
    (incomeUnderThreshold
      ? props.onContinuePress
      : props.navigateToSvKoCheckIncomeThreshold)();
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
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("bonus.sv.voucherGeneration.checkIncome.title")}</H1>
          <View spacer={true} />
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
  navigateToSvKoCheckIncomeThreshold: () =>
    dispatch(navigateToSvKoCheckIncomeThresholdScreen()),
  underThresholdIncome: (isUnderThresholdIncome: boolean) =>
    dispatch(svGenerateVoucherUnderThresholdIncome(isUnderThresholdIncome))
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckIncomeComponent);
