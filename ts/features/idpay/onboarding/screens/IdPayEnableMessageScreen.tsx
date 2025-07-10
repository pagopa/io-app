import { INonEmptyStringTag } from "@pagopa/ts-commons/lib/strings";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { upsertServicePreference } from "../../../services/details/store/actions/preference";
import { servicePreferenceResponseSuccessByIdSelector } from "../../../services/details/store/reducers";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";

const IdPayEnableMessageScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const dispatch = useIODispatch();

  const { serviceId } = useSelector(state => state.context);

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

  const onSuccess = () => {
    if (!initiativeId || !servicePreferenceResponseSuccess) {
      return;
    }

    dispatch(
      upsertServicePreference.request({
        ...servicePreferenceResponseSuccess.value,
        id: serviceId as string & INonEmptyStringTag,
        inbox: true
      })
    );
    machine.send({ type: "next" });
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
        onPress: onSuccess
      }}
      secondaryAction={{
        label: I18n.t("idpay.onboarding.enableMessages.cancelAction"),
        onPress: () => machine.send({ type: "close" })
      }}
    />
  );
};

export default IdPayEnableMessageScreen;
