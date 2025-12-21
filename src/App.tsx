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
  Timeline
} from "@chakra-ui/react"
import { LuTicketsPlane, LuPlaneLanding, LuPlaneTakeoff,  } from "react-icons/lu"
import { ColorModeToggle } from "./components/color-mode-toggle"

export default function Page() {
  return (
    <Box textAlign="left" fontSize="xl" pt="30vh">
      <VStack gap="8">
        {/* <img alt="chakra logo" src="/static/logo.svg" width="80" height="80" /> */}
        <Heading size="2xl" letterSpacing="tight">
          Below are some template UI elements from Chakra UI.
        </Heading>

        <Heading size="xl" letterSpacing="tight">
          Timeline:
        </Heading>

        <Timeline.Root maxW="400px">
          <Timeline.Item>
            <Timeline.Content width="auto">
              <Timeline.Title whiteSpace="nowrap">May 2, 2026</Timeline.Title>
            </Timeline.Content>
            <Timeline.Connector>
              <Timeline.Separator />
              <Timeline.Indicator>
                <LuTicketsPlane />
              </Timeline.Indicator>
            </Timeline.Connector>
            
            <Timeline.Content>
              <Timeline.Title>Flights booked:</Timeline.Title>
              <Timeline.Description />
              {// Nested Timeline to show flight departure and arrival
              }
              <Timeline.Root maxW="400px" variant="subtle">
                <Timeline.Item>
                  <Timeline.Connector>
                    <Timeline.Separator />
                    <Timeline.Indicator>
                      <LuPlaneTakeoff />
                    </Timeline.Indicator>
                  </Timeline.Connector>
                  <Timeline.Content>
                    <Timeline.Title>Departure</Timeline.Title>
                    <Timeline.Description>LHR - 10:00 AM</Timeline.Description>
                  </Timeline.Content>
                </Timeline.Item>

                <Timeline.Item>
                  <Timeline.Connector>
                    <Timeline.Separator />
                    <Timeline.Indicator>
                      <LuPlaneLanding />
                    </Timeline.Indicator>
                  </Timeline.Connector>
                  <Timeline.Content>
                    <Timeline.Title>Arrival</Timeline.Title>
                    <Timeline.Description>NRT - 1:00 PM</Timeline.Description>
                  </Timeline.Content>
                </Timeline.Item>
              </Timeline.Root>
            </Timeline.Content>
          </Timeline.Item>
        </Timeline.Root>

        <HStack gap="10">
          <Checkbox.Root defaultChecked>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>Checkbox</Checkbox.Label>
          </Checkbox.Root>

          <RadioGroup.Root display="inline-flex" defaultValue="1">
            <RadioGroup.Item value="1" mr="2">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl>
                <RadioGroup.ItemIndicator />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemText lineHeight="1">Radio</RadioGroup.ItemText>
            </RadioGroup.Item>

            <RadioGroup.Item value="2">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl>
                <RadioGroup.ItemIndicator />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemText lineHeight="1">Radio</RadioGroup.ItemText>
            </RadioGroup.Item>
          </RadioGroup.Root>
        </HStack>

        <Progress.Root width="300px" value={65} striped>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>

        <HStack>
          <Button>Let's go!</Button>
          <Button variant="outline">bun install @chakra-ui/react</Button>
        </HStack>
      </VStack>

      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>
    </Box>
  )
}
