import * as React from "react";
import { useEffect, useRef } from "react";
import { View, Alert } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { cgnUnsubscribeSelector } from "../../store/reducers/unsubscribe";
import { Link } from "../../../../../components/core/typography/Link";
import I18n from "../../../../../i18n";
import { cgnUnsubscribe } from "../../store/actions/unsubscribe";
import { isError, isReady } from "../../../bpd/model/RemoteValue";
import { showToast } from "../../../../../utils/showToast";
import { navigateBack } from "../../../../../store/actions/navigation";
import { cgnDetails } from "../../store/actions/details";

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
      showToast(I18n.t("bonus.cgn.activation.deactivate.toast"), "success");
    }
    if (isError(unsubscriptionStatus) && !isFirstRender.current) {
      showToast(I18n.t("global.genericError"), "danger");
    }

    // eslint-disable-next-line functional/immutable-data
    isFirstRender.current = false;
  }, [unsubscriptionStatus, dispatch]);

  return (
    <View style={{ paddingTop: 16, paddingBottom: 60 }}>
      <Link
        color={"red"}
        style={{ textAlign: "center" }}
        accessibilityRole={"button"}
        accessibilityLabel={I18n.t("bonus.cgn.cta.deactivateBonus")}
        onPress={requestUnsubscription}
      >
        {I18n.t("bonus.cgn.cta.deactivateBonus")}
      </Link>
    </View>
  );
};

export default CgnUnsubscribe;
