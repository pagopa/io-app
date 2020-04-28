import * as React from "react";
import { connect } from "react-redux";
import { getTabBarVisibility } from "../../navigation/MainNavigator";
import { GlobalState } from "../../store/reducers/types";
import FooterWithButtons, { FooterWithButtonsPorps } from "./FooterWithButtons";

type OwnProps = Readonly<{
  footerProps: FooterWithButtonsPorps;
}>;

type Props = ReturnType<typeof mapStateToProps> & OwnProps;

const FooterButtonsWithSafeAreaAsHOC = (props: Props) => {
  return (
    <FooterWithButtons
      {...props.footerProps}
      withSafeArea={props.shouldIncludeSafeArea}
    />
  );
};

const mapStateToProps = (state: GlobalState) => {
  return {
    shouldIncludeSafeArea: getTabBarVisibility(state.nav)
  };
};

export default connect(mapStateToProps)(FooterButtonsWithSafeAreaAsHOC);
