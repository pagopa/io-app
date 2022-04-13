import { CompatNavigationProp } from "@react-navigation/compat";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { GlobalState } from "../../../../store/reducers/types";
import { BancomatPaymentMethod } from "../../../../types/pagopa";
import { showToast } from "../../../../utils/showToast";
import BasePaymentMethodScreen from "../../common/BasePaymentMethodScreen";
import PaymentMethodFeatures from "../../component/features/PaymentMethodFeatures";
import { navigateToOnboardingCoBadgeChooseTypeStartScreen } from "../../onboarding/cobadge/navigation/action";
import BancomatCard from "../component/bancomatCard/BancomatCard";
import BancomatInformation from "./BancomatInformation";

export type BancomatDetailScreenNavigationParams = Readonly<{
  // TODO: we should use only the id and retrieve it from the store, otherwise we lose all the updates
  bancomat: BancomatPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    navigation: CompatNavigationProp<
      IOStackNavigationProp<WalletParamsList, "WALLET_BANCOMAT_DETAIL">
    >;
  };

/**
 * Start the cobadge onboarding, if the abi is defined
 * @param props
 */
const startCoBadge = (props: Props) => {
  const bancomat = props.navigation.getParam("bancomat");
  if (bancomat.info.issuerAbiCode === undefined) {
    showToast(I18n.t("global.genericError"), "danger");
    // This should never happen. This condition is due to the weakness of the remote specifications
    void mixpanelTrack("BANCOMAT_DETAIL_NO_ABI_ERROR");
  } else {
    props.addCoBadge(bancomat.info.issuerAbiCode);
  }
};

const bancomatScreenContent = (
  props: Props,
  bancomat: BancomatPaymentMethod
) => (
  <>
    <View spacer={true} small={true} />
    <BancomatInformation onAddPaymentMethod={() => startCoBadge(props)} />
    <View spacer={true} />
    <ItemSeparatorComponent noPadded={true} />
    <View spacer={true} />
    <PaymentMethodFeatures paymentMethod={bancomat} />
  </>
);

/**
 * Detail screen for a bancomat
 * @constructor
 */
const BancomatDetailScreen: React.FunctionComponent<Props> = props => {
  const bancomat: BancomatPaymentMethod = props.navigation.getParam("bancomat");

  return (
    <BasePaymentMethodScreen
      paymentMethod={bancomat}
      card={<BancomatCard enhancedBancomat={bancomat} />}
      content={bancomatScreenContent(props, bancomat)}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  addCoBadge: (abi: string) =>
    navigateToOnboardingCoBadgeChooseTypeStartScreen({
      abi,
      legacyAddCreditCardBack: 1
    })
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatDetailScreen);
