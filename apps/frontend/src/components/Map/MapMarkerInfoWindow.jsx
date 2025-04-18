import { InfoWindow } from '@react-google-maps/api';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Link,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { MapPin, Navigation2, Star } from 'lucide-react';
import DefaultImg from '../../assets/images/bonsai-tree-logo.png';

const MapMarkerInfoWindow = ({
  selectedMarker,
  onMouseEnter,
  onMouseLeave,
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');

  const renderStars = rating => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon
            key={i}
            as={Star}
            color="yellow.400"
            boxSize={4}
            fill="currentColor"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Box key={i} position="relative" width="16px" height="16px">
            <Icon
              as={Star}
              color="yellow.400"
              boxSize={4}
              fill="currentColor"
              position="absolute"
              clipPath="inset(0 50% 0 0)"
            />
            <Icon
              as={Star}
              color="gray.200"
              boxSize={4}
              fill="currentColor"
              position="absolute"
            />
          </Box>
        );
      } else {
        stars.push(
          <Icon
            key={i}
            as={Star}
            color="gray.200"
            boxSize={4}
            fill="currentColor"
          />
        );
      }
    }
    return stars;
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    selectedMarker.address
  )}`;

  return (
    <InfoWindow
      position={selectedMarker.position}
      options={{
        disableAutoPan: true,
        pixelOffset: new window.google.maps.Size(0, -90),
      }}
      onCloseClick={null}
    >
      <Box
        width={{ base: 'auto', md: '300px' }}
        bg={bgColor}
        borderRadius="md"
        borderWidth="2px"
        borderStyle="solid"
        borderColor={bgColor}
        boxShadow="lg"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        whiteSpace="normal"
        overflow="hidden"
      >
        <VStack align="stretch" spacing={0}>
          <Image
            src={selectedMarker.photo || DefaultImg}
            alt={`${selectedMarker.name} thumbnail`}
            height="auto"
            maxHeight="180px"
            objectFit="cover"
            width="100%"
            maxWidth="100%"
            onError={(e) => {
              e.target.src = DefaultImg;
              e.target.onerror = null;
            }}
            fallback={<Box height="180px" width="100%" bg="gray.200" />}
          />

          <Box backgroundColor={bgColor} p={4}>
            <HStack justify="space-between" align="flex-start" mb={2}>
              <Text
                color={textColor}
                fontWeight="bold"
                fontSize="lg"
                noOfLines={2}
                maxWidth="75%"
              >
                {selectedMarker.name}
              </Text>
              <Tooltip
                label="Get Directions"
                placement="top"
                bg="white"
                color="gray.800"
              >
                <Link
                  href={directionsUrl}
                  isExternal
                  color="green.500"
                  _hover={{
                    color: 'green.600',
                    transform: 'scale(1.1)',
                  }}
                  transition="all 0.2s"
                  display="block"
                >
                  <Icon as={Navigation2} boxSize={6} />
                </Link>
              </Tooltip>
            </HStack>

            <Box mb={2}>
              <HStack spacing={1} mb={1}>
                <Text fontSize="sm" color={textColor}>
                  Rating:
                </Text>
                <HStack spacing={0.5}>
                  {renderStars(selectedMarker.rating)}
                </HStack>
                <Text fontSize="sm" color={textColor}>
                  {selectedMarker.rating}
                </Text>
              </HStack>
              <Text fontSize="xs" color={textColor}>
                ({selectedMarker.reviewCount} reviews)
              </Text>
            </Box>

            {selectedMarker.address && (
              <HStack spacing={2} mt={2}>
                <Icon
                  as={MapPin}
                  boxSize={4}
                  color={textColor}
                  flexShrink={0}
                />
                <Text color={textColor} fontSize="sm" noOfLines={2}>
                  {selectedMarker.address}
                </Text>
              </HStack>
            )}
          </Box>
        </VStack>
      </Box>
    </InfoWindow>
  );
};

export default MapMarkerInfoWindow;
