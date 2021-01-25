import { Button, View } from "native-base";
import * as React from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";
import { NavigationActions, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { IOColors } from "../../../../components/core/variables/IOColors";
import DarkLayout from "../../../../components/screens/DarkLayout";
import { GlobalState } from "../../../../store/reducers/types";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useRemovePaymentMethodBottomSheet } from "../../component/RemovePaymentMethod";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import PaymentMethodCapabilities from "../../component/PaymentMethodCapabilities";
import { Label } from "../../../../components/core/typography/Label";
import { deleteWalletRequest } from "../../../../store/actions/wallet/wallets";
import { showToast } from "../../../../utils/showToast";
import defaultCardIcon from "../../../../../img/wallet/cards-icons/unknown.png";
import CobadgeCard from "../component/CobadgeCard";
import reactotron from "reactotron-react-native";

type NavigationParams = Readonly<{
  cobadge: CreditCardPaymentMethod;
  brandLogo: ImageSourcePropType;
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
 * Detail screen for a cobadge card
 * @constructor
 */
const CobadgeDetailScreen: React.FunctionComponent<Props> = props => {
  const cobadge: CreditCardPaymentMethod = props.navigation.getParam("cobadge");
  const brandLogo: ImageSourcePropType = props.navigation.getParam("brandLogo");

  const { present } = useRemovePaymentMethodBottomSheet({
    icon: defaultCardIcon,
    caption: I18n.t("wallet.methods.bancomatPay.name")
  });

  reactotron.log(brandLogo);
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
        <CobadgeCard
          expireMonth={cobadge.info.expireMonth}
          expireYear={cobadge.info.expireYear}
          caption={cobadge.caption}
          abiLogo={cobadge.abiInfo?.logoUrl}
          brandLogo={brandLogo}
        />
      </View>
      <View spacer={true} extralarge={true} />
      <View style={IOStyles.horizontalContentPadding}>
        <PaymentMethodCapabilities paymentMethod={cobadge} />
        <View spacer={true} />
        <View spacer={true} large={true} />
        <UnsubscribeButton
          onPress={() => present(() => props.deleteWallet(cobadge.idWallet))}
        />
      </View>
      <View spacer={true} extralarge={true} />
    </DarkLayout>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  deleteWallet: (walletId: number) =>
    dispatch(
      deleteWalletRequest({
        walletId,
        onSuccess: _ => {
          showToast(I18n.t("wallet.delete.bPay.successful"), "success");
          dispatch(NavigationActions.back());
        },
        onFailure: _ => {
          showToast(I18n.t("wallet.delete.bPay.failed"), "danger");
        }
      })
    )
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CobadgeDetailScreen);
