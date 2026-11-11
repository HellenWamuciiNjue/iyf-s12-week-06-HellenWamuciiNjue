
# 🌦️ Week 6 Graded Gate: Asynchronous Weather Dashboard

## Live Project

**Live Demo:** [View Weather Dashboard](https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/)

## Project Overview

The Weather Dashboard is a web application that allows users to search for cities and retrieve real-time weather information using the OpenWeatherMap API.

The application demonstrates asynchronous JavaScript concepts, API integration, dynamic DOM manipulation, error handling, and browser-based search history management.

## Features

- **City Search:** Search for weather information by city name.
- **Real-Time Weather Data:** Fetch current weather conditions from OpenWeatherMap.
- **Dynamic Weather Icons:** Display weather icons based on current conditions.
- **Temperature Display:** Show temperature and feels-like temperature in Celsius.
- **Additional Weather Details:** Display humidity, wind speed, and atmospheric pressure.
- **Loading States:** Provide visual feedback while fetching weather data.
- **Error Handling:** Handle invalid cities, API errors, and network connection problems.
- **Recent Searches:** Save and display previously searched cities.

## Technologies Used

- HTML5 – Application structure.
- CSS3 – Styling and responsive layout.
- JavaScript (ES6+) – Application logic and DOM manipulation.
- Fetch API – Asynchronous HTTP requests.
- OpenWeatherMap API – Weather data provider.
- Git & GitHub – Version control and deployment.

## Project Structure

```text
iyf-s12-week-06-HellenWamuciiNjue/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── daily-challenges/
│   ├── day-1.js
│   ├── day-2.js
│   ├── day-3.js
│   ├── day-4.js
│   └── day-5.js
├── .gitignore
├── README.md
├── index.html
├── styles.css
├── app.js
├── config.js
├── config.example.js
└── async-practice.js
```

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone YOUR-REPOSITORY-URL
   ```

2. Navigate into the project directory:

   ```bash
   cd iyf-s12-week-06-HellenWamuciiNjue
   ```

3. Create your `config.js` file using `config.example.js` as a reference.

4. Add your OpenWeatherMap API key to the configuration file.

5. Open `index.html` in your browser or use the VS Code Live Server extension.

## Architectural Discoveries & Core Lessons

### 1. Defensive HTTP Status Handling

I learned that JavaScript's `fetch()` API does not automatically reject promises for HTTP error responses such as `404 Not Found` or `500 Internal Server Error`.

Checking `response.ok` before processing JSON ensures that unsuccessful HTTP responses are handled appropriately.

### 2. Dynamic UI States

I implemented loading indicators to provide immediate feedback while asynchronous operations are running.

This improves the user experience by communicating the application's current state rather than leaving users wondering whether their search is processing.

### 3. Asynchronous Error Handling

Using `async/await`, `try/catch`, and `finally` helped me manage asynchronous operations, handle errors gracefully, and ensure that loading indicators are removed after requests complete.

### 4. API Configuration and Security

I learned how to separate configuration settings from application logic using `config.js` and `config.example.js`.

I also used `.gitignore` to prevent accidental commits of my local configuration file.

**Security note:** Excluding a frontend configuration file from Git does not hide API keys from website visitors. Public deployments should use appropriately restricted API keys or a backend service to protect credentials.

### 5. Dynamic DOM Manipulation

I learned how to use API responses to dynamically update the dashboard, including city names, temperatures, weather descriptions, icons, and additional weather details.

## Challenges Encountered

- Configuring and initializing the OpenWeatherMap API key.
- Correcting API endpoint URLs and request parameters.
- Handling unsuccessful HTTP responses.
- Displaying dynamic weather icons based on API responses.
- Managing asynchronous loading and error states.

## Conclusion

This project strengthened my understanding of asynchronous JavaScript, API integration, HTTP response handling, and dynamic user interfaces.

It also gave me practical experience building an interactive application that retrieves and displays real-world data.

---

**Author:** Hellen Wamucii Njue

**Week:** 06 – Season 12

**Project:** Asynchronous Weather Dashboard
