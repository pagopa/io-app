import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { PrivativeQuery, searchUserPrivative } from "../../store/actions";
import { onboardingSearchedPrivativeQuery } from "../../store/reducers/searchedPrivative";
import AddPrivativeCardScreen from "../add/AddPrivativeCardScreen";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen orchestrates (loading, kos, success) the search of a privative card
 * @param props
 * @constructor
 */
const SearchPrivativeCardScreen = (props: Props): React.ReactElement => {
  useEffect(() => {
    if (props.privativeQuery) {
      props.search(props.privativeQuery);
    }
  }, []);
  return <AddPrivativeCardScreen />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  search: (pr: PrivativeQuery) => dispatch(searchUserPrivative.request(pr))
});

const mapStateToProps = (state: GlobalState) => ({
  privativeQuery: onboardingSearchedPrivativeQuery(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPrivativeCardScreen);
