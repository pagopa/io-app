import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useEffect } from "react";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useFirstRender } from "../../../services/common/hooks/useFirstRender";
import { upsertServicePreference } from "../../../services/details/store/actions/preference";
import {
  isErrorServicePreferenceSelector,
  isLoadingServicePreferenceSelector,
  servicePreferenceResponseSuccessByIdSelector
} from "../../../services/details/store/selectors";
import {
  trackIDPayOnboardingNotificationCancel,
  trackIDPayOnboardingNotificationError,
  trackIDPayOnboardingNotificationOK,
  trackIDPayOnboardingNotificationPermission
} from "../analytics";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";

const IdPayEnableMessageScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const dispatch = useIODispatch();
  const isFirstRender = useFirstRender();

  const { serviceId } = useSelector(state => state.context);

  const isErrorServicePreference = useIOSelector(state =>
    isErrorServicePreferenceSelector(state, serviceId as ServiceId)
  );

  const isLoadingServicePreference = useIOSelector(state =>
    isLoadingServicePreferenceSelector(state, serviceId as ServiceId)
  );

  const isSuccessServicePreference = useIOSelector(state =>
    servicePreferenceResponseSuccessByIdSelector(state, serviceId as ServiceId)
  );

  const initiative = useSelector(selectInitiative);

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.toUndefined
  );

  const onActivate = () => {
    if (
      !initiativeId ||
      !isSuccessServicePreference ||
      isLoadingServicePreference
    ) {
      return;
    }

    dispatch(
      upsertServicePreference.request({
        ...isSuccessServicePreference.value,
        id: serviceId as ServiceId,
        inbox: true
      })
    );
  };

  // Since we need to wait for the service preference update to complete, we use an effect
  // to listen for changes in the loading/error/success state of the service preference.
  // Once the update is complete, we can proceed to the next step or show an error message.
  // There could be a better way to handle this in the future.
  useEffect(() => {
    if (isFirstRender) {
      return;
    }
    if (!isLoadingServicePreference) {
      if (isErrorServicePreference) {
        /*
          Toast error intentionally omitted: error handling is managed within ServiceDetailsPreferences.
          Uncomment below to enable toast notifications for debugging or testing purposes:
          IOToast.error("I18n.t("global.genericError")");
        */
        trackIDPayOnboardingNotificationError({ initiativeName, initiativeId });
      } else if (isSuccessServicePreference) {
        trackIDPayOnboardingNotificationOK({ initiativeName, initiativeId });
        machine.send({ type: "next" });
      }
    }
  }, [
    isLoadingServicePreference,
    isErrorServicePreference,
    isSuccessServicePreference,
    initiativeName,
    initiativeId,
    machine,
    isFirstRender
  ]);

  const onCancel = () => {
    trackIDPayOnboardingNotificationCancel({ initiativeName, initiativeId });
    machine.send({ type: "close" });
  };

  useOnFirstRender(() => {
    trackIDPayOnboardingNotificationPermission({
      initiativeName,
      initiativeId
    });
  });

  return (
    <OperationResultScreenContent
      pictogram="message"
      title={I18n.t("idpay.onboarding.enableMessages.title")}
      subtitle={I18n.t("idpay.onboarding.enableMessages.subtitle", {
        initiativeName
      })}
      action={{
        label: I18n.t("idpay.onboarding.enableMessages.confirmAction"),
        onPress: onActivate
      }}
      secondaryAction={{
        label: I18n.t("idpay.onboarding.enableMessages.cancelAction"),
        onPress: onCancel
      }}
    />
  );
};

export default IdPayEnableMessageScreen;
