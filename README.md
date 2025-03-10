# BuzzLine

A Next.js-based platform designed to support users during emergencies (e.g., fire hazards) by providing targeted recommendations, safe travel routes, and real-time mapping overlays for walkabilities.
<a href="https://ibb.co/sd1nPwHx"><img src="https://i.ibb.co/W4zZ3yt8/tmp.webp" alt="tmp" border="0"></a>

---
## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Modules and Functions](#modules-and-functions)
  - [Gemini Service](#gemini-service)
  - [Map Overlay and Markers](#map-overlay-and-markers)
  - [Recommendations and Data Fetching](#recommendations-and-data-fetching)
  - [Dialogflow Integration](#dialogflow-integration)
  - [Firebase Services](#firebase-services)
  - [API Endpoints](#api-endpoints)
  - [Utilities](#utilities)
  - [Context Providers](#context-providers)
  - [UI Components](#ui-components)
- [Configuration Files](#configuration-files)
- [Usage](#usage)
- [License](#license)

---

## Overview

This project is built using Next.js and modern React tools. It assists users affected by emergencies by aggregating personalized recommendations, safe travel routes, and environmental hazard data on interactive maps. The app leverages generative AI to create content and explanations, offers real-time data from NASA and Google APIs, and integrates Firebase for user management. What makes our project unique is that it uses Gemini to smartly generate queries for google maps APIs, allowing for our project to chose the best amenities based on peoples needs. This allows people to put in dynamic or uncommon requests and our system will be able to adapt to them becauase Gemini will generate smart queries for it.

## Tech Stack

---

### Frontend
> **Next.js** — React framework for server-rendered and static web applications  
> **React** — Library for building user interfaces  
> **Tailwind CSS** — Utility-first CSS framework for modern UI development

---

### Backend
> **Next.js API Routes** — Built-in API handling for seamless backend integration  
> **Axios** — Promise-based HTTP client for API interactions

---

### AI & Mapping ![Google Badge](https://img.shields.io/badge/Google-4285F4?style=flat&logo=google&logoColor=white)
> **Google Generative AI (Gemini)** — AI-powered content generation  
> **Google Maps API** — Interactive maps integration  
> **Google Places API** — Detailed place information retrieval  
> **Google Directions API** — Optimized routing and navigation  
> **Google Dialogflow** — Conversational AI platform for natural language interactions

---

### Data & Authentication
> **Firebase Firestore** — Scalable NoSQL cloud database  
> **Firebase Auth** — Secure user authentication and identity management
> **Google OAuth2.0** - a secure protocol that lets third-party apps request access to a user’s Google account without needing their password

---

### External Data Sources
> **NASA Landsat API** — Access to satellite imagery and earth observation data  
> **OpenRouteService (ORS)** — Advanced route planning and geospatial services

---

### Utilities
> **Turf.js** — Geospatial analysis and computations  
> **Axios** — Simplified HTTP requests and API interactions


## Directory Structure

```
/src
  /app
    /recommendations
      - map_overlay.js         // Renders Google Map overlays with fire polygons and custom markers
      - gallery.js             // Gallery view for displaying recommended amenities with filtering/sorting
      - CustomMarker.js        // Custom marker component for Google Maps with tooltip detailing marker info
      - page.js                // Recommendations page that ties together user data, maps, and galleries
    /preferences               // Page to manage and update user emergency assistance preferences
    /review                    // Page to generate and display user reviews based on their input
    layout.js                 // Root layout wrapping the app with context providers (Auth & Notification)
    layout-server.js          // Server layout containing metadata (title, description)
    page.js                   // Main landing/login page with Firebase authentication
  /components
    /ui
      - button.jsx             // Reusable button component with configurable style and size
    - Notifications.jsx       // Component to show global notifications
    - (Other UI components such as InfoCard, SortDropdown, FilterDropdown are used in gallery)
  /context
    - AuthContext.js          // Manages and provides authentication state (user, loading)
    - NotificationContext.jsx // Global notification provider with add/clear functions
  /firebase
    - config.js               // Initializes Firebase using environment variables; exports db and auth
    /services
      - firestore.js          // Firestore functions: add, get, update user data
      - auth.js               // Authentication services (e.g., signInWithGoogle, signOut)
  /pages
    /api
      - landsat.js            // API endpoint fetching and converting Landsat CSV data from NASA to JSON
      - generate-explanations.js // Uses Gemini to generate explanations for recommended places
      - recommend-places.js   // Generates Google Maps Places API query URLs and retrieves recommendation data
  /services
    - gemini.js               // Interacts with Google's Gemini API for content and chat responses
    - dialogflow.js           // Initializes Dialogflow SessionsClient for chatbot integration
  /utils
    - fetchRecommendations.js // Takes user input to generate a detailed prompt and fetch recommendations
    - fetchSafeRouteORS.js    // Computes safe routes via the OpenRouteService API by avoiding hazards
    - fetchRouteInfo.js       // Retrieves detailed route information from Google Maps Directions API
    - extractPlacesQueriesUrls.js // Extracts URLs from Gemini output and requests data from Google Places API
    - decodeORSGeometry.js    // Decodes ORS LineString geometry into map-friendly latitude/longitude coordinates
  /lib
    - utils.js                // Utility functions such as merging CSS class names using clsx and tailwind-merge
/jsconfig.json                 // Configures path aliases for easier module imports
/.gitignore                    // Specifies files to ignore in version control
/LICENSE                      // MIT License file
/package.json                 // Project metadata, scripts, and dependencies
/next.config.mjs              // Next.js configuration (headers, experimental options, webpack fallbacks)
```

---

## Modules and Functions

### Gemini Service

**File:** `src/services/gemini.js`

**Purpose:**  
This file provides two functions that connect with Google’s Generative AI (Gemini). The first function, `generateContent`, takes a text prompt, sends it to Gemini, and returns the AI-generated content. The second function, `generateChatContent`, initiates a chat session by supplying a series of messages and then returns the AI’s responses.

---

### Map Overlay and Markers

#### MapOverlay

**File:** `src/app/recommendations/map_overlay.js`

**Purpose:**  
The MapOverlay component displays an interactive Google Map, which includes environmental overlays (such as fire polygons created through Turf.js) and various markers. It relies on the Google Maps JavaScript API to load and configure the map, determining its center based on Landsat data or the user's geolocation. It also listens for mouse hover events to show walkability scores and provides a toggle for enabling or disabling walkability overlays.

#### CustomMarker

**File:** `src/app/recommendations/CustomMarker.js`

**Purpose:**  
This component is used to place custom markers on the map. The `getColor(confidence)` function selects a color (red, orange, yellow, etc.) according to the marker’s confidence level. When hovering over a marker, a tooltip appears with details like confidence level, acquisition date, and time.

---

### Recommendations and Data Fetching

#### Fetch Recommendations

**File:** `src/utils/fetchRecommendations.js`

**Purpose:**  
This utility composes a detailed review prompt based on the user’s situation and preferences in order to generate tailored recommendations. It also has an internal helper function, `sortAmenities(rawResults)`, which ensures that certain critical categories (Healthcare, Shelter, Food/Water) have at least three amenities each and caps the total number at 15.

#### Gallery

**File:** `src/app/recommendations/gallery.js`

**Purpose:**  
The gallery component displays recommended amenities in a visually organized layout, allowing for sorting and filtering. A key function, `getFilterCategories(types)`, converts raw Google Places API types into human-readable groups (Health, Food, Retail, Shelter, Civic, etc.). The gallery also adds placeholder ETA and walkability data, and supports dropdown-based filtering and sorting.

---

### Dialogflow Integration

**File:** `src/services/dialogflow.js`

**Purpose:**  
This file initializes the Dialogflow SessionsClient using project credentials and provides a convenient way for the application to manage conversational interactions.

**Usage:**  
Any feature that requires real-time chatbot functionality can use this client.

---

### Firebase Services

#### Firestore Service

**File:** `src/firebase/services/firestore.js`

**Purpose:**  
This service offers methods to connect to Firestore for reading and writing data, as well as verifying the database connection. It includes functions like `getUserData(uid)` to retrieve documents by UID, `setUser(uid, userData)` to create or update user records, and `updateUser(uid, data)` to modify existing user fields, logging and throwing errors if anything goes wrong.

#### Firebase Configuration

**File:** `src/firebase/config.js`

**Purpose:**  
Here, the Firebase app is initialized with environment variables. This file exports both the Firestore database (`db`) and the Firebase authentication service for use throughout the application.

#### Authentication Service

**File:** `src/firebase/services/auth.js`

**Purpose:**  
This service handles user authentication tasks, such as signing in with Google and signing out. It exports an `authService` instance that other parts of the app can leverage for user authentication flows.

---

### API Endpoints

#### Landsat API

**File:** `src/pages/api/landsat.js`

**Purpose:**  
This endpoint fetches CSV data from NASA's MODAPS API for LANDSAT, converts it into JSON, and provides location and confidence data suitable for mapping.

#### Generate Explanations API

**File:** `src/pages/api/generate-explanations.js`

**Purpose:**  
This endpoint listens for a POST request containing the user’s review and place details, constructs a detailed prompt, and uses the Gemini `generateContent` function to create a concise explanation about why an amenity was recommended.

#### Recommend Places API

**File:** `src/pages/api/recommend-places.js`

**Purpose:**  
Upon receiving a POST request with a user review, this endpoint uses Gemini to generate Places query URLs, extracts those URLs using a helper function, and queries the Google Places API multiple times. It consolidates the results before returning them to the client.

---

### Utilities

#### Fetch Safe Route

**File:** `src/utils/fetchSafeRouteORS.js`

**Purpose:**  
This utility calculates a safe driving route via the OpenRouteService API, avoiding specified areas (such as fire polygons). It assembles a request body based on the user’s location and unsafe polygons, then returns information like estimated travel time, distance, and route geometry.

#### Fetch Route Information

**File:** `src/utils/fetchRouteInfo.js`

**Purpose:**  
This function collects route details from the Google Maps Directions API. It factors in user preferences and travel mode (driving, walking, transit, etc.) and returns crucial data like ETA, distance, and the encoded polyline.

#### Extract Places Query URLs

**File:** `src/utils/extractPlacesQueriesUrls.js`

**Purpose:**  
By parsing Gemini’s output, this utility finds URLs within the text and sends multiple GET requests to the Google Places API. It contains functions like `extractUrls(text)` for regex-based URL detection and `sendMultipleRequests(urls)`, which replaces a placeholder with a real API key and then makes simultaneous requests.

#### Decode ORS Geometry

**File:** `src/utils/decodeORSGeometry.js`

**Purpose:**  
This file converts a LineString geometry from an OpenRouteService response into a list of coordinate objects (with `lat` and `lng` keys) so that the route can be properly rendered on the map.

**Reference:**
Pedestrian Environmental Index research paper https://www.sciencedirect.com/science/article/pii/S0966692314001343

