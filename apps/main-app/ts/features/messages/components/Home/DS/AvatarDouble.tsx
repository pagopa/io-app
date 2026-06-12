import {
  IOColors,
  IOSpacingScale,
  IOVisualCostants,
  Icon,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useCallback, useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";
import { addCacheTimestampToUri } from "../../../../../utils/image";

type AvatarDoubleProps = {
  backgroundLogoUri?: ImageSourcePropType;
};

const avatarContainerSize = 30;
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

const getImageState = (backgroundLogoUri?: ImageSourcePropType) => {
  switch (typeof backgroundLogoUri) {
    case "number":
      return backgroundLogoUri;
    case "object":
      if (Array.isArray(backgroundLogoUri)) {
        return addCacheTimestampToUri(backgroundLogoUri[0]);
      }
      return addCacheTimestampToUri(backgroundLogoUri as ImageURISource);
    default:
      return undefined;
  }
};

/**
 * `AvatarDouble` component is used to display the background logo of an organization, with a fixed pagoPA icon on top. It accepts the following props:
 * - `backgroundLogoUri`: the uri of the image to display. If not provided, a placeholder icon will be displayed. It can be a single uri or an array of uris, in which case the first one that is available will be used.
 * @param AvatarDoubleProps
 * @returns
 */
export const AvatarDouble = ({ backgroundLogoUri }: AvatarDoubleProps) => {
  const theme = useIOTheme();
  const indexValue = useRef<number>(0);

  const imageInitialState = useCallback(
    () => getImageState(backgroundLogoUri),
    [backgroundLogoUri]
  );
  const [imageSource, setImageSource] = useState(imageInitialState);

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
          <Icon name="productPagoPA" color="blueItalia-500" size={20} />
        </View>
      </View>
    </View>
  );
};
