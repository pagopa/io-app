import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { isTimeoutError } from "../../../../../../utils/errors";
import {
  isError,
  isLoading,
  isReady
} from "../../../../../bonus/bpd/model/RemoteValue";
import { searchUserCoBadge } from "../../store/actions";
import { onboardingCoBadgeAbiSelectedSelector } from "../../store/reducers/abiSelected";
import { onboardingCoBadgeFoundSelector } from "../../store/reducers/foundCoBadge";
import AddCoBadgeScreen from "../add-account/AddCoBadgeScreen";
import CoBadgeKoNotFound from "./ko/CoBadgeKoNotFound";
import CoBadgeKoSingleBankNotFound from "./ko/CoBadgeKoSingleBankNotFound";
import CoBadgeKoTimeout from "./ko/CoBadgeKoTimeout";
import LoadCoBadgeSearch from "./LoadCoBadgeSearch";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen handle the errors and loading for the co-badge.
 * @constructor
 */
const SearchAvailableCoBadgeScreen = (props: Props): React.ReactElement => {
  useEffect(() => {
    props.search(props.abiSelected);
  }, []);
  const coBadgeFound = props.coBadgeFound;
  const noCoBadgeFound =
    isReady(coBadgeFound) &&
    // if the payload is missing the optional fields, it is treated as an array with zero elements
    (coBadgeFound.value.payload?.paymentInstruments?.length ?? 0) === 0;

  console.log(noCoBadgeFound);

  if (noCoBadgeFound) {
    // The user doesn't have a co-badge cards
    return props.abiSelected !== undefined ? (
      <CoBadgeKoSingleBankNotFound contextualHelp={emptyContextualHelp} />
    ) : (
      <CoBadgeKoNotFound contextualHelp={emptyContextualHelp} />
    );
  }

  if (isError(coBadgeFound) && isTimeoutError(coBadgeFound.error)) {
    return <CoBadgeKoTimeout contextualHelp={emptyContextualHelp} />;
  }
  if (isLoading(coBadgeFound) || isError(coBadgeFound)) {
    return <LoadCoBadgeSearch />;
  }

  // TODO: add CoBadgeKoSingleBankNotFound and CoBadgeKoServicesError

  // success! The user can now optionally add found co-badge cards to the wallet
  return <AddCoBadgeScreen contextualHelp={emptyContextualHelp} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  search: (abi?: string) => dispatch(searchUserCoBadge.request(abi))
});

const mapStateToProps = (state: GlobalState) => ({
  abiSelected: onboardingCoBadgeAbiSelectedSelector(state),
  coBadgeFound: onboardingCoBadgeFoundSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchAvailableCoBadgeScreen);
