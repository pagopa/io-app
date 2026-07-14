import { IOToast, RadioGroup, VSpacer } from "@io-app/design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";

import {
  SelfCriteriaMultiDTO,
  _typeEnum as SelfCriteriaMultiTypeEnum
} from "../../../../../definitions/idpay/SelfCriteriaMultiDTO";
import {
  SelfCriteriaMultiTypeDTO,
  _typeEnum as SelfCriteriaMultiTypeVariationEnum
} from "../../../../../definitions/idpay/SelfCriteriaMultiTypeDTO";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  trackIDPayOnboardingAlert,
  trackIDPayOnboardingMultiSelfDeclaration
} from "../analytics";
import IdPayOnboardingStepper from "../components/IdPayOnboardingStepper";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  multiRequiredCriteriaSelector,
  selectCurrentMultiSelfDeclarationPage,
  selectInitiative
} from "../machine/selectors";

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

  const initiative =
    IdPayOnboardingMachineContext.useSelector(selectInitiative);

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.getOrElse(() => "")
  );

  useOnFirstRender(() =>
    trackIDPayOnboardingMultiSelfDeclaration({
      initiativeId
    })
  );

  return (
    <PagerView
      initialPage={0}
      ref={pagerRef}
      scrollEnabled={false}
      style={{ flex: 1 }}
    >
      {multiSelfDeclarations.map((selfDeclaration, index) => (
        <View
          key={index}
          style={{
            flex: 1
          }}
        >
          <MultiValuePrerequisiteItemScreenContent
            initiativeId={initiativeId}
            selfDeclaration={selfDeclaration}
          />
        </View>
      ))}
    </PagerView>
  );
};

type MultiValuePrerequisiteItemScreenContentProps = {
  initiativeId?: string;
  selfDeclaration: SelfCriteriaMultiDTO | SelfCriteriaMultiTypeDTO;
};

const MultiValuePrerequisiteItemScreenContent = ({
  selfDeclaration,
  initiativeId
}: MultiValuePrerequisiteItemScreenContentProps) => {
  const machine = IdPayOnboardingMachineContext.useActorRef();

  const [selectedValueIndex, setSelectedValueIndex] = useState<
    number | undefined
  >(undefined);

  const isSelfCriteriaMultiTypeDTO = (
    obj: SelfCriteriaMultiDTO | SelfCriteriaMultiTypeDTO
  ): obj is SelfCriteriaMultiTypeDTO =>
    // eslint-disable-next-line no-underscore-dangle
    obj._type === SelfCriteriaMultiTypeVariationEnum.multi_consent;

  const handleContinuePress = () => {
    if (selectedValueIndex === undefined) {
      IOToast.error(
        I18n.t("idpay.onboarding.multiPrerequisites.emptyValueError")
      );
      trackIDPayOnboardingAlert({
        screen: "multi_self_declaration",
        initiativeId
      });
      return;
    }
    const value = selfDeclaration.value?.[selectedValueIndex].value;
    if (!selfDeclaration.code || !value) {
      IOToast.error(I18n.t("global.genericError"));
      return;
    }

    machine.send({
      type: "select-multi-consent",
      data: isSelfCriteriaMultiTypeDTO(selfDeclaration)
        ? {
            _type: SelfCriteriaMultiTypeVariationEnum.multi_consent,
            value,
            code: selfDeclaration.code
          }
        : {
            _type: SelfCriteriaMultiTypeEnum.multi,
            value,
            code: selfDeclaration.code
          }
    });
  };

  const handleGoBack = () => machine.send({ type: "back" });

  const selfCriteriaMultiTitle =
    selfDeclaration.description ||
    I18n.t("idpay.onboarding.boolPrerequisites.header");

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        type: "SingleButton",
        primary: {
          onPress: handleContinuePress,
          label: I18n.t("global.buttons.continue")
        }
      }}
      contextualHelp={emptyContextualHelp}
      goBack={handleGoBack}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins
      title={{
        label: selfCriteriaMultiTitle,
        section: I18n.t("idpay.onboarding.navigation.header")
      }}
      topElement={<IdPayOnboardingStepper />}
    >
      {selfDeclaration.subDescription && (
        <>
          <IOMarkdown content={selfDeclaration.subDescription} />
          <VSpacer size={16} />
        </>
      )}
      <RadioGroup<number>
        items={
          selfDeclaration?.value?.map((answer, index) => ({
            id: index,
            value: answer.description,
            description: answer.subDescription
          })) || []
        }
        onPress={value => setSelectedValueIndex(value)}
        selectedItem={selectedValueIndex}
        type="radioListItem"
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default IdPayMultiValuePrerequisitesScreen;
