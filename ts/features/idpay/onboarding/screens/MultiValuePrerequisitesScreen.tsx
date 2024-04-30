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
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  criteriaToDisplaySelector,
  prerequisiteAnswerIndexSelector
} from "../machine/selectors";

type ListItemProps = {
  text: string;
  checked: boolean;
  onPress: () => void;
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

const buttonProps = {
  leftButton: { title: I18n.t("global.buttons.back"), bordered: true },
  rightButton: {
    title: I18n.t("global.buttons.continue"),
    bordered: false
  }
};

const MultiValuePrerequisitesScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const currentPrerequisite = useSelector(criteriaToDisplaySelector);
  const possiblySelectedIndex = useSelector(prerequisiteAnswerIndexSelector);

  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(
    possiblySelectedIndex
  );

  const continueOnPress = () => {
    if (selectedIndex === undefined) {
      return null;
    }
    machine.send({
      type: "select-multi-consent",
      data: {
        _type: currentPrerequisite._type,
        value: currentPrerequisite.value[selectedIndex],
        code: currentPrerequisite.code
      }
    });

    return null;
  };
  const goBack = () => machine.send({ type: "back" });

  useNavigationSwipeBackListener(() => {
    machine.send({ type: "back", skipNavigation: true });
  });

  return (
    <SafeAreaView style={IOStyles.flex}>
      <BaseScreenComponent
        goBack={goBack}
        headerTitle={I18n.t("idpay.onboarding.headerTitle")}
      >
        <View style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("idpay.onboarding.multiPrerequisites.header")}</H1>
          <VSpacer size={16} />
          <Body>{I18n.t("idpay.onboarding.multiPrerequisites.body")}</Body>
          <Link>{I18n.t("idpay.onboarding.multiPrerequisites.link")}</Link>
          <VSpacer size={24} />
          <H4>{currentPrerequisite.description}</H4>
          <ScrollView style={styles.maxheight}>
            {currentPrerequisite.value.map((answer, index) => (
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
          onPress: goBack,
          ...buttonProps.leftButton
        }}
        rightButton={{
          onPress: continueOnPress,
          disabled: selectedIndex === undefined,
          ...buttonProps.rightButton
        }}
      />
    </SafeAreaView>
  );
};

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
