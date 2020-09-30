import { Button } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView, View } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { FooterTwoButtons } from "../../../bonusVacanze/components/markdown/FooterTwoButtons";
import { navigateToBpdIbanKOCannotVerify } from "../../navigation/action/iban";
import { H1 } from "../../../../../components/core/typography/H1";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen allows the user to add / modify an iban to be used to receive the refund provided by bpd
 * @constructor
 */
const IbanInsertionScreen: React.FunctionComponent<Props> = props => {
  useEffect(() => {
    console.log("mount!");
  }, []);
  return (
    <BaseScreenComponent goBack={true} headerTitle={"Insert Iban"}>
      <NavigationEvents onDidFocus={() => console.log("focus iban insert")} />
      <SafeAreaView style={IOStyles.flex}>
        <View style={IOStyles.flex}>
          <H1>Insert Iban</H1>
        </View>
        <FooterTwoButtons
          onRight={props.cannotVerify}
          onCancel={props.cancel}
          title={I18n.t("global.buttons.continue")}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => {},
  cannotVerify: () => dispatch(navigateToBpdIbanKOCannotVerify())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IbanInsertionScreen);
