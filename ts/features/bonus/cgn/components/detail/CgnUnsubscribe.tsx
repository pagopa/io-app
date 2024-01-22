import * as React from "react";
import { useEffect, useRef } from "react";
import { View, Alert } from "react-native";
import { LabelLink } from "@pagopa/io-app-design-system";

import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { cgnUnsubscribeSelector } from "../../store/reducers/unsubscribe";
import I18n from "../../../../../i18n";
import { cgnUnsubscribe } from "../../store/actions/unsubscribe";
import { isError, isReady } from "../../../../../common/model/RemoteValue";
import { navigateBack } from "../../../../../store/actions/navigation";
import { cgnDetails } from "../../store/actions/details";
import { IOToast } from "../../../../../components/Toast";
import { skipToastShowingDueToE2ECrash } from "./ToastPatch";

const CgnUnsubscribe = () => {
  const dispatch = useIODispatch();
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
      navigateBack();
      dispatch(cgnDetails.request());
      // This is needed to prevent a crash while running E2E tests. Showing
      // the toast causes random crashes upon calling device.reloadReactNative
      if (!skipToastShowingDueToE2ECrash) {
        IOToast.success(I18n.t("bonus.cgn.activation.deactivate.toast"));
      }
    }
    if (isError(unsubscriptionStatus) && !isFirstRender.current) {
      IOToast.error(I18n.t("global.genericError"));
    }

    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [unsubscriptionStatus, dispatch]);

  return (
    <View style={{ paddingTop: 16, paddingBottom: 60 }}>
      <LabelLink
        color={"red"}
        style={{ textAlign: "center" }}
        accessibilityRole={"button"}
        accessibilityLabel={I18n.t("bonus.cgn.cta.deactivateBonus")}
        onPress={requestUnsubscription}
        testID="cgnDeactivateBonusTestId"
      >
        {I18n.t("bonus.cgn.cta.deactivateBonus")}
      </LabelLink>
    </View>
  );
};

export default CgnUnsubscribe;
