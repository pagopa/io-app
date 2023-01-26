import { Content, Text as NBText } from "native-base";
import * as React from "react";
import { View, FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import I18n from "../../../i18n";
import { FOUR_UNICODE_CIRCLES } from "../../../utils/wallet";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";
import { EdgeBorderComponent } from "../../screens/EdgeBorderComponent";
import { formatDateAsLocal } from "../../../utils/dates";
import {
  CreditCardInsertion,
  CreditCardInsertionState
} from "../../../store/reducers/wallet/creditCard";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import { BadgeComponent } from "../../screens/BadgeComponent";
import IconFont from "../../ui/IconFont";
import customVariables from "../../../theme/variables";
import { Label } from "../../core/typography/Label";
import { IOStyles } from "../../core/variables/IOStyles";
import { IOColors } from "../../core/variables/IOColors";
import { VSpacer } from "../../core/spacer/Spacer";

type Props = Readonly<{
  title: string;
  creditCardAttempts: CreditCardInsertionState;
  onAttemptPress: (attempt: CreditCardInsertion) => void;
  ListEmptyComponent: React.ReactNode;
}>;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: IOColors.white,
    flex: 1
  },
  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  }
});

const itemStyles = StyleSheet.create({
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  },
  spaced: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center"
  },
  text11: {
    paddingLeft: 8
  },
  icon: {
    width: 64,
    alignItems: "flex-end",
    alignContent: "center",
    alignSelf: "center",
    justifyContent: "center"
  }
});

const ICON_WIDTH = 24;
const labelColor = "bluegrey";
export const getPanDescription = (attempt: CreditCardInsertion) =>
  `${FOUR_UNICODE_CIRCLES} ${attempt.blurredPan}\n ${I18n.t(
    "cardComponent.validUntil"
  ).toLowerCase()} ${attempt.expireMonth}/${attempt.expireYear}`;

const getAttemptData = (attempt: CreditCardInsertion) => {
  const conditionalData = attempt.onboardingComplete
    ? {
        color: "green",
        header: I18n.t("wallet.creditCard.onboardingAttempts.success")
      }
    : {
        color: "red",
        header: I18n.t("wallet.creditCard.onboardingAttempts.failure")
      };
  const startDate = new Date(attempt.startDate);
  const when = `${formatDateAsLocal(
    startDate,
    true,
    true
  )} - ${startDate.toLocaleTimeString()}`;
  return {
    panAndExpiringDate: getPanDescription(attempt),
    when,
    ...conditionalData
  };
};

/**
 * This component shows a list with the last credit card onboarding attempts
 */
export const CreditCardAttemptsList: React.FC<Props> = (props: Props) => {
  const { ListEmptyComponent, creditCardAttempts } = props;
  const renderCreditCardAttempt = (
    info: ListRenderItemInfo<CreditCardInsertion>
  ) => {
    const attemptData = getAttemptData(info.item);
    return (
      <View style={IOStyles.flex}>
        <TouchableDefaultOpacity
          onPress={() => props.onAttemptPress(info.item)}
          style={itemStyles.verticalPad}
        >
          <View style={[IOStyles.flex, IOStyles.row]}>
            <View style={IOStyles.flex}>
              <View style={itemStyles.spaced}>
                <BadgeComponent color={attemptData.color} />
                <Label color={labelColor} style={itemStyles.text11}>
                  {attemptData.header}
                </Label>
              </View>
              <VSpacer size={8} />
              <Label color={labelColor} weight={"Regular"}>
                {attemptData.panAndExpiringDate}
              </Label>
              <Label color={labelColor} weight={"Regular"}>
                {attemptData.when}
              </Label>
            </View>
            <View style={itemStyles.icon}>
              <IconFont
                name={"io-right"}
                size={ICON_WIDTH}
                color={customVariables.contentPrimaryBackground}
              />
            </View>
          </View>
        </TouchableDefaultOpacity>
      </View>
    );
  };

  return (
    <Content style={styles.whiteContent}>
      <View>
        <View style={styles.subHeaderContent}>
          <NBText>{props.title}</NBText>
        </View>
      </View>

      <FlatList
        scrollEnabled={false}
        data={creditCardAttempts}
        renderItem={renderCreditCardAttempt}
        ListEmptyComponent={ListEmptyComponent}
        ItemSeparatorComponent={() => (
          <ItemSeparatorComponent noPadded={true} />
        )}
        ListFooterComponent={
          creditCardAttempts.length > 0 && <EdgeBorderComponent />
        }
        keyExtractor={c => c.hashedPan}
      />
    </Content>
  );
};
