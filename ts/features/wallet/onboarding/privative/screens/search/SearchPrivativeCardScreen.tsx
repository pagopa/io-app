import * as t from "io-ts";
import { useEffect } from "react";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {fromNullable} from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../store/reducers/types";
import { searchUserPrivative } from "../../store/actions";
import {
  SearchedPrivativeData,
  onboardingSearchedPrivativeSelector
} from "../../store/reducers/searchedPrivative";
import { onboardingPrivativeFoundSelector } from "../../store/reducers/foundPrivative";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { SearchRequestMetadata } from "../../../../../../../definitions/pagopa/walletv2/SearchRequestMetadata";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";


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


const toPrivativeQuery = (
  searched: SearchedPrivativeData
): Option<PrivativeQuery> => {
  const { id, cardNumber } = searched;
  return id !== undefined && cardNumber !== undefined
    ? some({ id, cardNumber })
    : none;
};
/**
 * This screen orchestrates (loading, kos, success) the search of a privative card
 * @param props
 * @constructor
 */
const SearchPrivativeCardScreen = (props: Props): React.ReactElement => {
  useEffect(() => {
    const issuerId = fromNullable(props.privativeSelected.id);
    const cardNumber = fromNullable(props.privativeSelected.cardNumber);

    // Is not expected that the user can arrive in this screen without the issuerId and the cardNumber.
    // If this happens, an event will be send to mixpanel and the cancel action will be dispatched.
    // TODO: add an error action to the workunit


  }, []);

  return <View />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  search: (searchedPrivativeData: Required<SearchedPrivativeData>) =>
    dispatch(searchUserPrivative.request(searchedPrivativeData))
});

const mapStateToProps = (state: GlobalState) => ({
  privativeSelected: onboardingSearchedPrivativeSelector(state),
  foundPrivative: onboardingPrivativeFoundSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPrivativeCardScreen);
