import themeVariables from "../../../theme/variables";

/**
 * A collection of default styles used within IO App.
 */

// TODO: in a first iteration, to avoid overlaps,
//  if a value already exists, will be used from themeVariables
export const IOStyles = {
  flex: {
    flex: 1
  },
  horizontalContentPadding: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  },
  row: {
    flex: 1,
    flexDirection: "row"
  }
};
