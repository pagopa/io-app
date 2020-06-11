import { H3, Text, View } from "native-base";
import * as React from "react";
import { Image, ScrollView, StyleSheet } from "react-native";
import { FamilyMember } from "../../../../../../../definitions/bonus_vacanze/FamilyMember";
import ItemSeparatorComponent from "../../../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import H5 from "../../../../../../components/ui/H5";
import IconFont from "../../../../../../components/ui/IconFont";
import { openLink } from "../../../../../../components/ui/Markdown/handlers/link";
import I18n from "../../../../../../i18n";
import themeVariables from "../../../../../../theme/variables";
import { BonusCompositionDetails } from "../../../../components/keyValueTable/BonusCompositionDetails";
import { FamilyComposition } from "../../../../components/keyValueTable/FamilyComposition";
import { FooterTwoButtons } from "../../../../components/markdown/FooterTwoButtons";

type Props = {
  familyMembers: ReadonlyArray<FamilyMember>;
  bonusAmount: number;
  taxBenefit: number;
  hasDiscrepancies: boolean;
  onCancel: () => void;
  onRequestBonus: () => void;
};

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  reminderRow: {
    flexDirection: "row"
  },
  reminder: {
    fontSize: themeVariables.fontSizeSmall,
    color: themeVariables.lightGray,
    flex: 1
  },
  discrepanciesBox: {
    backgroundColor: themeVariables.brandHighlight
  },
  discrepancies: {
    fontSize: themeVariables.fontSizeSmall,
    color: themeVariables.colorWhite,
    flex: 1
  },
  link: {
    color: themeVariables.textLinkColor
  },
  image: {
    width: 48,
    height: 48
  },
  body: {
    flex: 1
  },
  paddingWidth: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  },
  paddingHeight: {
    paddingTop: themeVariables.spacerHeight,
    paddingBottom: themeVariables.spacerHeight
  }
});

const bonusVacanzeImage = require("../../../../../../../img/bonus/bonusVacanze/vacanze.png");
const inpsCustomerCareLink =
  "https://www.inps.it/nuovoportaleinps/default.aspx?imenu=24";

export const loadLocales = () => ({
  headerTitle: I18n.t(
    "bonus.bonusVacanza.eligibility.activateBonus.headerTitle"
  ),
  title: I18n.t("bonus.bonusVacanza.eligibility.activateBonus.title"),
  description: I18n.t(
    "bonus.bonusVacanza.eligibility.activateBonus.description"
  ),
  discrepancies: {
    attention: I18n.t(
      "bonus.bonusVacanza.eligibility.activateBonus.discrepancies.attention"
    ),
    text: I18n.t(
      "bonus.bonusVacanza.eligibility.activateBonus.discrepancies.text"
    )
  },
  reminder: {
    text: I18n.t("bonus.bonusVacanza.eligibility.activateBonus.reminder.text"),
    link: I18n.t("bonus.bonusVacanza.eligibility.activateBonus.reminder.link")
  },
  activateBonusText: I18n.t(
    "bonus.bonusVacanza.eligibility.activateBonus.activateCTA"
  )
});

/**
 * display the title of the screen with an image on the right and a description
 */
export const renderTitle = (title: string, description: string) => (
  <View style={styles.paddingWidth}>
    <View style={styles.titleRow}>
      <H3>{title}</H3>
      <Image
        source={bonusVacanzeImage}
        resizeMode={"contain"}
        style={styles.image}
      />
    </View>
    <View style={styles.titleRow}>
      <H5>{description}</H5>
      <View style={styles.image} />
    </View>
  </View>
);

type Reminder = {
  text: string;
  link: string;
};

export const renderReminder = (reminder: Reminder) => (
  <View style={styles.paddingWidth}>
    <View style={[styles.reminderRow]}>
      <IconFont
        name={"io-titolare"}
        size={24}
        color={themeVariables.lightGray}
      />
      <View hspacer={true} />
      <Text style={styles.reminder}>
        {`${reminder.text} `}
        <Text
          style={[styles.discrepancies, styles.link]}
          link={true}
          onPress={() => openLink(inpsCustomerCareLink)}
        >
          {reminder.link}
        </Text>
      </Text>
    </View>
  </View>
);

type Discrepancy = {
  text: string;
  attention: string;
};

export const renderDiscrepancies = (discrepancy: Discrepancy) => (
  <View
    style={[styles.paddingWidth, styles.paddingHeight, styles.discrepanciesBox]}
  >
    <View style={[styles.reminderRow]}>
      <IconFont
        name={"io-notice"}
        size={24}
        color={themeVariables.colorWhite}
      />
      <View hspacer={true} />
      <Text style={styles.discrepancies}>
        <Text bold={true} style={styles.discrepancies}>
          {`${discrepancy.attention} `}
        </Text>
        {discrepancy.text}
      </Text>
    </View>
  </View>
);

/**
 * This component displays generic information about the bonus, including the {@link Props.bonusAmount} and
 * the {@link Props.familyMembers}.
 * @param props
 * @constructor
 */
export const ActivateBonusRequestComponent: React.FunctionComponent<
  Props
> = props => {
  const {
    headerTitle,
    title,
    description,
    discrepancies,
    reminder,
    activateBonusText
  } = loadLocales();

  return (
    <BaseScreenComponent goBack={true} headerTitle={headerTitle}>
      <ScrollView style={styles.body}>
        <View spacer={true} large={true} />
        {renderTitle(title, description)}
        <View spacer={true} large={true} />
        <BonusCompositionDetails
          bonusAmount={props.bonusAmount}
          taxBenefit={props.taxBenefit}
        />
        <View spacer={true} />
        {props.hasDiscrepancies ? (
          renderDiscrepancies(discrepancies)
        ) : (
          <ItemSeparatorComponent />
        )}

        <View spacer={true} />
        <FamilyComposition familyMembers={props.familyMembers} />
        <View spacer={true} />
        <ItemSeparatorComponent />
        <View spacer={true} />
        {renderReminder(reminder)}
      </ScrollView>
      <FooterTwoButtons
        onCancel={props.onCancel}
        onRight={props.onRequestBonus}
        title={activateBonusText}
      />
    </BaseScreenComponent>
  );
};
