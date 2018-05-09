/**
 * Defines a new icon set for the custom io-icon-font.
 *
 * The json configuration file is exported from IcoMoon.
 */

import { createIconSetFromIcoMoon } from "react-native-vector-icons";

import fontConfig from "./selection.json";

const iconSet = createIconSetFromIcoMoon(fontConfig);

export default iconSet;
