# TimeStudy

TimeStudy is a web application for time study analysis, featuring video playback, editing, task management, and data visualization. Built with Bootstrap, jQuery, Highcharts, and `ffmpeg.wasm`, it enables users to analyze workflows, annotate tasks, and generate charts.

## Features

- **Video Playback**: Load and control videos with play, pause, seek, and speed adjustments.
- **Video Editing**: Crop and zoom videos using `ffmpeg.wasm`.
- **Task Management**: Add, edit, and delete operations and tasks with VA/NVA/W status.
- **Data Visualization**: Generate column and pie charts with Highcharts.
- **CSV Import/Export**: Import/export task data in CSV format.

## Usage

1. **Load a Video**:
   - Click **Load Video** to select a video file.
   - Use playback controls to navigate.
2. **Add Operations/Tasks**:
   - Click **Add Operation** to start a new operation.
   - Click **Add Task** to annotate tasks with VA/NVA/W status.
3. **Edit Video**:
   - Click **Edit Video**, use the marquee to crop, or apply 2x zoom.
   - Export edited video via **Export Video**.
4. **Visualize Data**:
   - Click **Chart** to generate charts.
   - Export data with **Export CSV** or import via **Load CSV**.

### Prerequisites

- Node.js (v18 or later)
- npm (v11.3.0 or later)
- VS Code with ESLint and Prettier extensions

### Setup

1. **Linting and Formatting**:
   Run the following commands:
   `npm run lint`
   `npm run format`
   Uses ESLint (Standard JS) and Prettier for code style.

2. **Dependencies** (from `package.json`):

   - `eslint`: 8.57.0
   - `prettier`: 3.3.3
   - `eslint-plugin-prettier`: 5.4.0
   - `eslint-config-prettier`: 10.1.5
   - `eslint-config-standard`: 17.1.0
   - `http-server`: 14.1.1

3. **Favicon**:
   - Favicon is located at `assets/favicon.png` and linked in `index.html`.

### Running Locally

- Ensure `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers for `ffmpeg.wasm`.
- Use Live Server or `http-server` to run the application.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact

For issues or questions, open an issue on [GitHub](https://github.com/57471C/TimeStudy/issues).

## Acknowledgments

- Bootstrap, jQuery, Highcharts, and `ffmpeg.wasm` for core functionality.
- ESLint and Prettier for code quality.
