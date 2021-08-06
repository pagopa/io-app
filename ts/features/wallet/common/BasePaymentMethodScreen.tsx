import * as pot from "italia-ts-commons/lib/pot";
import { Button, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Label } from "../../../components/core/typography/Label";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import DarkLayout from "../../../components/screens/DarkLayout";
import I18n from "../../../i18n";
import { deleteWalletRequest } from "../../../store/actions/wallet/wallets";
import { GlobalState } from "../../../store/reducers/types";
import { getWalletsById } from "../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../types/pagopa";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { showToast } from "../../../utils/showToast";
import { useRemovePaymentMethodBottomSheet } from "../component/RemovePaymentMethod";

type OwnProps = {
  paymentMethod: PaymentMethod;
  card: React.ReactNode;
  content: React.ReactNode;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

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

const DeleteButton = (props: { onPress?: () => void }) => (
  <Button bordered={true} style={styles.cancelButton} onPress={props.onPress}>
    <Label color={"red"}>{I18n.t("cardComponent.removeCta")}</Label>
  </Button>
);
/**
 * Base layout for payment methods screen & legacy delete handling
 * @constructor
 */
const BasePaymentMethodScreen = (props: Props): React.ReactElement => {
  const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);

  const { card, content, paymentMethod } = props;
  const { present } = useRemovePaymentMethodBottomSheet({
    icon: paymentMethod.icon,
    caption: paymentMethod.caption
  });

  React.useEffect(() => {
    if (props.hasErrorDelete) {
      setIsLoadingDelete(false);
    }
  }, [props.hasErrorDelete]);

  return isLoadingDelete ? (
    <LoadingSpinnerOverlay
      isLoading={true}
      loadingCaption={I18n.t("cardComponent.deleteLoading")}
    />
  ) : (
    <DarkLayout
      bounces={false}
      contextualHelp={emptyContextualHelp}
      title={I18n.t("wallet.creditCard.details.header")}
      faqCategories={["wallet_methods"]}
      allowGoBack={true}
      topContent={<View style={styles.headerSpacer} />}
      gradientHeader={true}
      hideHeader={true}
    >
      <View style={styles.cardContainer}>{card}</View>
      <View spacer={true} extralarge={true} />
      <View style={IOStyles.horizontalContentPadding}>
        {content}
        <View spacer={true} large={true} />
        <DeleteButton
          onPress={() =>
            present(() => {
              props.deleteWallet(paymentMethod.idWallet);
              setIsLoadingDelete(true);
            })
          }
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
          showToast(I18n.t("wallet.delete.successful"), "success");
          dispatch(NavigationActions.back());
        },
        onFailure: _ => {
          showToast(I18n.t("wallet.delete.failed"), "danger");
        }
      })
    )
});

const mapStateToProps = (state: GlobalState) => ({
  hasErrorDelete: pot.isError(getWalletsById(state))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BasePaymentMethodScreen);
