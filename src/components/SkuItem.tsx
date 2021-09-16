import { Badge, Box, IconButton, SlideFade, Stack, Tooltip } from '@chakra-ui/react';
import { EditIcon, WarningTwoIcon } from '@chakra-ui/icons';

interface SkuItemProps {
  onEdit: (sku: Sku) => void;
  sku: Sku;
}

const getBadges = (spec: Spec, badges: string[] = []) => {
  let result: string[] = [];

  if (spec.subSpecs) {
    result = [...getBadges(spec.subSpecs[0], [...badges, spec.label])];
  } else {
    result = [...badges, spec.label];
  }

  return result;
};

const getErrors = (sku: Sku) => {
  let errors: string[] = [];

  if (sku.price === 0) errors.push('price');
  if (sku.images.length === 0) errors.push('images');

  return errors;
};

const SkuItem = ({ onEdit, sku }: SkuItemProps) => {
  const errors = getErrors(sku);
  const hasErrors = errors.length > 0;

  return (
    <SlideFade in={true} offsetY="100px">
      <Box rounded="md" border="1px" borderColor="gray.200" p={4}>
        <Stack direction="row" spacing={4} alignItems="center">
          <Stack direction="row" spacing={2} flexGrow={1}>
            {getBadges(sku.specs[0]).map((badge, index) => {
              return (
                <Badge key={index} colorScheme="blue" fontSize="md" variant="outline">
                  {badge}
                </Badge>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
            {hasErrors && (
              <Tooltip
                hasArrow
                label={`There are fields missing (${errors.join(', ')})`}
                placement="top-start"
              >
                <WarningTwoIcon color="red.400" w={5} h={5} />
              </Tooltip>
            )}
            <IconButton aria-label="Edit" icon={<EditIcon />} onClick={() => onEdit(sku)} />
          </Stack>
        </Stack>
      </Box>
    </SlideFade>
  );
};

export default SkuItem;
