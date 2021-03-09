import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { StyleSheet } from "react-native";
import { Button } from "native-base";
import { NavigationActions } from "react-navigation";
import I18n from "../../../i18n";
import { Label } from "../../../components/core/typography/Label";
import { deleteWalletRequest } from "../../../store/actions/wallet/wallets";
import { showToast } from "../../../utils/showToast";
import { GlobalState } from "../../../store/reducers/types";
import { IOColors } from "../../../components/core/variables/IOColors";

type Props = { walletId: number } & ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  deleteButton: {
    borderColor: IOColors.red,
    width: "100%"
  }
});

const DeletePaymentMethodButton: React.FunctionComponent<Props> = props => (
  <Button
    bordered={true}
    style={styles.deleteButton}
    onPress={() => props.deleteWallet(props.walletId)}
  >
    <Label color={"red"}>{I18n.t("wallet.bancomat.details.removeCta")}</Label>
  </Button>
);

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

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeletePaymentMethodButton);
