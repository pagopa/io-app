import * as React from "react";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { IOToast, ListItemAction } from "@pagopa/io-app-design-system";

import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { cgnUnsubscribeSelector } from "../../store/reducers/unsubscribe";
import I18n from "../../../../../i18n";
import { cgnUnsubscribe } from "../../store/actions/unsubscribe";
import { isError, isReady } from "../../../../../common/model/RemoteValue";
import { cgnDetails } from "../../store/actions/details";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

const CgnUnsubscribe = () => {
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
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.deactivate"),
          onPress: () => dispatch(cgnUnsubscribe.request())
        }
      ]
    );
  };

  useEffect(() => {
    if (isReady(unsubscriptionStatus)) {
      navigation.goBack();
      dispatch(cgnDetails.request());
      IOToast.success(I18n.t("bonus.cgn.activation.deactivate.toast"));
    }
    if (isError(unsubscriptionStatus) && !isFirstRender.current) {
      IOToast.error(I18n.t("global.genericError"));
    }

    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [unsubscriptionStatus, navigation, dispatch]);

  return (
    <ListItemAction
      accessibilityLabel={I18n.t("bonus.cgn.cta.deactivateBonus")}
      variant="danger"
      label={I18n.t("bonus.cgn.cta.deactivateBonus")}
      testID="cgnDeactivateBonusTestId"
      onPress={requestUnsubscription}
      icon="trashcan"
    />
  );
};

export default CgnUnsubscribe;
