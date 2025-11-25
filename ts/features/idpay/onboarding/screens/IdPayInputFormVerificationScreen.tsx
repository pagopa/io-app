import { H6, IOToast, TextInput, VSpacer } from "@pagopa/io-app-design-system";
import { useEffect, useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { emptyContextualHelp } from "../../../../utils/help";
import { isLoadingSelector } from "../../common/machine/selectors";
import IdPayOnboardingStepper from "../components/IdPayOnboardingStepper";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  selectCurrentInputTextNumber,
  textRequiredCriteriaSelector
} from "../machine/selectors";
import {
  SelfCriteriaTextDTO,
  _typeEnum as SelfCriteriaTextTypeEnum
} from "../../../../../definitions/idpay/SelfCriteriaTextDTO";

const IdPayInputFormVerificationScreen = () => {
  const { useSelector } = IdPayOnboardingMachineContext;

  const pagerRef = useRef<PagerView>(null);
  const currentPage = useSelector(selectCurrentInputTextNumber);
  const selfCriteriaText = useSelector(textRequiredCriteriaSelector);

  useEffect(() => {
    pagerRef.current?.setPage(currentPage);
  }, [pagerRef, currentPage]);

  return (
    <PagerView
      ref={pagerRef}
      scrollEnabled={false}
      style={{ flex: 1 }}
      initialPage={0}
    >
      {selfCriteriaText.map((criteria, index) => (
        <InputFormVerificationContent criteria={criteria} key={index} />
      ))}
    </PagerView>
  );
};

type MultiValuePrerequisiteItemScreenContentProps = {
  criteria: SelfCriteriaTextDTO;
};

const InputFormVerificationContent = ({
  criteria
}: MultiValuePrerequisiteItemScreenContentProps) => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);
  const [value, setValue] = useState("");

  const handleContinuePress = () => {
    if (!value.length) {
      IOToast.error(
        I18n.t("idpay.onboarding.inputPrerequisites.emptyValueError")
      );
      return;
    }
    if (!criteria.code) {
      return;
    }
    machine.send({
      type: "input-text-criteria",
      criteria: {
        _type: SelfCriteriaTextTypeEnum.text,
        code: criteria.code,
        value
      }
    });
  };

  const goBackOnPress = () => machine.send({ type: "back" });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <IOScrollViewWithLargeHeader
        topElement={<IdPayOnboardingStepper />}
        title={{
          label: I18n.t("idpay.onboarding.boolPrerequisites.header"),
          section: I18n.t("idpay.onboarding.navigation.header")
        }}
        goBack={goBackOnPress}
        contextualHelp={emptyContextualHelp}
        headerActionsProp={{ showHelp: true }}
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: handleContinuePress
          }
        }}
        includeContentMargins
      >
        <H6>{criteria.description}</H6>
        <VSpacer size={16} />
        <TextInput
          key={criteria.code}
          accessibilityLabel={criteria.description}
          accessibilityHint={criteria.description}
          placeholder={criteria.value ?? ""}
          onChangeText={text => setValue(text)}
          value={value}
        />
        <VSpacer size={16} />
      </IOScrollViewWithLargeHeader>
    </LoadingSpinnerOverlay>
  );
};

export default IdPayInputFormVerificationScreen;
