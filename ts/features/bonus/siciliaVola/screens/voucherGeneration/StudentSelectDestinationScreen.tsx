import * as React from "react";
import { useRef, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { isSome } from "fp-ts/lib/Option";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherFailure,
  svGenerateVoucherSelectUniversity
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { University } from "../../types/SvVoucherRequest";
import { selectedBeneficiaryCategorySelector } from "../../store/reducers/voucherRequest";
import { navigateToSvSelectFlightsDateScreen } from "../../navigation/actions";
import I18n from "../../../../../i18n";
import { Picker } from "native-base";
import IconFont from "../../../../../components/ui/IconFont";
import variables from "../../../../../theme/variables";
import { IOColors } from "../../../../../components/core/variables/IOColors";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, borderColor: IOColors.bluegreyLight },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  icon: {
    height: 24,
    width: 24,
    marginBottom: 5
  }
});

const StudentSelectDestinationScreen = (
  props: Props
): React.ReactElement | null => {
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
    onPress: props.navigateToSelectFlightsDateScreen,
    title: "Continue"
  };

  if (
    isSome(props.selectedBeneficiaryCategory) &&
    props.selectedBeneficiaryCategory.value !== "student"
  ) {
    props.failure("The selected category is not Student");
    return null;
  }
  const [selectedValue, setSelectedValue] = useState();
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"StudentSelectDestinationScreen"}
        ref={elementRef}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>
            {I18n.t(
              "bonus.sv.voucherGeneration.student.selectDestination.title"
            )}
          </H1>
          <Picker
            /*style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}*/
            enabled={true}
            mode={"dropdown"}
            collapsable={true}
            selectedValue={selectedValue}
            onValueChange={(itemValue, _) => setSelectedValue(itemValue)}
            headerTitleStyle={{
              fontFamily: "Titillium Web",
              color: "black",
              textAlign: "auto",
              paddingLeft: 15
            }}
            headerBackButtonTextStyle={{
              fontFamily: "Titillium Web",
              color: "black",
              fontSize: 16,
              textAlign: "auto",
              lineHeight: undefined,
              paddingLeft: 0,
              fontWeight: "300"
            }}
            placeholder={"seleziona una scelta"}
            iosIcon={
              <IconFont
                size={variables.iconSize3}
                color={IOColors.blue}
                name={"io-calendario"}
                selectionColor={IOColors.blue}
                style={styles.icon}
              />
            }
            style={{
              flex: 1,
              justifyContent: "space-between",
              alignSelf: "auto"
            }}
          >
            <Picker.Item label="Office eg: VC, DSA" value="" color="#c1c1c1" />
            <Picker.Item label={"pippo"} value={"pippo"} />
            <Picker.Item label={"pluto"} value={"pluto"} />
          </Picker>
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
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason)),
  selectUniversity: (university: University) =>
    dispatch(svGenerateVoucherSelectUniversity(university)),
  navigateToSelectFlightsDateScreen: () =>
    dispatch(navigateToSvSelectFlightsDateScreen())
});
const mapStateToProps = (state: GlobalState) => ({
  selectedBeneficiaryCategory: selectedBeneficiaryCategorySelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StudentSelectDestinationScreen);
