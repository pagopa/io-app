import { IOToast } from "@pagopa/io-app-design-system";
import { INonEmptyStringTag } from "@pagopa/ts-commons/lib/strings";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useEffect } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { upsertServicePreference } from "../../../services/details/store/actions/preference";
import {
  isErrorServicePreferenceSelector,
  servicePreferenceResponseSuccessByIdSelector
} from "../../../services/details/store/reducers";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { useFirstRender } from "../../../services/common/hooks/useFirstRender";

const IdPayEnableMessageScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const dispatch = useIODispatch();
  const isFirstRender = useFirstRender();

  const { serviceId } = useSelector(state => state.context);

  const isErrorServicePreference = useIOSelector(state =>
    isErrorServicePreferenceSelector(state, serviceId as ServiceId)
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

  const servicePreferenceResponseSuccess = useIOSelector(state =>
    servicePreferenceResponseSuccessByIdSelector(
      state,
      serviceId as string & INonEmptyStringTag
    )
  );

  useEffect(() => {
    if (!isFirstRender && isErrorServicePreference) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isFirstRender, isErrorServicePreference]);

  const onActivate = () => {
    if (!initiativeId || !servicePreferenceResponseSuccess) {
      return;
    }

    dispatch(
      upsertServicePreference.request({
        ...servicePreferenceResponseSuccess.value,
        id: serviceId as ServiceId,
        inbox: true
      })
    );

    if (!isErrorServicePreference) {
      machine.send({ type: "next" });
    }
  };

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
        onPress: () => machine.send({ type: "close" })
      }}
    />
  );
};

export default IdPayEnableMessageScreen;
