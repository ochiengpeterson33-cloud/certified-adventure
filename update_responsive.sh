#!/bin/bash
# A script to run comprehensive sed replacements for responsive layouts across files.

# Ensure max-w-7xl is replaced with a responsive container logic if needed, but max-w-7xl mx-auto is already good. Let's make sure it has padding everywhere.
# `px-4 sm:px-6 lg:px-8` -> good.

# In Navbar.tsx:
# Make sure the mobile menu is styled perfectly.
sed -i 's/text-2xl font-semibold/text-xl sm:text-2xl font-semibold/g' src/components/Navbar.tsx

# In Hero.tsx:
# Already has font-['Poppins'] text-[clamp(2.5rem,6vw+1rem,6rem)]
sed -i 's/mt-20/mt-24 md:mt-20/g' src/components/Hero.tsx
sed -i 's/text-lg md:text-2xl/text-base sm:text-lg md:text-xl lg:text-2xl/g' src/components/Hero.tsx
sed -i 's/px-8 py-4/px-6 py-3 sm:px-8 sm:py-4/g' src/components/Hero.tsx

# Footer.tsx:
# Let's check Footer layout.
