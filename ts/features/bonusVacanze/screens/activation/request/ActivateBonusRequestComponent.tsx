import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { FamilyMember } from "../../../../../../definitions/bonus_vacanze/FamilyMember";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../../../components/screens/EdgeBorderComponent";
import I18n from "../../../../../i18n";
import { BonusCompositionDetails } from "../../../components/keyValueTable/BonusCompositionDetails";
import { FamilyComposition } from "../../../components/keyValueTable/FamilyComposition";
import { FooterTwoButtons } from "../../../components/markdown/FooterTwoButtons";
import { bonusVacanzaStyle } from "../../../components/Styles";
import { ActivateBonusDiscrepancies } from "./ActivateBonusDiscrepancies";
import { ActivateBonusReminder } from "./ActivateBonusReminder";
import { ActivateBonusTitle } from "./ActivateBonusTitle";

type Props = {
  familyMembers: ReadonlyArray<FamilyMember>;
  bonusAmount: number;
  taxBenefit: number;
  hasDiscrepancies: boolean;
  logo?: string;
  onCancel: () => void;
  onRequestBonus: () => void;
};

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
 * This component displays generic information about the bonus, including the {@link Props.bonusAmount} and
 * the {@link Props.familyMembers}.
 * In order to represent the discrepancy box as in design (full width color), each element
 * have the horizontal padding, instead to assign the padding to the main container.
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
    <BaseScreenComponent goBack={props.onCancel} headerTitle={headerTitle}>
      <SafeAreaView style={bonusVacanzaStyle.flex}>
        <ScrollView>
          <View style={bonusVacanzaStyle.horizontalPadding}>
            <View spacer={true} large={true} />
            <ActivateBonusTitle
              title={title}
              description={description}
              image={props.logo}
            />
            <View spacer={true} large={true} />
            <BonusCompositionDetails
              bonusAmount={props.bonusAmount}
              taxBenefit={props.taxBenefit}
            />
            <View spacer={true} />
          </View>

          {props.hasDiscrepancies ? (
            <ActivateBonusDiscrepancies
              text={discrepancies.text}
              attention={discrepancies.attention}
            />
          ) : (
            <ItemSeparatorComponent />
          )}
          <View style={bonusVacanzaStyle.horizontalPadding}>
            <View spacer={true} />
            {props.familyMembers.length > 0 && (
              <>
                <FamilyComposition familyMembers={props.familyMembers} />
                <View spacer={true} />
                <ItemSeparatorComponent />
                <View spacer={true} />
              </>
            )}

            <ActivateBonusReminder text={reminder.text} link={reminder.link} />
            <EdgeBorderComponent />
          </View>
        </ScrollView>
        <FooterTwoButtons
          onCancel={props.onCancel}
          onRight={props.onRequestBonus}
          title={activateBonusText}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
