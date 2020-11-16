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
import { EnhancedBancomat } from "../../../../store/reducers/wallet/wallets";
import { showToast } from "../../../../utils/showToast";
import { useRemovePaymentMethodBottomSheet } from "../../component/RemovePaymentMethod";
import BancomatCard from "../component/bancomatCard/BancomatCard";
import pagoBancomatImage from "../../../../../img/wallet/cards-icons/pagobancomat.png";
import BancomatInformation from "./BancomatInformation";

type NavigationParams = Readonly<{
  bancomat: EnhancedBancomat;
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
 * Detail screen for a bancomat
 * @constructor
 */
const BancomatDetailScreen: React.FunctionComponent<Props> = props => {
  const bancomat = props.navigation.getParam("bancomat");
  const { present } = useRemovePaymentMethodBottomSheet({
    icon: pagoBancomatImage,
    caption: bancomat.abiInfo?.name ?? I18n.t("wallet.methods.bancomat.name")
  });
  return (
    <DarkLayout
      bounces={false}
      title={I18n.t("wallet.methods.card.shortName")}
      faqCategories={["wallet_methods"]}
      allowGoBack={true}
      topContent={<View style={styles.headerSpacer} />}
      gradientHeader={true}
      hideHeader={true}
      footerContent={
        <UnsubscribeButton
          onPress={() => present(() => props.deleteWallet(bancomat.idWallet))}
        />
      }
    >
      <View style={styles.cardContainer}>
        <BancomatCard bancomat={bancomat} />
      </View>
      <View spacer={true} extralarge={true} />
      <View spacer={true} />
      <View style={IOStyles.horizontalContentPadding}>
        <BancomatInformation />
      </View>
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
          showToast(I18n.t("wallet.delete.successful"), "success");
          dispatch(NavigationActions.back());
        },
        onFailure: _ => {
          showToast(I18n.t("wallet.delete.failed"), "danger");
        }
      })
    )
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatDetailScreen);
