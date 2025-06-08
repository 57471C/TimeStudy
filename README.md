[...]
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
[...]