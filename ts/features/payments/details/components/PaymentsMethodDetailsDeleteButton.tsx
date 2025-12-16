import { IOToast, ListItemAction } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Alert, Platform } from "react-native";
import I18n from "i18next";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { isPaymentMethodExpired } from "../../common/utils";
import { selectPaymentOnboardingMethods } from "../../onboarding/store/selectors";
import { getPaymentsWalletUserMethods } from "../../wallet/store/actions";
import * as analytics from "../analytics";
import { paymentsDeleteMethodAction } from "../store/actions";

type PaymentsDetailsDeleteMethodButtonProps = {
  paymentMethod?: WalletInfo;
};

const PaymentsMethodDetailsDeleteButton = ({
  paymentMethod
}: PaymentsDetailsDeleteMethodButtonProps) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const store = useIOStore();

  const paymentMethodsPot = useIOSelector(selectPaymentOnboardingMethods);
  const availablePaymentMethods = pot.toUndefined(paymentMethodsPot);

  if (paymentMethod === undefined) {
    return null;
  }

  const analyticsData = {
    payment_method_selected: paymentMethod.details?.type,
    payment_method_status: isPaymentMethodExpired(paymentMethod.details)
      ? ("invalid" as const as "invalid")
      : ("valid" as const as "valid")
  };

  const deleteWallet = (walletId: string) => {
    dispatch(
      paymentsDeleteMethodAction.request({
        walletId,
        onSuccess: () => {
          IOToast.success(I18n.t("wallet.delete.successful"));
          analytics.trackWalletPaymentRemoveMethodSuccess(analyticsData);
          void updateMixpanelProfileProperties(store.getState(), {
            property: "SAVED_PAYMENT_METHOD",
            value: (availablePaymentMethods?.length ?? 1) - 1
          });
          dispatch(getPaymentsWalletUserMethods.request());
        },
        onFailure: () => {
          IOToast.error(I18n.t("wallet.delete.failed"));
          analytics.trackWalletPaymentRemoveMethodFailure(analyticsData);
        }
      })
    );
    navigation.goBack();
  };

  const onDeleteMethod = () => {
    // Create a native Alert to confirm or cancel the delete action
    analytics.trackWalletPaymentRemoveMethodStart(analyticsData);
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
              analytics.trackWalletPaymentRemoveMethodConfirm(analyticsData);
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
