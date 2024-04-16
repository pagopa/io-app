/* eslint-disable no-underscore-dangle */
import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import {
  Body,
  FooterWithButtons,
  H1,
  IOColors,
  IOStyles,
  Icon,
  PressableListItemBase,
  VSpacer
} from "@pagopa/io-app-design-system";
import { H4 } from "../../../../components/core/typography/H4";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { useOnboardingMachineService } from "../xstate/provider";
import {
  criteriaToDisplaySelector,
  prerequisiteAnswerIndexSelector
} from "../xstate/selectors";
import { Link } from "../../../../components/core/typography/Link";

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

const MultiValuePrerequisitesScreen = () => {
  const machine = useOnboardingMachineService();

  const currentPrerequisite = useSelector(machine, criteriaToDisplaySelector);
  const possiblySelectedIndex = useSelector(
    machine,
    prerequisiteAnswerIndexSelector
  );

  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(
    possiblySelectedIndex
  );

  const continueOnPress = () => {
    if (selectedIndex === undefined) {
      return null;
    }
    machine.send("SELECT_MULTI_CONSENT", {
      data: {
        _type: currentPrerequisite._type,
        value: currentPrerequisite.value[selectedIndex],
        code: currentPrerequisite.code
      }
    });

    return null;
  };
  const goBack = () => machine.send("BACK");

  useNavigationSwipeBackListener(() => {
    machine.send({ type: "BACK", skipNavigation: true });
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
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.back"),
            onPress: goBack
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            onPress: continueOnPress,
            disabled: selectedIndex === undefined
          }
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
