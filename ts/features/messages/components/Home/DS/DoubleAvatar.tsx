import React from "react";
import {
  Image,
  ImageRequireSource,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";
import {
  IOColors,
  IOIconSizeScale,
  IOSpacingScale,
  IOVisualCostants,
  Icon,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { addCacheTimestampToUri } from "../../../../../utils/image";

type DoubleAvatarProps = {
  backgroundLogoUri?:
    | ImageRequireSource
    | ImageURISource
    | ReadonlyArray<ImageURISource>;
};

const avatarContainerSize: IOIconSizeScale = 30;
const avatarDoubleRadiusSizeSmall: number = 6;
const internalSpaceDefaultSize: number = 3;
const internalSpacePlaceholderDefaultSize: IOSpacingScale = 6;
const avatarBorderLightMode = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  topContainer: {
    height: IOVisualCostants.avatarSizeSmall,
    width: IOVisualCostants.avatarSizeSmall
  },
  avatarWrapper: {
    overflow: "hidden",
    borderColor: avatarBorderLightMode,
    borderWidth: 1,
    borderCurve: "continuous",
    position: "absolute"
  },
  avatarInnerWrapper: {
    overflow: "hidden",
    backgroundColor: IOColors.white,
    borderCurve: "continuous"
  },
  avatarImage: {
    resizeMode: "contain",
    height: "100%",
    width: "100%"
  }
});

/**
 * DoubleAvatar component is used to display the background logo of an organization, with a fixed pagoPA icon on top. It accepts the following props:
 * - `backgroundLogoUri`: the uri of the image to display. If not provided, a placeholder icon will be displayed. It can be a single uri or an array of uris, in which case the first one that is available will be used.
 * @param DoubleAvatarProps
 * @returns
 */
export const DoubleAvatar = ({ backgroundLogoUri }: DoubleAvatarProps) => {
  const theme = useIOTheme();
  const indexValue = React.useRef<number>(0);

  const [imageSource, setImageSource] = React.useState(
    backgroundLogoUri === undefined
      ? undefined
      : Array.isArray(backgroundLogoUri)
      ? addCacheTimestampToUri(backgroundLogoUri[0])
      : typeof backgroundLogoUri === "number"
      ? backgroundLogoUri
      : addCacheTimestampToUri(backgroundLogoUri as ImageURISource)
  );

  const onError = () => {
    if (
      Array.isArray(backgroundLogoUri) &&
      indexValue.current + 1 < backgroundLogoUri.length
    ) {
      // eslint-disable-next-line functional/immutable-data
      indexValue.current = indexValue.current + 1;
      setImageSource(
        addCacheTimestampToUri(backgroundLogoUri[indexValue.current])
      );
      return;
    }
    setImageSource(undefined);
  };

  return (
    <View style={styles.topContainer}>
      <View
        accessibilityIgnoresInvertColors
        style={[
          styles.avatarWrapper,
          {
            height: avatarContainerSize,
            width: avatarContainerSize,
            borderRadius: avatarDoubleRadiusSizeSmall,
            backgroundColor:
              imageSource === undefined ? IOColors["grey-50"] : IOColors.white,
            padding:
              imageSource === undefined
                ? internalSpacePlaceholderDefaultSize
                : internalSpaceDefaultSize,
            bottom: 0,
            right: 0
          }
        ]}
      >
        {imageSource === undefined ? (
          <Icon
            name="institution"
            color={theme["icon-decorative"]}
            size={"100%"}
          />
        ) : (
          <View
            style={[
              styles.avatarInnerWrapper,
              {
                borderRadius:
                  avatarDoubleRadiusSizeSmall - internalSpaceDefaultSize
              }
            ]}
          >
            <Image
              accessibilityIgnoresInvertColors
              source={imageSource}
              style={styles.avatarImage}
              onError={onError}
            />
          </View>
        )}
      </View>
      <View
        accessibilityIgnoresInvertColors
        style={[
          styles.avatarWrapper,
          {
            height: avatarContainerSize,
            width: avatarContainerSize,
            borderRadius: avatarDoubleRadiusSizeSmall,
            backgroundColor:
              imageSource === undefined ? IOColors["grey-50"] : IOColors.white,
            padding: 0,
            justifyContent: "center",
            alignItems: "center"
          }
        ]}
      >
        <View
          style={[
            styles.avatarInnerWrapper,
            {
              borderRadius:
                avatarDoubleRadiusSizeSmall - internalSpaceDefaultSize
            }
          ]}
        >
          <Icon name="productPagoPA" color="blueIO-500" size={20} />
        </View>
      </View>
    </View>
  );
};
