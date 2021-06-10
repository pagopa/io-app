import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { H1 } from "../../../../../components/core/typography/H1";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { useRef } from "react";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { NavigationEvents } from "react-navigation";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { SafeAreaView } from "react-native";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel
} from "../../store/actions/voucherGeneration";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const CheckStatusRouterScreen = (props: Props): React.ReactElement => {
  const elementRef = useRef(null);
  const backButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.back,
    title: "Back"
  };
  const cancelButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.cancel,
    title: "Cancel"
  };
  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <NavigationEvents onDidFocus={() => setAccessibilityFocus(elementRef)} />
      <SafeAreaView
        style={IOStyles.flex}
        testID={"BaseEuCovidCertificateLayout"}
        ref={elementRef}
      >
        <H1>CheckStatusRouterScreen</H1>
      </SafeAreaView>
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={backButtonProps}
        rightButton={cancelButtonProps}
      />
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(svGenerateVoucherBack()),
  cancel: () => dispatch(svGenerateVoucherCancel())
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckStatusRouterScreen);
