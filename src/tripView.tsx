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
import { LuTicketsPlane, LuPlaneLanding, LuPlaneTakeoff,  } from "react-icons/lu"
import { ColorModeToggle } from "./components/color-mode-toggle"

export default function Page() {
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
