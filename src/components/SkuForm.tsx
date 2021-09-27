import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SlideFade,
  Stack,
} from '@chakra-ui/react';
import { AddIcon, LinkIcon, DeleteIcon } from '@chakra-ui/icons';

export interface SkuModalRef {
  openWithValues: (sku: Sku) => void;
}

interface SkuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSave: (sku: Sku) => void;
}

interface SkuForm {
  images: { value: string }[];
  installmentCount: number;
  installmentPrice: string;
  oldPrice: string;
  price: string;
}

const format = (value: string) => `R$ ${value}`.replace('.', ',');

const parse = (value: string) => value.replace(/^\$/, '');

const baseSkuValue = {
  originalProductId: '',
  skuId: '',
  name: '',
  ean: '',
  priceText: '',
  oldPriceText: '',
  price: 0,
  oldPrice: 0,
  installment: null,
  images: [],
  specs: [],
};

const initialFormValue: SkuForm = {
  images: [],
  installmentCount: 0,
  installmentPrice: '',
  oldPrice: '',
  price: '',
};

const SkuFormModal = (
  { isOpen, onClose, onOpen, onSave }: SkuFormModalProps,
  ref: ForwardedRef<SkuModalRef>,
) => {
  const [sku, setSku] = useState<Sku>(baseSkuValue);
  const [form, setForm] = useState(initialFormValue);
  const [isValid, setIsValid] = useState(false);

  const handleImageChange = (value: string, index: number) => {
    const list = [...form.images];

    list[index] = { value };

    setForm((prev) => ({
      ...prev,
      images: [...list],
    }));
  };

  const handleNumberInputChange = (value: string, id: string) => {
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddImageInput = () => {
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, { value: '' }],
    }));
  };

  const handleRemoveImage = (index: number) => {
    const list = [...form.images];

    list.splice(index, 1);

    setForm((prev) => ({
      ...prev,
      images: [...list],
    }));
  };

  const handleComplete = () => {

    const installmentObj = form.installmentCount === 0 ? null : {
      count: form.installmentCount,
      value: parseFloat(form.installmentPrice),
      valueText: format(form.installmentPrice),
    };

    onSave({
      ...sku,
      images: form.images.filter((x) => x.value.length),
      installment: installmentObj,
      oldPrice: parseFloat(form.oldPrice),
      oldPriceText: format(form.oldPrice),
      price: parseFloat(form.price),
      priceText: format(form.price),
    });

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  useImperativeHandle(ref, () => ({
    openWithValues: (sku: Sku) => {
      onOpen();
      setSku(sku);
    },
  }));

  useEffect(() => {
    if (!sku) return;

    setForm({
      images: sku.images,
      installmentCount: sku.installment?.count || 0,
      installmentPrice: String(sku.installment?.value || 0),
      oldPrice: String(sku.price),
      price: String(sku.price),
    });
  }, [sku]);

  useEffect(() => {
    const hasAllImages = form.images.filter((x) => x.value === '').length === 0;
    setIsValid(parseFloat(form.price) > 0 && form.images.length > 0 && hasAllImages);
  }, [form]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Edit SKU</ModalHeader>
        <ModalBody pb={6}>
          <Stack spacing={4}>
            <Stack direction="row">
              <FormControl id="price" isRequired>
                <FormLabel>Price</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children="R$" />
                  <NumberInput
                    id="price"
                    value={form.price}
                    onChange={(value) => handleNumberInputChange(parse(value), 'price')}
                    placeholder="SKU price"
                    variant="filled"
                    min={0}
                    precision={2}
                    step={1}
                    w="full"
                  >
                    <NumberInputField paddingLeft="12" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </InputGroup>
              </FormControl>

              <FormControl id="oldPrice">
                <FormLabel>Old price</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children="R$" />
                  <NumberInput
                    id="oldPrice"
                    value={form.oldPrice}
                    onChange={(value) => handleNumberInputChange(parse(value), 'oldPrice')}
                    placeholder="SKU price"
                    variant="filled"
                    min={0}
                    precision={2}
                    step={1}
                    w="full"
                  >
                    <NumberInputField paddingLeft="12" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </InputGroup>
              </FormControl>
            </Stack>

            <Stack direction="row">
              <FormControl id="installmentCount">
                <FormLabel>Installment count</FormLabel>
                <NumberInput
                  id="installmentCount"
                  value={form.installmentCount}
                  onChange={(value) => handleNumberInputChange(parse(value), 'installmentCount')}
                  placeholder="SKU installment count"
                  variant="filled"
                  min={0}
                  precision={0}
                  step={1}
                  w="full"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl id="installmentPrice">
                <FormLabel>Installment price</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children="R$" />
                  <NumberInput
                    id="installmentValue"
                    value={form.installmentPrice}
                    onChange={(value) => handleNumberInputChange(parse(value), 'installmentPrice')}
                    placeholder="SKU installment price"
                    variant="filled"
                    min={0}
                    precision={2}
                    step={1}
                    w="full"
                  >
                    <NumberInputField paddingLeft="12" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </InputGroup>
              </FormControl>
            </Stack>

            <Stack spacing={4}>
              <FormControl id="images" isRequired>
                <FormLabel>Images</FormLabel>
                <Stack spacing={4}>
                  {form.images.map((image, index) => (
                    <SlideFade key={index} in={true} offsetY="30px">
                      <InputGroup>
                        <InputLeftElement>
                          <LinkIcon />
                        </InputLeftElement>
                        <Input
                          id="images"
                          value={image.value}
                          onChange={(e) => handleImageChange(e.target.value, index)}
                          placeholder="Image URL"
                          variant="filled"
                          pr="3rem"
                        />
                        <InputRightElement width="3rem">
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            h="1.75rem"
                            size="sm"
                            aria-label="Remove"
                            onClick={() => handleRemoveImage(index)}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </SlideFade>
                  ))}
                </Stack>
              </FormControl>

              <Box>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  variant="solid"
                  onClick={handleAddImageInput}
                >
                  Add image
                </Button>
              </Box>
            </Stack>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleComplete} isDisabled={!isValid}>
            Save
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </ModalFooter>

        <ModalCloseButton onClick={handleCancel} />
      </ModalContent>
    </Modal>
  );
};

export default forwardRef(SkuFormModal);
