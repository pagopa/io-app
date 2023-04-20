import * as React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { FamilyMember } from "../../../../../../../definitions/bonus_vacanze/FamilyMember";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../../../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../../../../../components/screens/EdgeBorderComponent";
import I18n from "../../../../../../i18n";
import { BonusCompositionDetails } from "../../../components/keyValueTable/BonusCompositionDetails";
import { FamilyComposition } from "../../../components/keyValueTable/FamilyComposition";
import { FooterTwoButtons } from "../../../components/markdown/FooterTwoButtons";
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
    "bonus.bonusVacanze.eligibility.activateBonus.headerTitle"
  ),
  title: I18n.t("bonus.bonusVacanze.eligibility.activateBonus.title"),
  description: I18n.t(
    "bonus.bonusVacanze.eligibility.activateBonus.description"
  ),
  discrepancies: {
    attention: I18n.t(
      "bonus.bonusVacanze.eligibility.activateBonus.discrepancies.attention"
    ),
    text: I18n.t(
      "bonus.bonusVacanze.eligibility.activateBonus.discrepancies.text"
    )
  },
  reminder: I18n.t(
    "bonus.bonusVacanze.eligibility.activateBonus.reminder.text"
  ),
  activateBonusText: I18n.t(
    "bonus.bonusVacanze.eligibility.activateBonus.activateCTA"
  )
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "bonus.bonusVacanze.eligibility.activateBonus.contextualHelp.title",
  body: "bonus.bonusVacanze.eligibility.activateBonus.contextualHelp.body"
};

/**
 * This component displays generic information about the bonus, including the {@link Props.bonusAmount} and
 * the {@link Props.familyMembers}.
 * In order to represent the discrepancy box as in design (full width color), each element
 * have the horizontal padding, instead to assign the padding to the main container.
 * @param props
 * @constructor
 */
export const ActivateBonusRequestComponent: React.FunctionComponent<Props> =
  props => {
    const {
      headerTitle,
      title,
      description,
      discrepancies,
      reminder,
      activateBonusText
    } = loadLocales();

    return (
      <BaseScreenComponent
        goBack={props.onCancel}
        headerTitle={headerTitle}
        faqCategories={
          props.hasDiscrepancies
            ? ["bonus_eligible", "bonus_eligible_discrepancies"]
            : ["bonus_eligible"]
        }
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView>
            <View style={IOStyles.horizontalContentPadding}>
              <VSpacer size={24} />
              <ActivateBonusTitle
                title={title}
                description={description}
                image={props.logo}
              />
              <VSpacer size={24} />
              <BonusCompositionDetails
                bonusAmount={props.bonusAmount}
                taxBenefit={props.taxBenefit}
              />
              <VSpacer size={16} />
            </View>

            {props.hasDiscrepancies ? (
              <ActivateBonusDiscrepancies
                text={discrepancies.text}
                attention={discrepancies.attention}
              />
            ) : (
              <ItemSeparatorComponent />
            )}
            <View style={IOStyles.horizontalContentPadding}>
              <VSpacer size={16} />
              {props.familyMembers.length > 0 && (
                <>
                  <FamilyComposition familyMembers={props.familyMembers} />
                  <VSpacer size={16} />
                  <ItemSeparatorComponent />
                  <VSpacer size={16} />
                </>
              )}

              <ActivateBonusReminder text={reminder} />
              <EdgeBorderComponent />
            </View>
          </ScrollView>
          <FooterTwoButtons
            onCancel={props.onCancel}
            onRight={props.onRequestBonus}
            rightText={activateBonusText}
          />
        </SafeAreaView>
      </BaseScreenComponent>
    );
  };
