import { H6, IOToast, RadioGroup } from "@pagopa/io-app-design-system";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import IdPayOnboardingStepper from "../components/IdPayOnboardingStepper";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  multiRequiredCriteriaSelector,
  selectCurrentMultiSelfDeclarationPage
} from "../machine/selectors";
import {
  SelfCriteriaMultiDTO,
  _typeEnum as SelfCriteriaMultiTypeEnum
} from "../../../../../definitions/idpay/SelfCriteriaMultiDTO";

const IdPayMultiValuePrerequisitesScreen = () => {
  const pagerRef = useRef<PagerView>(null);

  const multiSelfDeclarations = IdPayOnboardingMachineContext.useSelector(
    multiRequiredCriteriaSelector
  );
  const currentPage = IdPayOnboardingMachineContext.useSelector(
    selectCurrentMultiSelfDeclarationPage
  );

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
      {multiSelfDeclarations.map((selfDelcaration, index) => (
        <View key={index}>
          <MultiValuePrerequisiteItemScreenContent
            selfDeclaration={selfDelcaration}
          />
        </View>
      ))}
    </PagerView>
  );
};

type MultiValuePrerequisiteItemScreenContentProps = {
  selfDeclaration: SelfCriteriaMultiDTO;
};

const MultiValuePrerequisiteItemScreenContent = ({
  selfDeclaration
}: MultiValuePrerequisiteItemScreenContentProps) => {
  const machine = IdPayOnboardingMachineContext.useActorRef();

  const [selectedValueIndex, setSelectedValueIndex] = useState<
    number | undefined
  >(undefined);

  const handleContinuePress = () => {
    if (selectedValueIndex === undefined) {
      IOToast.error(
        I18n.t("idpay.onboarding.boolPrerequisites.emptyValueError")
      );
      return;
    }
    const value = selfDeclaration.value?.[selectedValueIndex].description;
    if (!selfDeclaration.code || !value) {
      IOToast.error(I18n.t("global.genericError"));
      return;
    }
    machine.send({
      type: "select-multi-consent",
      data: {
        _type: SelfCriteriaMultiTypeEnum.multi,
        value,
        code: selfDeclaration.code
      }
    });
  };

  const handleGoBack = () => machine.send({ type: "back" });

  return (
    <IOScrollViewWithLargeHeader
      topElement={<IdPayOnboardingStepper />}
      title={{
        label: I18n.t("idpay.onboarding.boolPrerequisites.header"),
        section: I18n.t("idpay.onboarding.headerTitle")
      }}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{ showHelp: true }}
      goBack={handleGoBack}
      includeContentMargins
      actions={{
        type: "SingleButton",
        primary: {
          onPress: handleContinuePress,
          label: I18n.t("global.buttons.continue")
        }
      }}
    >
      <H6>{selfDeclaration.description}</H6>
      <RadioGroup<number>
        type="radioListItem"
        items={
          selfDeclaration?.value?.map((answer, index) => ({
            id: index,
            value: answer.description
          })) || []
        }
        selectedItem={selectedValueIndex}
        onPress={value => setSelectedValueIndex(value)}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default IdPayMultiValuePrerequisitesScreen;
