import * as React from "react";
import { PARKING_CAPACITY } from "../config";
import { ParkingContextType, ParkingSpace, Ticket, PaymentOption } from "./types";

export const ParkingContext = React.createContext<
	ParkingContextType | undefined
>(undefined);

function initParking(): ParkingSpace[] {
	const localValue = localStorage.getItem('parkingSpaces')
	const parkingSpacesLocal = localValue ? JSON.parse(localValue) : null;
	if (parkingSpacesLocal) {
		return parkingSpacesLocal;
	} else {
		return [...Array(PARKING_CAPACITY)].map((_, idx: number) => ({
			spaceNumber: idx + 1,
			ticket: null,
		}));
	}
}

function initParkingPayment(): ParkingSpace[] {
	const localValue = localStorage.getItem('payedParkingList')
	const payedParkingList = localValue ? JSON.parse(localValue) : null;
	if (payedParkingList) {
		return payedParkingList;
	} else {
		return []
	}
}

export function ParkingContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {

	const [parkingSpaces, setParkingSpaces] = React.useState(initParking());
	const [payedParkingList, setPayedParkingList] = React.useState(initParkingPayment());

	const updateParkingSpace = async (spaceNumber: number, ticket: Ticket | null) => {
		await setParkingSpaces((prev: ParkingSpace[]) =>
			prev.map((space) =>
				space.spaceNumber === spaceNumber ? { ...space, ticket } : space
			)
		);

	};
	//first task make start -->
	const getTicket = (spaceNumber: number): Ticket => {
		const today = new Date();
		//make random number of 
		const randomNumber = Math.floor(Math.random() * 1000000000);
		let newTicket: Ticket = {
			spaceNumber: spaceNumber,
			timeIn: today.getTime(),
			timeOut: null,
			paymentStatus: false,
			paymentOption: null,
			paymentOptionExtra: null,
			//barcode combination  right to left : spaceNumber(2digits) - random1(10digits)
			barcode: `${spaceNumber > 9 ? spaceNumber : "0" + spaceNumber}${today.getHours() > 9 ? today.getHours() : "0" + today.getHours()}${today.getMinutes() > 9 ? today.getMinutes() : "0" + today.getMinutes()}${randomNumber}`
		}
		return newTicket;
	}

	const park = async (spaceNumber: number) => {
		const ticket = getTicket(spaceNumber);
		const p = new Promise((resolve) =>
			resolve(updateParkingSpace(spaceNumber, ticket))
		);
		return await p;
	};

	//task#2 pay price base on barcode and time 
	const calculatePrice = (barcode: String): Number => {
		const carParkPlace = parkingSpaces.find(item => item.ticket?.barcode == barcode);
		let cost = 0;
		if (carParkPlace && carParkPlace.ticket && carParkPlace.ticket.timeIn && !carParkPlace.ticket?.paymentStatus) {
			let parkTimeHours = Math.floor(calculateTimePassPerMinute(carParkPlace.ticket.timeIn) / 60)
			cost = parkTimeHours > 1 ? parkTimeHours * 2 : 1 * 2
			return cost;
		} else {
			console.log("something wrong your car place doesnt exist ...")
		}
		return 0;
	}
	//calculate time passed
	const calculateTimePassPerMinute = (time: number): number => {
		let timeNow = new Date().getTime();
		return (timeNow - time) / (60 * 1000);
	}
	//task#3 payTicket(barcode, paymentMethod) 
	const payTicket = (barcode: String, paymentMethod: PaymentOption): boolean => {
		const carPark = parkingSpaces.find(item => item.ticket?.barcode == barcode);
		if (carPark && carPark.ticket) {
			carPark.ticket.paymentOption = paymentMethod;
			carPark.ticket.timeOut = new Date().getTime();
			console.log(`your cost :  ${calculatePrice(carPark.ticket.barcode)} euro`);
			//paid process
			updateParkingSpace(carPark.spaceNumber, carPark.ticket);
			setPayedParkingList([...payedParkingList, carPark])
			return true;
		} else {
			console.log("something wrong your car place doesnt exist ...")
			return false;
		}
	}
	const getPaymentOption = (cost: string): PaymentOption | null => {
		let paymentType = prompt(`please enter your payment option ${cost} : `, "cash - debit -credit")?.toUpperCase();
		let paymentOption;
		switch (paymentType) {
			case PaymentOption.CASH:
				paymentOption = PaymentOption.CASH
				break;
			case PaymentOption.CREDIT:
				paymentOption = PaymentOption.CREDIT
				break;
			case PaymentOption.DEBIT:
				paymentOption = PaymentOption.DEBIT
				break;
			default:
				console.log("you doesnt paid...")
				return null;
		}
		return paymentOption;
	}

	//#task4 getTicketState(barcode);

	const getTicketStatus = (barcode: String): any => {
		const carpark = parkingSpaces.find(item => item.ticket?.barcode == barcode);
		if (carpark && carpark.ticket && carpark.ticket.barcode) {
			//paid before check time past after payment
			const timeOut = carpark.ticket.timeOut;
			if (timeOut) {
				let extraTime = calculateTimePassPerMinute(timeOut)
				if (extraTime > 1) {
					//must pay extra charge 
					console.log(`you must pay extra charge for ${extraTime}`);
					let paymentOption = getPaymentOption("extra charge");
					if (paymentOption) {
						carpark.ticket.paymentStatus = true;
						carpark.ticket.paymentOptionExtra = paymentOption;
						return true;
					} else {
						return false;
					}

				} else {
					 carpark.ticket.paymentStatus = true;
					console.log("you paid before gate open")
					return true;
				}
			} else {
				//timeout doesnt exit...
				console.log("something wrong try it later ...");
				return false;
			}
		} else {
			console.log("something wrong your car place doesnt exist ...");
			return false
		}
	}

	//#task5 getFreeSpaces

	const getFreeSpaces = ()=>{
		let freeSpace = PARKING_CAPACITY;
		parkingSpaces.forEach(parkSpace=>{
			if(parkSpace.ticket && parkSpace.ticket.timeIn && !parkSpace.ticket.paymentStatus){
				freeSpace--;
			}
		})
		console.log(` free space : ${freeSpace}`);
		return freeSpace;
	}

	const leave = async (spaceNumber: number) => {
		const carpark = parkingSpaces.find(item => item.spaceNumber == spaceNumber);
		let state = true;
		if (carpark && carpark.ticket) {
			if (carpark.ticket.timeOut) {
				state = getTicketStatus(carpark.ticket.barcode)
			} else {
				//doesnt pay and out before 
				let paymentOption = getPaymentOption("cost");
				if (paymentOption) {
					state = payTicket(carpark.ticket.barcode, paymentOption)
				} else {
					console.log("please choose payment option and pay...")
					//for cancel process ...
					return null
				}
			}
			//check going out or not 
			let getOut = prompt("do you want get out now", "yes or no")?.toUpperCase();
			if (getOut && getOut === "YES" && state) {
				const p = new Promise((resolve) =>
					resolve(updateParkingSpace(spaceNumber, carpark.ticket))
				);
				return await p;
			}else{
				console.log("please show your ticket on gate ...");
				return true
			}
		} else {
			console.log("something wrong tyr it later ...");

		}


	};

	const initialState: ParkingContextType = {
		parkingSpaces,
		park,
		leave,
		getFreeSpaces
	};
	React.useEffect(() => {
		localStorage.setItem('parkingSpaces', JSON.stringify(parkingSpaces))
	}, [parkingSpaces])

	React.useEffect(() => {
		localStorage.setItem('payedParkingList', JSON.stringify(payedParkingList))
	}, [payedParkingList])



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

