import {
  DataSourceParam,
  Skia,
  type SkImage
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Image as RNImage } from "react-native";

/**
 * Module-level cache for decoded Skia images. Stores resolved SkImage instances
 * keyed by the `require()` asset ID. Safe for bundled assets since the set is
 * small and bounded.
 */
const resolvedImages = new Map<number, SkImage>();

/**
 * Module-level cache for in-flight image loading promises. Prevents duplicate
 * decode work when multiple components request the same image before the first
 * load completes.
 */
const pendingLoads = new Map<number, Promise<SkImage | null>>();

/**
 * Decodes a bundled asset into a Skia image, deduplicating concurrent requests.
 * The first call for a given source triggers the actual load; subsequent calls
 * return the same promise until it resolves.
 */
const loadImageAsync = (source: number): Promise<SkImage | null> => {
  const cached = resolvedImages.get(source);
  if (cached) {
    return Promise.resolve(cached);
  }

  const pending = pendingLoads.get(source);
  if (pending) {
    return pending;
  }

  const uri = RNImage.resolveAssetSource(source).uri;
  const promise = Skia.Data.fromURI(uri)
    .then(data => {
      const image = Skia.Image.MakeImageFromEncoded(data);
      if (image) {
        resolvedImages.set(source, image);
      }
      return image;
    })
    .catch(() => null)
    .finally(() => {
      pendingLoads.delete(source);
    });

  pendingLoads.set(source, promise);
  return promise;
};

/**
 * React hook that returns a cached Skia SkImage for a `require()`-based asset.
 * On first render, if the image is already in the module-level cache it is
 * returned synchronously (no flash). Otherwise the load is started and the hook
 * returns `null` until decoding completes.
 *
 * Concurrent calls with the same source share a single decode operation,
 * preventing the burst of parallel decodes that causes jank in list screens.
 */
export const useCachedImage = (source: DataSourceParam): SkImage | null => {
  const key = typeof source === "number" ? source : undefined;

  const [image, setImage] = useState<SkImage | null>(() =>
    key !== undefined ? (resolvedImages.get(key) ?? null) : null
  );

  useEffect(() => {
    if (key === undefined) {
      return;
    }

    // If already resolved since the initial render, update immediately
    const cached = resolvedImages.get(key);
    if (cached) {
      setImage(prev => (prev === cached ? prev : cached));
      return;
    }

    const controller = new AbortController();
    void loadImageAsync(key).then(img => {
      if (!controller.signal.aborted) {
        setImage(img);
      }
    });

    return () => {
      controller.abort();
    };
  }, [key]);

  return image;
};
