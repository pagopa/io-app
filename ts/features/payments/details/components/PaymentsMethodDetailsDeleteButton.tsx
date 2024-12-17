import { IOToast, ListItemAction } from "@pagopa/io-app-design-system";
import { Alert, Platform } from "react-native";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { paymentsDeleteMethodAction } from "../store/actions";
import { getPaymentsWalletUserMethods } from "../../wallet/store/actions";

type PaymentsDetailsDeleteMethodButtonProps = {
  paymentMethod?: WalletInfo;
};

const PaymentsMethodDetailsDeleteButton = ({
  paymentMethod
}: PaymentsDetailsDeleteMethodButtonProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const deleteWallet = (walletId: string) => {
    dispatch(
      paymentsDeleteMethodAction.request({
        walletId,
        onSuccess: () => {
          IOToast.success(I18n.t("wallet.delete.successful"));
          dispatch(getPaymentsWalletUserMethods.request());
        },
        onFailure: () => {
          IOToast.error(I18n.t("wallet.delete.failed"));
        }
      })
    );
    navigation.goBack();
  };

  if (paymentMethod === undefined) {
    return null;
  }

  const onDeleteMethod = () => {
    // Create a native Alert to confirm or cancel the delete action
    Alert.alert(
      I18n.t("wallet.newRemove.title"),
      I18n.t("wallet.newRemove.body"),
      [
        {
          text:
            Platform.OS === "ios"
              ? I18n.t(`wallet.delete.ios.confirm`)
              : I18n.t(`wallet.delete.android.confirm`),
          style: "destructive",
          onPress: () => {
            if (paymentMethod) {
              deleteWallet(paymentMethod.walletId);
            }
          }
        },
        {
          text: I18n.t("global.buttons.cancel"),
          style: "default"
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <ListItemAction
      label={I18n.t("cardComponent.removeCta")}
      onPress={onDeleteMethod}
      accessibilityLabel={I18n.t("cardComponent.removeCta")}
      icon="trashcan"
      variant="danger"
    />
  );
};

export { PaymentsMethodDetailsDeleteButton };
