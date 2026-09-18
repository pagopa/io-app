import {
  hexToRgba,
  Icon,
  IOColors,
  IOSpacingScale,
  IOVisualCostants,
  useIOTheme
} from "@io-app/design-system";
import { useEffect, useMemo, useState } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

import { addCacheTimestampToUri } from "../../../../../utils/image";

type AvatarDoubleProps = {
  backgroundLogoUri?: ImageSourcePropType;
};

const avatarContainerSize = 30;
const avatarDoubleRadiusSizeSmall = 6;
const internalSpaceDefaultSize = 3;
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
 * `AvatarDouble` component is used to display the background logo of an organization, with a fixed pagoPA icon on top. It accepts the following props:
 * - `backgroundLogoUri`: the uri of the image to display. If not provided, a placeholder icon will be displayed. It can be a single uri or an array of uris, in which case the first one that is available will be used.
 * @param AvatarDoubleProps
 * @returns
 */
export const AvatarDouble = ({ backgroundLogoUri }: AvatarDoubleProps) => {
  const theme = useIOTheme();
  const [failedUris, setFailedUris] = useState<ReadonlyArray<string>>([]);
  useEffect(() => {
    // Reset failed URIs when there's a prop change for backgroundLogoUri
    setFailedUris(prev => (prev.length === 0 ? prev : []));
  }, [backgroundLogoUri]);

  const candidate = useMemo(() => {
    if (
      backgroundLogoUri === undefined ||
      typeof backgroundLogoUri === "number"
    ) {
      return backgroundLogoUri;
    }
    const candidates = Array.isArray(backgroundLogoUri)
      ? backgroundLogoUri
      : [backgroundLogoUri];
    return candidates.find(
      source => source.uri === undefined || !failedUris.includes(source.uri)
    );
  }, [backgroundLogoUri, failedUris]);

  const imageSource =
    typeof candidate === "object"
      ? addCacheTimestampToUri(candidate)
      : candidate;

  const onError = () => {
    const uri = typeof candidate === "object" ? candidate.uri : undefined;
    setFailedUris(prev => (uri === undefined ? prev : [...prev, uri]));
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
            color={theme["icon-decorative"]}
            name="institution"
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
          <Icon color="blueItalia-500" name="productPagoPA" size={20} />
        </View>
      </View>
    </View>
  );
};
