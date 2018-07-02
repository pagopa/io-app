import { NavigationState } from "react-navigation";
import { reduxifyNavigator } from "react-navigation-redux-helpers";
import { connect } from "react-redux";

import { GlobalState } from "../store/reducers/types";
import { NAVIGATION_MIDDLEWARE_LISTENERS_KEY } from "../utils/constants";
import AppNavigator from "./AppNavigator";

type ReduxMappedProps = {
  state: NavigationState;
};

// Enhance AppNavigator using the reduxifyNavigator HOC.
const Navigation = reduxifyNavigator(
  AppNavigator,
  NAVIGATION_MIDDLEWARE_LISTENERS_KEY
);

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  state: state.nav
});

export default connect(mapStateToProps)(Navigation);
