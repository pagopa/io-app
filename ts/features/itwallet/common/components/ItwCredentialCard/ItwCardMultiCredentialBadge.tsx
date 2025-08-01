// The path data for the two shapes that make up the badge.
// These are extracted directly from the original SVG.
import { Canvas, Group, Path } from "@shopify/react-native-skia";

const PATH_BACK_CARD =
  "M0 4.8C0 3.80589 0.736564 3 1.64516 3H15.3548C16.2634 3 17 3.80589 17 4.8V13.2C17 14.1941 16.2634 15 15.3548 15H1.64516C0.736564 15 0 14.1941 0 13.2V4.8Z";
const PATH_FRONT_CARD =
  "M15.0762 3.33789L15.1592 3.33984C16.0197 3.38669 16.7041 4.15158 16.7041 5.08789V12.1709H5.60547C4.60285 12.1707 3.79012 11.3581 3.79004 10.3555V3.33789H15.0762ZM18.9746 0.170898C19.9773 0.171092 20.79 0.984592 20.79 1.9873V10.3555C20.79 11.3581 19.9772 12.1707 18.9746 12.1709H17.79V5.08789C17.79 3.47721 16.575 2.17114 15.0762 2.1709H3.79004V1.9873C3.79004 0.984592 4.6028 0.171093 5.60547 0.170898H18.9746Z";

const ORIGINAL_WIDTH = 23;
const ORIGINAL_HEIGHT = 15;

/**
 * A React Native component to display a multi-credential badge icon using Skia.
 * This version is drawn programmatically with Path components.
 */
export const ItwCardMultiCredentialBadge = () => (
  <Canvas style={{ width: ORIGINAL_WIDTH, height: ORIGINAL_HEIGHT }}>
    <Group>
      <Path path={PATH_BACK_CARD} color="#403F36" />
      <Path path={PATH_FRONT_CARD} color="#403C36" />
    </Group>
  </Canvas>
);
