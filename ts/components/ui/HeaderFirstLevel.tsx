import * as React from "react";
import { View } from "react-native";
import { IOColors } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";
import { IOStyles, IOVisualCostants } from "../core/variables/IOStyles";
import { NewH3 } from "../core/typography/NewH3";
import { HSpacer } from "../core/spacer/Spacer";

export type HeaderFirstLevel = WithTestID<{
  title: string;
  // Accepted components: IconButton
  // Don't use any components other than this, please.
  firstAction?: React.ReactNode;
  secondAction?: React.ReactNode;
  thirdAction?: React.ReactNode;
}>;

export const HeaderFirstLevel = ({
  title,
  firstAction,
  secondAction,
  thirdAction,
  testID
}: HeaderFirstLevel) => (
  <View
    accessibilityRole="header"
    testID={testID}
    style={{
      backgroundColor: IOColors.white,
      paddingHorizontal: IOVisualCostants.appMarginDefault,
      height: IOVisualCostants.headerFirstLevelHeight,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    }}
  >
    <NewH3>{title}</NewH3>
    <View style={IOStyles.row}>
      {firstAction}
      {secondAction && (
        <>
          <HSpacer size={16} />
          {secondAction}
        </>
      )}
      {thirdAction && (
        <>
          <HSpacer size={16} />
          {thirdAction}
        </>
      )}
    </View>
  </View>
);

export default HeaderFirstLevel;
