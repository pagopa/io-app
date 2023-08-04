import * as React from "react";
import { connect } from "react-redux";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { GlobalState } from "../../../../store/reducers/types";
import { BancomatPaymentMethod } from "../../../../types/pagopa";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import BancomatCard from "../component/bancomatCard/BancomatCard";

export type BancomatDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  bancomat: BancomatPaymentMethod;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  IOStackNavigationRouteProps<WalletParamsList, "WALLET_BANCOMAT_DETAIL">;

const bancomatScreenContent = (bancomat: BancomatPaymentMethod) => (
  <>
    <VSpacer size={8} />
    <ItemSeparatorComponent noPadded={true} />
    <VSpacer size={16} />
    <PaymentMethodFeatures paymentMethod={bancomat} />
  </>
);

/**
 * Detail screen for a bancomat
 * @constructor
 */
const BancomatDetailScreen: React.FunctionComponent<Props> = props => {
  const bancomat: BancomatPaymentMethod = props.route.params.bancomat;

  return (
    <BasePaymentMethodScreen
      paymentMethod={bancomat}
      card={<BancomatCard enhancedBancomat={bancomat} />}
      content={bancomatScreenContent(bancomat)}
    />
  );
};
const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps)(BancomatDetailScreen);
