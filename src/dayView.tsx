import {
  Box,
  Button,
  Heading,
  Timeline,
  For,
  Text,
  Flex,
  Spacer,
  Fieldset,
  Field,
  Stack,
  NativeSelect,
  Input,
  Dialog
} from "@chakra-ui/react"

import { useState, useEffect, useCallback } from 'react'
import { Trip, Day, ItineraryItem, ItineraryItemType } from "./types"
import { LuPizza, LuMapPin, LuTrainFront, LuKey, LuBed, LuPlus, LuClock } from "react-icons/lu"
import { getAccomColor, dialog, DialogProps } from "./tripView";
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import TimePicker from "react-time-picker";

export interface DayViewProps {
  thisTrip: Trip | null;
  dayNum: number;
}

const ItineraryItemForm = ({ trip, setTrip, dayNum, thisTrip }: { trip: Trip | null; setTrip: (trip: Trip) => void; dayNum: number; thisTrip: Trip | null }) => {

  const [newItineraryItem, setNewItineraryItem] = useState<Partial<ItineraryItem>>({
    id: "",
    time: "",
    activity: "",
    location: "",
    type: undefined
  })

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItineraryItem.activity && newItineraryItem.time) {
      const itemId = `item-${Date.now()}`;
      const itemToAdd: ItineraryItem = {
        id: itemId,
        activity: newItineraryItem.activity || "",
        type: (newItineraryItem.type) as ItineraryItemType,
        location: newItineraryItem.location || "",
        time: newItineraryItem.time ?? ""
      };

      // Update only the current day's items
      const updatedDays = trip!.days.map((day, index) => {
        if (index === dayNum - 1) {
          let updatedItems = [...day.items, itemToAdd];
          updatedItems.sort((a, b) => {
            return Date.parse('1970/01/01 ' + a.time) - Date.parse('1970/01/01 ' + b.time);
          });
          return { ...day, items: updatedItems };
        }
        return day;
      });

      const newTrip = {
        ...trip!,
        days: updatedDays
      };

      setTrip(newTrip);

      // Reset form
      setNewItineraryItem({
        id: "",
        time: "",
        activity: "",
        location: "",
        type: undefined
      });

      try {
        const response = await fetch(`http://localhost:3000/api/trips/${newTrip.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTrip),
        });

        if (!response.ok) {
          alert('Failed to add item. Please try again');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
      }
    }
  };

  return (
    <Fieldset.Root size="lg" maxW="md" p="4">
      <Stack>
        <Fieldset.Legend>New Activity</Fieldset.Legend>
        <Fieldset.HelperText>
          Add the details of your itinerary item
        </Fieldset.HelperText>
      </Stack>

      <Fieldset.Content>
        <Field.Root>
          <Field.Label>Activity Type</Field.Label>
          <NativeSelect.Root size="md">
            <NativeSelect.Field placeholder="Select type..." value={newItineraryItem.type || ""} onChange={(e) => setNewItineraryItem({ ...newItineraryItem, type: e.target.value as ItineraryItemType })}>
              <For each={['activity', 'transport', 'meal', 'other']}>
                {(type) => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                )}
              </For>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Title/Description</Field.Label>
          <Input name="title" value={newItineraryItem.activity} onChange={e => setNewItineraryItem({ ...newItineraryItem, activity: e.target.value })} />
        </Field.Root>

        <Field.Root>
          <Field.Label><LuMapPin />Location</Field.Label>
          <Input name="location" value={newItineraryItem.location} onChange={e => setNewItineraryItem({ ...newItineraryItem, location: e.target.value })} />
        </Field.Root>

        <Field.Root>
          <Box className="light">
            <Field.Label><LuClock />Time</Field.Label>
            <TimePicker name="time" value={newItineraryItem.time || ""}
              onChange={(time: string | null) => setNewItineraryItem({ ...newItineraryItem, time: time ?? undefined })} />
          </Box>
        </Field.Root>

        <Flex direction="flex-end" gap="4" alignItems="center" mt="4">
          <Dialog.ActionTrigger asChild>
            <Button size="md" variant="outline">Cancel</Button>
          </Dialog.ActionTrigger>
          <Button size="md" colorPalette="blue" onClick={handleSubmitItem}>
            Add to Itinerary
          </Button>
        </Flex>
      </Fieldset.Content>
    </Fieldset.Root>
  )
}

export default function DayView({ thisTrip, dayNum }: DayViewProps) {

  // Check immediately before any state setup
  if (!thisTrip || !thisTrip.days || thisTrip.days.length === 0 || !thisTrip.days[dayNum - 1]) {
    return <Box p="4"><Text>Day not found or trip data not available.</Text></Box>;
  }

  const [trip, setTrip] = useState<Trip | null>(thisTrip);
  const thisDay = trip!.days[dayNum - 1];
  const stayingAtItems = thisDay?.items.filter(item => item.type === 'staying-at');
  const otherItems = thisDay?.items.filter(item => item.type !== 'staying-at');

  const openAddItemDialog = useCallback(() => {
    dialog.open("itinerary-form", {
      title: "Add Activity",
      content: <ItineraryItemForm trip={trip} setTrip={setTrip} dayNum={dayNum} thisTrip={thisTrip} />,
      size: "lg",
      placement: "center"
    });
  }, [trip, dayNum, thisTrip]);

  return (
    <Box p="2">
      <Flex gap="2" direction="row" flexWrap="wrap">
        <Box borderWidth="1px" borderRadius="md" boxShadow="md" p="4" flex="1 1 0" minWidth={{ base: "100%", md: "300px" }} pb="5">
          <Flex direction="row" wrap="nowrap" alignItems="center">
            <Heading mb={4} size="lg">Daily Itinerary</Heading>
            <Spacer />
            <Button variant="outline" onClick={openAddItemDialog}>
              <LuPlus />
              Add Item
            </Button>
          </Flex>
          <Timeline.Root>
            <For each={otherItems}>
              {(item) => (
                <Timeline.Item>
                  <Timeline.Connector>
                    <Timeline.Separator />
                    <Timeline.Indicator>
                      {item.type === 'meal' ? <LuPizza /> : item.type === 'activity' ? <LuMapPin /> : item.type === 'transport' ? <LuTrainFront /> : item.type === 'check-in' || item.type === 'check-out' ? <LuKey /> : null}
                    </Timeline.Indicator>
                  </Timeline.Connector>
                  <Timeline.Content>
                    <Timeline.Title>{item.activity}</Timeline.Title>
                    <Timeline.Description>{item.time}</Timeline.Description>
                    {(item.type === 'check-in' || item.type === 'check-out') // For check-in and check-out items:
                      ? (() => {
                        const accomId = item.accommodationId;
                        // Find the relevant accommodation details to display here:
                        const accom = accomId ? thisTrip?.accommodations.find(a => a.id === accomId) : null;
                        return ( // Display accomodation name and address for check-in.
                          <Text textStyle="sm">
                            {accom ? `Check-in at ${accom.name}` : 'Check-in at unknown location'}
                            <br />
                            {accom ? `Location: ${accom.address}` : 'Location: unknown'}
                          </Text>
                        );
                      })()
                      : null
                    }
                  </Timeline.Content>
                </Timeline.Item>
              )}
            </For>

            {stayingAtItems && stayingAtItems.length > 0 && ( // If we have at least one 'staying at' item
              <Timeline.Item>
                <Timeline.Connector>
                  <Timeline.Separator />
                  <Timeline.Indicator backgroundColor={getAccomColor(stayingAtItems[0])}>
                    <LuBed />
                  </Timeline.Indicator>
                </Timeline.Connector>
                <Timeline.Content>
                  <Timeline.Title>Staying At</Timeline.Title>
                  <Timeline.Description>
                    {stayingAtItems.map(item => {
                      const accomId = item.accommodationId;
                      const accom = accomId ? thisTrip?.accommodations.find(a => a.id === accomId) : null;
                      return (
                        <Text key={item.id} textStyle="sm">
                          {accom ? `Staying at ${accom.name}` : 'Staying at unknown location'}
                        </Text>
                      );
                    })}
                  </Timeline.Description>
                </Timeline.Content>
              </Timeline.Item>
            )}
          </Timeline.Root>
        </Box>
        <Box borderWidth="1px" borderRadius="md" boxShadow="md" p="4" flex="1 1 0" minWidth={{ base: "100%", md: "300px" }}>
          <Heading mb={4} size="lg">Todo List</Heading>
        </Box>
      </Flex>
      <dialog.Viewport />
    </Box>
  )
}