import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { BrandImage } from "./BrandImage";
import { CardLayoutPreview } from "./CardLayoutPreview";

type Props = {
  left: React.ReactNode;
  image: ImageSourcePropType;
  onPress?: () => void;
};

/**
 * A preview card that shows as right section an image of fixed dimensions.
 * @param props
 * @constructor
 */
export const CardLogoPreview: React.FunctionComponent<Props> = props => (
  <CardLayoutPreview
    left={props.left}
    onPress={props.onPress}
    right={<BrandImage image={props.image} />}
  />
);
