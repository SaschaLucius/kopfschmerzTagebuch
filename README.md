# Kopfschmerz Tagebuch (Headache Diary)

A minimal-tap Progressive Web App (PWA) for tracking headache patterns, built with Svelte 5 and Vite.

## Features

### 🎯 Quick Entry
- **Interactive Head Canvases**: Tap on front/back head views to mark pain locations
- **Pain Scale**: Select intensity from 1-10 with visual color coding
- **Medication Tracking**: Quick-select common medications or add custom ones
- **Date Navigation**: Easy navigation between days
- **Auto-save**: All changes are automatically saved with 300ms debouncing
- **Notes**: Optional text notes for each entry

### 📅 History Calendar
- **Color-coded Calendar**: Days are colored based on pain intensity
  - Light green (1-3): Mild pain
  - Yellow/Orange (4-6): Moderate pain
  - Red (7-10): Severe pain
- **Day Details**: Tap any day to see full entry details including pain points, medications, and notes
- **Month Navigation**: Browse through months to review past entries

### 📊 Analytics
- **Heatmap Visualization**: See aggregated pain points over time
- **Time Range Filters**: View data for 7, 30, 90, or 365 days
- **Statistics Summary**:
  - Total number of entries
  - Average pain intensity
  - Most common medication
- **Pain Timeline**: Visual chart showing pain intensity over time
- **Front/Back Toggle**: Switch between front and back head views in the heatmap

## Privacy & Data

- **100% Local Storage**: All data is stored in IndexedDB in your browser
- **No Cloud Sync**: No data leaves your device
- **Offline-First**: Works completely offline once installed
- **No Tracking**: No analytics, no cookies, no external requests

## Installation

### Deployment

This app automatically deploys to GitHub Pages when changes are pushed to the main branch. The GitHub Actions workflow builds and deploys the application.

**To enable GitHub Pages for your fork:**
1. Go to your repository Settings → Pages
2. Under "Build and deployment", select "GitHub Actions" as the source
3. Push to the main branch to trigger the deployment

The app will be available at: `https://[username].github.io/kopfschmerzTagebuch/`

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### PWA Installation

When you visit the app in a browser, you can install it as a Progressive Web App:
- **Chrome/Edge**: Click the install icon in the address bar
- **Safari (iOS)**: Tap Share → Add to Home Screen
- **Android**: Tap the menu → Install app

## Technical Stack

- **Framework**: Svelte 5 with TypeScript
- **Build Tool**: Vite
- **Storage**: IndexedDB (via idb library)
- **PWA**: vite-plugin-pwa for offline support
- **Styling**: Component-scoped CSS

## Data Model

Each headache entry contains:
```typescript
{
  id: string;              // ISO timestamp
  date: string;            // YYYY-MM-DD format
  scale: number;           // Pain intensity 1-10
  medication: string[];    // List of medications taken
  points: {
    front: Point[];        // Pain points on front view
    back: Point[];         // Pain points on back view
  };
  notes: string;           // Optional notes
}
```

Points are stored as relative coordinates (0-1) for responsive rendering.

## Color Scale

The app uses a consistent color gradient to represent pain intensity:
- **1-3**: Light green (#90EE90) - Mild
- **4-6**: Yellow/Orange - Moderate  
- **7-10**: Red (#DC143C) - Severe

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

## License

This is an open-source project. Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
