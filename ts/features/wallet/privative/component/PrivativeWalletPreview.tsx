import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Option } from "fp-ts/lib/Option";
import { Image, ImageStyle, StyleProp } from "react-native";
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

const renderRight = (props: Props, size: Option<[number, number]>) =>
  size.fold(
    <Image
      source={unknownGdo}
      style={{ width: 40, height: 40, resizeMode: "contain" }}
      key={"unknownGdoLogo"}
      testID={"unknownGdoLogo"}
    />,
    imgDim => {
      const imageUrl = props.privative?.cardLogo;

      const imageStyle: StyleProp<ImageStyle> = {
        width: imgDim[0],
        height: imgDim[1],
        resizeMode: "contain"
      };
      return imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={imageStyle}
          key={"gdoLogo"}
          testID={"gdoLogo"}
        />
      ) : (
        <Image
          source={unknownGdo}
          style={{ width: 40, height: 40, resizeMode: "contain" }}
          key={"unknownGdoLogo"}
          testID={"unknownGdoLogo"}
        />
      );
    }
  );
/**
 * A card preview for a privative card
 * @param props
 * @constructor
 */
const PrivativeWalletPreview: React.FunctionComponent<Props> = props => {
  const imgDimensions = useImageResize(
    BASE_IMG_W,
    BASE_IMG_H,
    props.privative.cardLogo
  );
  return (
    <CardLayoutPreview
      left={
        <Body style={IOStyles.flex} numberOfLines={1} testID={"caption"}>
          {props.privative.caption}
        </Body>
      }
      right={renderRight(props, imgDimensions)}
      onPress={() => props.navigateToCobadgeDetails(props.privative)}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToCobadgeDetails: (privative: PrivativePaymentMethod) =>
    dispatch(navigateToPrivativeDetailScreen(privative))
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivativeWalletPreview);
