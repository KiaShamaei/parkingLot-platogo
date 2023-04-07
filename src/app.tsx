import * as React from "react";
import { ParkingContextProvider } from "./context/parkingContext";
import ParkingView from "./views/parking";

export default function App() {
  return (
    <ParkingContextProvider>
      <ParkingView />
    </ParkingContextProvider>
  );
}
