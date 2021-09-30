import * as t from "io-ts";
import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import {
  ExecutionStatusEnum,
  SearchRequestMetadata
} from "../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { isTimeoutError } from "../../../../../../utils/errors";
import { useAvoidHardwareBackButton } from "../../../../../../utils/useAvoidHardwareBackButton";
import { isError, isReady } from "../../../../../bonus/bpd/model/RemoteValue";
import { searchUserCoBadge } from "../../store/actions";
import { onboardingCoBadgeAbiSelectedSelector } from "../../store/reducers/abiSelected";
import { onboardingCoBadgeFoundSelector } from "../../store/reducers/foundCoBadge";
import AddCoBadgeScreen from "../add-account/AddCoBadgeScreen";
import CoBadgeKoNotFound from "./ko/CoBadgeKoNotFound";
import CoBadgeKoServiceError from "./ko/CoBadgeKoServiceError";
import CoBadgeKoSingleBankNotFound from "./ko/CoBadgeKoSingleBankNotFound";
import CoBadgeKoTimeout from "./ko/CoBadgeKoTimeout";
import LoadCoBadgeSearch from "./LoadCoBadgeSearch";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

export const CoBadgePayloadR = t.interface({
  paymentInstruments: t.readonlyArray(
    PaymentInstrument,
    "array of PaymentInstrument"
  ),
  searchRequestMetadata: t.readonlyArray(
    SearchRequestMetadata,
    "array of SearchRequestMetadata"
  )
});

const CoBadgePayloadP = t.partial({
  searchRequestId: t.string
});

export const CoBadgePayload = t.intersection(
  [CoBadgePayloadR, CoBadgePayloadP],
  "CoBadgePayload"
);

export type CoBadgePayload = t.TypeOf<typeof CoBadgePayload>;

const decodePayload = (cobadge: CobadgeResponse) =>
  CoBadgePayload.decode(cobadge.payload);

const CobadgePayloadRight = (p: {
  payload: CoBadgePayload;
  props: Props;
}): React.ReactElement => {
  const { props, payload } = p;
  const anyPendingRequest = payload.searchRequestMetadata.some(
    m => m.executionStatus === ExecutionStatusEnum.PENDING
  );

  const anyServiceError = payload.searchRequestMetadata.some(
    m => m.executionStatus === ExecutionStatusEnum.KO
  );

  // not all the services replied with success
  if (anyServiceError) {
    return <CoBadgeKoServiceError contextualHelp={emptyContextualHelp} />;
  }

  // with a pending request we show the timeout screen and the user will retry with the response token
  if (anyPendingRequest) {
    return <CoBadgeKoTimeout contextualHelp={emptyContextualHelp} />;
  }

  const noCoBadgeFound = payload.paymentInstruments.length === 0;
  if (noCoBadgeFound) {
    // No results with a single Abi
    return props.abiSelected !== undefined ? (
      <CoBadgeKoSingleBankNotFound contextualHelp={emptyContextualHelp} />
    ) : (
      // No results with global research
      <CoBadgeKoNotFound contextualHelp={emptyContextualHelp} />
    );
  }
  // success! payload.paymentInstruments.length > 0, the user can now choose to add to the wallet
  return <AddCoBadgeScreen contextualHelp={emptyContextualHelp} />;
};

/**
 * This screen handle the errors and loading for the co-badge.
 * @constructor
 */
const SearchAvailableCoBadgeScreen = (
  props: Props
): React.ReactElement | null => {
  const { search, abiSelected } = props;
  useEffect(() => {
    search(abiSelected);
  }, [search, abiSelected]);

  useAvoidHardwareBackButton();

  const coBadgeFound = props.coBadgeFound;

  if (isReady(coBadgeFound)) {
    const payload = decodePayload(coBadgeFound.value);
    return payload.fold(
      _ => <CoBadgeKoTimeout contextualHelp={emptyContextualHelp} />,
      val => <CobadgePayloadRight props={props} payload={val} />
    );
  }

  if (isError(coBadgeFound) && isTimeoutError(coBadgeFound.error)) {
    return <CoBadgeKoTimeout contextualHelp={emptyContextualHelp} />;
  }
  return <LoadCoBadgeSearch testID={"LoadCoBadgeSearch"} />;
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
