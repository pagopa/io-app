import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { isError, isReady } from "../../../../../common/model/RemoteValue";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { LightModalContext } from "../../../../../components/ui/LightModal";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { optInPaymentMethodsShowChoice } from "../../store/actions/optInPaymentMethods";
import { showOptInChoiceSelector } from "../../store/reducers/details/activation/ui";
import { bpdLastUpdateSelector } from "../../store/reducers/details/lastUpdate";

const BpdOptInPaymentMethodsContainer = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showModal, hideModal } = useContext(LightModalContext);
  const [showOptInChecked, setShowOptInChecked] = useState<boolean>(false);
  const showOptInChoice = useIOSelector(showOptInChoiceSelector);
  const bpdLastUpdate = useIOSelector(bpdLastUpdateSelector);

  useEffect(() => {
    if (!showOptInChecked && !isReady(showOptInChoice)) {
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
  }, [dispatch, showOptInChecked, bpdLastUpdate, showModal, showOptInChoice]);

  useEffect(() => {
    if (isReady(showOptInChoice) || isError(showOptInChoice)) {
      hideModal();
    }
  }, [hideModal, showOptInChoice, navigation]);

  return <></>;
};

export default BpdOptInPaymentMethodsContainer;
