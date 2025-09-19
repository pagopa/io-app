import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useEffect } from "react";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import LoadingComponent from "../../../fci/components/LoadingComponent";
import { isLoadingSelector } from "../../common/machine/selectors";
import { trackIDPayOnboardingConversionRate } from "../analytics";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { selectInitiative } from "../machine/selectors";

const IdPayLoadingScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const isLoading = useSelector(isLoadingSelector);

  const initiative = useSelector(selectInitiative);

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.getOrElse(() => "")
  );

  useEffect(() => {
    if (!isLoading) {
      machine.send({ type: "next" });
    }
  }, [isLoading, machine]);

  useOnFirstRender(() =>
    trackIDPayOnboardingConversionRate({
      initiativeId,
      initiativeName
    })
  );

  return (
    <LoadingComponent
      captionTitle={I18n.t("idpay.onboarding.loading.title")}
      captionSubtitle={I18n.t("idpay.onboarding.loading.subtitle")}
    />
  );
};

export default IdPayLoadingScreen;
