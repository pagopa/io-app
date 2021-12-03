import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";

type Props = unknown;

/**
 * This screen displays the recipients for a MVL
 * @param _
 * @constructor
 */
export const MvlRecipientsScreen = (_: Props): React.ReactElement => (
  <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
    <SafeAreaView style={IOStyles.flex} testID={"MvlRecipientsScreen"}>
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <H1>TMP MvlRecipientsScreen</H1>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);
