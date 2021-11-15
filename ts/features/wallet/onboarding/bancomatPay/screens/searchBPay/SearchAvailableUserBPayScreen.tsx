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
import { onboardingBPayFoundAccountsSelector } from "../../store/reducers/foundBpay";
import { useAvoidHardwareBackButton } from "../../../../../../utils/useAvoidHardwareBackButton";
import AddBPayScreen from "../add-account/AddBPayScreen";
import BPayKoNotFound from "./BPayKoNotFound";
import BPayKoTimeout from "./BPayKoTimeout";
import LoadBPaySearch from "./LoadBPaySearch";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen handle the errors and loading for the user BPay.
 * @constructor
 */
const SearchAvailableUserBPayScreen = (props: Props): React.ReactElement => {
  useAvoidHardwareBackButton();

  const bPayAccounts = props.bPayAccounts;
  const noBPayFound = isReady(bPayAccounts) && bPayAccounts.value.length === 0;

  if (noBPayFound) {
    // The user doesn't have a BPay account
    return <BPayKoNotFound contextualHelp={emptyContextualHelp} />;
  }

  if (isError(bPayAccounts) && isTimeoutError(bPayAccounts.error)) {
    return <BPayKoTimeout contextualHelp={emptyContextualHelp} />;
  }
  if (isLoading(bPayAccounts) || isError(bPayAccounts)) {
    return <LoadBPaySearch />;
  }
  // success! The user can now optionally add found BPay accounts to the wallet
  return <AddBPayScreen contextualHelp={emptyContextualHelp} />;
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  bPayAccounts: onboardingBPayFoundAccountsSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchAvailableUserBPayScreen);
