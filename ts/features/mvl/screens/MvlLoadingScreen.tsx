import * as React from "react";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { MessageLoading } from "../../messages/components/MessageLoading";

type Props = unknown;

/**
 * The loading of the MVL remote data
 * @param _
 * @constructor
 */
export const MvlLoadingScreen = (_: Props): React.ReactElement => (
  <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
    <SafeAreaView style={IOStyles.flex} testID={"MvlLoadingScreen"}>
      <MessageLoading />
    </SafeAreaView>
  </BaseScreenComponent>
);
