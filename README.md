# TimeStudy

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/57471C/TimeStudy/actions)
[![Version](https://img.shields.io/badge/version-0.4.7-brightgreen)](https://github.com/57471C/TimeStudy/blob/main/LICENSE)


## Features

- **Video Playback**: Load and control video files with play, pause, seek, speed (0.5x–8x), and volume adjustments.
- **Task Management**: Add, edit, split, and delete operations and tasks with Value-Added (VA), Non-Value-Added (NVA), and Waste (W) statuses.
- **Multi-Trial Kaizen**: Duplicate and compare multiple trials within a single project to visualize process improvements over time.
- **Comparison Dashboard**: Full-screen Highcharts dashboard comparing Value-Add breakdown, estimated capacity (Units per Shift), and Labor Cost per Unit across trials.
- **garting**: Visualize task durations with Gantt, column, and pie charts, customizable by time format (MM:SS:MS, ms, decimal minutes).
- **Dark/Light Mode**: Toggle between themes for improved usability.
- **Zoom Controls**: Marquee-based video zoom with reset functionality.
- **Takt Time**: Set and visualize takt time for process optimization.

## Version 0.4.7 Updates
- **UI Enhancements**: Implemented borderless action icons across task rows for a cleaner appearance.
- **Inline Assignment**: Replaced modals with contextual inline dropdown menus for assigning Part Numbers and Labour Codes, now fully supporting quantity inputs.

## Version 0.4.6 Updates
- **Native App Enhancements**: Switched native Save/Load behaviors to Tauri Core Invoke commands for reliable app-specific behavior.
- **File Overwrite Support**: Added `window.showSaveFilePicker` for seamless file overwriting in browsers, acting like a true desktop app.
- **Clean State Initialization**: Apps now always open to an "Untitled Project" instead of auto-loading cache.
- **Safe Prompts**: Added robust confirmation checks to prevent accidental data loss when closing windows, starting new projects, or loading new videos.

## Version 0.4.5 Updates
- **UI Cleanup**: Reorganized the Operations Panel and moved file management tools (Save/Load/New) to the top header.
- **Auto-Complete**: Added dynamic auto-complete suggestions for Operation and Task names based on prior entries.
- **Keyboard Shortcuts**: Implemented shortcuts (`1`-`8`, `` ` ``) for quickly adjusting playback speeds.
- **Accessibility**: Improved touch targets for Trial management buttons.

## Version 0.4.4 Updates
- **Multi-Trial Support**: Added the ability to create, duplicate, and seamlessly switch between multiple trials within a single project.
- **Kaizen Comparison Dashboard**: Introduced a dedicated analytics mo- **Video Blob Caching**: Switching trials automatically caches and restores video streams without requiring manual file re-linking.
: Added "Units per Cycle" and "Project Comments" to the Settings panel.
- **Cleanup**: Removed legacy XLSX and Excel handling dependencies.

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
2. **Configure Project**: Open the Settings (Gear) menu to set Hourly Rate, Shift Length, and Efficiency.
3. **Add Operations/Tasks**: Use “Add Operation” and “Add Task” buttons to log process steps.
4. **Analyze Data**: View the inline Gantt/Column charts, or create a new Trial via the header dropdown to analyze improvements.
5. **Compare Trials**: Click "Compare Trials" to view the full-screen Kaizen dashboard.
6. **Save/Load**: Use “Save Project” to export your `.json` state.
6. **Toggle Format**: Switch between MM:SS:MS, milliseconds, or decimal minutes.
7. **Dark Mode**: Click the sun/moon icon to toggle themes.

## Project Structure
n
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
