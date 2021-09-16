import {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Kbd,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ScaleFade,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

export interface VariationModalRef {
  openWithValues: (formValues: Form) => void;
}

interface VariationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (formValues: { previousType: string; type: string; values: string[] }) => void;
  onOpen: () => void;
  onSave: (formValues: { type: string; values: string[] }) => void;
}

interface Form {
  type: string;
  value: string;
  values: string[];
}

const initialFormValue: Form = {
  type: '',
  value: '',
  values: [],
};

const VariationFormModal = (
  { isOpen, onClose, onEdit, onOpen, onSave }: VariationFormModalProps,
  ref: ForwardedRef<VariationModalRef>,
) => {
  const [form, setForm] = useState(initialFormValue);
  const [isValid, setIsValid] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [previousType, setPreviousType] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddValue = (val: string) => {
    if (val && !form.values.includes(val)) {
      setForm((prev) => ({
        ...prev,
        values: [...prev.values, val],
      }));
    }

    setForm((prev) => ({
      ...prev,
      value: '',
    }));
  };

  const handleRemoveValue = (val: string) => {
    const newArray = form.values.filter((x) => x !== val);

    setForm((prev) => ({
      ...prev,
      values: [...newArray],
    }));
  };

  const handleClear = () => {
    setForm({ type: '', value: '', values: [] });
    setMode('add');
    setPreviousType(null);
  };

  const handleComplete = () => {
    if (mode === 'add') {
      onSave({ type: form.type, values: form.values });
    } else {
      onEdit({ previousType: previousType ?? form.type, type: form.type, values: form.values });
    }

    onClose();
    handleClear();
  };

  const handleCancel = () => {
    onClose();
    handleClear();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddValue(form.value);
    }
  };

  useImperativeHandle(ref, () => ({
    openWithValues: (formValues: Form) => {
      onOpen();
      setForm(formValues);
      setMode('edit');
      setPreviousType(formValues.type);
    },
  }));

  useEffect(() => {
    setIsValid(!!form.type && form.values.length > 0);
  }, [form]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Add variation</ModalHeader>
        <ModalBody pb={6}>
          <Stack spacing={4}>
            <FormControl id="type" isRequired>
              <FormLabel>Type</FormLabel>
              <Input
                id="type"
                value={form.type}
                onChange={handleInputChange}
                placeholder="Variation type (e.g. color, size)."
                variant="filled"
              />
            </FormControl>

            <FormControl id="value" isRequired>
              <FormLabel>Values</FormLabel>

              <Flex wrap="wrap" pb={2}>
                {form.values.map((val, index) => (
                  <ScaleFade key={index} initialScale={0.6} in={true} unmountOnExit>
                    <Tag borderRadius="full" variant="solid" colorScheme="blue" m={1}>
                      <TagLabel>{val}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveValue(val)} />
                    </Tag>
                  </ScaleFade>
                ))}
              </Flex>

              <InputGroup>
                <Input
                  id="value"
                  value={form.value}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Variation value"
                  pr="8rem"
                />
                <InputRightElement width="8rem">
                  <Stack direction="row">
                    <span>
                      <Kbd>enter</Kbd>
                    </span>

                    <span>or</span>

                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => handleAddValue(form.value)}
                      colorScheme="blue"
                      h="1.75rem"
                      size="sm"
                      aria-label="Remove"
                    />
                  </Stack>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} isDisabled={!isValid} onClick={handleComplete}>
            Save
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </ModalFooter>

        <ModalCloseButton onClick={handleCancel} />
      </ModalContent>
    </Modal>
  );
};

export default forwardRef(VariationFormModal);
