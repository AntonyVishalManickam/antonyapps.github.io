// apps.js
// Edit this array to add/remove apps.
// For each app:
//  id - unique string
//  name - app title
//  developer - developer name
//  category - apps | games | offers
//  rating - initial displayed rating (used only as initial value if you want)
//  size - text
//  image - image URL (240x240 recommended)
//  download - direct download URL (must permit hotlinking)

const apps = [
  {
    id: 'smaiv-notes',
    name: 'SMAIV Notes',
    developer: 'SMAIV TECH',
    category: 'apps',
    rating: 4.6,
    size: '8 MB',
    image: 'https://via.placeholder.com/240x240.png?text=SMAIV+Notes',
    download: 'https://example.com/downloads/smaiv-notes.apk',
    short: 'Simple notes app with quick widgets and backup.',
    tags: ['Productivity','Notes']
  },
  {
    id: 'smaiv-runner',
    name: 'SMAIV Runner',
    developer: 'SMAIV GAMES',
    category: 'games',
    rating: 4.4,
    size: '62 MB',
    image: 'https://via.placeholder.com/240x240.png?text=SMAIV+Runner',
    download: 'https://example.com/downloads/smaiv-runner.apk',
    short: 'Endless runner with powerups & local leaderboards.',
    tags: ['Arcade','Runner']
  },
  {
    id: 'smaiv-toolkit',
    name: 'SMAIV Toolkit',
    developer: 'SMAIV TECH',
    category: 'offers',
    rating: 4.2,
    size: '14 MB',
    image: 'https://via.placeholder.com/240x240.png?text=SMAIV+Toolkit',
    download: 'https://example.com/downloads/smaiv-toolkit.apk',
    short: 'Handy utilities and small tools for power users.',
    tags: ['Tools','Utilities']
  }
];
