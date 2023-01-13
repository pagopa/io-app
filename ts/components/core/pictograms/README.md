# Pictograms
There are different sets:
* **General:** Pictograms used to enrich the following states:
  * Empty 
  * Success
  * Error 
* **Sections:** Pictograms used in the `Header` component as companion of the title. 

## Prefixes
- **General**: `Pictogram…`
- **Sections**: `PictogramSection…`

## Add a new pictogram
First of all, follow the instructions stated in the main README (`Vector graphics` section).

If you want to add a new pictogram in the `General` set, open the `Pictogram.tsx` file and import the React component:
```jsx
[…]
import PictogramAirBaloon from "./svg/PictogramAirBaloon";
[…]
```
Add the desired key to the `IOPictograms` object with the corresponding component reference:
```jsx
export const IOPictograms = {
  airBaloon: PictogramAirBaloon,
  …
}
```
You can add the recently added pictogram with the following declaration:
```jsx
// Default size: 120×120px
// Default color: Aqua
<Pictogram name="airBaloon">
```

## View all the available pictograms
There are two ways:
- In the app, go to the `Profile → Design System → Pictograms` (you must enable `Debug Mode`)
- In the repository, go to the `svg/originals` subfolder
