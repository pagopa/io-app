/*
  Imported from
  https://github.com/philipshurpik/react-native-source-maps/blob/master/index.js
  - `react-native-fs`, a native dependency, was throwing errors about its API on invocation
  - `createSourceMapper` method was customized in order to add support for Android
  we could either fork or merge back once we're positive about our solution
*/

// Temporary disable eslint for this file
/* eslint-disable */

import { Platform } from "react-native";
import RNFS from "react-native-fs";
import SourceMap, { MappedPosition } from "source-map";
import StackTrace from "stacktrace-js";

export interface ISourceMapsOptions {
  sourceMapBundle: string;
  projectPath?: string;
  collapseInLine?: boolean;
}

interface ISourcePosition {
  lineNumber: number;
  columnNumber: number;
}

export type SourceMapper = (row: ISourcePosition) => MappedPosition;

/**
 * Creates a SourceMapper from the provided options
 */
export async function createSourceMapper(
  options: ISourceMapsOptions
): Promise<SourceMapper> {
  const bundlePath =
    Platform.OS === "ios" ? RNFS.MainBundlePath : RNFS.DocumentDirectoryPath;
  const path = `${bundlePath}/${options.sourceMapBundle}`;
  const fileExists = await RNFS.exists(path);
  if (!fileExists) {
    throw new Error(
      __DEV__
        ? "Unable to read source maps in DEV mode"
        : `Unable to read source maps, possibly invalid sourceMapBundle file, please check that it exists here: ${bundlePath}/${
            options.sourceMapBundle
          }`
    );
  }

  const mapContents = await RNFS.readFile(path, "utf8");
  const sourceMaps = JSON.parse(mapContents);
  const mapConsumer = new SourceMap.SourceMapConsumer(sourceMaps);

  function mapper(row: ISourcePosition): MappedPosition {
    return mapConsumer.originalPositionFor({
      line: row.lineNumber,
      column: row.columnNumber
    });
  }

  return mapper;
}

export async function getStackTrace(
  sourceMapper: SourceMapper,
  options: ISourceMapsOptions,
  error: Error
): Promise<string> {
  const minStackTrace = await StackTrace.fromError(error);
  const stackTrace = minStackTrace.map(row => {
    const mapped = sourceMapper(row);
    const source = mapped.source || "";
    const fileName = options.projectPath
      ? source.split(options.projectPath).pop()
      : source;
    const functionName = mapped.name || "unknown";
    return {
      fileName,
      functionName,
      lineNumber: mapped.line,
      columnNumber: mapped.column,
      position: `${functionName}@${fileName}:${mapped.line}:${mapped.column}`
    };
  });
  return options.collapseInLine
    ? stackTrace.map(i => i.position).join("\n")
    : `${stackTrace}`;
}
