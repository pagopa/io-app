import { Button, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationActions, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Label } from "../../../../components/core/typography/Label";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import DarkLayout from "../../../../components/screens/DarkLayout";
import I18n from "../../../../i18n";
import { deleteWalletRequest } from "../../../../store/actions/wallet/wallets";
import { GlobalState } from "../../../../store/reducers/types";
import {
  BPayPaymentMethod,
  SatispayPaymentMethod
} from "../../../../types/pagopa";
import { showToast } from "../../../../utils/showToast";
import PaymentMethodCapabilities from "../../component/PaymentMethodCapabilities";
import { useRemovePaymentMethodBottomSheet } from "../../component/RemovePaymentMethod";
import bPayImage from "../../../../../img/wallet/cards-icons/bPay.png";
// import SatispayCard from "../SatispayCard";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import BPayCard from "../component/BPayCard";
import reactotron from "reactotron-react-native";

type NavigationParams = Readonly<{
  bPay: BPayPaymentMethod;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

const styles = StyleSheet.create({
  cardContainer: {
    height: 235,
    width: "100%",
    position: "absolute",
    top: 16,
    zIndex: 7,
    elevation: 7,
    alignItems: "center"
  },
  headerSpacer: {
    height: 172
  },
  cancelButton: {
    borderColor: IOColors.red,
    width: "100%"
  }
});

const UnsubscribeButton = (props: { onPress?: () => void }) => (
  <Button bordered={true} style={styles.cancelButton} onPress={props.onPress}>
    <Label color={"red"}>{I18n.t("wallet.bancomat.details.removeCta")}</Label>
  </Button>
);

/**
 * Detail screen for a satispay
 * @constructor
 */
const BPayDetailScreen: React.FunctionComponent<Props> = props => {
  const bPay: BPayPaymentMethod = props.navigation.getParam("bPay");

  const { present } = useRemovePaymentMethodBottomSheet({
    icon: bPayImage,
    caption: I18n.t("wallet.methods.bancomatPay.name")
  });
  return (
    <DarkLayout
      bounces={false}
      contextualHelp={emptyContextualHelp}
      title={I18n.t("wallet.methods.bancomatPay.name")}
      faqCategories={["wallet_methods"]}
      allowGoBack={true}
      topContent={<View style={styles.headerSpacer} />}
      gradientHeader={true}
      hideHeader={true}
    >
      <View style={styles.cardContainer}>
        <BPayCard
          phone={bPay.info.numberObfuscated}
          bankName={bPay.info.bankName}
        />
      </View>
      <View spacer={true} extralarge={true} />
      <View style={IOStyles.horizontalContentPadding}>
        <PaymentMethodCapabilities paymentMethod={bPay} />
        <View spacer={true} />
        <View spacer={true} large={true} />
        <UnsubscribeButton
          onPress={() => present(() => props.deleteWallet(bPay.idWallet))}
        />
      </View>
      <View spacer={true} extralarge={true} />
    </DarkLayout>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // using the legacy action with callback instead of using the redux state to read the results
  // for time reasons...
  deleteWallet: (walletId: number) =>
    dispatch(
      deleteWalletRequest({
        walletId,
        onSuccess: _ => {
          showToast(I18n.t("wallet.delete.satispay.successful"), "success");
          dispatch(NavigationActions.back());
        },
        onFailure: _ => {
          showToast(I18n.t("wallet.delete.satispay.failed"), "danger");
        }
      })
    )
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BPayDetailScreen);
