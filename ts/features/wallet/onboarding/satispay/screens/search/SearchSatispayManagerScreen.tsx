import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { RawSatispayPaymentMethod } from "../../../../../../types/pagopa";
import { isTimeoutError } from "../../../../../../utils/errors";
import { useAvoidHardwareBackButton } from "../../../../../../utils/useAvoidHardwareBackButton";
import {
  isError,
  isLoading,
  isReady
} from "../../../../../bonus/bpd/model/RemoteValue";
import { addSatispayToWallet } from "../../store/actions";
import AddSatispayScreen from "../add/AddSatispayScreen";
import LoadSatispaySearch from "./LoadSatispaySearch";
import SatispayKoNotFound from "./SatispayKoNotFound";
import SatispayKoTimeout from "./SatispayKoTimeout";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen handles the different search state (loading, ko, error, success)
 * @constructor
 */
const SearchSatispayManagerScreen: React.FunctionComponent<Props> = props => {
  useAvoidHardwareBackButton();

  const satispay = props.foundSatispay;

  if (isError(satispay) && isTimeoutError(satispay.error)) {
    return <SatispayKoTimeout />;
  }
  if (isError(satispay) || isLoading(satispay)) {
    return <LoadSatispaySearch />;
  }
  if (isReady(satispay)) {
    if (satispay.value === null) {
      return <SatispayKoNotFound />;
    }
    return <AddSatispayScreen />;
  }
  return null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addSatispay: (w: RawSatispayPaymentMethod) =>
    dispatch(addSatispayToWallet.request(w))
});

const mapStateToProps = (state: GlobalState) => ({
  foundSatispay: state.wallet.onboarding.satispay.foundSatispay
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchSatispayManagerScreen);
