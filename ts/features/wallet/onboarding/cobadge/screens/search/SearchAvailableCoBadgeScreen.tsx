import * as React from "react";
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
import { onboardingCoBadgeAbiSelectedSelector } from "../../store/reducers/abiSelected";
import { onboardingCoBadgeFoundSelector } from "../../store/reducers/foundCoBadge";
import AddCoBadgeScreen from "../add-account/AddCoBadgeScreen";
import CoBadgeKoNotFound from "./ko/CoBadgeKoNotFound";
import CoBadgeKoTimeout from "./ko/CoBadgeKoTimeout";
import LoadCoBadgeSearch from "./LoadCoBadgeSearch";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen handle the errors and loading for the co-badge.
 * @constructor
 */
const SearchAvailableCoBadgeScreen = (props: Props): React.ReactElement => {
  const coBadgeFound = props.coBadgeFound;
  const noCoBadgeFound =
    isReady(coBadgeFound) &&
    coBadgeFound.value.payload?.paymentInstruments?.length === 0;

  if (noCoBadgeFound) {
    // The user doesn't have a co-badge cards
    return <CoBadgeKoNotFound contextualHelp={emptyContextualHelp} />;
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

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  abiSelected: onboardingCoBadgeAbiSelectedSelector(state),
  coBadgeFound: onboardingCoBadgeFoundSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchAvailableCoBadgeScreen);
