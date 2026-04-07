import { H6, IOToast, TextInput, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect, useRef, useState } from "react";
import PagerView from "react-native-pager-view";

import {
  SelfCriteriaTextDTO,
  _typeEnum as SelfCriteriaTextTypeEnum
} from "../../../../../definitions/idpay/SelfCriteriaTextDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { isLoadingSelector } from "../../common/machine/selectors";
import IdPayOnboardingStepper from "../components/IdPayOnboardingStepper";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  selectCurrentInputTextNumber,
  textRequiredCriteriaSelector
} from "../machine/selectors";

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
      initialPage={0}
      ref={pagerRef}
      scrollEnabled={false}
      style={{ flex: 1 }}
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
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: handleContinuePress
          }
        }}
        contextualHelp={emptyContextualHelp}
        goBack={goBackOnPress}
        headerActionsProp={{ showHelp: true }}
        includeContentMargins
        title={{
          label: I18n.t("idpay.onboarding.boolPrerequisites.header"),
          section: I18n.t("idpay.onboarding.navigation.header")
        }}
        topElement={<IdPayOnboardingStepper />}
      >
        <H6>{criteria.description}</H6>
        <VSpacer size={16} />
        <TextInput
          accessibilityHint={criteria.description}
          accessibilityLabel={criteria.description}
          key={criteria.code}
          onChangeText={text => setValue(text)}
          placeholder={criteria.value ?? ""}
          value={value}
        />
        <VSpacer size={16} />
      </IOScrollViewWithLargeHeader>
    </LoadingSpinnerOverlay>
  );
};

export default IdPayInputFormVerificationScreen;
