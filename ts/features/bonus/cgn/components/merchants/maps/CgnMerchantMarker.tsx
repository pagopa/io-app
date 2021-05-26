import * as React from "react";
import { LatLng, Marker } from "react-native-maps";
import { H1 } from "../../../../../../components/core/typography/H1";

type Props = {
  coordinate: LatLng;
  category?: string;
};

const CgnMerchantMarker: React.FunctionComponent<Props> = (props: Props) => (
  <Marker coordinate={props.coordinate}>
    <H1>{"UN MARKER"}</H1>
  </Marker>
);

export default CgnMerchantMarker;
