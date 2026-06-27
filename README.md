# MyLittleLibrary 📚📺

MyLittleLibrary is a premium, modern single-page web application to log, track, and review the books you read, the mangas you collect, and the dramas/animes you watch.  
Operating entirely on the client side with the browser's `LocalStorage` API, the application requires no backend or external server, ensuring a completely private, fast, and secure media tracking experience.

👉 **[Launch Live Web App (GitHub Pages)](https://riwawa999.github.io/YourLibrary/)**

---

## 🌟 Key Features

- **Pinkwhite Light Theme**: A clean, premium light-themed design featuring glassmorphism layout elements, delicate pink-white gradient backdrops, and subtle micro-animations.
- **Asynchronous Autocomplete Suggestions**: Enter a title to fetch real-time suggestions progressively and concurrently from Wikipedia OpenSearch, Google Autocomplete, TVmaze, and Google Books.
- **Concurrent CJK Language Detection & Badging**:
  - Automatically triggers autocomplete search on a single character (`minLength = 1`) when Hiragana, Katakana, Kanji, or Hangul is detected.
  - Queries both Japanese and Chinese Wikipedia subdomains concurrently for Kanji-only queries (like "怪物" or "人間失格").
  - Displays distinct, color-coded language badges next to suggestions: 🔴 **Japanese**, 🟡 **Chinese**, 🔵 **Korean**, and 🟣 **English** to help identify shared Kanji titles.
- **Smart Metadata Auto-fill & Fallbacks**:
  - **Books**: Google Books search with automatic **Open Library API** fallback to retrieve Authors and Cover Art URLs even if Google Books hits its rate limit (429).
  - **Dramas**: TVmaze Search with TVmaze **Crew API** integration to dynamically extract and fill the actual **Directors/Creators** (e.g. "Ross Duffer, Matt Duffer" for Stranger Things) instead of using the broadcasting network.
- **Category-Matching Filtering**: Suggestions automatically filter based on the active dropdown category (hiding TV shows for "Books/Mangas", and hiding books for "Dramas/Animes"). Changing category dynamically updates and re-filters the suggestion list in real-time.
- **Analytics Dashboard**: Tracks total logged items, book metrics, drama metrics, and live-calculated average ratings.
- **Data Portability**: Instantly download your full library as a formatted JSON file or import a previous backup to restore your logs.
- **100% Client-Side**: No registration required. All data remains in your local browser sandbox.

---

## 🛠️ Project Structure

```text
Library app/
├── index.html       # Application markup and layouts
├── style.css        # Theme variables, responsive layouts, and transitions
├── app.js           # State manager, LocalStorage persistence, and filter/sort logic
├── PRD.md           # Product Requirement Document (English)
└── README.md        # This documentation file (English)
```

For comprehensive technical specifications, please check the [PRD.md](./PRD.md).

---

## 🚀 How to Run

### Run Locally
No installation is required. Simply download the project files and open `index.html` in any web browser.

Alternatively, you can run a local server using Python:

```bash
# Start a local static server
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.

### Deploying to GitHub Pages
This project is configured to run on GitHub Pages out of the box.  
Once pushed to your GitHub repository:
1. Go to **Settings** > **Pages** of your repository.
2. Under **Build and deployment**, select `Deploy from a branch` as source.
3. Select `main` branch and `/` root directory, and save.
4. Your site will be published at your custom GitHub Pages URL.

---

## 📄 License

Licensed under the MIT License. Free to use, adapt, and build upon.

