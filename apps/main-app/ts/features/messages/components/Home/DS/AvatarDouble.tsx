import {
  hexToRgba,
  Icon,
  IOColors,
  IODimensions,
  useIOTheme
} from "@io-app/design-system";
import { useCallback, useState } from "react";
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

const avatarSize = IODimensions.size.avatar.xsmall;
const avatarRadius = IODimensions.radius.avatar.xsmall;
const avatarPadding = IODimensions.padding.avatar.xsmall;
const avatarBorderLightMode = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  topContainer: {
    height: IODimensions.size.avatar.small,
    width: IODimensions.size.avatar.small
  },
  avatarWrapper: {
    overflow: "hidden",
    borderColor: avatarBorderLightMode,
    borderWidth: IODimensions.stroke.default,
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
 * `AvatarDouble` component is used to display the background logo of an
 * organization, with a fixed pagoPA icon on top. It accepts the following
 * props:
 *
 * - `backgroundLogoUri`: the uri of the image to display. If not provided, a
 *   placeholder icon will be displayed. It can be a single uri or an array of
 *   uris, in which case the first one that is available will be used.
 *
 * @param AvatarDoubleProps
 * @returns
 */
export const AvatarDouble = ({ backgroundLogoUri }: AvatarDoubleProps) => {
  const theme = useIOTheme();
  const [imageIndex, setImageIndex] = useState(0);
  const logoKey = JSON.stringify(backgroundLogoUri); // compare by content rather than by reference
  const [prevLogoKey, setPrevLogoKey] = useState(logoKey);

  const imageInitialState = useCallback(
    () => getImageState(backgroundLogoUri),
    [backgroundLogoUri]
  );
  const [imageSource, setImageSource] = useState(imageInitialState);

  // A recycled list cell receives a different logo: restart from its first
  // source instead of keeping the previous logo or its fallback
  if (logoKey !== prevLogoKey) {
    setPrevLogoKey(logoKey);
    setImageIndex(0);
    setImageSource(getImageState(backgroundLogoUri));
  }

  const onError = () => {
    if (
      Array.isArray(backgroundLogoUri) &&
      imageIndex + 1 < backgroundLogoUri.length
    ) {
      setImageIndex(imageIndex + 1);
      setImageSource(addCacheTimestampToUri(backgroundLogoUri[imageIndex + 1]));
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
            height: avatarSize,
            width: avatarSize,
            borderRadius: avatarRadius,
            backgroundColor:
              imageSource === undefined ? IOColors["grey-50"] : IOColors.white,
            padding:
              imageSource === undefined
                ? avatarPadding.placeholder
                : avatarPadding.logo,
            bottom: 0,
            right: 0
          }
        ]}
      >
        {imageSource === undefined ? (
          <Icon
            color={theme["icon-decorative"]}
            name="institution"
            size={"100%"}
          />
        ) : (
          <View
            style={[
              styles.avatarInnerWrapper,
              {
                borderRadius: avatarRadius - avatarPadding.logo
              }
            ]}
          >
            <Image
              accessibilityIgnoresInvertColors
              onError={onError}
              source={imageSource}
              style={styles.avatarImage}
              testID="avatar_double_background_image"
            />
          </View>
        )}
      </View>
      <View
        accessibilityIgnoresInvertColors
        style={[
          styles.avatarWrapper,
          {
            height: avatarSize,
            width: avatarSize,
            borderRadius: avatarRadius,
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
              borderRadius: avatarRadius - avatarPadding.logo
            }
          ]}
        >
          <Icon color="blueItalia-500" name="productPagoPA" size={20} />
        </View>
      </View>
    </View>
  );
};
