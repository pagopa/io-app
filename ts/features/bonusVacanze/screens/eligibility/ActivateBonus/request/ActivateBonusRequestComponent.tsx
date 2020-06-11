import { H3, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { FamilyMember } from "../../../../../../../definitions/bonus_vacanze/FamilyMember";
import ItemSeparatorComponent from "../../../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import H5 from "../../../../../../components/ui/H5";
import IconFont from "../../../../../../components/ui/IconFont";
import I18n from "../../../../../../i18n";
import themeVariables from "../../../../../../theme/variables";
import { BonusCompositionDetails } from "../../../../components/keyValueTable/BonusCompositionDetails";
import { FamilyComposition } from "../../../../components/keyValueTable/FamilyComposition";
import { FooterTwoButtons } from "../../../../components/markdown/FooterTwoButtons";

type Props = {
  familyMembers: ReadonlyArray<FamilyMember>;
  bonusAmount: number;
  taxBenefit: number;
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
  reminderSpacer: {
    width: 12
  },
  image: {
    width: 48,
    height: 48
  },
  body: {
    flex: 1
  },
  padding: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  }
});

const bonusVacanzeImage = require("../../../../../../../img/bonus/bonusVacanze/vacanze.png");

export const loadLocales = () => ({
  headerTitle: I18n.t(
    "bonus.bonusVacanza.eligibility.activateBonus.headerTitle"
  ),
  title: I18n.t("bonus.bonusVacanza.eligibility.activateBonus.title"),
  description: I18n.t(
    "bonus.bonusVacanza.eligibility.activateBonus.description"
  ),
  reminder: I18n.t("bonus.bonusVacanza.eligibility.activateBonus.reminder"),
  activateBonusText: I18n.t(
    "bonus.bonusVacanza.eligibility.activateBonus.activateCTA"
  )
});

/**
 * display the title of the screen with an image on the right and a description
 */
export const renderTitle = (title: string, description: string) => (
  <View style={styles.padding}>
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

export const renderReminder = (text: string) => (
  <View style={styles.padding}>
    <View style={[styles.reminderRow]}>
      <IconFont
        name={"io-titolare"}
        size={24}
        color={themeVariables.lightGray}
      />
      <View style={styles.reminderSpacer} />
      <Text style={styles.reminder}>{text}</Text>
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
    reminder,
    activateBonusText
  } = loadLocales();

  return (
    <BaseScreenComponent goBack={true} headerTitle={headerTitle}>
      <View style={styles.body}>
        <View spacer={true} large={true} />
        {renderTitle(title, description)}
        <View spacer={true} large={true} />
        <BonusCompositionDetails
          bonusAmount={props.bonusAmount}
          taxBenefit={props.taxBenefit}
        />
        <View spacer={true} />
        <ItemSeparatorComponent />
        <View spacer={true} />
        <FamilyComposition familyMembers={props.familyMembers} />
        <View spacer={true} />
        <ItemSeparatorComponent />
        <View spacer={true} />
        {renderReminder(reminder)}
      </View>
      <FooterTwoButtons
        onCancel={props.onCancel}
        onRight={props.onRequestBonus}
        title={activateBonusText}
      />
    </BaseScreenComponent>
  );
};
