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
  FlightsDate,
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherSelectFlightsDate
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { navigateToSvSummaryScreen } from "../../navigation/actions";
import I18n from "../../../../../i18n";
import DateTimePicker from "../../../../../components/ui/DateTimePicker";
import {
  RadioButtonList,
  RadioItem
} from "../../../../../components/core/selection/RadioButtonList";
import { H5 } from "../../../../../components/core/typography/H5";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const getShowReturnDateItems = (): ReadonlyArray<RadioItem<boolean>> => [
  {
    id: false,
    body: I18n.t(
      "bonus.sv.voucherGeneration.selectFlightsDate.flights_choice.departure"
    )
  },
  {
    id: true,
    body: I18n.t(
      "bonus.sv.voucherGeneration.selectFlightsDate.flights_choice.return"
    )
  }
];

const SelectFlightsDateScreen = (props: Props): React.ReactElement => {
  const elementRef = useRef(null);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    undefined
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  const [showReturn, setShowReturn] = useState<boolean | undefined>(false);

  const handleDisableContinue = (): boolean => {
    if (showReturn === true) {
      return departureDate === undefined || returnDate === undefined;
    }
    return departureDate === undefined;
  };

  const handleOnPressContinue = () => {
    if (departureDate) {
      props.selectFlightsDate({
        departureDate,
        returnDate
      });
    }
    props.navigateToSummaryScreen();
  };

  const cancelButtonProps = {
    bordered: true,
    onPress: props.back,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    bordered: false,
    onPress: handleOnPressContinue,
    title: I18n.t("global.buttons.continue"),
    disabled: handleDisableContinue()
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"SelectFlightsDateScreen"}
        ref={elementRef}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>
            {I18n.t("bonus.sv.voucherGeneration.selectFlightsDate.title")}
          </H1>
          <View spacer={true} />
          <H5 color={"bluegrey"} weight={"Regular"}>
            {I18n.t("bonus.sv.voucherGeneration.selectFlightsDate.subtitle")}
          </H5>
          <View spacer={true} />
          <RadioButtonList<boolean>
            key="flights"
            items={getShowReturnDateItems()}
            selectedItem={showReturn}
            onPress={setShowReturn}
          />

          <DateTimePicker
            label={I18n.t(
              "bonus.sv.voucherGeneration.selectFlightsDate.labels.departure"
            )}
            date={departureDate}
            onConfirm={setDepartureDate}
          />
          <View spacer={true} />

          {showReturn && (
            <DateTimePicker
              label={I18n.t(
                "bonus.sv.voucherGeneration.selectFlightsDate.labels.return"
              )}
              date={returnDate}
              onConfirm={setReturnDate}
              minimumDate={departureDate}
              blocked={departureDate === undefined}
            />
          )}
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
  back: () => dispatch(svGenerateVoucherBack()),
  cancel: () => dispatch(svGenerateVoucherCancel()),
  selectFlightsDate: (flightsDate: FlightsDate) =>
    dispatch(svGenerateVoucherSelectFlightsDate(flightsDate)),
  navigateToSummaryScreen: () => dispatch(navigateToSvSummaryScreen())
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectFlightsDateScreen);
