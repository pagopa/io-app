/* eslint-disable no-underscore-dangle */
import { H6, IOStyles, RadioGroup } from "@pagopa/io-app-design-system";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/SelfDeclarationMultiDTO";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  multiRequiredCriteriaSelector,
  selectCurrentMultiSelfDeclarationPage
} from "../machine/selectors";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";

const MultiValuePrerequisitesScreen = () => {
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
      style={IOStyles.flex}
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
  selfDeclaration: SelfDeclarationMultiDTO;
};

const MultiValuePrerequisiteItemScreenContent = ({
  selfDeclaration
}: MultiValuePrerequisiteItemScreenContentProps) => {
  const machine = IdPayOnboardingMachineContext.useActorRef();

  const [selectedValueIndex, setSelectedValueIndex] = useState<
    number | undefined
  >(undefined);

  const handleContinuePress = () => {
    if (selectedValueIndex !== undefined) {
      machine.send({
        type: "select-multi-consent",
        data: {
          _type: selfDeclaration._type,
          value: selfDeclaration.value[selectedValueIndex],
          code: selfDeclaration.code
        }
      });
    }
  };
  const handleGoBack = () => machine.send({ type: "back" });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("idpay.onboarding.multiPrerequisites.header"),
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
          disabled: selectedValueIndex === undefined,
          label: I18n.t("global.buttons.continue")
        }
      }}
    >
      <H6>{selfDeclaration.description}</H6>
      <RadioGroup<number>
        type="radioListItem"
        items={selfDeclaration.value.map((answer, index) => ({
          id: index,
          value: answer
        }))}
        selectedItem={selectedValueIndex}
        onPress={value => setSelectedValueIndex(value)}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default MultiValuePrerequisitesScreen;
