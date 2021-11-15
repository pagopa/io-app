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
import { isTimeoutError } from "../../../../../../utils/errors";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { useAvoidHardwareBackButton } from "../../../../../../utils/useAvoidHardwareBackButton";
import BancomatKoNotFound from "./BancomatKoNotFound";
import BancomatKoSingleBankNotFound from "./BancomatKoSingleBankNotFound";
import BancomatKoTimeout from "./BancomatKoTimeout";
import LoadBancomatSearch from "./LoadBancomatSearch";
import BancomatKoServicesError from "./BancomatKoServicesError";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const bancomatServiceSuccessCode = 0;
const bancomatServiceCustomerNotFound = 21;
const bancomatServiceCardNotFound = 23;

const servicesSuccessCodes = [
  bancomatServiceSuccessCode,
  bancomatServiceCardNotFound,
  bancomatServiceCustomerNotFound
];

/**
 * This screen handle the errors and loading for the user bancomat.
 * @constructor
 */
const SearchAvailableUserBancomatScreen: React.FunctionComponent<Props> =
  props => {
    useAvoidHardwareBackButton();

    const pans = props.pans;
    const noBancomatFound = isReady(pans) && pans.value.cards.length === 0;

    // The user choose a specific bank to search and no results are found
    if (props.abiSelected && noBancomatFound) {
      return (
        <BancomatKoSingleBankNotFound contextualHelp={emptyContextualHelp} />
      );
    }
    if (noBancomatFound) {
      // check if all services respond without error (success or not found)
      if (
        isReady(pans) &&
        pans.value.messages.every(
          m => m.code !== undefined && servicesSuccessCodes.includes(m.code)
        )
      ) {
        // The user doesn't have a bancomat
        return <BancomatKoNotFound contextualHelp={emptyContextualHelp} />;
      }
      // One of the ca returned with error, the user could have a bancomat
      // and he should try to search for a single bank
      return <BancomatKoServicesError contextualHelp={emptyContextualHelp} />;
    }
    if (isError(pans) && isTimeoutError(pans.error)) {
      return <BancomatKoTimeout contextualHelp={emptyContextualHelp} />;
    }
    if (isLoading(pans) || isError(pans)) {
      return <LoadBancomatSearch />;
    }
    // success! The user can now optionally add found bancomat to the wallet
    return <AddBancomatScreen contextualHelp={emptyContextualHelp} />;
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
