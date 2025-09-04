import { IOToast } from "@pagopa/io-app-design-system";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import I18n from "i18next";
import { isError, isReady } from "../../../../common/model/RemoteValue";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";

export function useCgnUnsubscribe() {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const unsubscriptionStatus = useIOSelector(cgnUnsubscribeSelector);
  const isFirstRender = useRef<boolean>(true);

  const requestUnsubscription = () => {
    Alert.alert(
      I18n.t("bonus.cgn.activation.deactivate.alert.title"),
      I18n.t("bonus.cgn.activation.deactivate.alert.message"),
      [
        {
          text: I18n.t(`wallet.delete.android.confirm`),
          style: "destructive",
          onPress: () => dispatch(cgnUnsubscribe.request())
        },
        {
          text: I18n.t("global.buttons.cancel"),
          style: "default"
        }
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    if (isReady(unsubscriptionStatus) && unsubscriptionStatus.value) {
      navigation.goBack();
      IOToast.success(I18n.t("bonus.cgn.activation.deactivate.toast"));
    }
    if (isError(unsubscriptionStatus) && !isFirstRender.current) {
      IOToast.error(I18n.t("wallet.delete.failed"));
    }

    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [unsubscriptionStatus, navigation, dispatch]);

  return { requestUnsubscription };
}
