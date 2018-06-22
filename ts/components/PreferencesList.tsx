import { List, View } from "native-base";
import * as React from "react";
import PreferenceItem from "./PreferenceItem";

type ownProps = {
  preferences: ReadonlyArray<any>;
};

type Props = ownProps;

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
