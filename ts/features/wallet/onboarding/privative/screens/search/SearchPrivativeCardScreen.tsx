import * as React from "react";
import { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ExecutionStatusEnum } from "../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { isTimeoutError } from "../../../../../../utils/errors";
import { isError, isReady } from "../../../../../bonus/bpd/model/RemoteValue";
import {
  PrivativeResponse,
  searchUserPrivative,
  walletAddPrivativeCancel,
  walletAddPrivativeFailure
} from "../../store/actions";
import { onboardingPrivativeFoundSelector } from "../../store/reducers/foundPrivative";
import {
  onboardingSearchedPrivativeQuerySelector,
  SearchedPrivativeData
} from "../../store/reducers/searchedPrivative";
import AddPrivativeCardScreen from "../add/AddPrivativeCardScreen";
import PrivativeKoNotFound from "./ko/PrivativeKoNotFound";
import PrivativeKoServiceError from "./ko/PrivativeKoServiceError";
import PrivativeKoTimeout from "./ko/PrivativeKoTimeout";
import LoadPrivativeSearch from "./LoadPrivativeSearch";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const PrivativeReady = (p: {
  privative: PrivativeResponse;
}): React.ReactElement => {
  const privative = p.privative;

  const anyPendingRequest = privative.searchRequestMetadata.some(
    m => m.executionStatus === ExecutionStatusEnum.PENDING
  );

  const anyServiceError = privative.searchRequestMetadata.some(
    m => m.executionStatus === ExecutionStatusEnum.KO
  );

  // with a pending request or if not all the services replied with success we show the timeout screen and the user
  // will retry
  if (anyPendingRequest) {
    return <PrivativeKoTimeout contextualHelp={emptyContextualHelp} />;
  }

  // if not all the services replied with success we show the specific error
  if (anyServiceError) {
    return <PrivativeKoServiceError contextualHelp={emptyContextualHelp} />;
  }

  const noPrivativeFound = privative.paymentInstrument === null;
  if (noPrivativeFound) {
    return <PrivativeKoNotFound contextualHelp={emptyContextualHelp} />;
  }
  // success! payload.paymentInstruments.length > 0, the user can now choose to add to the wallet
  return <AddPrivativeCardScreen contextualHelp={emptyContextualHelp} />;
};
/**
 * This screen orchestrates (loading, kos, success) the search of a privative card
 * @param props
 * @constructor
 */
const SearchPrivativeCardScreen = (props: Props): React.ReactElement => {
  const { privativeSelected, search, failure } = props;
  const firstRendering = useRef(true);
  useEffect(() => {
    // Is not expected that the user can arrive in this screen without the issuerId and the cardNumber.
    // If this happens, an event will be sent to mixpanel and the failure action will be dispatched.
    if (firstRendering.current) {
      if (privativeSelected === undefined) {
        failure("privativeSelected is undefined in SearchPrivativeCardScreen");
      } else {
        search(privativeSelected);
      }
      // eslint-disable-next-line functional/immutable-data
      firstRendering.current = false;
    }
  }, [privativeSelected, search, failure]);

  const privativeFound = props.privativeFound;
  if (isReady(privativeFound)) {
    return <PrivativeReady privative={privativeFound.value} />;
  }

  if (isError(privativeFound) && isTimeoutError(privativeFound.error)) {
    return <PrivativeKoTimeout contextualHelp={emptyContextualHelp} />;
  }

  return <LoadPrivativeSearch testID={"LoadPrivativeSearch"} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  failure: (reason: string) => dispatch(walletAddPrivativeFailure(reason)),
  cancel: () => dispatch(walletAddPrivativeCancel()),
  search: (searchedPrivativeData: Required<SearchedPrivativeData>) =>
    dispatch(searchUserPrivative.request(searchedPrivativeData))
});

const mapStateToProps = (state: GlobalState) => ({
  privativeSelected: onboardingSearchedPrivativeQuerySelector(state),
  privativeFound: onboardingPrivativeFoundSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPrivativeCardScreen);
