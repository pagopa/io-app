import { IOToast, RadioGroup, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
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

  useOnFirstRender(() =>
    trackIDPayOnboardingMultiSelfDeclaration({
      initiativeId,
      initiativeName
    })
  );

  return (
    <PagerView
      ref={pagerRef}
      scrollEnabled={false}
      style={{ flex: 1 }}
      initialPage={0}
    >
      {multiSelfDeclarations.map((selfDeclaration, index) => (
        <View
          key={index}
          style={{
            flex: 1
          }}
        >
          <MultiValuePrerequisiteItemScreenContent
            selfDeclaration={selfDeclaration}
            initiativeId={initiativeId}
            initiativeName={initiativeName}
          />
        </View>
      ))}
    </PagerView>
  );
};

type MultiValuePrerequisiteItemScreenContentProps = {
  selfDeclaration: SelfCriteriaMultiDTO | SelfCriteriaMultiTypeDTO;
  initiativeId?: string;
  initiativeName?: string;
};

const MultiValuePrerequisiteItemScreenContent = ({
  selfDeclaration,
  initiativeId,
  initiativeName
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
        initiativeId,
        initiativeName
      });
      return;
    }
    const value = selfDeclaration.value?.[selectedValueIndex].description;
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
      topElement={<IdPayOnboardingStepper />}
      title={{
        label: selfCriteriaMultiTitle,
        section: I18n.t("idpay.onboarding.navigation.header")
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
      {selfDeclaration.subDescription && (
        <>
          <IOMarkdown content={selfDeclaration.subDescription} />
          <VSpacer size={16} />
        </>
      )}
      <RadioGroup<number>
        type="radioListItem"
        items={
          selfDeclaration?.value?.map((answer, index) => ({
            id: index,
            value: answer.description,
            description: answer.subDescription
          })) || []
        }
        selectedItem={selectedValueIndex}
        onPress={value => setSelectedValueIndex(value)}
      />
    </IOScrollViewWithLargeHeader>
  );
};

export default IdPayMultiValuePrerequisitesScreen;
