import * as React from "react";
import { constNull } from "fp-ts/lib/function";
import { connect } from "react-redux";
import FooterWithButtons from "../ui/FooterWithButtons";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// this component shows two CTA to enable or disable services
const ServicesEnablingFooter = (props: Props): React.ReactElement => (
  <FooterWithButtons
    type={"TwoButtonsInlineHalf"}
    leftButton={{
      title: I18n.t("services.disableAll"),
      onPress: props.enableAll,
      bordered: true,
      light: true
    }}
    rightButton={{
      title: I18n.t("services.enableAll"),
      onPress: props.disableAll,
      bordered: true,
      light: true
    }}
  />
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO Add the handlers when available
  enableAll: constNull,
  disableAll: constNull
});

export default connect(mapStateToProps, mapDispatchToProps)(ServicesHomeButton);
