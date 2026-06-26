# MyLittleLibrary 📚📺

MyLittleLibrary is a premium, modern single-page web application to log, track, and review the books you read and the dramas you watch.  
Operating entirely on the client side with the browser's `LocalStorage` API, the application requires no backend or external server, ensuring a completely private, fast, and secure media tracking experience.

👉 **[Launch Live Web App (GitHub Pages)](https://riwawa999.github.io/YourLibrary/)**

---

## 🌟 Key Features

- **Sleek Dark Theme**: A premium default dark theme featuring glassmorphism design layouts, translucent input fields, and neon gradient details.
- **Analytics Dashboard**: Tracks total logged items, book metrics, drama metrics, and live-calculated average ratings.
- **Advanced Filtering & Sorting**: Real-time text search, type category tab switches (All/Books/Dramas), completion status filters, and multiple sorting models.
- **Rich Log Modals**: Dynamic forms change depending on whether you record a book (Author) or drama (Director). Includes star ratings, cover art URLs, date ranges, and multiline review space.
- **Gradient Covers**: Don't have a cover image URL? The app dynamically generates beautiful, colorful gradient backdrops with icons for each category.
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
python3 -m http.server 8000
```
Open `http://localhost:8000` in your browser.

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
