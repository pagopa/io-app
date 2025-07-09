import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";

const IdPayEnableMessageScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const initiative = useSelector(selectInitiative);

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  return (
    <OperationResultScreenContent
      pictogram="message"
      title={I18n.t("idpay.onboarding.enableMessages.title")}
      subtitle={I18n.t("idpay.onboarding.enableMessages.subtitle", {
        initiativeName
      })}
      action={{
        label: I18n.t("idpay.onboarding.enableMessages.confirmAction"),
        onPress: () => machine.send({ type: "next" })
      }}
      secondaryAction={{
        label: I18n.t("idpay.onboarding.enableMessages.cancelAction"),
        onPress: () => machine.send({ type: "close" })
      }}
    />
  );
};

export default IdPayEnableMessageScreen;
