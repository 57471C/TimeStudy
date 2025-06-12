# TimeStudy

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/57471C/TimeStudy/actions)
[![Version](https://img.shields.io/badge/version-0.3.1--dev-blue)](https://github.com/57471C/TimeStudy/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/57471C/TimeStudy/blob/main/LICENSE)

TimeStudy is a web-based application for analyzing video-based process times, enabling users to track operations and tasks, visualize durations with charts, and manage data via CSV import/export. Version `0.3.1-dev` introduces a two-column layout, enhanced styling, XLSX handling, and lazy-loaded Highcharts for beta testing.

## Features

- **Video Playback**: Load and control video files with play, pause, seek, speed (0.5x–8x), and volume adjustments.
- **Task Management**: Add, edit, split, and delete operations and tasks with Value-Added (VA), Non-Value-Added (NVA), and Waste (W) statuses.
- **Charting**: Visualize task durations with Highcharts column and pie charts, lazy-loaded for performance, customizable by time format (MM:SS:MS, ms, decimal minutes).
- **CSV Import/Export**: Import and export operation/task data in CSV format, with XLSX support for filtering blank rows.
- **Dark/Light Mode**: Toggle between themes for improved usability.
- **Two-Column Layout**: Responsive design with video controls on the left and task management on the right.
- **Zoom Controls**: Marquee-based video zoom with reset functionality.
- **Takt Time**: Set and visualize takt time for process optimization.

## Version 0.3.1-dev Updates

- **UI Enhancements**: Two-column layout (`col-lg-6`) for better organization.
- **Styling**: CSS variables (e.g., `--btn-orange-bg: #ff6200`), fixed 30px header, responsive button and slider sizes.
- **XLSX Handling**: Inline script in `index.html` filters blank rows during CSV import.
- **Performance**: Lazy-loaded Highcharts scripts in `app.js` to reduce initial page load time.
- **Optimizations**: Cache DOM Queries, Optimize String Concatenation, Debounce Event Listeners, Error Boundary.
- **Beta Testing**: Ready for broader testing on the `main` branch.

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
5. **Import/Export CSV**: Use “Load CSV” and “Export CSV” for data management, with XLSX filtering.
6. **Toggle Format**: Switch between MM:SS:MS, milliseconds, or decimal minutes.
7. **Dark Mode**: Click the sun/moon icon to toggle themes.

## Project Structure

- `index.html`: Main HTML with two-column layout, Bootstrap 5.3.3, jQuery 3.7.1, and XLSX script.
- `styles.css`: Custom styles with CSS variables, responsive design, and dark/light mode support.
- `app.js`: JavaScript logic for video controls, task management, lazy-loaded charting, and CSV handling.

## Development

- **Branch**: `feature/v0.3.1` merged into `main` for beta testing.
- **Tools**: Windows 11, VS Code, ESLint, Prettier, Google’s JavaScript style guide.
- **Linting/Formatting**:
  ```bash
  npm run lint:fix
  npm run format
  ```

## Beta Testing

- **Focus**: Validate two-column layout, styling, XLSX handling, lazy-loaded Highcharts, and core functionality.
- **Feedback**: Report issues via GitHub Issues at https://github.com/57471C/TimeStudy/issues.
- **Known Limitations**: None identified; monitor for performance with large datasets.

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
