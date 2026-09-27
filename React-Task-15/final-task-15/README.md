# Saarthi Motors

A beginner-friendly React and TypeScript showroom for pre-owned cars in Pune, India. Prices are in Indian rupees (INR); vehicle distances are in kilometres.

## Run the app

Open a terminal in the `final-task-15` folder and run:

```powershell
npm install
npm run dev
```

Vite prints a local address, usually `http://localhost:5173`. To check a production build, run `npm run build`.

## Find your way around

- `src/main.tsx` starts the app, declares routes, and contains the page components.
- `src/data.ts` contains the example cars, service descriptions, and rupee formatter.
- `src/store.ts` contains the Redux store for cars saved to the Garage.
- `src/hooks.ts` contains the reusable debounced-search hook.
- `src/style.css` contains shared styles and mobile breakpoints.
- `index.html` contains the page title, language, and metadata.

## Pages and routes

| Page           | Address                  | What it shows                                  |
| -------------- | ------------------------ | ---------------------------------------------- |
| Home           | `/`                      | Featured cars and showroom introduction        |
| Inventory      | `/inventory`             | Search, filters, and add/edit/remove controls  |
| Vehicle detail | `/inventory/:vehicleId`  | Details for one car, selected by its URL ID    |
| Services       | `/services`              | Sourcing, finance, and aftercare               |
| Service detail | `/services/:serviceSlug` | Details for one service                        |
| Our story      | `/about`                 | Saarthi Motors and its values                  |
| Contact        | `/contact`               | Pune contact details and a validated demo form |
| Garage         | `/garage`                | Cars saved by the visitor                      |

## Session concepts used

1. **Components:** The interface is split into reusable functions in `src/main.tsx`, including `SiteLayout`, `HomePage`, `VehicleCard`, `InventoryPage`, and `ContactPage`.
2. **Props:** A parent passes a vehicle into a reusable card with `<VehicleCard vehicle={vehicle} />`. The `VehicleCard` component reads that value from its props.
3. **`useState`:** Stores values that change while the app is open, such as the mobile menu state, active hero slide, search text, form values, and validation messages.
4. **`useEffect`:** Saves catalogue changes to browser storage, loads manufacturer suggestions from the API, and scrolls to the top when the route changes.
5. **`useRef`:** Focuses the inventory search and contact name field. It also remembers the starting touch position for swiping through hero photos.
6. **`useContext`:** `NoticeContext` shares the `notify` function so different pages can show a consistent toast message without passing it through every component.
7. **`useReducer`:** `inventoryReducer` processes `add`, `update`, and `delete` actions for the vehicle collection. This keeps related catalogue changes in one place.
8. **Conditional rendering:** The Garage shows either saved vehicles or an empty-state message. Vehicle pages show a not-found message for an unknown vehicle ID, and the contact form shows success only after valid submission.
9. **List rendering:** `.map()` creates vehicle cards, navigation links, service rows, form options, and vehicle detail facts from arrays.
10. **API integration:** `useVehicleMakes` requests live makes from the NHTSA vehicle API and combines them with a built-in list of popular Indian makes. The local list remains available if the request fails or the device is offline.
11. **Custom hook:** `useDebouncedValue` in `src/hooks.ts` waits briefly after typing stops, preventing the inventory filter and URL from updating on every keystroke.
12. **Routing:** React Router maps `/`, `/inventory`, `/services`, `/about`, `/contact`, and `/garage` to their pages.
13. **Redux:** `src/store.ts` uses Redux Toolkit to keep saved vehicle IDs in a shared Garage state. The state is persisted in browser storage so saved cars remain after refresh.
14. **Nested routing:** Vehicle details are nested under `/inventory`, for example `/inventory/tata-nexon-ev`. Service details are nested under `/services`, for example `/services/finance`.
15. **`useParams`:** Reads `vehicleId` on a vehicle detail route and `serviceSlug` on a service detail route.
16. **`useSearchParams`:** Keeps inventory filters in the URL, for example `/inventory?q=tata&body=SUV`, so a filtered view can be refreshed or shared.
17. **CRUD operations:** The Inventory page can create a car, read and search the collection, update car details, and remove a car. Changes are saved in browser storage.
18. **Form validation:** The vehicle form checks required details, price, model year, and kilometres. The contact form checks the name, email address, and message length before showing confirmation.
19. **Responsive UI:** `src/style.css` uses breakpoints for desktop, tablet, and mobile layouts. The navigation, car grids, detail page, forms, Garage empty state, and swipeable hero carousel adapt to smaller screens.

The contact form is a frontend demonstration; it does not send a message to a server.

## Add another example car

Add a new object to `initialVehicles` in `src/data.ts`. Give it a unique `id`, fill in the `Vehicle` fields, set `price` in rupees, and set `mileage` in kilometres. The inventory screen also lets you add, edit, and remove cars while the app is running.

The contact form is a frontend demonstration; it does not send a message to a server.
