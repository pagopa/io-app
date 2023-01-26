/* eslint-disable no-underscore-dangle */
import { useActor, useSelector } from "@xstate/react";
import { ListItem as NBListItem, View as NBView } from "native-base";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../components/ui/IconFont";
import I18n from "../../../../i18n";
import { useOnboardingMachineService } from "../xstate/provider";
import { multiRequiredCriteriaPageToDisplaySelector } from "../xstate/selectors";
import { useRoute } from "@react-navigation/native";

const styles = StyleSheet.create({
  maxheight: {
    height: "100%"
  }
});

type ListItemProps = {
  text: string;
  onPressProps: number;
  checked: boolean;
  onPress: (value: number) => void;
};

const CustomListItem = ({
  text,
  onPressProps,
  onPress,
  checked
}: ListItemProps) => (
  <NBListItem
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12
    }}
    onPress={() => onPress(onPressProps)}
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
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(
    undefined
  );
  const { params } = useRoute();
  console.log(params.page);
  const machine = useOnboardingMachineService();
  const continueOnPress = () => {
    if (selectedIndex === undefined) {
      return null;
    }
    machine.send("ADD_SELF_CONSENT", {
      data: {
        _type: currentPage._type,
        value: currentPage.value[selectedIndex],
        code: currentPage.code
      }
    });
    return null;
  };
  const currentPage = useSelector(
    machine,
    multiRequiredCriteriaPageToDisplaySelector
  );

  const goBack = () => null;

  return (
    <SafeAreaView style={IOStyles.flex}>
      <BaseScreenComponent
        goBack={goBack}
        headerTitle={I18n.t("idpay.onboarding.headerTitle")}
      >
        <View style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("idpay.onboarding.multiPrerequisites.header")}</H1>
          <NBView spacer={true} />
          <Body>{I18n.t("idpay.onboarding.multiPrerequisites.body")}</Body>
          <Link>{I18n.t("idpay.onboarding.multiPrerequisites.link")}</Link>
          <NBView spacer large />
          <H4>{currentPage.description}</H4>
          <ScrollView style={styles.maxheight}>
            {currentPage.value.map((requisite, index) => (
              <CustomListItem
                key={index}
                text={requisite}
                onPressProps={index}
                checked={index === selectedIndex}
                onPress={setSelectedIndex}
              />
            ))}
          </ScrollView>
        </View>
      </BaseScreenComponent>
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={{
          onPress: () => null,
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
