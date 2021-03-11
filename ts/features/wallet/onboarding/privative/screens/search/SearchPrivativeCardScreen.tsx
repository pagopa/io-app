import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { searchUserPrivative } from "../../store/actions";
import {
  SearchedPrivativeData,
  onboardingSearchedPrivativeSelector
} from "../../store/reducers/searchedPrivative";
import {
  onboardingPrivativeFoundIsError,
  onboardingPrivativeFoundSelector
} from "../../store/reducers/foundPrivative";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen orchestrates (loading, kos, success) the search of a privative card
 * @param props
 * @constructor
 */
const SearchPrivativeCardScreen = (_: Props): React.ReactElement => <View />;

const mapDispatchToProps = (dispatch: Dispatch) => ({
  search: (searchedPrivativeData: Required<SearchedPrivativeData>) =>
    dispatch(searchUserPrivative.request(searchedPrivativeData))
});

const mapStateToProps = (state: GlobalState) => ({
  searchedPrivative: onboardingSearchedPrivativeSelector(state),
  foundPrivative: onboardingPrivativeFoundSelector(state),
  foundError: onboardingPrivativeFoundIsError(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPrivativeCardScreen);
