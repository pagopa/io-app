import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  isError,
  isLoading,
  isReady
} from "../../../../../bonus/bpd/model/RemoteValue";
import { onboardingBancomatAbiSelectedSelector } from "../../store/reducers/abiSelected";
import { onboardingBancomatFoundPansSelector } from "../../store/reducers/pans";
import AddBancomatScreen from "../add-pans/AddBancomatScreen";
import BancomatKoNotFound from "./BancomatKoNotFound";
import BancomatKoServicesError from "./BancomatKoServicesError";
import BancomatKoSingleBankNotFound from "./BancomatKoSingleBankNotFound";
import BancomatKoTimeout from "./BancomatKoTimeout";
import LoadBancomatSearch from "./LoadBancomatSearch";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const bancomatServiceSuccessCode = 0;

/**
 * This screen handle the errors and loading for the user bancomat.
 * @constructor
 */
const SearchAvailableUserBancomatScreen: React.FunctionComponent<Props> = props => {
  const pans = props.pans;
  const noBancomatFound = isReady(pans) && pans.value.cards.length === 0;

  // The user choose a specific bank to search and no results are found
  if (props.abiSelected && noBancomatFound) {
    return <BancomatKoSingleBankNotFound />;
  }
  if (noBancomatFound) {
    const allServicesResponseSuccess =
      isReady(pans) &&
      pans.value.messages.every(m => m.code === bancomatServiceSuccessCode);
    if (allServicesResponseSuccess) {
      return <BancomatKoNotFound />;
    }
    return <BancomatKoServicesError />;
  }
  if (isError(pans) && pans.error.kind === "timeout") {
    return <BancomatKoTimeout />;
  }
  if (isLoading(pans) || isError(pans)) {
    return <LoadBancomatSearch />;
  }
  // success! The user can now optionally add found bancomat to the wallet
  return <AddBancomatScreen />;
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  pans: onboardingBancomatFoundPansSelector(state),
  abiSelected: onboardingBancomatAbiSelectedSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchAvailableUserBancomatScreen);
