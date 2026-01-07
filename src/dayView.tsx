import {
  Box,
  Button,
  Heading,
  Timeline,
  For,
  Text,
  Flex,
  Spacer
} from "@chakra-ui/react"

import { useState, useEffect } from 'react'
import { Trip, Day } from "./types"
import { LuPizza, LuMapPin, LuTrainFront, LuKey, LuBed, LuPlus } from "react-icons/lu"
import { getAccomColor, dialog, DialogProps } from "./tripView";

export interface DayViewProps {
  thisTrip: Trip | null;
  dayNum: number;
}

export default function DayView({ thisTrip, dayNum }: DayViewProps) {

  const thisDay = thisTrip?.days[dayNum - 1]; // Temporary: always show first day

  // Filter out only the 'staying-at' type items to display these separately at the end of the day.
  const stayingAtItems = thisDay?.items.filter(item => item.type === 'staying-at');
  const otherItems = thisDay?.items.filter(item => item.type !== 'staying-at');

  const ItineraryItemForm = () => {
    return (
      <Box></Box>
    )
  }

  return (
    <Box p="2">
      <Flex gap="2" direction="row" flexWrap="wrap">
        <Box borderWidth="1px" borderRadius="md" boxShadow="md" p="4" flex="1 1 0" minWidth={{ base: "100%", md: "300px" }} pb="5">
          <Flex direction="row" wrap="nowrap" alignItems="center">
            <Heading mb={4} size="lg">Daily Itinerary</Heading>
            <Spacer />
            <Button variant="outline"
              onClick={() => dialog.open("itinerary-form", {
                title: "Add Activity",
                content: <ItineraryItemForm />,
                size: "lg",
                placement: "center"
              })}>
              <LuPlus />
              Add Item
            </Button>
            <dialog.Viewport />
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
    </Box>
  )
}