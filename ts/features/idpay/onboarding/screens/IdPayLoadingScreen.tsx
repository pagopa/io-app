import { useEffect } from "react";
import I18n from "i18next";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import LoadingComponent from "../../../fci/components/LoadingComponent";
import { isLoadingSelector } from "../../common/machine/selectors";

const IdPayLoadingScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();
  const isLoading = useSelector(isLoadingSelector);

  useEffect(() => {
    if (!isLoading) {
      machine.send({ type: "next" });
    }
  }, [isLoading, machine]);

  return (
    <LoadingComponent
      captionTitle={I18n.t("idpay.onboarding.loading.title")}
      captionSubtitle={I18n.t("idpay.onboarding.loading.subtitle")}
    />
  );
};

export default IdPayLoadingScreen;
