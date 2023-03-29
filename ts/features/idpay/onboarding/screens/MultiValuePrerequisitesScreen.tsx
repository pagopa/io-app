/* eslint-disable no-underscore-dangle */
import { useSelector } from "@xstate/react";
import { ListItem as NBListItem } from "native-base";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../components/ui/IconFont";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { useOnboardingMachineService } from "../xstate/provider";
import {
  criteriaToDisplaySelector,
  prerequisiteAnswerIndexSelector
} from "../xstate/selectors";

const styles = StyleSheet.create({
  maxheight: {
    height: "100%"
  }
});

type ListItemProps = {
  text: string;
  checked: boolean;
  onPress: () => void;
};

const CustomListItem = ({ text, onPress, checked }: ListItemProps) => (
  <NBListItem
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12
    }}
    onPress={onPress}
  >
    <H4 weight={checked ? "SemiBold" : "Regular"} color={"bluegreyDark"}>
      {text}
    </H4>
    <IconFont
      name={checked ? "io-radio-on" : "io-radio-off"}
      size={22}
      color={checked ? IOColors.blue : IOColors.bluegrey}
    />
  </NBListItem>
);

const buttonProps = {
  leftButton: { title: I18n.t("global.buttons.back"), bordered: true },
  rightButton: {
    title: I18n.t("global.buttons.continue"),
    bordered: false
  }
};

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
  const goBack = () => machine.send("GO_BACK");

  useNavigationSwipeBackListener(() => {
    machine.send({ type: "GO_BACK", skipNavigation: true });
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

export default MultiValuePrerequisitesScreen;
