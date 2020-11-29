import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Satispay } from "../../../../../../../definitions/pagopa/walletv2/Satispay";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import {
  addSatispayToWallet,
  walletAddSatispayCancel
} from "../../store/actions";
import { onboardingSatispayFoundSelector } from "../../store/reducers/foundSatispay";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * The user can choose to add the found Satispay account to the wallet
 * @constructor
 */
const AddSatispayScreen = (props: Props) => (
  <SafeAreaView style={IOStyles.flex}>
    <View style={IOStyles.flex}>
      <H1>Satispay Account found</H1>
    </View>
    <FooterWithButtons
      type={"TwoButtonsInlineThird"}
      leftButton={cancelButtonProps(props.cancel)}
      rightButton={confirmButtonProps(
        () => props.satispay && props.confirm(props.satispay)
      )}
    />
  </SafeAreaView>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddSatispayCancel()),
  confirm: (satispay: Satispay) =>
    dispatch(addSatispayToWallet.request(satispay))
});

const mapStateToProps = (state: GlobalState) => ({
  satispay: onboardingSatispayFoundSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(AddSatispayScreen);
