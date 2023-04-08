export interface ParkingSpace {
  spaceNumber: number;
  ticket: Ticket|null;
}

export interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  park: (spaceNumber: number) => void;
  leave: (spaceNumber: number) => void;
}
export interface Ticket {
	spaceNumber : Number;
	barcode : String;
	timeIn : Number | null ;
	timeOut : Number | null;
	paymentStatus : Boolean | null;
	paymentOption : PaymentOption | null
}

export enum PaymentOption{
	"CREDIT" = "CREDIT", "DEBIT" = "DEBIT", "CASH" = "CASH"
}
