import * as React from "react";
import { PARKING_CAPACITY } from "../config";
import { ParkingContextType, ParkingSpace , Ticket} from "./types";

export const ParkingContext = React.createContext<
  ParkingContextType | undefined
>(undefined);

function initParking(): ParkingSpace[] {
	const localValue = localStorage.getItem('parkingSpaces')
	const parkingSpacesLocal = localValue ? JSON.parse(localValue) : null ;
	if(parkingSpacesLocal){
		return parkingSpacesLocal;
	}else{
		return [...Array(PARKING_CAPACITY)].map((_, idx: number) => ({
			spaceNumber: idx + 1,
			ticket: null,
		  }));
	}

}

export function ParkingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [parkingSpaces, setParkingSpaces] = React.useState(initParking());

  const updateParkingSpace =async (spaceNumber: number, ticket: Ticket | null) => {
   await setParkingSpaces((prev: ParkingSpace[]) =>
      prev.map((space) =>
        space.spaceNumber === spaceNumber ? { ...space, ticket } : space
      )
    );
	
  };
  //first task make start -->
  const getTicket = (spaceNumber: number) : Ticket=>{
	const today = new Date();
	//make random number of 
	const randomNumber = Math.floor(Math.random() * 1000000000);
	let newTicket : Ticket ={
	spaceNumber : spaceNumber ,
	timeIn : today.getTime(),
	timeOut : null,
	//barcode combination  right to left : spaceNumber(2digits) - random1(10digits)
	 barcode:`${spaceNumber > 9 ? spaceNumber : "0"+spaceNumber}${today.getHours() > 9 ? today.getHours():"0"+today.getHours() }${today.getMinutes() > 9 ? today.getMinutes() : "0"+today.getMinutes() }${randomNumber}`}
	return newTicket;
  }

  const park = async (spaceNumber: number) => {
    const ticket = getTicket(spaceNumber);
    const p = new Promise((resolve) =>
      resolve(updateParkingSpace(spaceNumber, ticket))
    );
    return await p;
  };

  const leave = async (spaceNumber: number) => {
    const p = new Promise((resolve) =>
      resolve(updateParkingSpace(spaceNumber, null))
    );
    return await p;
  };

  const initialState: ParkingContextType = {
    parkingSpaces,
    park,
    leave,
  };
  React.useEffect(() => {
    localStorage.setItem('parkingSpaces', JSON.stringify(parkingSpaces))
  }, [parkingSpaces])



  return (
    <ParkingContext.Provider value={initialState}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking(): ParkingContextType {
  const context = React.useContext(ParkingContext);
  if (context === undefined) {
    throw new Error("useParking called outside context.");
  }

  return context;
}
