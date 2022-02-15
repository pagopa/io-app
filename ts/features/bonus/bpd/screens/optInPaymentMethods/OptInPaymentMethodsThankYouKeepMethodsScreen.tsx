import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import ThankYouSuccessComponent from "../../components/optInPaymentMethods/ThankYouSuccessComponent";
import { useIOSelector } from "../../../../../store/hooks";
import { optInPaymentMethodsCompleted } from "../../store/actions/optInPaymentMethods";
import { showToast } from "../../../../../utils/showToast";
import I18n from "../../../../../i18n";
import { optInStatusSelector } from "../../store/reducers/details/activation";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { bpdUpdateOptInStatusMethod } from "../../store/actions/onboarding";
import { CitizenOptInStatusEnum } from "../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";

const OptInPaymentMethodsThankYouKeepMethodsScreen = () => {
  const dispatch = useDispatch();
  const optInStatus = useIOSelector(optInStatusSelector);

  useEffect(() => {
    // dispatch saga that delete payment methods and update opt-in field
    dispatch(
      bpdUpdateOptInStatusMethod.request(CitizenOptInStatusEnum.ACCEPTED)
    );
  }, [dispatch]);

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

  // if the opt-in choice fails complete the workunit and show an error toast to the user
  if (pot.isError(optInStatus)) {
    showToast(I18n.t("bonus.bpd.optInPaymentMethods.thankYouPage.toast"));
    dispatch(optInPaymentMethodsCompleted());
    return null;
  }

  // the opt-in update succeed, show the thank you page
  return <ThankYouSuccessComponent />;
};

export default OptInPaymentMethodsThankYouKeepMethodsScreen;
