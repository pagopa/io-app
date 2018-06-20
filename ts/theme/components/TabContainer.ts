import { Theme } from "../types";
export default (): Theme => {
  return {
    justifyContent: "flex-start",
    elevation: 3,
    shadowColor: "#FFF",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1.2,
    borderBottomWidth: 1,
    borderColor: "#FFF"
  };
};
