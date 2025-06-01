# TimeStudy

![GitHub release (latest by date)](https://img.shields.io/github/v/release/57471C/TimeStudy?label=Version)
![GitHub license](https://img.shields.io/github/license/57471C/TimeStudy)

TimeStudy is a web-based application designed for conducting time and motion studies, particularly in manufacturing, logistics, and other process-driven industries. It allows users to analyze videos of processes, segment them into operations and tasks, categorize tasks as Value-Added (VA), Non-Value-Added (NVA), or Waste (W), and visualize task durations using interactive charts. The app supports CSV import/export for data persistence and is built with modern web technologies for a responsive, user-friendly experience.

## Features

- **Video Player**: Load and analyze videos with precise controls (play/pause, seek, nudge, zoom, marquee selection).
- **Task and Operation Management**: Define operations and tasks, assign start times, durations, and statuses (VA, NVA, W).
- **Interactive Charts**: Visualize task durations with Highcharts, including stacked column charts and pie charts per operation.
- **Takt Time Analysis**: Set and compare task durations against a configurable Takt Time.
- **CSV Import/Export**: Save and load study data in CSV format for easy sharing and backup.
- **Responsive Design**: Built with Bootstrap for compatibility across desktops and tablets.
- **Keyboard Shortcuts**: Streamline workflows with shortcuts for playback, zooming, and task management.
- **Debug Logging**: Detailed console logs for troubleshooting (configurable via `debuggin` flag).

## Current Version

**v0.2.0-beta** (Beta Release)

This is a beta version, actively under development. Feedback and contributions are welcome!

**Note**: The GitHub repository was wiped and reset with v0.2.0-beta on June 1, 2025, to start fresh with a clean history.

## Installation

To run TimeStudy locally, follow these steps:

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge).
- [Node.js](https://nodejs.org/) (for linting/formatting with ESLint and Prettier).
- [Git](https://git-scm.com/) for cloning the repository.

### Steps

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/YourUsername/TimeStudy.git
   cd TimeStudy
   ```

2. **Install Development Dependencies**:

   ```bash
   npm install
   ```

3. **Serve the Application**:
   Since TimeStudy is a static web app, you can serve it using a local server:

   - Option 1: Use VS Code’s Live Server extension.
     - Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
     - Right-click `index.html` in VS Code and select “Open with Live Server.”
   - Option 2: Use Python’s HTTP server:
     ```bash
     python -m http.server 8000
     ```
     Open `http://localhost:8000` in your browser.

## Usage

1. **Load a Video**:

   - Click “Load Video” and select a video file (e.g., MP4, WebM).
   - Use the video controls to navigate (play/pause, nudge ±1s/±5s, zoom, marquee selection).

2. **Define Operations and Tasks**:

   - Click “Add Operation” to create a new operation and set its start time.
   - Click “Add Task” to add tasks within the current operation, specifying name, duration, and status (VA, NVA, W).
   - Edit, delete, or split tasks as needed.

3. **Set Takt Time**:

   - Enter a Takt Time in `HH:MM:SS:MS` format (e.g., `00:01:00:00`) to compare against task durations.

4. **Visualize Data**:

   - Click “Chart” to generate column and pie charts showing task durations by operation and status.
   - Hover over chart elements for detailed tooltips.

5. **Export/Import Data**:

   - Click “Export CSV” to save operations, tasks, and timings.
   - Click “Load CSV” to import a previously saved study.

6. **Keyboard Shortcuts**:
   - `Space`: Play/pause video.
   - `Arrow Left/Right`: Nudge ±1s.
   - `Arrow Up/Down`: Nudge ±5s.
   - `T`: Add task.
   - `O`: Add operation.
   - `M`: Toggle mute.
   - `+/-`: Zoom in/out.
   - `Backspace`: Reset zoom.

## Development

### Code Style

TimeStudy uses the Google JavaScript style guide with Prettier formatting:

- Semicolons: `true`
- Quotes: Double quotes (`singleQuote: false`)
- Tab Width: 2 spaces
- Trailing Commas: ES5

To lint and format code:

```bash
# Lint JavaScript
npm run lint
# Format JavaScript
npm run format
# Automatically fix JavaScript linting issues
npm run lint:fix
```

### Project Structure

```
TimeStudy/
├── index.html        # Main application file
├── app.js            # Application JavaScript logic
├── styles.css        # Application styles
├── .eslintrc.json    # ESLint configuration
├── .prettierrc.json  # Prettier configuration
├── .gitignore        # Git ignore file
├── README.md         # This file
├── package.json      # Development dependencies
└── .vscode/
    └── settings.json # VS Code settings
```

### Dependencies

TimeStudy relies on CDN-hosted libraries:

- [Bootstrap 5.3.3](https://getbootstrap.com/) for styling and layout.
- [jQuery 3.7.1](https://jquery.com/) for DOM manipulation.
- [Highcharts 12](https://www.highcharts.com/) for charts.

Development dependencies (installed via npm):

- [ESLint 9.11.1](https://eslint.org/)
- [Prettier 3.3.3](https://prettier.io/)
- [eslint-config-google 0.14.0](https://github.com/google/eslint-config-google)
- [eslint-config-prettier 9.1.0](https://github.com/prettier/eslint-config-prettier)
- [eslint-plugin-prettier 5.2.1](https://github.com/prettier/eslint-plugin-prettier)

## Contributing

Contributions are welcome! To contribute:

1. **Fork the Repository**:
   Click “Fork” on GitHub to create your own copy.

2. **Create a Branch**:

   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make Changes**:

   - Follow the [Code Style](#code-style).
   - Test changes locally using Live Server or a similar tool.
   - Update documentation if needed.

4. **Commit and Push**:

   ```bash
   git add .
   git commit -m "Add your feature description"
   git push origin feature/your-feature
   ```

5. **Open a Pull Request**:
   Go to your forked repository on GitHub and click “Compare & pull request.”

Please include a clear description of your changes and reference any related issues.

## Issues

Found a bug or have a feature request? [Open an issue](https://github.com/YourUsername/TimeStudy/issues/new) on GitHub. Provide:

- A clear title and description.
- Steps to reproduce the issue.
- Screenshots or logs (enable `debuggin = 1` in `app.js` for detailed logs).

## License

[MIT License](LICENSE)

Copyright (c) 2025 Terry Minett

## Acknowledgments

- [Bootstrap](https://getbootstrap.com/) for responsive design.
- [Highcharts](https://www.highcharts.com/) for powerful visualizations.
- [jQuery](https://jquery.com/) for simplified DOM handling.

---
