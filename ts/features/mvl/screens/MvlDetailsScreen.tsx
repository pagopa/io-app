import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { H1 } from "../../../components/core/typography/H1";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";

type Props = unknown;

/**
 * This screen displays all the details for a MVL:
 * - Body
 * - Attachments
 * - Metadata
 * @param _
 * @constructor
 */
export const MvlDetailsScreen = (_: Props): React.ReactElement => (
  <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
    <SafeAreaView style={IOStyles.flex} testID={"MVLDetailsScreen"}>
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <H1>MVLDetailsScreen</H1>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);
