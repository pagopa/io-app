import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { LightModalContext } from "../../../../../components/ui/LightModal";
import { bpdOptInPaymentMethodsEnabled } from "../../../../../config";
import I18n from "../../../../../i18n";
import ROUTES from "../../../../../navigation/routes";
import { useIOSelector } from "../../../../../store/hooks";
import { bpdRemoteConfigSelector } from "../../../../../store/reducers/backendStatus";
import { isError, isReady } from "../../model/RemoteValue";
import BPD_ROUTES from "../../navigation/routes";
import { optInPaymentMethodsShowChoice } from "../../store/actions/optInPaymentMethods";
import { showOptInChoiceSelector } from "../../store/reducers/details/activation/ui";
import { bpdLastUpdateSelector } from "../../store/reducers/details/lastUpdate";

const BpdOptInPaymentMethodsContainer = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showModal, hideModal } = useContext(LightModalContext);
  const [showOptInChecked, setShowOptInChecked] = useState<boolean>(false);
  const bpdRemoteConfig = useIOSelector(bpdRemoteConfigSelector);
  const showOptInChoice = useIOSelector(showOptInChoiceSelector);
  const bpdLastUpdate = useIOSelector(bpdLastUpdateSelector);
  const isOptInPaymentMethodsEnabled =
    bpdRemoteConfig?.opt_in_payment_methods_v2 && bpdOptInPaymentMethodsEnabled;

  useEffect(() => {
    if (
      isOptInPaymentMethodsEnabled &&
      !showOptInChecked &&
      !isReady(showOptInChoice)
    ) {
      setShowOptInChecked(true);
      // Starts the optInShouldShowChoiceHandler saga
      dispatch(optInPaymentMethodsShowChoice.request());
      showModal(
        <LoadingSpinnerOverlay
          isLoading={true}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          loadingOpacity={1}
        />
      );
    }
  }, [
    isOptInPaymentMethodsEnabled,
    dispatch,
    showOptInChecked,
    bpdLastUpdate,
    showModal,
    showOptInChoice
  ]);

  useEffect(() => {
    if (
      isOptInPaymentMethodsEnabled &&
      (isReady(showOptInChoice) || isError(showOptInChoice))
    ) {
      hideModal();
      if (isReady(showOptInChoice) && showOptInChoice.value) {
        navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
          screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.MAIN,
          params: {
            screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE
          }
        });
      }
    }
  }, [isOptInPaymentMethodsEnabled, hideModal, showOptInChoice, navigation]);

  return <></>;
};

export default BpdOptInPaymentMethodsContainer;
