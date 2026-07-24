import { ListItemAction } from "@io-app/design-system";
import I18n from "i18next";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";

import {
  InitiativeDTO,
  VoucherStatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IdPayUnsubscriptionRoutes } from "../../unsubscription/navigation/routes";
import { idPayUnsubscribeAction } from "../../unsubscription/store/actions";
import {
  isFailureSelector,
  isUnsubscriptionSuccessSelector
} from "../../unsubscription/store/selectors";

const IdPayRemoveFromWalletButton = (initiative: InitiativeDTO) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isSuccess = useIOSelector(isUnsubscriptionSuccessSelector);
  const isFailure = useIOSelector(isFailureSelector);

  useEffect(() => {
    if (isFailure || isSuccess) {
      navigation.navigate(IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
        screen: IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT
      });
    }
  }, [navigation, isFailure, isSuccess]);

  const showAlert = () => {
    Alert.alert(
      I18n.t("idpay.unsubscription.removeAlert.title", {
        initiativeName: initiative.initiativeName
      }),
      I18n.t("idpay.unsubscription.removeAlert.content"),
      [
        {
          text:
            Platform.OS === "ios"
              ? I18n.t(`wallet.delete.ios.confirm`)
              : I18n.t(`wallet.delete.android.confirm`),
          style: "destructive",
          onPress: () =>
            dispatch(
              idPayUnsubscribeAction.request({
                initiativeId: initiative.initiativeId
              })
            )
        },
        {
          text: I18n.t("global.buttons.cancel"),
          style: "default"
        }
      ],
      { cancelable: false }
    );
  };

  const show =
    initiative.voucherStatus === VoucherStatusEnum.EXPIRED ||
    initiative.voucherStatus === VoucherStatusEnum.EXPIRING ||
    initiative.voucherStatus === VoucherStatusEnum.ACTIVE;

  return (
    show && (
      <ListItemAction
        accessibilityLabel={I18n.t("cardComponent.removeCta")}
        icon="trashcan"
        label={I18n.t("cardComponent.removeCta")}
        onPress={showAlert}
        testID="idpay-remove-from-wallet"
        variant="danger"
      />
    )
  );
};

export default IdPayRemoveFromWalletButton;
