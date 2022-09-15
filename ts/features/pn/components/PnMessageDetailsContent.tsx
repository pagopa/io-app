import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { H1 } from "../../../components/core/typography/H1";
import { H2 } from "../../../components/core/typography/H2";
import { PNMessage } from "../store/types/types";
import customVariables from "../../../theme/variables";
import { isStringNullyOrEmpty } from "../../../utils/strings";

const styles = StyleSheet.create({
  subject: {
    marginTop: customVariables.spacerExtrasmallHeight
  },
  abstract: {
    marginTop: customVariables.spacerExtrasmallHeight
  }
});

type Props = Readonly<{ message: PNMessage }>;

export const PnMessageDetailsContent = (props: Props & ViewProps) => (
  <View style={props.style}>
    {!isStringNullyOrEmpty(props.message.senderDenomination) && (
      <H2>{props.message.senderDenomination}</H2>
    )}
    <H1 style={styles.subject}>{props.message.subject}</H1>
    {!isStringNullyOrEmpty(props.message.abstract) && (
      <Body style={styles.abstract}>{props.message.abstract}</Body>
    )}
  </View>
);
