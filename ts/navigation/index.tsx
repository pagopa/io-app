import { NavigationDispatch } from "react-navigation";
import { reduxifyNavigator } from "react-navigation-redux-helpers";
import { connect } from "react-redux";

import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import { NAVIGATION_MIDDLEWARE_LISTENERS_KEY } from "../utils/constants";
import AppNavigator from "./AppNavigator";

// Enhance AppNavigator using the reduxifyNavigator HOC.
const Navigation = reduxifyNavigator(
  AppNavigator,
  NAVIGATION_MIDDLEWARE_LISTENERS_KEY
);

const mapStateToProps = (state: GlobalState) => ({
  state: state.nav
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch: dispatch as NavigationDispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);
