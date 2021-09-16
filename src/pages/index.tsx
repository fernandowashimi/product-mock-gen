import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  SimpleGrid,
  ScaleFade,
  SlideFade,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, ViewIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import VariationFormModal, { VariationModalRef } from '../components/VariationForm';
import VariationItem from '../components/VariationItem';
import SkuFormModal, { SkuModalRef } from '../components/SkuForm';
import SkuItem from '../components/SkuItem';

interface Form {
  id: string;
  name: string;
  description: string;
}

interface VariationLevel {
  type: string;
  values: string[];
}

const initialFormValue: Form = {
  id: '',
  name: '',
  description: '',
};

const initialProductValue: Product = {
  id: '',
  name: '',
  description: '',
  priceText: '',
  oldPriceText: '',
  price: 0,
  oldPrice: 0,
  installment: {
    count: 0,
    value: 0,
    valueText: '',
  },
  skus: [],
  specs: [],
};

const baseSkuValue: Sku = {
  originalProductId: '',
  skuId: '',
  name: '',
  ean: '',
  priceText: '',
  oldPriceText: '',
  price: 0,
  oldPrice: 0,
  installment: {
    count: 0,
    value: 0,
    valueText: '',
  },
  images: [],
  specs: [],
};

const getRandomNumber = () =>
  Math.floor(Math.random() * (9999999999999 - 1000000000000) + 1000000000000);

const setLastNode = (spec: Spec, last: Spec[] | null) => {
  let result: Spec;

  if (spec.subSpecs) {
    result = { ...spec, subSpecs: [setLastNode(spec.subSpecs[0], last)] };
  } else {
    result = { ...spec, subSpecs: last };
  }

  return result;
};

const getLastNode = (spec: Spec) => {
  let result: Spec;

  if (spec.subSpecs) {
    result = getLastNode(spec.subSpecs[0]);
  } else {
    result = { ...spec };
  }

  return result;
};

const generateSkuSpecs = (specs: Spec[], path?: Spec) => {
  let result: Spec[] = [];

  specs.forEach((spec) => {
    if (spec.subSpecs) {
      result.push(
        ...generateSkuSpecs(
          spec.subSpecs,
          path ? setLastNode(path, [{ ...spec, subSpecs: null }]) : { ...spec, subSpecs: null },
        ),
      );
    } else {
      const currentPath = path ?? { ...spec, subSpecs: null };
      const subSpec = path ? [spec] : null;

      result.push(setLastNode(currentPath, subSpec));
    }
  });

  return result;
};

const generateSpecs = (variations: VariationLevel[]) => {
  const levels = variations
    .map((variation) => {
      return variation.values.map((value) => {
        return {
          id: value,
          label: value,
          type: variation.type,
          offerId: '',
          subSpecs: null,
        };
      });
    })
    .reverse();

  let current: Spec[] = [];

  levels.forEach((level, index) => {
    const hasNext = index !== levels.length - 1;
    const isFirst = index === 0;

    if (hasNext) {
      const next = levels[index + 1];

      const cur = next.map((x) => {
        return {
          ...x,
          subSpecs: current.length > 0 ? replaceOfferId(current) : level,
        };
      });

      current = cur;
    } else if (isFirst) {
      current = level;
    }
  });

  return replaceOfferId(current);
};

const replaceOfferId = (specs: Spec[]) => {
  return specs.map((x) => ({
    ...x,
    offerId: uuidv4(),
    subSpecs: x.subSpecs?.map((y) => ({ ...y, offerId: uuidv4() })) || null,
  }));
};

const generateSkuName = (name: string, spec: Spec) => {
  let concat = '';

  if (spec.subSpecs) {
    concat = generateSkuName(`${name} ${spec.label}`, spec.subSpecs[0]);
  } else {
    concat = `${name} ${spec.label}`;
  }

  return concat;
};

const Home = () => {
  const variationModal = useRef<VariationModalRef>(null);
  const skuModal = useRef<SkuModalRef>(null);

  const [product, setProduct] = useState(initialProductValue);
  const [form, setForm] = useState({ ...initialFormValue, id: uuidv4() });
  const [variations, setVariations] = useState<VariationLevel[]>([]);

  const {
    isOpen: isResultModalOpen,
    onOpen: onResultModalOpen,
    onClose: onResultModalClose,
  } = useDisclosure();
  const {
    isOpen: isVariationModalOpen,
    onOpen: onVariationModalOpen,
    onClose: onVariationModalClose,
  } = useDisclosure();
  const {
    isOpen: isSkuModalOpen,
    onOpen: onSkuModalOpen,
    onClose: onSkuModalClose,
  } = useDisclosure();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddVariation = ({ type, values }: { type: string; values: string[] }) => {
    const exists = variations.some((x) => x.type === type);

    if (!exists) {
      setVariations((prev) => [...prev, { type, values }]);
    }
  };

  const handleEditVariation = ({
    previousType,
    type,
    values,
  }: {
    previousType: string;
    type: string;
    values: string[];
  }) => {
    const index = variations.findIndex((x) => x.type === previousType);

    if (index >= 0) {
      const newArray = variations;
      newArray[index] = { type, values };

      setVariations([...newArray]);
    }
  };

  const handleRemoveVariation = (type: string) => {
    const newArray = variations.filter((x) => x.type !== type);

    setVariations([...newArray]);
  };

  const handleOpenVariationModalWithValues = (formValues: {
    type: string;
    value: string;
    values: string[];
  }) => {
    variationModal.current?.openWithValues(formValues);
  };

  const handleEditSku = (sku: Sku) => {
    const newArray = [...product.skus];
    const index = newArray.findIndex((x) => x.skuId === sku.skuId);

    if (index >= 0) {
      newArray[index] = sku;

      setProduct((prev) => ({ ...prev, skus: newArray }));
    }
  };

  const handleOpenSkuModalWithValues = (sku: Sku) => {
    skuModal.current?.openWithValues(sku);
  };

  const handleGenerate = () => {
    const allImages = product.skus.flatMap((x) => x.images);

    const cheapestProduct = product.skus.reduce((acc, cur, index) => {
      if (index === 0) return cur;

      if (cur.price < acc.price) {
        return cur;
      } else {
        return acc;
      }
    }, baseSkuValue);

    console.log(cheapestProduct);

    setProduct((prev) => ({
      id: prev.id,
      name: prev.name,
      description: prev.description,
      oldPrice: cheapestProduct.oldPrice,
      oldPriceText: cheapestProduct.oldPriceText,
      price: cheapestProduct.price,
      priceText: cheapestProduct.priceText,
      installment: cheapestProduct.installment,
      images: [...allImages],
      skus: prev.skus,
      specs: prev.specs,
    }));

    onResultModalOpen();
  };

  useEffect(() => {
    const { id, name, description } = form;

    setProduct((prev) => ({
      ...prev,
      id,
      name,
      description,
    }));
  }, [form]);

  useEffect(() => {
    const specs = generateSpecs(variations);
    const skusSpecs = generateSkuSpecs(specs);

    const skus = skusSpecs.map((sku) => ({
      ...baseSkuValue,
      originalProductId: form.id,
      skuId: getLastNode(sku).offerId,
      name: generateSkuName(form.name, sku).trim(),
      ean: String(getRandomNumber()),
      specs: [sku],
    }));

    setProduct((prev) => ({
      ...prev,
      skus,
      specs,
    }));
  }, [variations, form]);

  return (
    <div>
      <Head>
        <title>Mock generator</title>
      </Head>

      <Container maxW="xl" py="16">
        <SlideFade offsetY="128px" in={true}>
          <SimpleGrid columns={1} spacing={8}>
            <ScaleFade initialScale={0.6} in={true}>
              <Stack spacing={4}>
                <Heading as="h1" size="md">
                  Details
                </Heading>

                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Product name"
                    variant="filled"
                  />
                </FormControl>

                <FormControl id="description" isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Product description"
                    variant="filled"
                    resize="none"
                  />
                </FormControl>
              </Stack>
            </ScaleFade>

            <ScaleFade initialScale={0.6} in={true}>
              <Stack spacing={4}>
                <Heading as="h1" size="md">
                  Variations
                </Heading>

                {variations.length > 0 ? (
                  <>
                    {variations.map((variation, index) => {
                      return (
                        <VariationItem
                          key={index}
                          type={variation.type}
                          values={variation.values}
                          onEdit={handleOpenVariationModalWithValues}
                          onRemove={handleRemoveVariation}
                        />
                      );
                    })}
                  </>
                ) : (
                  <Box bg="red.200" p={4} rounded="md">
                    <Text>No variation registered.</Text>
                  </Box>
                )}

                <Box>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    variant="solid"
                    onClick={onVariationModalOpen}
                  >
                    Add variation
                  </Button>
                </Box>
              </Stack>
            </ScaleFade>

            <ScaleFade initialScale={0.6} in={true}>
              <Stack spacing={4}>
                <Heading as="h1" size="md">
                  SKUs
                </Heading>

                {product.skus.length > 0 ? (
                  <>
                    {product.skus.map((sku, index) => {
                      return (
                        <SkuItem key={index} sku={sku} onEdit={handleOpenSkuModalWithValues} />
                      );
                    })}
                  </>
                ) : (
                  <Box bg="red.200" p={4} rounded="md">
                    <Text>SKUs will be generated after adding the variation list.</Text>
                  </Box>
                )}
              </Stack>
            </ScaleFade>

            <Box>
              <Button
                leftIcon={<ViewIcon />}
                colorScheme="green"
                variant="solid"
                onClick={handleGenerate}
                isFullWidth
              >
                Generate data
              </Button>
            </Box>
          </SimpleGrid>
        </SlideFade>
      </Container>

      <Modal size="3xl" isOpen={isResultModalOpen} onClose={onResultModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box bg="blue.900" rounded="md" p={4}>
              <pre style={{ overflow: 'auto' }}>
                <Text color="white">{JSON.stringify(product, null, 2)}</Text>
              </pre>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      <VariationFormModal
        ref={variationModal}
        isOpen={isVariationModalOpen}
        onClose={onVariationModalClose}
        onEdit={handleEditVariation}
        onOpen={onVariationModalOpen}
        onSave={handleAddVariation}
      />

      <SkuFormModal
        ref={skuModal}
        isOpen={isSkuModalOpen}
        onClose={onSkuModalClose}
        onOpen={onSkuModalOpen}
        onSave={handleEditSku}
      />
    </div>
  );
};

export default Home;
