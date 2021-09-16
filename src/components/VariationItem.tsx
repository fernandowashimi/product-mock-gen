import {
  Box,
  Flex,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  SlideFade,
  Stack,
  Tag,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';

interface VariationItemProps {
  onEdit: (formValues: { type: string; value: string; values: string[] }) => void;
  onRemove: (type: string) => void;
  type: string;
  values: string[];
}

const VariationItem = ({ onEdit, onRemove, type, values }: VariationItemProps) => {
  return (
    <SlideFade in={true} offsetY="100px">
      <Box rounded="md" border="1px" borderColor="gray.200" p={4}>
        <Stack direction="row" spacing={4} alignItems="center">
          <Box flexGrow={1}>
            <Heading as="h2" size="sm">
              {type}
            </Heading>
          </Box>

          <Stack direction="row" spacing={4}>
            <Popover placement="top-end">
              <PopoverTrigger>
                <IconButton aria-label="View" icon={<ViewIcon />} />
              </PopoverTrigger>
              <Portal>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverHeader>
                    <b>{type}</b> values
                  </PopoverHeader>
                  <PopoverCloseButton />
                  <PopoverBody>
                    <Flex wrap="wrap" pb={2}>
                      {values.map((val, index) => (
                        <Tag
                          key={index}
                          borderRadius="full"
                          variant="solid"
                          colorScheme="blue"
                          m={1}
                        >
                          {val}
                        </Tag>
                      ))}
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              onClick={() => onEdit({ type, value: '', values })}
            />
            <IconButton aria-label="Remove" icon={<DeleteIcon />} onClick={() => onRemove(type)} />
          </Stack>
        </Stack>
      </Box>
    </SlideFade>
  );
};

export default VariationItem;
