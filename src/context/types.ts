export interface ParkingSpace {
  spaceNumber: number;
  ticket: Ticket|null;
}

export interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  park: (spaceNumber: number) => void;
  leave: (spaceNumber: number) => void;
  getFreeSpaces : ()=>number;
}
export interface Ticket {
	spaceNumber : Number;
	barcode : String;
	timeIn : number | null ;
	timeOut : number | null;
	paymentStatus : Boolean | null;
	paymentOption : PaymentOption | null;
	paymentOptionExtra : PaymentOption | null;

}

export enum PaymentOption{
	"CREDIT" = "CREDIT", "DEBIT" = "DEBIT", "CASH" = "CASH"
}
