export const routeToArray = (routerKeys: any): ReadonlyArray<string> => {
  return Object.keys(routerKeys).map(k => {
    if (typeof routerKeys[k] === "string") {
      return routerKeys[k];
    } else {
      return routeToArray(routerKeys[k]);
    }
  });
};
