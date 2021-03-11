import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { searchUserPrivative } from "../../store/actions";
import { SearchedPrivativeData } from "../../store/reducers/searchedPrivative";

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

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPrivativeCardScreen);
