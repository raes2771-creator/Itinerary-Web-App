import { ColorModeToggle } from "./components/color-mode-toggle"
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Trip, Accommodation, AccommodationType, Day, ItineraryItem, API_URL } from "./types";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './datetime-picker-style.css';
import DateTimePicker from "react-datetime-picker";
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
  LuExternalLink,
  LuMapPin,
  LuPencil,
  LuTrash2,
  LuPlus,
  LuClock,
  LuBed,
  LuArrowLeft
} from "react-icons/lu"
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
  VStack, HStack,
  Portal,
  Dialog, createOverlay,
  Field,
  Fieldset,
  Input,
  Stack,
  NativeSelect,
  CloseButton
} from "@chakra-ui/react"
import DayView from "./dayView";
import { useNavigate } from "react-router-dom";

function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function getNonStayingAtItems(day: Day): ItineraryItem[] {
  return day.items.filter(item => item.type !== 'staying-at');
}
function getStayingAtItem(day: Day): ItineraryItem | null {
  const stayingAtItems = day.items.find(item => item.type === 'staying-at');
  return (stayingAtItems ? stayingAtItems : null);
}

export function getAccomColor(item: ItineraryItem): string {
  const colors = ['blue.500', 'green.500', 'yellow.500', 'purple.500', 'orange.500'];
  const index = item.accommodationId ? parseInt(item.accommodationId.split('-')[1]) - 1 : 0;
  return colors[index % colors.length];
}

export interface DialogProps {
  title: string,
  description?: string,
  content?: React.ReactNode
  size?: Dialog.RootProps["size"]
  placement?: Dialog.RootProps["placement"]
}

export const dialog = createOverlay<DialogProps>((props): React.ReactNode => {
  const { title, description, content, ...rest } = props
  return (
    <Dialog.Root {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            {title && (
              <Dialog.Header>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
            )}
            <Dialog.Body p="1" spaceY="4">
              {description && (
                <Dialog.Description>{description}</Dialog.Description>
              )}
              {content}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
});

export default function TripView() {
  //Get the trip ID from the URL parameters
  const tripId = useParams().id;

  const [trip, setTrip] = useState<Trip>({
    id: "",
    title: "",
    destination: "",
    startDate: null,
    endDate: null,
    accommodations: [],
    days: [],
  });
  const [loading, setLoading] = useState(true);
  const [isAccomDialogOpen, setIsAccomDialogOpen] = useState(false);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Fetch the trip data asynchronously from the Node server
  const loadTripData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trips/${tripId}`);
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

      // Only update state if data has actually changed
      setTrip(prevTrip => {
        if (JSON.stringify(prevTrip) !== JSON.stringify(data)) {
          return data;
        }
        return prevTrip;
      });
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

  // handler to delete a given accomodation entry from the whole trip (including itinerary items)
  const handleDeleteAccom = (accomId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    // remove the accommodation with given ID from the list:
    const updatedAccoms = trip.accommodations.filter(accom => accom.id !== accomId);
    // also remove related itinerary items with the same accom ID:
    const updatedDays = trip.days.map(day => {
      const filteredItems = day.items.filter(item => item.accommodationId !== accomId);
      return { ...day, items: filteredItems };
    }
    );
    // add updated accom and itinerary lists to trip state:
    const newTrip = {
      ...trip,
      accommodations: updatedAccoms,
      days: updatedDays
    }
    setTrip(newTrip);
    try {
      const response = await fetch(`${API_URL}/api/trips/${newTrip.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrip),
      });
      if (response.ok != true) {
        alert('Failed to delete accommodation. Please try again');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occured.');
    }
  }

  const AccommodationList = ({ accommodationList }: { accommodationList: Accommodation[] }) => {
    if (accommodationList && accommodationList.length === 0) {
      return (
        <Box mb="4">
          <Text fontSize="sm" color="fg.subtle">No accommodations available.</Text>
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
                                  <LuExternalLink />
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
                          <Text>Check-Out: {accom.checkOutTime ? accom.checkOutTime.toLocaleDateString() : 'N/A'} {accom.checkOutTime ? accom.checkOutTime.toLocaleTimeString() : 'N/A'}</Text>
                        </Flex>
                        <Flex direction="flex-start" alignItems="center" gap="2" mb="2">
                          <LuMapPin />
                          <Text>{accom.address}</Text>
                        </Flex>
                      </Box>
                    </GridItem>
                    <GridItem fontWeight="light" textStyle="md" colSpan={1}>
                      <VStack align="end">
                        <Button size="sm" colorPalette="blue"> {/*TODO: add a handler for modification of an accomodation item.*/}
                          <LuPencil /> Modify
                        </Button>
                        <Button size="sm" colorPalette="red" onClick={handleDeleteAccom(accom.id)}>
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

  const ScrollableDayList = ({ dayList }: { dayList: Day[] }) => {
    const EmptyItineraryItem = () => {
      return (
        <Box p="2" borderWidth="1px" borderRadius="md" w="100%">
          <Text fontSize="xs" color="fg.muted">Go to day to add an activity!</Text>
        </Box>
      )
    }
    // Scrollable list of days
    return (
      <ScrollArea.Root size="md">
        <ScrollArea.Viewport>
          <ScrollArea.Content py="4">
            <HStack gap="4" alignItems="start">
              <For each={dayList}>
                {(day) => {
                  const stayingAtItem = getStayingAtItem(day);
                  const nonAccomItems = getNonStayingAtItems(day);
                  return (
                    <Card.Root w="350px" mx="auto" key={day.dayNum}>
                      <Card.Body gap="2">
                        <Card.Title mt="2"> Day {day.dayNum} </Card.Title>
                        <Card.Description>
                          {getDayOfWeek(day.date)} - {day.date.getDate()}/{day.date.getMonth() + 1}/{day.date.getFullYear()}
                        </Card.Description>
                        <Box mt="4">
                          {nonAccomItems.length > 0 ? (
                            <VStack align="start" gap="2" maxH="200px" overflowY="auto">
                              <For each={nonAccomItems.slice(0, 3)}>
                                {(item) => (
                                  <Box key={item.id} p="2" borderWidth="1px" borderRadius="md" w="100%">
                                    <Text fontSize="xs">{item.time} - {item.activity}</Text>
                                  </Box>
                                )}
                              </For>
                              {nonAccomItems.length > 3 ? (
                                <Box key={nonAccomItems[3].id} p="2" w="100%">
                                  <Text fontSize="xs">...</Text>
                                </Box>
                              ) : null}
                            </VStack>
                          ) : (
                            <EmptyItineraryItem />
                          )}
                        </Box>
                      </Card.Body>
                      <Card.Footer justifyContent="column">
                        <Box>
                          {stayingAtItem ? (
                            <Box p="1" pl="2" pr="2" borderWidth="1px" borderRadius="md" w="100%" bgColor={getAccomColor(stayingAtItem)}>
                              <HStack alignItems="center">
                                <LuBed />
                                <Text fontSize="xs">{stayingAtItem.activity}</Text>
                              </HStack>
                            </Box>
                          ) : null}
                        </Box>
                        <Button variant="outline"
                          onClick={() => {
                            setSelectedDay(day.dayNum);
                            setIsDayDialogOpen(true);
                          }}>
                          Go to day <LuArrowRight />
                        </Button>
                      </Card.Footer>
                    </Card.Root>
                  )
                }}
              </For>
            </HStack>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal" />
        <ScrollArea.Corner />
      </ScrollArea.Root>
    )
  }

  const AccommodationForm = () => {

    const [newAccom, setNewAccom] = useState<Partial<Accommodation>>({
      type: undefined,
      name: "",
      address: "",
      link: "",
      checkInTime: null,
      checkOutTime: null,
    })

    const handleSubmitAccom = async (e: React.FormEvent) => {
      e.preventDefault();
      // Add the new accommodation to the trip state
      if (newAccom.name && newAccom.address) {
        const accomId = `accom-${trip.accommodations.length + 1}`;
        const accomToAdd: Accommodation = {
          id: accomId,
          name: newAccom.name || "",
          type: (newAccom.type || "other") as AccommodationType,
          address: newAccom.address || "",
          checkInTime: newAccom.checkInTime ?? null,
          checkOutTime: newAccom.checkOutTime ?? null,
          link: newAccom.link || "",
        };
        // Create relevant itinerary items for check-in/check-out here:
        let checkInItem: ItineraryItem = {
          id: `item-${Date.now()}-checkin`,
          time: newAccom.checkInTime ? newAccom.checkInTime.toLocaleTimeString() : "N/A",
          activity: "Check-In to " + accomToAdd.name,
          location: accomToAdd.address,
          accommodationId: accomId,
          type: 'check-in'
        };
        let checkOutItem: ItineraryItem = {
          id: `item-${Date.now()}-checkout`,
          time: newAccom.checkOutTime ? newAccom.checkOutTime.toLocaleTimeString() : "N/A",
          activity: "Check-Out of " + accomToAdd.name,
          location: accomToAdd.address,
          accommodationId: accomId,
          type: 'check-out'
        };
        let stayingAtItem: ItineraryItem = {
          id: `item-${Date.now()}-stayingat`,
          time: "",
          activity: accomToAdd.name,
          location: accomToAdd.address,
          accommodationId: accomId,
          type: 'staying-at'
        };
        // Update days with new items
        const updatedDays = trip.days.map(day => {
          const dayDateStr = day.date.toDateString();
          const checkInDateStr = newAccom.checkInTime ? newAccom.checkInTime.toDateString() : null;
          const checkOutDateStr = newAccom.checkOutTime ? newAccom.checkOutTime.toDateString() : null;

          // Logic to add items on relevant days.
          // Check-in day:    add check-in and staying-at
          // Check-out day:   add check-out
          // In-between days: add staying-at
          if (checkInDateStr && dayDateStr === checkInDateStr) {
            stayingAtItem.id = `item-${Date.now()}-stayingat-${day.dayNum}`;
            checkInItem.id = `item-${Date.now()}-checkin-${day.dayNum}`;
            return { ...day, items: [...day.items, checkInItem, stayingAtItem] };
          } else if (checkOutDateStr && dayDateStr === checkOutDateStr) {
            checkOutItem.id = `item-${Date.now()}-checkout-${day.dayNum}`;
            return { ...day, items: [...day.items, checkOutItem] };
          } else if (checkInDateStr && checkOutDateStr && day.date > new Date(checkInDateStr) && day.date < new Date(checkOutDateStr)) {
            stayingAtItem.id = `item-${Date.now()}-stayingat-${day.dayNum}`;
            return { ...day, items: [...day.items, stayingAtItem] };
          } else {
            return day;
          }
        });
        // append to current trip accommodations
        const newTrip = {
          ...trip,
          accommodations: [...trip.accommodations, accomToAdd],
          days: updatedDays
        }
        setTrip(newTrip);
        // reset form
        setNewAccom({
          type: undefined,
          name: "",
          address: "",
          link: "",
          checkInTime: null,
          checkOutTime: null,
        });
        try {
          const response = await fetch(`${API_URL}/api/trips/${newTrip.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTrip),
          });

          if (response.ok != true) {
            alert('Failed to add accommodation. Please try again');
          } else {
            setIsAccomDialogOpen(false);
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occured.');
        }
      }
    };

    return (
      <Fieldset.Root size="lg" maxW="md" p="4">
        <Stack> {/* Begining of the form*/}
          <Fieldset.Legend>New Accomodation</Fieldset.Legend>
          <Fieldset.HelperText>
            Add the details of your accomodation
          </Fieldset.HelperText>
        </Stack>

        {/* Form to create a new accomodation item */}
        <Fieldset.Content>
          <Field.Root>
            <Field.Label>Accommodation Type</Field.Label>
            <NativeSelect.Root size="md">
              <NativeSelect.Field placeholder="Select type..." value={newAccom.type || ""} onChange={(e) => setNewAccom({ ...newAccom, type: e.target.value as AccommodationType })}>
                <For each={['hotel', 'hostel', 'bnb', 'ryokan', 'apartment', 'camping', 'other']}>
                  {(type) => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  )}
                </For>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root>
            <Field.Label>Name</Field.Label>
            <Input name="title" value={newAccom.name} onChange={e => setNewAccom({ ...newAccom, name: e.target.value })} />
          </Field.Root>

          <Field.Root>
            <Field.Label><LuMapPin />Address</Field.Label>
            <Input name="location" value={newAccom.address} onChange={e => setNewAccom({ ...newAccom, address: e.target.value })} />
          </Field.Root>

          <Field.Root >
            <Box className="light">
              <Field.Label><LuClock />Check-in date/time</Field.Label>
              <DateTimePicker name="start-date" minDate={trip.startDate!} maxDate={trip.endDate!} value={newAccom.checkInTime}
                onChange={(date: Date | null) => setNewAccom({ ...newAccom, checkInTime: date })} />
            </Box>
          </Field.Root>

          <Field.Root className="light">
            <Field.Label><LuClock />Check-out date/time</Field.Label>
            <DateTimePicker name="start-date" minDate={trip.startDate!} maxDate={trip.endDate!} value={newAccom.checkOutTime}
              onChange={(date: Date | null) => setNewAccom({ ...newAccom, checkOutTime: date })} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Link (optional)</Field.Label>
            <Input name="link" value={newAccom.link} onChange={e => setNewAccom({ ...newAccom, link: e.target.value })} />
          </Field.Root>

          <Flex direction="flex-end" gap="4" alignItems="center" mt="4">
            <Dialog.ActionTrigger asChild>
              <Button size="md" variant="outline">Cancel</Button>
            </Dialog.ActionTrigger>
            <Button size="md" colorPalette="blue" onClick={handleSubmitAccom}> { /* Submit button for the form */}
              Add to Trip
            </Button>
          </Flex>
        </Fieldset.Content>
      </Fieldset.Root>
    )
  }

  // 404 state, displayed if trip ID in URL is invalid.
  const navigate = useNavigate();
  const emptyState = (
    <Box p={4} pt={10}>
      <VStack alignContent="center" gap="4">
        404 - Item not found.
        <Button colorPalette="blue"
          onClick={() => navigate(`/`)}>Return to front page</Button>
      </VStack>
    </Box>
  )

  return (
    <>
      {loading ? (
        <Box p={4} pt={10}>
          <VStack alignContent="center" gap="4">
            Loading...
          </VStack>
        </Box>
      ) : trip.id !== "" && trip.id === tripId ? (
        <Box textAlign="left" fontSize="xl" pt="2vh" margin="6">
          <Button size="xs" variant="ghost" color="fg.muted" pos="absolute" top="0" left="4"
            onClick={() => navigate(`/`)}>
            <LuArrowLeft /> Return to trip selection
          </Button>
          <Heading size="4xl" mb="2" mt="6">{trip?.title} - Itinerary</Heading>
          <Text mb="3" fontSize="md" color="fg.muted"> {/* Print the trip dates */}
            {trip?.destination} {trip?.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'} - {trip?.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A'}
          </Text>

          {/* Day Info */}
          <Box mb="6">
            <Heading size="2xl" mb="3">Days</Heading>
            <ScrollableDayList dayList={trip ? trip.days : []} />
          </Box>

          {/* Accomodation Info */}
          <Box mt="6" mb="6">
            <Heading size="2xl" mb="3">Accomodation</Heading>
            <AccommodationList accommodationList={trip ? trip.accommodations : []} />

            {/* <Dialog.Trigger asChild>
                <Button size="sm" colorPalette="blue"><LuPlus />Add Accommodation</Button>
              </Dialog.Trigger> */}
            <Button colorPalette="blue" size="md"
              onClick={() => setIsAccomDialogOpen(true)}>
              <LuPlus />Add Accomodation Item
            </Button>
          </Box>

          {/* Day View Dialog */}
          <Portal>
            <Dialog.Root open={isDayDialogOpen} onOpenChange={(details) => setIsDayDialogOpen(details.open)} size="cover">
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Day {selectedDay}</Dialog.Title>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                  </Dialog.Header>
                  <Dialog.Body p="1" spaceY="4">
                    {selectedDay && trip && <DayView key={`day-${selectedDay}`} thisTrip={trip} dayNum={selectedDay} />}
                  </Dialog.Body>
                </Dialog.Content>
              </Dialog.Positioner>
            </Dialog.Root>
          </Portal>

          {/* Accommodation Dialog */}
          <Dialog.Root open={isAccomDialogOpen} onOpenChange={(details) => setIsAccomDialogOpen(details.open)} size="lg" placement="center">
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Add Accommodation</Dialog.Title>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                  </Dialog.Header>
                  <Dialog.Body p="1" spaceY="4">
                    <AccommodationForm />
                  </Dialog.Body>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>

          {/* Color Mode Toggle */}
          <Box pos="absolute" top="4" right="4">
            <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
              <ColorModeToggle />
            </ClientOnly>
          </Box>
        </Box>
      ) : (
        emptyState
      )}
    </>

  )
}
