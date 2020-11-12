/**
 * This component displays a list of attempts of payment instrument onboarding
 */
import { Content, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { PaymentHistory } from "../../../store/reducers/payments/history";
import variables from "../../../theme/variables";
import I18n from "../../../i18n";
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

type Props = Readonly<{
  title: string;
  creditCardAttempts: CreditCardInsertionState;
  navigateToPaymentHistoryDetail: (payment: PaymentHistory) => void;
  ListEmptyComponent: React.ReactNode;
}>;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: variables.colorWhite,
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

const FOUR_UNICODE_CIRCLES = "●".repeat(4);
const notAvailable = I18n.t("global.remoteStates.notAvailable");
const ICON_WIDTH = 24;
export const CreditCardAttemptsList: React.FC<Props> = (props: Props) => {
  const { ListEmptyComponent, creditCardAttempts } = props;
  const renderCreditCardAttempt = (
    info: ListRenderItemInfo<CreditCardInsertion>
  ) => {
    const attempt = info.item;
    const conditionalData = attempt.onboardingComplete
      ? {
          color: "green",
          header: I18n.t("payment.details.state.successful")
        }
      : { color: "red", header: I18n.t("payment.details.state.failed") };
    const startDate = new Date(attempt.startDate);
    const data = {
      when: `${formatDateAsLocal(
        startDate,
        true,
        true
      )} - ${startDate.toLocaleTimeString()}`,
      ...conditionalData
    };
    return (
      <View style={{ flex: 1 }}>
        <TouchableDefaultOpacity
          onPress={undefined}
          style={itemStyles.verticalPad}
        >
          <View style={{ flexDirection: "row", flex: 1 }}>
            <View style={{ flex: 1 }}>
              <View style={itemStyles.spaced}>
                <BadgeComponent color={data.color} />
                <Label color={"bluegrey"} style={itemStyles.text11}>
                  {data.header}
                </Label>
              </View>
              <Text>{data.when}</Text>
              <View small={true} />
              <Label color={"bluegrey"} weight={"Regular"}>
                {`${FOUR_UNICODE_CIRCLES} ${attempt.blurredPan}\n ${I18n.t(
                  "cardComponent.validUntil"
                )}  ${attempt.expireMonth}/${attempt.expireYear}`}
              </Label>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "flex-end"
              }}
            >
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
          <Text>{props.title}</Text>
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
