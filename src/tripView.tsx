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
  Card,
  Flex,
  ScrollArea,
  For,
  Text
} from "@chakra-ui/react"

import { ColorModeToggle } from "./components/color-mode-toggle"
import { useState, useEffect } from "react";
import { Trip } from "./types"
import { LuArrowRight } from "react-icons/lu"

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
      <Heading size="4xl">{trip?.title}</Heading>
      <Text mb="3" fontSize="md" color="fg.muted"> {/* Print the trip dates */}
        {trip?.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'} - {trip?.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A'}
      </Text>
      <Heading size="2xl">Accomodation</Heading>
      <Card.Root mb="6">
        <Card.Body>
          <For each={trip?.accommodations}>
            {(accom) => (
              <Box mb="4" key={accom.id}> {/* Display each accommodation */}
                <Heading size="lg">{accom.name} ({accom.type})</Heading>
                <Text>{accom.address}</Text>
                {accom.link && (
                  <Text>
                    <a href={accom.link} target="_blank" rel="noopener noreferrer">
                      More Info
                    </a>
                  </Text>
                )} 
              </Box>
            )}
          </For>
        </Card.Body>
      </Card.Root>
      {/* Horizontal scrollable list of days */}
      <Heading size="2xl">Days</Heading>
      <ScrollArea.Root width="24rem" size="xs">
        <ScrollArea.Viewport
          css={{
            "--scroll-shadow-size": "4rem",
            maskImage:
              "linear-gradient(#000,#000,transparent 0,#000 var(--scroll-shadow-size),#000 calc(100% - var(--scroll-shadow-size)),transparent)",
            "&[data-at-right]": {
              maskImage:
                "linear-gradient(90deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
            },
            "&[data-at-left]": {
              maskImage:
                "linear-gradient(270deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
            },
          }}
        >
          <ScrollArea.Content py="4">
            <Flex direction="row" gap="4" flexWrap="nowrap">
              <For each={trip?.days}>
                {(day) => (
                  <Card.Root w="300px" mx="auto">
                    <Card.Body gap="2">
                      <Card.Title mt="2"> Day {day.dayNum} </Card.Title>
                      <Card.Description>
                        {day.date.getDay()} - {day.date.getDate()}/{day.date.getMonth() + 1}/{day.date.getFullYear()}
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer justifyContent="flex-end">
                      <Button variant="outline">Go to day <LuArrowRight /></Button>
                    </Card.Footer>
                  </Card.Root>
                )}
              </For>
            </Flex>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal" />
        <ScrollArea.Corner />
      </ScrollArea.Root>
      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>
    </Box>
  )
}
