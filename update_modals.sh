#!/bin/bash
sed -i 's/my-8 max-h-\[90vh\]/my-2 sm:my-8 max-h-\[95vh\] sm:max-h-\[90vh\]/g' src/components/ExperienceModal.tsx
sed -i 's/h-64 sm:h-80/h-48 sm:h-64 md:h-80/g' src/components/ExperienceModal.tsx

sed -i 's/my-8 max-h-\[90vh\]/my-2 sm:my-8 max-h-\[95vh\] sm:max-h-\[90vh\]/g' src/components/BookingModal.tsx
sed -i 's/h-64 sm:h-80/h-48 sm:h-64 md:h-80/g' src/components/BookingModal.tsx

sed -i 's/my-8 max-h-\[90vh\]/my-2 sm:my-8 max-h-\[95vh\] sm:max-h-\[90vh\]/g' src/components/CustomTripBuilder.tsx
sed -i 's/h-64 sm:h-80/h-48 sm:h-64 md:h-80/g' src/components/CustomTripBuilder.tsx

