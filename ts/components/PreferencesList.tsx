import { List, View } from "native-base";
import * as React from "react";
import { PreferenceItem as PreferenceItemType } from "../types/PreferenceItem";
import PreferenceItem from "./PreferenceItem";

type OwnProps = {
  preferences: ReadonlyArray<PreferenceItemType>;
};

type Props = OwnProps;

/**
 * Component that implements the preference list of the preferences screen
 */
const PreferenceList: React.SFC<Props> = ({ preferences }) => (
  <View>
    <List>
      {preferences.map(preference => (
        <PreferenceItem key={preference.id} {...preference} />
      ))}
    </List>
  </View>
);

export default PreferenceList;
