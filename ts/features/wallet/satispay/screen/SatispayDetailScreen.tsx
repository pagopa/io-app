import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationActions, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import DarkLayout from "../../../../components/screens/DarkLayout";
import I18n from "../../../../i18n";
import { deleteWalletRequest } from "../../../../store/actions/wallet/wallets";
import { GlobalState } from "../../../../store/reducers/types";
import { SatispayPaymentMethod } from "../../../../types/pagopa";
import { showToast } from "../../../../utils/showToast";
import PaymentMethodCapabilities from "../../component/PaymentMethodCapabilities";
import { useRemovePaymentMethodBottomSheet } from "../../component/RemovePaymentMethod";
import satispayImage from "../../../../../img/wallet/cards-icons/satispay.png";
import SatispayCard from "../SatispayCard";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import SatispayInformation from "./SatispayInformation";
import UnsubscribeButton from "../../component/UnsubscribeButton";

type NavigationParams = Readonly<{
  satispay: SatispayPaymentMethod;
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
});

/**
 * Detail screen for a satispay
 * @constructor
 */
const SatispayDetailScreen: React.FunctionComponent<Props> = props => {
  const satispay: SatispayPaymentMethod = props.navigation.getParam("satispay");

  const { present } = useRemovePaymentMethodBottomSheet({
    icon: satispayImage,
    caption: I18n.t("wallet.methods.satispay.name")
  });
  return (
    <DarkLayout
      bounces={false}
      contextualHelp={emptyContextualHelp}
      title={I18n.t("wallet.methods.card.shortName")}
      faqCategories={["wallet_methods"]}
      allowGoBack={true}
      topContent={<View style={styles.headerSpacer} />}
      gradientHeader={true}
      hideHeader={true}
    >
      <View style={styles.cardContainer}>
        <SatispayCard />
      </View>
      <View spacer={true} extralarge={true} />
      <View style={IOStyles.horizontalContentPadding}>
        <PaymentMethodCapabilities paymentMethod={satispay} />
        <View spacer={true} />
        <SatispayInformation />
        <View spacer={true} large={true} />
        <UnsubscribeButton
          onPress={() => present(() => props.deleteWallet(satispay.idWallet))}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SatispayDetailScreen);
