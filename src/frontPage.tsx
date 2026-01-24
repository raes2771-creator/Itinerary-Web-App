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
  CloseButton,
  Dialog,
  Portal,
  Field,
  Fieldset,
  For,
  Input,
  NativeSelect,
  Stack,
  Text,
  Card,
  Spacer,
  Show
} from "@chakra-ui/react"
import { LuArrowRight, LuTrash2, LuPlus, LuPencil } from "react-icons/lu" //currently unused, these are icons from a library
import { ColorModeToggle } from "./components/color-mode-toggle"
import { Trip, Day, TripSummary, API_URL } from "./types"
import { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useNavigate } from "react-router-dom"
import { dialog } from "./tripView"

export function countDays(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
}

// function to create an array of Day objects between the start and end dates
function createDays(startDate: Date, endDate: Date): Day[] {

  const dayCount = countDays(startDate, endDate);
  const days: Day[] = [];

  for (let i = 0; i < dayCount; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    days.push({
      date: currentDate,
      dayNum: i + 1,
      notes: "",
      items: [],
      todos: []
    });
  }

  return days;
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(val: string): string {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default function Page() {
  const navigate = useNavigate();


  const [tripList, setTripList] = useState<[TripSummary]>();
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState<boolean>(false);

  // Fetch the trip data asynchronously from the Node server
  const loadTripListData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trips/`);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Only update state if data has actually changed
        const newData = data as [TripSummary];
        setTripList(prevList => {
          if (JSON.stringify(prevList) !== JSON.stringify(newData)) {
            return newData;
          }
          return prevList;
        });
      }
      setLoading(false);
    } catch (error) {
      // console.error('Error fetching trip data:', error);
      alert('Error fetching trip list data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripListData(); //Load the data immediately on mount

    const interval = setInterval(() => {
      loadTripListData(); //Refresh data every 10 seconds
    }, 10000);

    return () => clearInterval(interval); //Cleanup on unmount
  }, []);

  const ListEmptyState = (
    <Box p="4">
      <Text fontSize="sm" color="fg.muted">No Trips found. Use the button below to get started.</Text>
    </Box>
  )


  const TripListView = () => {
    return (
      <VStack gap="2" alignItems="left" mb="4">
        {(tripList && tripList.length > 0) ? (
          <For each={tripList}>
            {(item) =>
              <Card.Root size="sm" key={item.id} >
                <Card.Body >
                  <HStack>
                    <Card.Title>{item.title}</Card.Title>
                    <Spacer />
                    <Show when={editState} fallback={null}>
                      <Button
                        size="xs"
                        colorPalette="red"
                        variant="subtle">
                        <LuTrash2 />
                      </Button>
                    </Show>
                    <Button size="xs" variant="solid" colorPalette="blue"
                      onClick={() => navigate(`/trip/${item.id}`)}>
                      <LuArrowRight />
                    </Button>
                  </HStack>
                  {/* This is the card body. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. */}
                </Card.Body>
              </Card.Root>
            }
          </For>
        ) : ListEmptyState}
      </VStack>
    )
  }

  const NewTripForm = () => {
    const [trip, setTrip] = useState<Trip>({
      id: "",
      title: "",
      destination: "",
      startDate: null,
      endDate: null,
      accommodations: [],
      days: [],
    })

    //TODO: see if we can get this using the server.js by making a POST request to the /api/trips endpoint
    // This should then create a trip and add a trip summary to the meta.json file
    const handleLocalSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const uniqueId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      const updatedTrip = { ...trip, id: uniqueId };
      const tripData = {
        ...updatedTrip,
        destination: capitalizeFirstLetter(updatedTrip.destination),
        startDate: updatedTrip.startDate ? updatedTrip.startDate.toISOString() : null,
        endDate: updatedTrip.endDate ? updatedTrip.endDate.toISOString() : null,
        days: (updatedTrip.startDate && updatedTrip.endDate) ? createDays(updatedTrip.startDate, updatedTrip.endDate) : []
      };
      // Send the trip data to the server
      try {
        const response = await fetch(`http://localhost:3000/api/trips/${uniqueId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tripData),
        });

        if (response.ok) {
          dialog.close("newtrip");
          navigate(`/trip/${uniqueId}`);
          setTrip({ id: "", title: "", destination: "", startDate: null, endDate: null, accommodations: [], days: [] });
        } else {
          alert('Failed to create trip. Please try again');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occured.');
      }
    };

    return (
      <Fieldset.Root size="lg" maxW="md" p="4">
        <Stack> {/* Begining of the form*/}
          <Fieldset.HelperText>
            Put in the details of the trip
          </Fieldset.HelperText>
        </Stack>
        <Fieldset.Content>
          <Field.Root>
            <Field.Label>Trip Name</Field.Label>
            <Input name="title" value={trip.title} onChange={(e) => setTrip({ ...trip, title: e.target.value })} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Destination</Field.Label>
            <Input name="destination" value={trip.destination} onChange={(e) => setTrip({ ...trip, destination: e.target.value })} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Start Date</Field.Label>
            <DatePicker name="start-date" selected={trip.startDate as Date | null} onChange={(date: Date | null) => setTrip({ ...trip, startDate: date })} />
          </Field.Root>

          <Field.Root>
            <Field.Label>End Date</Field.Label>
            <DatePicker name="end-date" selected={trip.endDate as Date | null} onChange={(date: Date | null) => setTrip({ ...trip, endDate: date })} />
          </Field.Root>

          <HStack alignItems="center" mt="4">
            <Dialog.ActionTrigger asChild>
              <Button size="md" variant="outline">Cancel</Button>
            </Dialog.ActionTrigger>
            <Button size="md" colorPalette="blue" onClick={handleLocalSubmit}> { /* Submit button for the form */}
              Create Trip
            </Button>
          </HStack>
        </Fieldset.Content>
      </Fieldset.Root>
    )
  }

  return (
    <VStack height="100vh" justify="center" alignItems="center">
      <Box m="2" mt="6" mb="6" p="4" borderWidth="1px" borderRadius="md">
        <Box minW="300px">
          <HStack>
            <Heading size="2xl" mb="3">Your Trips</Heading>
            <Spacer />
            <Show when={tripList && tripList.length > 0}>
              <Button size="sm" variant="ghost" onClick={() => {
                setEditState(!editState);
                console.log("set editState to " + editState);
              }}>
                <LuPencil /></Button>
            </Show>
          </HStack>
          <TripListView />
          <Button variant="solid" size="lg" colorPalette="blue"
            onClick={() => dialog.open("newtrip", {
              title: "New Trip",
              content: <NewTripForm />,
              size: "lg",
              placement: "center"
            })}>
            <LuPlus />Create new Trip
          </Button>
        </Box>
      </Box>
      <Box pos="absolute" top="4" right="4"> {/* Color mode toggle button */}
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>

      <dialog.Viewport />
    </VStack>
  );
}
