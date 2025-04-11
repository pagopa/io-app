import { H6, IOStyles, TextInput, VSpacer } from "@pagopa/io-app-design-system";
import { useEffect, useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import { SelfDeclarationTextDTO } from "../../../../../definitions/idpay/SelfDeclarationTextDTO";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isLoadingSelector } from "../../common/machine/selectors";
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
      ref={pagerRef}
      scrollEnabled={false}
      style={IOStyles.flex}
      initialPage={0}
    >
      {selfCriteriaText.map((criteria, index) => (
        <InputFormVerificationContent criteria={criteria} key={index} />
      ))}
    </PagerView>
  );
};

type MultiValuePrerequisiteItemScreenContentProps = {
  criteria: SelfDeclarationTextDTO;
};

const InputFormVerificationContent = ({
  criteria
}: MultiValuePrerequisiteItemScreenContentProps) => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);
  const [value, setValue] = useState("");

  const handleContinuePress = () =>
    machine.send({
      type: "input-text-criteria",
      criteria: { ...criteria, value }
    });
  const goBackOnPress = () => machine.send({ type: "back" });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <IOScrollViewWithLargeHeader
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
            onPress: handleContinuePress,
            disabled: value.length === 0
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
          placeholder={criteria.value}
          onChangeText={text => setValue(text)}
          value={value}
        />
        <VSpacer size={16} />
      </IOScrollViewWithLargeHeader>
    </LoadingSpinnerOverlay>
  );
};

export default IdPayInputFormVerificationScreen;
