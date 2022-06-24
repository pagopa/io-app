import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { PNMessage } from "../store/types/types";
import customVariables from "../../../theme/variables";
import { PnMessageDetailsContent } from "./PnMessageDetailsContent";
import { PnMessageDetailsHeader } from "./PnMessageDetailsHeader";

const styles = StyleSheet.create({
  content: {
    marginTop: customVariables.spacerHeight
  }
});

type Props = Readonly<{
  message: PNMessage;
  service: ServicePublic | undefined;
}>;

export const PnMessageDetails = (props: Props) => (
  <ScrollView style={[IOStyles.horizontalContentPadding]}>
    {props.service && <PnMessageDetailsHeader service={props.service} />}
    <PnMessageDetailsContent style={styles.content} message={props.message} />
  </ScrollView>
);
