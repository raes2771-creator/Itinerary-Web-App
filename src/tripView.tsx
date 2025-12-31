import {
  Box,
  Button,
  Checkbox,
  ClientOnly,
  HStack,
  Heading,
  Progress,
  RadioGroup,
  Skeleton,
  VStack,
  Timeline,
  Card
} from "@chakra-ui/react"

import { ColorModeToggle } from "./components/color-mode-toggle"
import { useState, useEffect } from "react";
import { Trip } from "./types"



export interface TripViewProps {
  tripId: string | null;
}

export default function TripView({ tripId }: TripViewProps) {

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the trip data asynchronously from the Node server
  // TODO: create the Node server to handle these requests.
  const loadTripData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/trips/${tripId}`);
      const data = await response.json();
      setTrip(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trip data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData(); //Load the data immediately on mount

    const interval = setInterval(() => {
      loadTripData(); //Refresh data every 10 seconds
    }, 10000);

    return () => clearInterval(interval); //Cleanup on unmount
  }, [tripId]); 

  return (
    <Box textAlign="left" fontSize="xl" pt="10vh">
        <HStack justify="center">
            <Card.Root aspectRatio={1} w="300px" mx="auto">
               <Card.Body gap = "2"> 
                    <Card.Title mt="2"> Day 1 </Card.Title>
                    <Card.Description>
                        This is where we would call the summary data from each day
                    </Card.Description>
                </Card.Body>
            </Card.Root>
        </HStack>
      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>
    </Box>
  )
}
