import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { PNMessage } from "../store/types/PNMessage";
import { PnMessageDetailsHeader } from "./PnMessageDetailsHeader";

type Props = Readonly<{
  message: PNMessage;
  service: ServicePublic | undefined;
}>;

export const PnMessageDetails = (props: Props) => (
  <ScrollView style={[IOStyles.horizontalContentPadding]}>
    {props.service && <PnMessageDetailsHeader service={props.service} />}
  </ScrollView>
);
