import { View } from "native-base";
import { useReducer } from "react";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { H1 } from "../../../../../../components/core/typography/H1";
import { Label } from "../../../../../../components/core/typography/Label";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import { Body } from "../../../../../../components/core/typography/Body";
import { Link } from "../../../../../../components/core/typography/Link";
import { DeclarationEntry } from "./DeclarationEntry";

type OwnProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

type PersonalUse = {
  normal: string;
  bold: string;
};

type InnerAction = "increment" | "decrement";

const loadLocales = () => ({
  title: I18n.t("bonus.bpd.title"),
  header: I18n.t("bonus.bpd.onboarding.declaration.header"),
  age: I18n.t("bonus.bpd.onboarding.declaration.conditions.age"),
  resident: I18n.t("bonus.bpd.onboarding.declaration.conditions.resident"),
  personal_use: {
    normal: I18n.t(
      "bonus.bpd.onboarding.declaration.conditions.personal_use.normal"
    ),
    bold: I18n.t(
      "bonus.bpd.onboarding.declaration.conditions.personal_use.bold"
    )
  },
  disclaimer: {
    normal: I18n.t("bonus.bpd.onboarding.declaration.disclaimer.normal"),
    link: I18n.t("bonus.bpd.onboarding.declaration.disclaimer.link")
  }
});

/**
 * Need a specific rendering of this component because have some bold parts
 * @param personalUse
 */
const personalUseText = (personalUse: PersonalUse) => (
  <Body>
    {personalUse.normal}
    <Label color={"bluegrey"}>{personalUse.bold}</Label>
  </Body>
);

const generateRequiredConditions = (
  list: ReadonlyArray<string | React.ReactNode>,
  dispatch: React.Dispatch<InnerAction>
) =>
  list.map((condition, index) => (
    <DeclarationEntry
      text={condition}
      key={index}
      onValueChange={newValue => dispatch(newValue ? "increment" : "decrement")}
    />
  ));

function reducer(state: number, action: InnerAction) {
  switch (action) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    default:
      throw new Error();
  }
}

/**
 * This screen allows the user to declare the required conditions.
 * When all the condition are accepted, the continue button will be enabled
 */
export const DeclarationComponent: React.FunctionComponent<OwnProps> = props => {
  const {
    title,
    header,
    age,
    resident,
    personal_use,
    disclaimer
  } = loadLocales();

  // tracks the condition accepted, used to enabled the "continue" button
  const [state, dispatch] = useReducer(reducer, 0);

  // transform the required textual conditions to graphical objects with checkbox
  const requiredConditions = [age, resident, personalUseText(personal_use)];

  return (
    <BaseScreenComponent goBack={props.onCancel} headerTitle={title}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <View spacer={true} large={true} />
            <H1>{header}</H1>
            <View spacer={true} extralarge={true} />
            {generateRequiredConditions(requiredConditions, dispatch)}
            <View spacer={true} small={true} />
            <InfoBox>
              <Body>
                {disclaimer.normal}
                <Link>{disclaimer.link}</Link>
              </Body>
            </InfoBox>
          </View>
        </ScrollView>
        <FooterTwoButtons
          rightDisabled={state !== requiredConditions.length}
          onCancel={props.onCancel}
          onRight={props.onConfirm}
          title={I18n.t("global.buttons.continue")}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
