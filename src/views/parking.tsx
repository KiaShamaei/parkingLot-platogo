import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import { ParkingSpace } from "../context/types";

function ParkingBox({
  parkingSpace,
}: {
  parkingSpace: ParkingSpace;
}): JSX.Element {
  const { park, leave} = useParking();
  const { spaceNumber, ticket } = parkingSpace;

  const togglePlace = async () => {
    try {
      const res = !ticket?.paymentStatus ? leave(spaceNumber) : park(spaceNumber);
	  if(ticket?.timeOut && ticket.paymentStatus){
		console.log("Goodbye!")
	  }else if(ticket?.timeOut){
		console.log("you pay extra charge for more 15 min");	
	  }else{
		console.log("Welcome!");
	  }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ParkingBoxContainer
      className={(ticket?.timeIn)&&(!ticket?.paymentStatus) ? "occupied" : "free"}
      onClick={togglePlace}
    >
      {spaceNumber}
    </ParkingBoxContainer>
  );
}

function InnerRow({
  start,
  end,
  first = false,
}: {
  start: number;
  end: number;
  first?: boolean;
}) {
  const { parkingSpaces } = useParking();

  const blank = [0, 1].map((idx) => <div key={idx} />);

  return (
    <InnerRowContainer first={first}>
      {blank}
      {parkingSpaces.slice(start, end).map((space) => (
        <ParkingBox key={space.spaceNumber} parkingSpace={space} />
      ))}
      {blank}
    </InnerRowContainer>
  );
}

function OuterRow({ start, end }: { start: number; end: number }) {
  const { parkingSpaces } = useParking();
  return (
    <OuterRowContainer>
      {parkingSpaces.slice(start, end).map((space) => (
        <ParkingBox key={space.spaceNumber} parkingSpace={space} />
      ))}
    </OuterRowContainer>
  );
}

export default function ParkingView() {
	const {getFreeSpaces} = useParking();
  return (
    <Container>
      <Parking>
        <OuterRow start={0} end={16} />
        <div />
        <InnerRow first start={16} end={27} />
        <InnerRow start={27} end={38} />
        <div />
        <OuterRow start={38} end={54} />
      </Parking>
      <Message>Please click on a parking place to park or leave.</Message>
	  <Button onClick={getFreeSpaces}>getFreeSpaces</Button>
    </Container>
  );
}
const Button = styled.button`
border-radius : 5px ;
padding : 5px;
background: var(--free-spot);
`

const Container = styled.div`
  margin: 64px 128px;
`;

const Message = styled.p`
  margin-top: 40px;
  text-align: center;
`;

const Parking = styled.div`
  display: grid;
  grid-template-rows: 80px 100px 80px 80px 100px 80px;
  border: 1px solid var(--main-border);
`;

const OuterRowContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  & > div {
    height: 80px;
    flex: 1;
  }
  & > div:not(:last-of-type) {
    border-right: 1px solid black;
  }
`;

interface InnerRowContainerProps {
  readonly first?: boolean;
}

const InnerRowContainer = styled(OuterRowContainer)<InnerRowContainerProps>`
  & > div {
    border-bottom: ${(props) => (props.first ? "1px solid black" : "none")};
  }
  & > div:first-of-type,
  & > div:nth-of-type(14) {
    border-right: none;
  }
  & > div:first-of-type,
  & > div:nth-of-type(2),
  & > div:nth-of-type(14),
  & > div:nth-of-type(15) {
    border-bottom: none;
  }
`;

const ParkingBoxContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  &.free {
    background: var(--free-spot);
  }
  &.occupied {
    background: var(--occupied-spot);
  }
`;
