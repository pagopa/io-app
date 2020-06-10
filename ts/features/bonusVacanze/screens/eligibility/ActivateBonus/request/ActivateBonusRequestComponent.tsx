import { List, Separator, View } from "native-base";
import * as React from "react";
import { StyleSheet, Text } from "react-native";
import { FamilyMember } from "../../../../../../../definitions/bonus_vacanze/FamilyMember";
import ItemSeparatorComponent from "../../../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../../../components/screens/ListItemComponent";
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
  body: {
    flex: 1
  },
  padding: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  }
});

/**
 * This component displays generic information about the bonus, including the {@link Props.bonusAmount} and
 * the {@link Props.familyMembers}.
 * @param props
 * @constructor
 */
export const ActivateBonusRequestComponent: React.FunctionComponent<
  Props
> = props => {
  const headerTitle = I18n.t(
    "bonus.bonusVacanza.eligibility.activateBonus.headerTitle"
  );
  const activateBonusText = I18n.t(
    "bonus.bonusVacanza.eligibility.activateBonus.activateCTA"
  );

  return (
    <BaseScreenComponent goBack={true} headerTitle={headerTitle}>
      <View style={styles.body}>
        <BonusCompositionDetails
          bonusAmount={props.bonusAmount}
          taxBenefit={props.taxBenefit}
        />
        <View spacer={true} />
        <ItemSeparatorComponent />
        <View spacer={true} />
        <FamilyComposition familyMembers={props.familyMembers} />
      </View>
      <FooterTwoButtons
        onCancel={props.onCancel}
        onRight={props.onRequestBonus}
        title={activateBonusText}
      />
    </BaseScreenComponent>
  );
};
