import * as t from "io-ts";
import { useEffect } from "react";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { isNone, none, Option, some } from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  searchUserPrivative,
  walletAddPrivativeCancel
} from "../../store/actions";
import {
  SearchedPrivativeData,
  onboardingSearchedPrivativeSelector,
  PrivativeIssuerId
} from "../../store/reducers/searchedPrivative";
import { onboardingPrivativeFoundSelector } from "../../store/reducers/foundPrivative";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import {
  ExecutionStatusEnum,
  SearchRequestMetadata
} from "../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { showToast } from "../../../../../../utils/showToast";
import I18n from "../../../../../../i18n";
import { mixpanelTrack } from "../../../../../../mixpanel";
import { isError, isReady } from "../../../../../bonus/bpd/model/RemoteValue";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { isTimeoutError } from "../../../../../../utils/errors";
import AddPrivativeCardScreen from "../add/AddPrivativeCardScreen";
import LoadPrivativeSearch from "./LoadPrivativeSearch";
import PrivativeKoTimeout from "./ko/PrivativeKoTimeout";
import PrivativeKoNotFound from "./ko/PrivativeKoNotFound";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const PrivativePayload = t.type({
  paymentInstruments: t.readonlyArray(
    PaymentInstrument,
    "array of PaymentInstrument"
  ),
  searchRequestMetadata: t.readonlyArray(
    SearchRequestMetadata,
    "array of SearchRequestMetadata"
  )
});

type PrivativePayload = t.TypeOf<typeof PrivativePayload>;

const decodePayload = (privative: CobadgeResponse) =>
  PrivativePayload.decode(privative.payload);

type PrivativeQuery = {
  id: PrivativeIssuerId;
  cardNumber: string;
};

export const toPrivativeQuery = (
  searched: SearchedPrivativeData
): Option<PrivativeQuery> => {
  const { id, cardNumber } = searched;
  return id && cardNumber ? some({ id, cardNumber }) : none;
};

const PrivativePayloadRight = (p: {
  payload: PrivativePayload;
}): React.ReactElement => {
  const { payload } = p;

  const anyPendingRequest = payload.searchRequestMetadata.some(
    m => m.executionStatus === ExecutionStatusEnum.PENDING
  );

  const anyServiceError = payload.searchRequestMetadata.some(
    m => m.executionStatus === ExecutionStatusEnum.KO
  );

  // with a pending request or if not all the services replied with success we show the timeout screen and the user
  // will retry
  if (anyPendingRequest || anyServiceError) {
    return <PrivativeKoTimeout contextualHelp={emptyContextualHelp} />;
  }

  const noPrivativeFound = payload.paymentInstruments.length === 0;
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
  useEffect(() => {
    const privativeQueryParam = toPrivativeQuery(props.privativeSelected);
    // Is not expected that the user can arrive in this screen without the issuerId and the cardNumber.
    // If this happens, an event will be send to mixpanel and the cancel action will be dispatched.
    // TODO: add an error action to the workunit
    if (isNone(privativeQueryParam)) {
      showToast(I18n.t("global.genericError"), "danger");
      void mixpanelTrack("PRIVATIVE_NO_QUERY_PARAMS_ERROR");
      props.cancel();
    } else {
      props.search(privativeQueryParam.value);
    }
  }, []);

  const privativeFound = props.privativeFound;
  if (isReady(privativeFound)) {
    const payload = decodePayload(privativeFound.value);
    return payload.fold(
      _ => <PrivativeKoTimeout contextualHelp={emptyContextualHelp} />,
      val => <PrivativePayloadRight payload={val} />
    );
  }

  if (isError(privativeFound) && isTimeoutError(privativeFound.error)) {
    return <PrivativeKoTimeout contextualHelp={emptyContextualHelp} />;
  }

  return <LoadPrivativeSearch testID={"LoadPrivativeSearch"} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel()),
  search: (searchedPrivativeData: Required<SearchedPrivativeData>) =>
    dispatch(searchUserPrivative.request(searchedPrivativeData))
});

const mapStateToProps = (state: GlobalState) => ({
  privativeSelected: onboardingSearchedPrivativeSelector(state),
  privativeFound: onboardingPrivativeFoundSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPrivativeCardScreen);
