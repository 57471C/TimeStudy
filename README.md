# TimeStudy

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/57471C/TimeStudy/actions)
[![Version](https://img.shields.io/badge/version-0.3.2-blue)](https://github.com/57471C/TimeStudy/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/57471C/TimeStudy/blob/main/LICENSE)

TimeStudy is a web-based application for analyzing video-based process times, enabling users to track operations and tasks, visualize durations with charts, and manage data via CSV import/export. Version `0.3.2` refactors code, simplifies dependencies, enhances user experience with new features, and improves stability.

## Features

- **Video Playback**: Load and control video files with play, pause, seek, speed (0.5x–8x), and volume adjustments.
- **Task Management**: Add, edit, split, and delete operations and tasks with Value-Added (VA), Non-Value-Added (NVA), and Waste (W) statuses.
- **Charting**: Visualize task durations with Highcharts column and pie charts, lazy-loaded for performance, customizable by time format (MM:SS:MS, ms, decimal minutes).
- **CSV Import/Export**: Import and export operation/task data in CSV format.
- **Dark/Light Mode**: Toggle between themes for improved usability.
- **Two-Column Layout**: Responsive design with video controls on the left and task management on the right.
- **Zoom Controls**: Marquee-based video zoom with reset functionality.
- **Takt Time**: Set and visualize takt time for process optimization.
- **Mute Button Icons**: Toggle between speaker (🔊) and muted speaker (🔇) icons for mute/unmute.
- **Navigation Warnings**: Prompt users about unsaved data when using the browser back button or closing the tab.
- **Time Format Control**: Toggle time format button disabled until an operation is added.

## Version 0.3.2 Updates

- **Refactoring**: Split `app.js` into `functions.js` for self-contained utilities (e.g., time formatting, debouncing).
- **Simplification**: Removed XLSX script from `index.html` to reduce complexity.
- **New Features**:
  - Replaced mute button text with speaker icons (🔊/🔇) for improved UX.
  - Added warnings for browser back button and tab close if unsaved data exists.
  - Disabled “Toggle Format” button until an operation is added.
- **Fixes**:
  - Enabled “Add Task” button after adding operations.
  - Disabled “Chart” button when no operations exist.
  - Resolved `SyntaxError` in `app.js` and `toConsole` undefined errors.
- **Version**: Updated to `0.3.2`.

## Version 0.3.1-dev Updates

- **UI Enhancements**: Two-column layout (`col-lg-6`) for better organization.
- **Styling**: CSS variables (e.g., `--btn-orange-bg: #ff6200`), fixed 30px header, responsive button and slider sizes.
- **XLSX Handling**: Inline script in `index.html` filtered blank rows during CSV import (removed in `0.3.2`).
- **Performance**: Lazy-loaded Highcharts scripts in `app.js` to reduce initial page load time.
- **Optimizations**: Cache DOM Queries, Optimize String Concatenation, Debounce Event Listeners, Error Boundary.
- **Beta Testing**: Prepared for broader testing.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/57471C/TimeStudy.git
   cd TimeStudy
   ```

2. Install dependencies (if applicable):

   ```bash
   npm install
   ```

3. Run the application locally:
   ```bash
   python -m http.server 8500
   ```
   - Open `http://localhost:8500` in a browser.

## Usage

1. **Load Video**: Click “Load” or the placeholder to select a video file.
2. **Add Operations/Tasks**: Use “Add Operation” and “Add Task” buttons to log process steps.
3. **Set Takt Time**: Enter in `HH:MM:SS:MS` format (e.g., `00:01:00:00`).
4. **Generate Charts**: Click “Chart” to visualize task durations (Highcharts loads dynamically).
5. **Import/Export CSV**: Use “Load CSV” and “Export CSV” for data management.
6. **Toggle Format**: Click “Format” to switch between MM:SS:MS, milliseconds, or decimal minutes (enabled after adding an operation).
7. **Dark Mode**: Click the sun/moon icon to toggle themes.
8. **Mute/Unmute**: Click the speaker icon (🔊/🔇) to toggle audio.

## Project Structure

- `index.html`: Main HTML with two-column layout, Bootstrap 5.3.3, jQuery 3.7.1.
- `styles.css`: Custom styles with CSS variables, responsive design, and dark/light mode support.
- `app.js`: JavaScript logic for video controls, task management, lazy-loaded charting, CSV handling, and navigation warnings.
- `functions.js`: Utility functions for time formatting, debouncing, and logging.

## Development

- **Branch**: `feature/v0.3.2` for ongoing development.
- **Tools**: Windows 11, VS Code, ESLint, Prettier, Google’s JavaScript style guide.
- **Linting/Formatting**:
  ```bash
  npm run lint:fix
  npm run format
  ```

## Beta Testing

- **Focus**: Validate two-column layout, styling, CSV handling, lazy-loaded Highcharts, button functionality, and new navigation warnings.
- **Feedback**: Report issues via GitHub Issues at https://github.com/57471C/TimeStudy/issues.
- **Known Limitations**: Monitor performance with large datasets.

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push and open a pull request:
   ```bash
   git push origin feature/your-feature
   ```

## License

MIT License (see `LICENSE` file, if applicable).

## Contact

For questions, contact the repository owner via GitHub.
