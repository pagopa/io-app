import { Omit } from "@pagopa/ts-commons/lib/types";
import React from "react";
import {
  Image,
  ImageProps,
  ImageRequireSource,
  ImageURISource,
  Platform
} from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/boolean";
import * as T from "io-ts";
import * as E from "fp-ts/Either";
import { toAndroidCacheTimestamp } from "../../utils/dates";

interface Props extends Omit<ImageProps, "source"> {
  source: ReadonlyArray<ImageURISource | ImageRequireSource>;
}

type State = Readonly<{
  sourceIndex?: number;
}>;

/**
 * An image component that attempts to load the provided images
 * until one is available.
 *
 * Usually you want to provide a local image as last one to make sure
 * there is always an image that can be displayed.
 */
export class MultiImage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      // start by rendering the first image
      sourceIndex: props.source.length > 0 ? 0 : undefined
    };
  }

  public render() {
    const sourceIndex = this.state.sourceIndex;
    if (sourceIndex === undefined) {
      return null;
    }

    const atIndex = this.props.source[sourceIndex];

    // Workaround for invalidating the Android cache of the Image component.
    const source: ImageURISource | ImageRequireSource = pipe(
      Platform.OS === "android",
      B.fold(
        () => atIndex,
        () =>
          pipe(
            atIndex,
            T.number.decode,
            E.fold(
              () => ({
                ...(atIndex as ImageURISource),
                uri: `${
                  (atIndex as ImageURISource).uri
                }?ts=${toAndroidCacheTimestamp()}`
              }),
              () => atIndex
            )
          )
      )
    );

    const onError = () => {
      // if current image fails loading, move to next
      this.setState((_, props) => ({
        sourceIndex:
          sourceIndex < props.source.length ? sourceIndex + 1 : undefined
      }));
    };
    return <Image {...this.props} source={source} onError={onError} />;
  }
}
