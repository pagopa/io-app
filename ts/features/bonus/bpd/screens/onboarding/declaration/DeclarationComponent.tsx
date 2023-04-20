import * as React from "react";
import { useReducer } from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { Label } from "../../../../../../components/core/typography/Label";
import { Link } from "../../../../../../components/core/typography/Link";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { openWebUrl } from "../../../../../../utils/url";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";
import { dpr28Dec2000Url } from "../../../../../../urls";
import { DeclarationEntry } from "./DeclarationEntry";

type OwnProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

type Props = OwnProps &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;
type NormalBold = {
  normal: string;
  bold: string;
};

type InnerAction = "increment" | "decrement";

const loadLocales = () => ({
  title: I18n.t("bonus.bpd.title"),
  header: I18n.t("bonus.bpd.onboarding.declaration.header"),
  age: I18n.t("bonus.bpd.onboarding.declaration.conditions.age"),
  owner: {
    normal: I18n.t("bonus.bpd.onboarding.declaration.conditions.owner.normal"),
    bold: I18n.t("bonus.bpd.onboarding.declaration.conditions.owner.bold")
  },
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
    normal1: I18n.t("bonus.bpd.onboarding.declaration.disclaimer.normal1"),
    link: I18n.t("bonus.bpd.onboarding.declaration.disclaimer.link"),
    normal2: I18n.t("bonus.bpd.onboarding.declaration.disclaimer.normal2")
  },
  cta: I18n.t("bonus.bpd.onboarding.declaration.cta")
});

/**
 * Need a specific rendering of this component because have some bold parts
 * @param personalUse
 */
const normalBoldText = (personalUse: NormalBold) => (
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
export const DeclarationComponent: React.FunctionComponent<Props> = props => {
  const { title, header, age, owner, resident, personal_use, disclaimer, cta } =
    loadLocales();

  // tracks the condition accepted, used to enabled the "continue" button
  const [state, dispatch] = useReducer(reducer, 0);

  // transform the required textual conditions to graphical objects with checkbox
  const requiredConditions = [
    age,
    resident,
    normalBoldText(owner),
    normalBoldText(personal_use)
  ];

  return (
    <BaseScreenComponent
      goBack={props.onCancel}
      headerTitle={title}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <VSpacer size={24} />
            <H1>{header}</H1>
            <VSpacer size={40} />
            {generateRequiredConditions(requiredConditions, dispatch)}
            <VSpacer size={8} />
            <InfoBox>
              <Body>
                {disclaimer.normal1}
                <Link onPress={() => openWebUrl(dpr28Dec2000Url)}>
                  {disclaimer.link}
                </Link>
                {disclaimer.normal2}
              </Body>
            </InfoBox>
          </View>
        </ScrollView>
        <FooterTwoButtons
          rightDisabled={state !== requiredConditions.length}
          onCancel={props.onCancel}
          onRight={props.onConfirm}
          rightText={cta}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
