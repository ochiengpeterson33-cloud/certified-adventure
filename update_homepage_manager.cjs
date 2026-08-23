const fs = require('fs');
const content = fs.readFileSync('src/admin/HomepageManager.tsx', 'utf8');

let newContent = content.replace(
  `const SECTIONS = [
  { id: 'stats', label: 'Stats Counter' },
  { id: 'features', label: 'Feature Bar' },
  { id: 'why-choose-us', label: 'Why Choose Us' },
  { id: 'merch-store', label: 'Merch Store' },
];`,
  `const SECTIONS = [
  { id: 'stats', label: 'Stats Counter' },
  { id: 'features', label: 'Feature Bar' },
  { id: 'why-choose-us', label: 'Why Choose Us' },
  { id: 'merch-store', label: 'Merch Store' },
  { id: 'gallery', label: 'Gallery' },
];`
);

newContent = newContent.replace(
  `case 'homepage-merch-store':
          return JSON.stringify([`,
  `case 'homepage-gallery':
          return JSON.stringify([
            { id: '1', type: 'image', src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80', span: 'col-span-2 row-span-2' },
            { id: '2', type: 'video', src: 'https://images.unsplash.com/photo-1549468057-5ce754b4fa26?auto=format&fit=crop&w=800&q=80', span: 'col-span-1 row-span-2' },
            { id: '3', type: 'image', src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80', span: 'col-span-1 row-span-1' },
            { id: '4', type: 'image', src: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', span: 'col-span-1 row-span-1' },
            { id: '5', type: 'image', src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', span: 'col-span-2 row-span-1' }
          ], null, 2);
        case 'homepage-merch-store':
          return JSON.stringify([`
);

fs.writeFileSync('src/admin/HomepageManager.tsx', newContent);
