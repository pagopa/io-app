import { Button, View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { RawSatispayPaymentMethod } from "../../../../../../types/pagopa";
import { addSatispayToWallet } from "../../store/actions";
import { isReady } from "../../../../../bonus/bpd/model/RemoteValue";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen handles the different search state (loading, ko, error, success)
 * @constructor
 */
const SearchSatispayManagerScreen: React.FunctionComponent<Props> = props => (
  <View>
    <View spacer={true} extralarge={true} />
    <Button
      onPress={() =>
        isReady(props.satispay) && props.addSatispay(props.satispay.value)
      }
    ></Button>
  </View>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addSatispay: (w: RawSatispayPaymentMethod) =>
    dispatch(addSatispayToWallet.request(w))
});

const mapStateToProps = (state: GlobalState) => ({
  satispay: state.wallet.onboarding.satispay.foundSatispay
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchSatispayManagerScreen);
