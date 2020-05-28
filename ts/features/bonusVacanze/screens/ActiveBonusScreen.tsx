import { List, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import ScreenContent from "../../../components/screens/ScreenContent";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../utils/stringBuilder";
import { BonusStatusEnum, BonusVacanzaMock } from "../mock/mockData";
import { mockedIseeFamilyMembers } from "../mock/mockData";
import { FamilyMember } from "../types/eligibility";
import ListItemComponent from "../../../components/screens/ListItemComponent";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";

type NavigationParams = Readonly<{
  bonus: BonusVacanzaMock;
}>;

type Props = NavigationInjectedProps<NavigationParams>;

const styles = StyleSheet.create({
  image: {
    resizeMode: "contain",
    width: 300,
    height: 300,
    alignSelf: "center"
  },
  code: {
    alignSelf: "center"
  },
  rowBlock: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  paddedContent: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

const ActiveBonusScreen: React.FunctionComponent<Props> = (props: Props) => {
  const bonus = props.navigation.getParam("bonus");
  const bonusValidityInterval = `${formatDateAsLocal(
    bonus.valid_from,
    true
  )} - ${formatDateAsLocal(bonus.valid_to, true)}`;

  const status =
    bonus.status === BonusStatusEnum.ACTIVE
      ? I18n.t("bonus.active")
      : I18n.t("bonus.inactive");

  return (
    <BaseScreenComponent goBack={true} headerTitle="Bonus Vacanze">
      <ScreenContent
        title={I18n.t("bonus.latestBonus")}
        subtitle={`${status} ${formatDateAsLocal(bonus.updated_at, true)}`}
      >
        <Image
          style={styles.image}
          source={{
            uri: `data:image/png;base64,${bonus.qrCode.base64_content}`
          }}
        />
        <Text style={styles.code}>{bonus.code}</Text>
        <View spacer={true} />
        <View style={styles.paddedContent}>
          <View style={styles.rowBlock}>
            <Text bold={true}>{I18n.t("wallet.amount")}</Text>
            <Text>
              {formatNumberAmount(centsToAmount(bonus.max_amount), true)}
            </Text>
          </View>
          <View style={styles.rowBlock}>
            <Text bold={true}>{I18n.t("bonus.bonusVacanza.taxBenefit")}</Text>
            <Text>{formatNumberAmount(centsToAmount(bonus.tax_benefit))}</Text>
          </View>
          <View style={styles.rowBlock}>
            <Text bold={true}>{I18n.t("bonus.bonusVacanza.validity")}</Text>
            <Text>{bonusValidityInterval}</Text>
          </View>
          <View spacer={true} />
          <Text bold={true}>{I18n.t("bonus.bonusVacanza.familyMembers")}</Text>
          <List>
            {mockedIseeFamilyMembers
              .map(
                (familyMember: FamilyMember) =>
                  `${familyMember.name} ${familyMember.surname} ${
                    familyMember.fiscal_code
                  }`
              )
              .map((displayName: string) => (
                <ListItemComponent
                  key={displayName}
                  title={displayName}
                  hideIcon={true}
                />
              ))}
          </List>
        </View>
        <EdgeBorderComponent />
      </ScreenContent>
    </BaseScreenComponent>
  );
};

export default ActiveBonusScreen;
