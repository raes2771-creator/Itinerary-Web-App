import {
  Box,
  Button,
  ClientOnly,
  Heading,
  Skeleton,
  Card,
  Flex,
  ScrollArea,
  For,
  Text,
  Grid,
  GridItem,
  Spacer,
  VStack
} from "@chakra-ui/react"

import { ColorModeToggle } from "./components/color-mode-toggle"
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Trip, Accommodation } from "./types"
import {
  LuArrowRight,
  LuHotel,
  LuHouse,
  LuCroissant,
  LuBath,
  LuBuilding2,
  LuTent,
  LuDoorOpen,
  LuDoorClosed,
  LuLink2,
  LuMapPin,
  LuPencil,
  LuTrash2,
  LuPlus
} from "react-icons/lu"

function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function AccommodationList({ accommodationList }: { accommodationList: Accommodation[] }) {
  if (accommodationList.length === 0) {
    return (
      <Box>
        <Text>No accommodations available.</Text>
        <Button>Add a new accomodation item</Button>
      </Box>
    );
  } else {
    return (
      <Box>
        <For each={accommodationList}>
          {(accom) => (
            <Card.Root mb="6" key={accom.id} size="sm">
              <Card.Body>
                <Grid templateColumns="repeat(5, 1fr)" >
                  <GridItem height="100%" colSpan={2}>
                    <Flex direction="column">
                      <Box>
                        <Flex direction="flex-start" alignItems="center" gap="2" mb="2">
                          {accom.type === 'hotel' ? <LuHotel /> :
                            accom.type === 'hostel' ? <LuHouse /> :
                              accom.type === 'bnb' ? <LuCroissant /> :
                                accom.type === 'ryokan' ? <LuBath /> :
                                  accom.type === 'apartment' ? <LuBuilding2 /> :
                                    accom.type === 'camping' ? <LuTent /> :
                                      null}
                          <Heading size="lg">{accom.name}</Heading>
                        </Flex>
                      </Box>
                      <Spacer />
                      <Box>
                        {accom.link && (
                          <Text textStyle="md" fontWeight="bold" color="blue.500">
                            <a href={accom.link} target="_blank" rel="noopener noreferrer">
                              <Flex direction="flex-start" alignItems="center" gap="2" mb="2">
                                More Info
                                <LuLink2 />
                              </Flex>
                            </a>
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  </GridItem>
                  <GridItem fontWeight="light" textStyle="md" colSpan={2}>
                    <Box borderLeftWidth="1px" borderColor="gray.500" pl="4">
                      <Flex direction="flex-start" alignItems="center" gap="2" mb="2">
                        <LuDoorOpen />
                        <Text>Check-In: {accom.checkInTime ? accom.checkInTime.toLocaleDateString() : 'N/A'} {accom.checkInTime ? accom.checkInTime.toLocaleTimeString() : 'N/A'}</Text>
                      </Flex>
                      <Flex direction="flex-start" alignItems="center" gap="2" mb="2">
                        <LuDoorClosed />
                        <Text>Check-Out: {accom.checkOutTime ? accom.checkOutTime.toLocaleDateString() : 'N/A'} {accom.checkOutTime ? accom.checkOutTime.toLocaleDateString() : 'N/A'}</Text>
                      </Flex>
                      <Flex direction="flex-start" alignItems="center" gap="2" mb="2">
                        <LuMapPin />
                        <Text>{accom.address}</Text>
                      </Flex>
                    </Box>
                  </GridItem>
                  <GridItem fontWeight="light" textStyle="md" colSpan={1}>
                    <VStack align="end">
                      <Button size="sm" colorPalette="blue">
                        <LuPencil /> Modify
                      </Button>
                      <Button size="sm" colorPalette="red">
                        <LuTrash2 /> Delete
                      </Button>
                    </VStack>
                  </GridItem>
                </Grid>
              </Card.Body>
            </Card.Root>
          )}
        </For>
      </Box>
    )
  }
}

export default function TripView() {

  //Get the trip ID from the URL parameters
  const tripId = useParams().id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the trip data asynchronously from the Node server
  const loadTripData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/trips/${tripId}`);
      const data = await response.json();

      // convert date strings -> Date objects
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      // same for accommodations check-in/check-out times
      if (Array.isArray(data.accommodations)) {
        data.accommodations = data.accommodations.map((accom: any) => ({
          ...accom,
          checkInTime: accom.checkInTime ? new Date(accom.checkInTime) : null,
          checkOutTime: accom.checkOutTime ? new Date(accom.checkOutTime) : null,
        }));
      }

      if (Array.isArray(data.days)) {
        data.days = data.days.map((d: any) => ({
          ...d,
          date: d.date ? new Date(d.date) : undefined,
        }));
      }

      setTrip(data);
      setLoading(false);
    } catch (error) {
      // console.error('Error fetching trip data:', error);
      alert('Error fetching trip data. Please try again later.');
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
    <Box textAlign="left" fontSize="xl" pt="10vh" margin="6">
      {/* Accomodation Info */}
      <Box mb="6">
        <Heading size="4xl">{trip?.title} - Itinerary</Heading>
        <Text mb="3" fontSize="md" color="fg.muted"> {/* Print the trip dates */}
          {trip?.destination} {trip?.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'} - {trip?.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A'}
        </Text>
        <Heading size="2xl" mb="3">Accomodation</Heading>
        <AccommodationList accommodationList={trip ? trip.accommodations : []} />

        <Button size="sm"><LuPlus />Add Accommodation</Button>
      </Box>
      {/* Day Info */}
      <Box mb="6">
        <Heading size="2xl" mb="3">Days</Heading>
        {/* Horizontal scrollable list of days */}
        <ScrollArea.Root width="100%" size="xs">
          <ScrollArea.Viewport>
            <ScrollArea.Content py="4">
              <Flex direction="row" gap="4" flexWrap="nowrap">
                <For each={trip?.days}>
                  {(day) => (
                    <Card.Root w="300px" mx="auto">
                      <Card.Body gap="2">
                        <Card.Title mt="2"> Day {day.dayNum} </Card.Title>
                        <Card.Description>
                          {getDayOfWeek(day.date)} - {day.date.getDate()}/{day.date.getMonth() + 1}/{day.date.getFullYear()}
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
    </Box>
  )
}
