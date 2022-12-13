import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CitizenOptInStatusEnum } from "../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import I18n from "../../../../../i18n";
import ROUTES from "../../../../../navigation/routes";
import { useIOSelector } from "../../../../../store/hooks";
import { showToast } from "../../../../../utils/showToast";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import ThankYouSuccessComponent from "../../components/optInPaymentMethods/ThankYouSuccessComponent";
import { bpdUpdateOptInStatusMethod } from "../../store/actions/onboarding";
import { optInStatusSelector } from "../../store/reducers/details/activation";

const OptInPaymentMethodsThankYouKeepMethodsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const optInStatus = useIOSelector(optInStatusSelector);

  useEffect(() => {
    // dispatch saga that delete payment methods and update opt-in field
    dispatch(
      bpdUpdateOptInStatusMethod.request(CitizenOptInStatusEnum.ACCEPTED)
    );
  }, [dispatch]);

  useEffect(() => {
    // if the opt-in choice fails complete the workunit and show an error toast to the user
    if (pot.isError(optInStatus)) {
      showToast(I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.toast"));
      navigation.navigate(ROUTES.WALLET_HOME);
    }
  }, [optInStatus, dispatch, navigation]);

  const isOptInStatusLoading = pot.fold(
    optInStatus,
    () => true,
    () => true,
    _ => true,
    _ => false,
    _ => false,
    _ => true,
    _ => true,
    _ => false
  );

  // if optInStatus is on loading (or undefined) state show loading component
  if (isOptInStatusLoading) {
    return (
      <LoadingErrorComponent
        isLoading={true}
        loadingCaption={I18n.t("global.remoteStates.loading")}
        onRetry={() => true}
        testID={"loadingComponent"}
      />
    );
  }

  if (pot.isError(optInStatus)) {
    return null;
  }

  // the opt-in update succeed, show the thank you page
  return <ThankYouSuccessComponent />;
};

export default OptInPaymentMethodsThankYouKeepMethodsScreen;
