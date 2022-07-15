import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";

type CgnUserAgeRange = "18-25" | "26-30" | "31-35" | "unrecognized";

export const getCgnUserAgeRange = (
  profileBDay: InitializedProfile["date_of_birth"]
): CgnUserAgeRange => {
  if (profileBDay) {
    const date = new Date();
    const birthDate = new Date(profileBDay);
    const age = date.getFullYear() - birthDate.getFullYear();

    if (age > 30) {
      return "31-35";
    } else if (age > 25) {
      return "26-30";
    } else if (age > 17) {
      return "18-25";
    }
  }
  return "unrecognized";
};
