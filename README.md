<div align="center">

# ✦ MOVIES

### A glassmorphic movie search app with detail pages, cast, trailers, filters, and favorites — built in pure HTML, CSS & JS.

<br/>

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TMDB](https://img.shields.io/badge/API-TMDB-01b4e4?style=for-the-badge)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=for-the-badge)

<br/>

> Search · Discover · Filter by genre · Sort · Movie details · Cast · Trailer · Favorites · Infinite scroll

<br/>

</div>

---

## ✦ Features

### 🎬 Discover & Search
- **Discover** — browse trending and popular movies on load
- **Search** — real-time search with 400ms debounce, no button needed
- Results update instantly as you type

### 🎭 Filters & Sorting
Filter by any genre and sort by:

| Sort Option | Description |
|-------------|-------------|
| Most Popular | Popularity score descending |
| Top Rated | Vote average descending |
| Latest | Release date descending |
| Box Office | Revenue descending |

Genre filters and sort can be combined freely.

### 🖼️ Movie Detail Modal
Click any card to open a full detail page in a beautiful animated modal:

- Blurred backdrop image
- Poster, title, rating, year, runtime, language
- Genre chips
- Full overview
- Scrollable cast row with profile photos and character names
- ▶ Trailer button — opens on YouTube
- ❤️ Save to favorites

### ❤️ Favorites
Save any movie with one click. Favorites persist in `localStorage`. View all saved movies in the dedicated Favorites tab. Heart counter shown in the nav.

### ♾️ Infinite Scroll (Load More)
Load more results with a single button — appends to the existing grid without a page reload.

---

## ✦ Getting Started

### 1. Get a free TMDB API key
Sign up at [themoviedb.org](https://www.themoviedb.org/signup) → Settings → API → Request a key (free, instant).

### 2. Add your key
Open `script.js` and replace line 1:

```javascript
const API_KEY = 'your_tmdb_key_here';
```

### 3. Run it
```bash
git clone https://github.com/heyfaraninam/Movies.git
cd Movies
open index.html
```

No build step. No npm. No config.

---

## ✦ File Structure

```
movies/
├── index.html     # Topbar, filters, grid, detail modal
├── styles.css     # Glassmorphism, movie cards, modal, cast scroll
└── Script.js         # TMDB API calls, search, filters, modal, favorites
```

---

## ✦ API Used

All data from the [TMDB API](https://developers.themoviedb.org/3) (free tier):

| Endpoint | Used For |
|----------|---------|
| `/discover/movie` | Browse & filter movies |
| `/search/movie` | Search by title |
| `/genre/movie/list` | Genre filter chips |
| `/movie/{id}` | Movie detail |
| `/movie/{id}/credits` | Cast list |
| `/movie/{id}/videos` | Trailer key |

---

## ✦ Browser Support

| Browser | Support |
|---------|---------|
| Chrome 76+ | ✅ Full |
| Firefox 103+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 79+ | ✅ Full |

---

## ✦ Part of a Series

| Project | Description |
|---------|-------------|
| [Calculator](https://github.com/heyfaraninam/Calculator) | Glassmorphic calculator with 4 themes & scientific mode |
| [Notes](https://github.com/heyfaraninam/Notes) | Notes app with tags, pinning & search |
| [Weather](https://github.com/heyfaraninam/Weather) | Weather app with forecast & geolocation |
| [Typing Speed](https://github.com/heyfaraninam/typing-speed) | Typing test with WPM & history |
| [Password Generator](https://github.com/heyfaraninam/password-generator) | Cryptographic password generator |
| **Movies** | This project |

---

## ✦ Tags

`movie-search` `tmdb-api` `glassmorphism` `vanilla-js` `dark-theme` `localstorage` `infinite-scroll` `html-css-js` `no-dependencies` `frontend`

---

## ✦ License

MIT — free to use, modify, and ship.

---

<div align="center">

Made with care · pure HTML · CSS · JS · no frameworks needed

</div>
