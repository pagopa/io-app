import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as React from "react";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import I18n from "../../../../../i18n";
import { bpdOptInPaymentMethodsEnabled } from "../../../../../config";
import { bpdRemoteConfigSelector } from "../../../../../store/reducers/backendStatus";
import { useIOSelector } from "../../../../../store/hooks";
import { optInPaymentMethodsShowChoice } from "../../store/actions/optInPaymentMethods";
import { LightModalContext } from "../../../../../components/ui/LightModal";
import { showOptInChoiceSelector } from "../../store/reducers/details/activation/ui";
import { isError, isReady } from "../../model/RemoteValue";
import { bpdLastUpdateSelector } from "../../store/reducers/details/lastUpdate";

const BpdOptInPaymentMethodsContainer = () => {
  const dispatch = useDispatch();
  const { showModal, hideModal } = useContext(LightModalContext);
  const [showOptInChecked, setShowOptInChecked] = useState<boolean>(false);
  const bpdRemoteConfig = useIOSelector(bpdRemoteConfigSelector);
  const showOptInChoice = useIOSelector(showOptInChoiceSelector);
  const bpdLastUpdate = useIOSelector(bpdLastUpdateSelector);
  const isOptInPaymentMethodsEnabled =
    bpdRemoteConfig?.opt_in_payment_methods && bpdOptInPaymentMethodsEnabled;

  useEffect(() => {
    if (isOptInPaymentMethodsEnabled && !showOptInChecked) {
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
    showModal
  ]);

  useEffect(() => {
    if (
      isOptInPaymentMethodsEnabled &&
      (isReady(showOptInChoice) || isError(showOptInChoice))
    ) {
      hideModal();
    }
  }, [isOptInPaymentMethodsEnabled, hideModal, showOptInChoice]);

  return <></>;
};

export default BpdOptInPaymentMethodsContainer;
