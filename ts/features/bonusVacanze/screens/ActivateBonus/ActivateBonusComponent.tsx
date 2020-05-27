import { string } from "io-ts";
import * as t from "io-ts";
import { List, View } from "native-base";
import * as React from "react";
import { StyleSheet, Text } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import ScreenContent from "../../../../components/screens/ScreenContent";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { FooterTwoButtons } from "../../components/markdown/FooterTwoButtons";

// TODO: temp definition, remove after merge with https://github.com/pagopa/io-app/pull/1849/
const FamilyMember = t.interface({
  name: string,
  surname: string
});
export type FamilyMember = t.TypeOf<typeof FamilyMember>;

type Props = {
  familyMembers: ReadonlyArray<FamilyMember>;
  bonusAmount: number;
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

const title = I18n.t("bonus.bonusVacanza.activateBonus.title");
const activateBonusText = title;

/**
 * Transform an object of type {@link FamilyMember} to a string representation
 * @param familyMember
 */
const familyMemberToDisplayName = (familyMember: FamilyMember) =>
  `${familyMember.name} ${familyMember.surname}`;

/**
 * Transform a string to a {@link ListItemComponent}, displaying information about a family member
 * @param displayName
 */
const familyMemberDisplayNameToRenderItem = (displayName: string) => (
  <ListItemComponent key={displayName} title={displayName} hideIcon={true} />
);

/**
 * Transform a list of object of type {@link FamilyMember} to a {@link List} containing foreach family member a
 * {@link ListItemComponent}
 * @param familyMembers
 */
const renderFamilyMembersList = (
  familyMembers: ReadonlyArray<FamilyMember>
) => (
  <List withContentLateralPadding={true}>
    {familyMembers
      .map(familyMemberToDisplayName)
      .map(familyMemberDisplayNameToRenderItem)}
  </List>
);

/**
 * This component displays generic information about the bonus, including the {@link Props.bonusAmount} and
 * the {@link Props.familyMembers}.
 * @param props
 * @constructor
 */
export const ActivateBonusComponent: React.FunctionComponent<Props> = props => {
  const description = I18n.t("bonus.bonusVacanza.activateBonus.description", {
    amount: props.bonusAmount
  });

  return (
    <BaseScreenComponent goBack={true} headerTitle={title}>
      <ScreenContent title={title} bounces={false}>
        <Text style={styles.padding}>{description}</Text>
        <View spacer={true} />
        {renderFamilyMembersList(props.familyMembers)}
      </ScreenContent>
      <FooterTwoButtons
        onCancel={props.onCancel}
        onRight={props.onRequestBonus}
        title={activateBonusText}
      />
    </BaseScreenComponent>
  );
};
