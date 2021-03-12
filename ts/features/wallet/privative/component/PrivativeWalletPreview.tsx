import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Option } from "fp-ts/lib/Option";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  StyleProp
} from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { navigateToPrivativeDetailScreen } from "../../../../store/actions/navigation";
import { GlobalState } from "../../../../store/reducers/types";
import { PrivativePaymentMethod } from "../../../../types/pagopa";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { useImageResize } from "../../onboarding/bancomat/screens/hooks/useImageResize";
import { CardLayoutPreview } from "../../component/CardLayoutPreview";
import unknownGdo from "../../../../../img/wallet/unknown-gdo.png";

type OwnProps = {
  privative: PrivativePaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const BASE_IMG_W = 160;
const BASE_IMG_H = 20;

const fallbackGdoLogo: React.ReactElement = (
  <Image
    source={unknownGdo}
    style={{ width: 40, height: 40, resizeMode: "contain" }}
    key={"unknownLoyaltyLogo"}
    testID={"unknownLoyaltyLogo"}
  />
);

const renderRight = (props: Props, size: Option<[number, number]>) =>
  size.fold(fallbackGdoLogo, imgDim => {
    const imageUrl = props.privative.icon;

    const imageStyle: StyleProp<ImageStyle> = {
      width: imgDim[0],
      height: imgDim[1],
      resizeMode: "contain"
    };
    return (
      <Image
        source={imageUrl}
        style={imageStyle}
        key={"loyaltyLogo"}
        testID={"loyaltyLogo"}
      />
    );
  });

/**
 * Typeguard for handle backward compatibility of icon type
 * @param image
 */
const isImageURISource = (
  image: ImageSourcePropType
): image is ImageURISource =>
  typeof image !== "number" && (image as ImageURISource).uri !== undefined;

/**
 * A card preview for a privative card
 * @param props
 * @constructor
 */
const PrivativeWalletPreview: React.FunctionComponent<Props> = props => {
  const rightElement = isImageURISource(props.privative.icon)
    ? renderRight(
        props,
        useImageResize(BASE_IMG_W, BASE_IMG_H, props.privative.icon.uri)
      )
    : fallbackGdoLogo;

  return (
    <CardLayoutPreview
      left={
        <Body style={IOStyles.flex} numberOfLines={1} testID={"caption"}>
          {props.privative.caption}
        </Body>
      }
      right={rightElement}
      onPress={() => props.navigateToPrivativeDetails(props.privative)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPrivativeDetails: (privative: PrivativePaymentMethod) =>
    dispatch(navigateToPrivativeDetailScreen(privative))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeWalletPreview);
