import { Stepper, VSpacer } from "@pagopa/io-app-design-system";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { stepperCountSelector } from "../machine/selectors";

const IdPayOnboardingStepper = () => {
  const { useSelector } = IdPayOnboardingMachineContext;

  const stepperCount = useSelector(stepperCountSelector);
  const currentStep = useSelector(state => state.context.currentStep);
  return (
    <>
      <Stepper currentStep={currentStep} steps={stepperCount} />
      <VSpacer size={24} />
    </>
  );
};

export default IdPayOnboardingStepper;
