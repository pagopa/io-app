import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { constNull } from "fp-ts/lib/function";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { GlobalState } from "../../../../store/reducers/types";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel
} from "../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import TosWebviewComponent from "../../../../components/TosWebviewComponent";
import { privacyUrl } from "../../../../config";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

// TODO change with the ufficial TOS page seehttps://pagopa.atlassian.net/browse/IASV-10
const tosUrl = privacyUrl;
const AcceptTosComponent = (props: Props): React.ReactElement => {
  const [showFooter, setShowfooter] = React.useState(false);
  const undoButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.back,
    title: I18n.t("global.buttons.cancel")
  };
  const requestBonusButtonProps = {
    primary: true,
    bordered: false,
    onPress: props.cancel,
    title: I18n.t("bonus.sv.voucherGeneration.acceptTos.buttons.requestBonus")
  };
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"AcceptTosComponent"}>
        <TosWebviewComponent
          handleError={constNull}
          handleLoadEnd={() => setShowfooter(true)}
          url={tosUrl}
          shouldFooterRender={false}
        />
        {showFooter && (
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={undoButtonProps}
            rightButton={requestBonusButtonProps}
          />
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(svGenerateVoucherBack()),
  cancel: () => dispatch(svGenerateVoucherCancel())
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AcceptTosComponent);
