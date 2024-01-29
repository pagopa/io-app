// for TSC to correctly read the type definition
// exported by this lib, it is necessary to import it
// in a `.ts` file, otherwise it will be ignored

// this file is strictly for TS to recognize the type definition,
// avoiding the malpractice of having to import it in a test,
// since the import is already done in the jest config files

import "@testing-library/jest-native/extend-expect";
