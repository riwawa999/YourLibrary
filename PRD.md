# Product Requirement Document (PRD) - YourLibrary

## 1. Product Overview
**YourLibrary** is a premium, modern single-page web application designed for users to log, track, and review the books they read and the dramas they watch. 
Operating entirely on the client side using the browser's `LocalStorage` API, the application requires no external database or server setup, providing a private, secure, and fast environment to maintain media history.

### 1.1 Background & Objectives
- Address the personal need to log reading and watching history in a unified, visually pleasing space.
- Eliminate social media overhead (likes, comments, external reviews) found in existing platforms, creating an intimate "personal study" or "private theater" feel.
- Ensure ease of data portability via straightforward JSON backup utilities.

---

## 2. Target Audience & Core Value

### 2.1 Target Audience
- Avid readers and drama/TV series enthusiasts.
- Users seeking a clean, focused, ad-free environment without public social interactions.
- Tech-savvy hobbyists who value data ownership and local backups.

### 2.2 Core Value Proposition
- **Self-Contained Privacy**: No accounts required; all user logs remain on the client browser.
- **Rich Aesthetics**: Premium dark theme by default, featuring glassmorphism elements and ambient backdrop color glows.
- **Zero Lock-In**: Instant JSON import/export functionality to prevent data loss.

---

## 3. Functional Requirements

### 3.1 Dashboard & Analytics
- **Total Library Items**: Display the cumulative number of logged records.
- **Books Read**: Display the total count of items flagged as a "Book".
- **Dramas Watched**: Display the total count of items flagged as a "Drama".
- **Average Rating**: Real-time calculated average of user star ratings (1-5 scale) across all rated logs.

### 3.2 Search, Filters, and Sorting
- **Real-Time Search**: Instantly query titles or creators (authors/directors) as the user types.
- **Category Tabs**: Filter items instantly by "All", "Books", or "Dramas".
- **Status Filter**: Dropdown menu to filter logs by reading/watching status: "All Statuses", "Plan to Read/Watch", "In Progress", or "Completed".
- **Sort Selector**:
  - Newest Added (default)
  - Oldest Added
  - Highest Rated
  - Lowest Rated (with unrated items sorted to the bottom)
  - Title (A-Z alphabetically)

### 3.3 Log Management (CRUD Operations)
- **Log Creation Modal**:
  - Title (Required)
  - Category (Book / Drama) (Required)
  - Creator (Author / Director) (Required; label changes dynamically based on category selection)
  - Status (Plan to, In Progress, Completed) (Required)
  - Rating (1 to 5 Stars; custom interactive star selector)
  - Cover Image URL (Optional; falls back to an elegant colored gradient matching the category)
  - Start & End Dates (Optional; date selectors)
  - Review / Personal Notes (Optional; multiline text area)
- **Edit & Delete Action**:
  - Clicking any item card opens the modal in edit mode with prepopulated values.
  - Delete buttons include a confirmation prompt.

### 3.4 Data Portability
- **JSON Export**: Downloads the entire library state as a formatted JSON file.
- **JSON Import**: Uploads a backup file and merges it into the local state.
- **Validation**: Basic validation check ensures imported JSON conforms to the schema.

### 3.5 Theme Customization
- **Light/Dark Toggle**: Switch color systems dynamically. Preference is cached in local storage for subsequent visits.

---

## 4. Non-Functional Requirements

### 4.1 UI/UX Design Tenets
- **Premium Styling**: Glassmorphic elements (`backdrop-filter: blur`), dark glass inputs, and linear neon gradients (Indigo for Books, Pink/Rose for Dramas).
- **Responsive Layout**: Fluid CSS Grid and Flexbox structures adapt seamlessly across mobile devices, tablets, and wide-screen desktops.
- **Transitions & Micro-animations**: Hover states lift cards slightly, modals scale and fade smoothly, and toast notifications slide up from the bottom with spring physics.

### 4.2 Tech Stack
- **Structure**: Semantic HTML5.
- **Styling**: Vanilla CSS3 using custom properties (variables) for theme management.
- **Logic**: Vanilla ES6 JavaScript.
- **Assets**: 
  - Google Fonts (`Outfit` & `Noto Sans JP`)
  - FontAwesome (v6.x icon system)

---

## 5. Data Schema

Each library item is stored as a JavaScript object with the following TypeScript schema:

```typescript
interface LibraryItem {
  id: string;          // Unique ID (typically a millisecond timestamp)
  title: string;       // Name of the book/drama
  type: 'book' | 'drama'; // Category type
  creator: string;     // Author or Director name
  status: 'planning' | 'reading' | 'completed'; // Current status
  rating: number;      // Star score (0 = unrated, 1-5 scale)
  coverUrl: string;    // Image address (optional)
  startDate: string;   // Date started (YYYY-MM-DD, optional)
  endDate: string;     // Date completed (YYYY-MM-DD, optional)
  notes: string;       // User review/notes (optional)
  createdAt: string;   // Date/Time log was created (ISO-8601)
}
```

---

## 6. Future Roadmap
1. **API Metadata Fetching**: Integrate with Google Books API and TMDB API to auto-fill cover art, creators, and descriptions.
2. **Detailed Progress Logging**: Allow tracking pages read (e.g., page 150 of 400) or episodes watched (e.g., Ep 4 of 12).
3. **Tags/Tags Manager**: Custom user-defined tags (e.g., "sci-fi", "thriller", "masterpiece") for more precise filtering.
