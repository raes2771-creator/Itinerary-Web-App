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
  Stack
} from "@chakra-ui/react"
import { LuTicketsPlane, LuPlaneLanding, LuPlaneTakeoff } from "react-icons/lu" //currently unused, these are icons from a library
import { ColorModeToggle } from "./components/color-mode-toggle"
import { Trip } from "./types"
import React, { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function Page() {
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uniqueId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const updatedTrip = { ...trip, id: uniqueId };
    const tripData = {
      ...updatedTrip,
      startDate: updatedTrip.startDate ? updatedTrip.startDate.toISOString() : null,
      endDate: updatedTrip.endDate ? updatedTrip.endDate.toISOString() : null,
    };
    const blob = new Blob([JSON.stringify(tripData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${updatedTrip.title || "new-trip"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <Box textAlign="left" fontSize="xl" pt="10vh">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button variant="outline" size="lg">
            Create new Trip
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Content>
            <Fieldset.Root size="lg" maxW="md">
              <Stack>
                <Fieldset.Legend>New Trip</Fieldset.Legend>
                <Fieldset.HelperText>
                  Put in the details of the trip
                </Fieldset.HelperText>
              </Stack>

              <form onSubmit={handleSubmit}>
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

                </Fieldset.Content>


                <Button type="submit" mt="4" size="lg" w="full">
                  Create Trip
                </Button>
              </form>
            </Fieldset.Root>
          </Dialog.Content>
        </Portal>

      </Dialog.Root>

      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>
    </Box>
  );
}
