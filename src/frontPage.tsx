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
import { LuTicketsPlane, LuPlaneLanding, LuPlaneTakeoff,  } from "react-icons/lu"
import { ColorModeToggle } from "./components/color-mode-toggle"
import { Trip } from "./types"

export default function Page() {
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
            <Fieldset.Root size = "lg" maxW="md">
              <Stack>
                <Fieldset.Legend>New Trip</Fieldset.Legend>
                <Fieldset.HelperText> 
                 Put in the details of the trip 
                </Fieldset.HelperText>
              </Stack>

              <Fieldset.Content> 
                <Field.Root>
                  <Field.Label>Trip Name</Field.Label>
                  <Input name = "title"/>
                </Field.Root>

                <Field.Root> 
                  <Field.Label>Destination</Field.Label>
                  <Input name = "destination"/>
                </Field.Root>

              </Fieldset.Content>



            </Fieldset.Root>
          </Dialog.Content>
        </Portal>








      </Dialog.Root>
      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>
    </Box> )
}
