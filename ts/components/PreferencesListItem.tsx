import * as React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../i18n";
import { TestID } from "../types/WithTestID";
import { LabelSmall } from "./core/typography/LabelSmall";
import { IOStyles } from "./core/variables/IOStyles";
import { NewH6 } from "./core/typography/NewH6";

type MoreInfoProps = {
  moreInfoText: string | React.ReactNode;
  moreInfoTap: () => void;
};

type Props = {
  title: string;
  description: string | React.ReactNode;
  moreInfo?: MoreInfoProps;
  rightElement: React.ReactNode;
} & TestID;

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  left: {
    ...IOStyles.flex,
    paddingRight: 8
  }
});

/**
 * The base layout for a preference list item, with a title, a subtitle and a right element
 * (e.g. a switch).
 * @param props
 * @constructor
 */
export const PreferencesListItem = (props: Props): React.ReactElement => (
  <View style={styles.row} testID={props.testID}>
    <View style={styles.left}>
      <NewH6>{props.title}</NewH6>
      <LabelSmall weight="Regular" color="grey-700">
        {props.description}
      </LabelSmall>
      {props.moreInfo && (
        <NewH6
          weight={"Regular"}
          color={"bluegrey"}
          accessibilityRole="link"
          accessibilityHint={I18n.t("accessibility.doubleTapToActivateHint")}
          onPress={props.moreInfo.moreInfoTap}
        >
          <LabelSmall accessibilityRole="link">
            {props.moreInfo.moreInfoText}
          </LabelSmall>
        </NewH6>
      )}
    </View>
    {props.rightElement}
  </View>
);
