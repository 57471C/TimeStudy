# TimeStudy

![GitHub release (latest by date)](https://img.shields.io/github/v/release/57471C/TimeStudy?label=Version)
![GitHub license](https://img.shields.io/github/license/57471C/TimeStudy)

TimeStudy is a web application designed for analyzing video-based time studies, allowing users to load videos, mark operations and tasks, and visualize task durations through charts. It supports features like video playback control, task categorization (VA, NVA, W), CSV import/export, and dark/light mode theming.

## Features

- **Video Playback**: Load and control MP4 videos with play/pause, nudge (±1s, ±5s), speed adjustment (0.5x to 8x), zoom, and mute/volume controls.
- **Task Management**: Add, edit, split, or delete operations and tasks with start times and durations.
- **Task Categorization**: Assign tasks as Value-Added (VA), Non-Value-Added (NVA), or Waste (W).
- **Takt Time**: Set a takt time to compare against task durations.
- **Charts**: Visualize task durations by operation and status using Highcharts (column and pie charts).
- **CSV Import/Export**: Import and export operation/task data in CSV format.
- **Dark/Light Mode**: Toggle between dark and light themes with persistent storage.
- **Responsive Design**: Adapts to various screen sizes using Bootstrap.
- **Keyboard Shortcuts**: Control playback and actions via keys (e.g., space for play/pause, arrows for nudge).

## Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Frameworks/Libraries**:
  - Bootstrap 5.3.3 for responsive UI
  - jQuery 3.7.1 for DOM manipulation
  - Highcharts 12.2.0 for data visualization
- **Tools**:
  - VS Code with ESLint (Google JavaScript style guide) and Prettier
  - Git for version control
- **Environment**: Runs locally via Python’s HTTP server or any static file server

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/57471C/TimeStudy.git
   cd TimeStudy
   ```

2. **Install Dependencies** (if using Node.js for linting/formatting):

   ```bash
   npm install
   ```

3. **Serve the Application**:

   ```bash
   python -m http.server 8000
   ```

   - Open `http://localhost:8000` in a browser.

4. **Linting and Formatting** (optional):
   ```bash
   npm run lint:fix
   npm run format
   ```

## Usage

1. **Load a Video**:

   - Click the “Load” button or video placeholder to select an MP4 file.
   - Use playback controls (Play/Pause, nudge, speed slider, mute, volume).
   - Zoom in/out or reset zoom using the top-right controls.

2. **Add Operations and Tasks**:

   - Click “Add Operation” to start a new operation, naming it and setting its start time.
   - Click “Add Task” to add tasks within the current operation, specifying name, status (VA, NVA, W), and duration based on video time.
   - Edit, split, or delete tasks via the task table.

3. **Set Takt Time**:

   - Enter a takt time (HH:MM:SS:MS) in the input field to display as a reference line in charts.

4. **Visualize Data**:

   - Click “Chart” to generate column and pie charts showing task durations by operation and status.

5. **Import/Export Data**:

   - Use “Load CSV” to import task data.
   - Use “Export CSV” to save operations and tasks.

6. **Toggle Modes**:
   - Click the ☀️/🌙 icon to switch between light and dark modes.
   - Use the “Format” button to cycle duration displays (MM:SS:MS, milliseconds, decimal minutes).

## Development

- **Project Structure**:

  - `index.html`: Main HTML file
  - `styles.css`: Custom styles with light/dark mode variables
  - `app.js`: Application logic
  - `package.json`: Node.js dependencies and scripts
  - `.eslintrc.json`: ESLint configuration
  - `.prettierrc`: Prettier configuration
  - `.gitignore`: Git ignore patterns

- **Coding Standards**:

  - Follow Google’s JavaScript style guide (2-space indentation, semicolons).
  - Use ESLint (`eslint-config-google`, `eslint-config-prettier`) and Prettier (`printWidth: 120`).
  - Commit changes with descriptive messages.

- **Contributing**:
  - Fork the repository, create a feature branch, and submit pull requests.
  - Report issues via GitHub Issues.

## Current Version

**v0.3.0** (Stable Release)

This is the first stable release, with a polished UI and robust functionality. Feedback and contributions are welcome!

**Note**: The GitHub repository was wiped and reset with v0.2.0-beta on June 1, 2025, to start fresh with a clean history.

## Release Notes

### v0.3.0

- **UI Polishing**:
  - Restored green styling for Play and Chart buttons (`btn-light-green`).
  - Set lighter green (`btn-lighter-green`) for nudge buttons (`-5s`, `-1s`, `+1s`, `+5s`).
  - Set grey styling (`btn-dark-gray`) for Load, Mute, and Format toggle buttons.
  - Restored dynamic yellow (`#ffd700`/`#d4af37`) and orange (`#ff6200`/`#e65b00`) styling for Load button based on video loaded state.
  - Set orange styling for Load CSV and Export CSV buttons (`btn-orange`).
  - Removed 21.5px left margin on Play button for consistent button-row spacing.
  - Added 10px vertical gap between seek bar row and button row.
  - Prevented "Playback Speed:" text from wrapping at various window sizes.
  - Disabled native video controls (play arrow, seek bar) to rely on custom controls.
  - Applied Bootstrap’s `table-dark` class to task table in dark mode only, ensuring light mode uses default styling.
  - Implemented Highcharts dark mode theme globally (background `#1c2526`, text `#d1d5db`) with proper toggling between dark and light modes.
  - Reduced volume slider horizontal padding by 20px (60px total, 50px at <992px).
  - Added version number to page title (e.g., "TimeStudy v0.2.9-beta").
  - Fixed console error when loading a video by safely resetting task table.
  - Removed unnecessary ESLint comments for cleaner code.
  - Fixed Play button height to match other buttons using Bootstrap’s default vertical padding.

### v0.2.9-beta

- **UI Enhancements**:
  - Set default Takt Time to 1 minute (`00:01:00:00`).
  - Made charts (`chartContainer`, `pieChartContainer`) span both columns at >992px screen width.
  - Restored `functions-row` button styling to `v0.2.0` (Bootstrap `btn-primary` blue buttons for Add Operation, Add Task).

### v0.2.8-beta

- **Dark Mode Enhancements**:
  - Moved dark/light mode toggle to the Current/Duration row, aligned right.
  - Fixed video placeholder text visibility in dark mode (white text).
  - Added a border to the video placeholder in dark mode (`#374151`).
  - Applied dark mode theme to the task table (background: `#1c2526`, text: `#d1d5db`).
- **UI Layout Improvements**:
  - Added a 30px fixed header with "TimeStudy" title.
  - Shortened "Load Video" button to "Load" to save space.
  - Reduced volume slider width to 80px (70px at <992px) to fit in the button row.
  - Reduced nudge button width to 45px and mute button to 55px.
  - Centered functions row (Takt Time input, Add Operation, etc.).
  - Fixed playback speed display to show "Playback Speed: 1x" inline.
  - Increased playback speed slider maximum to 8x.
- **Code Cleanup and Bug Fixes**:
  - Removed duplicate Prettier config (`prettierrc.json`) and updated `.gitignore`.
  - Resolved ESLint/Prettier conflict for single-line function calls (`printWidth: 120`).
  - Removed obsolete `highchart` table and its `app.js` references to fix CSV import error.
- **Version Consistency**:
  - Aligned `APP_VERSION` in `app.js` with `package.json`.

### v0.2.7-beta

- Initial beta release with core functionality (details in prior commits).

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contact

For questions or support, open an issue on GitHub or contact the repository owner.
