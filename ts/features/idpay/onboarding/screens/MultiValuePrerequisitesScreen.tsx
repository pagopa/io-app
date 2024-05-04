/* eslint-disable no-underscore-dangle */
import {
  Body,
  H1,
  IOColors,
  IOStyles,
  Icon,
  PressableListItemBase,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/SelfDeclarationMultiDTO";
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
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
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const multiSelfDeclarations = useSelector(multiRequiredCriteriaSelector);
  const currentPage = useSelector(selectCurrentMultiSelfDeclarationPage);

  React.useEffect(() => {
    pagerRef.current?.setPage(currentPage);
  }, [pagerRef, currentPage]);

  useNavigationSwipeBackListener(() => {
    machine.send({ type: "back", skipNavigation: true });
  });

  return (
    <SafeAreaView style={IOStyles.flex}>
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
    </SafeAreaView>
  );
};

type MultiValuePrerequisiteItemScreenContentProps = {
  selfDeclaration: SelfDeclarationMultiDTO;
};

const MultiValuePrerequisiteItemScreenContent = ({
  selfDeclaration
}: MultiValuePrerequisiteItemScreenContentProps) => {
  const { useActorRef } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

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

  return (
    <>
      <BaseScreenComponent
        goBack={handleGoBack}
        headerTitle={I18n.t("idpay.onboarding.headerTitle")}
      >
        <View style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("idpay.onboarding.multiPrerequisites.header")}</H1>
          <VSpacer size={16} />
          <Body>{I18n.t("idpay.onboarding.multiPrerequisites.body")}</Body>
          <Link>{I18n.t("idpay.onboarding.multiPrerequisites.link")}</Link>
          <VSpacer size={24} />
          <H4>{selfDeclaration.description}</H4>
          <ScrollView style={styles.maxheight}>
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
      </BaseScreenComponent>
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={{
          onPress: handleGoBack,
          title: I18n.t("global.buttons.back"),
          bordered: true
        }}
        rightButton={{
          onPress: handleContinuePress,
          disabled: selectedIndex === undefined,
          title: I18n.t("global.buttons.continue"),
          bordered: false
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
        <H4 weight={checked ? "SemiBold" : "Regular"} color={"bluegreyDark"}>
          {text}
        </H4>
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
  },
  maxheight: {
    height: "100%"
  }
});

export default MultiValuePrerequisitesScreen;
