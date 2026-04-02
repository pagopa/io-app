
## Navigation instructions

Navigation is built on `@react-navigation/native` with stack navigators. Every feature exposes:
- `<Feature>ParamsList` — typed param map for its routes
- `<FEATURE>_ROUTES` — string constants for route names

Add new routes to both the feature's `navigation/params.ts` and `navigation/routes.ts`, then register the navigator in `ts/navigation/params/AppParamsList.ts` and the root navigator.

Access navigation and route params with typed hooks:
```ts
import { useIONavigation } from "../navigation/params/AppParamsList";
const navigation = useIONavigation();
```