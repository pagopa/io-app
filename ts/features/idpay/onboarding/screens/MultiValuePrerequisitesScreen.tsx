/* eslint-disable no-underscore-dangle */
import {
  Body,
  FooterActionsInline,
  H1,
  H6,
  IOColors,
  IOStyles,
  Icon,
  PressableListItemBase,
  VSpacer
} from "@pagopa/io-app-design-system";
import { default as React } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/SelfDeclarationMultiDTO";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  multiRequiredCriteriaSelector,
  selectCurrentMultiSelfDeclarationPage
} from "../machine/selectors";

type ListItemProps = {
  text: string;
  checked: boolean;
  onPress: () => void;
};

const MultiValuePrerequisitesScreen = () => {
  const pagerRef = React.useRef<PagerView>(null);

  const multiSelfDeclarations = IdPayOnboardingMachineContext.useSelector(
    multiRequiredCriteriaSelector
  );
  const currentPage = IdPayOnboardingMachineContext.useSelector(
    selectCurrentMultiSelfDeclarationPage
  );

  React.useEffect(() => {
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

  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(
    undefined
  );

  const handleContinuePress = () => {
    if (selectedIndex !== undefined) {
      machine.send({
        type: "select-multi-consent",
        data: {
          _type: selfDeclaration._type,
          value: selfDeclaration.value[selectedIndex],
          code: selfDeclaration.code
        }
      });
    }
  };
  const handleGoBack = () => machine.send({ type: "back" });

  useHeaderSecondLevel({
    title: I18n.t("idpay.onboarding.headerTitle"),
    goBack: handleGoBack
  });

  return (
    <>
      <View style={IOStyles.horizontalContentPadding}>
        <H1>{I18n.t("idpay.onboarding.multiPrerequisites.header")}</H1>
        <VSpacer size={16} />
        <Body>{I18n.t("idpay.onboarding.multiPrerequisites.body")}</Body>
        {/* TODO: Add a proper `onPress` function to the following link.
          It was a `<Link>` without anything else before */}
        {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
        <Body weight="Semibold" asLink onPress={() => {}}>
          {I18n.t("idpay.onboarding.multiPrerequisites.link")}
        </Body>
        <VSpacer size={24} />
        <H6>{selfDeclaration.description}</H6>
        <ScrollView>
          {selfDeclaration.value.map((answer, index) => (
            <CustomListItem
              key={index}
              text={answer}
              checked={index === selectedIndex}
              onPress={() => setSelectedIndex(index)}
            />
          ))}
        </ScrollView>
      </View>
      <FooterActionsInline
        startAction={{
          color: "primary",
          onPress: handleGoBack,
          label: I18n.t("global.buttons.back")
        }}
        endAction={{
          onPress: handleContinuePress,
          disabled: selectedIndex === undefined,
          label: I18n.t("global.buttons.continue")
        }}
      />
    </>
  );
};

const CustomListItem = ({ text, onPress, checked }: ListItemProps) => (
  <View style={styles.outerListItem}>
    <PressableListItemBase onPress={onPress}>
      <View
        style={[IOStyles.flex, IOStyles.rowSpaceBetween, styles.innerListItem]}
      >
        <H6 color={"bluegreyDark"}>{text}</H6>
        <Icon
          name={checked ? "legRadioOn" : "legRadioOff"}
          size={24}
          color={checked ? "blue" : "bluegrey"}
        />
      </View>
    </PressableListItemBase>
  </View>
);

const styles = StyleSheet.create({
  outerListItem: {
    borderBottomWidth: 1,
    borderBottomColor: IOColors["grey-100"]
  },
  innerListItem: {
    paddingVertical: 4
  }
});

export default MultiValuePrerequisitesScreen;
