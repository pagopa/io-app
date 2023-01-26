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
import { H5 } from "../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import DateTimePicker from "../../../../../components/ui/DateTimePicker";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import SV_ROUTES from "../../navigation/routes";
import {
  FlightsDate,
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherSelectFlightsDate
} from "../../store/actions/voucherGeneration";

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

  const navigation = useNavigation();

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
    navigation.navigate(SV_ROUTES.VOUCHER_GENERATION.SUMMARY);
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
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>
            {I18n.t("bonus.sv.voucherGeneration.selectFlightsDate.title")}
          </H1>
          <VSpacer size={16} />
          <H5 color={"bluegrey"} weight={"Regular"}>
            {I18n.t("bonus.sv.voucherGeneration.selectFlightsDate.subtitle")}
          </H5>
          <VSpacer size={16} />
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
          <VSpacer size={16} />

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
    dispatch(svGenerateVoucherSelectFlightsDate(flightsDate))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectFlightsDateScreen);
