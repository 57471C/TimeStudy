import {
  yama,
  opNames,
  opStartTimes,
  formatTimeToHHMMSSMS,
  formatDuration,
  toConsole,
  parseTimeFromHHMMSSMS,
  parseTaktTime,
  taktTimeInput,
} from './functions.js'

// State management
let processEndTime = 0
let opCount = 0
let taskCount = 0
let taktTime = null

const updateProcessTimes = () => {
  if (yama.length === 0) return

  const chartFoot = document.getElementById('chartFoot')
  const formattedEndTime = formatTimeToHHMMSSMS(processEndTime)
  let totalProcessTime = '00:00:00:00'
  if (opStartTimes.length > 0) {
    const durationSeconds = Math.max(0, processEndTime - opStartTimes[0])
    totalProcessTime = formatTimeToHHMMSSMS(durationSeconds)
  }

  chartFoot.innerHTML = `
    <tr>
      <td colspan="4" class="table-foot">
        <span class="process-time-container">
          <label for="processEndTimeInput" class="form-label" style="width: auto;">Process end time:</label>
          <input type="text" id="processEndTimeInput" class="form-control process-time-input" value="${formattedEndTime}">
        </span>
        <span class="process-time-container">
          <label for="totalProcessTimeInput" class="form-label" style="width: auto;">Total Process time:</label>
          <input type="text" id="totalProcessTimeInput" class="form-control process-time-input" value="${totalProcessTime}" disabled>
        </span>
      </td>
    </tr>
  `

  const processEndTimeInput = document.getElementById('processEndTimeInput')
  processEndTimeInput.addEventListener('input', () => {
    const newEndTime = parseTimeFromHHMMSSMS(processEndTimeInput.value)
    if (newEndTime !== null) {
      processEndTime = newEndTime
      toConsole('Process end time updated', processEndTime)
      const durationSeconds =
        opStartTimes.length > 0
          ? Math.max(0, processEndTime - opStartTimes[0])
          : 0
      document.getElementById('totalProcessTimeInput').value =
        formatTimeToHHMMSSMS(durationSeconds)
    } else {
      window.alert(
        'Invalid time format. Please use HH:MM:SS:MS (e.g., 00:01:00:00).'
      )
      processEndTimeInput.value = formatTimeToHHMMSSMS(processEndTime)
    }
  })
}

const importFromCSV = (csvText) => {
  const lines = csvText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
  if (lines.length < 2) {
    window.alert('CSV file is empty or missing metadata.')
    return
  }
  const header = lines[0].split(',').map((h) => h.trim())
  if (header[0] !== 'ProcessEndTime' || !header[1].startsWith('OpStartTime')) {
    window.alert(
      'Invalid CSV format. Expected header: ProcessEndTime,OpStartTime-0,...'
    )
    return
  }

  const metaDataLine = lines[1].split(',').map((val) => val.trim())
  processEndTime = parseTimeFromHHMMSSMS(metaDataLine[0]) || 0
  toConsole('Imported Process end time', processEndTime)

  const opStartTimeHeaders = header.slice(1)
  opStartTimes.length = 0 // Clear array
  for (let i = 0; i < opStartTimeHeaders.length; i++) {
    let timeStr = metaDataLine[i + 1]
    const parts = timeStr.split(':')
    if (parts.length === 4) {
      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10)
      const seconds = parseInt(parts[2], 10)
      const milliseconds = parseInt(parts[3], 10)
      if (hours === 0 && minutes === 0 && seconds >= 60) {
        const newMinutes = Math.floor(seconds / 60)
        const newSeconds = seconds % 60
        timeStr = `00:${newMinutes.toString().padStart(2, '0')}:${newSeconds
          .toString()
          .padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
        toConsole(
          `Fixed OpStartTime-${i}`,
          `${metaDataLine[i + 1]} -> ${timeStr}`
        )
      }
    }
    const time = parseTimeFromHHMMSSMS(timeStr)
    if (time !== null) {
      opStartTimes[i] = time
    } else {
      opStartTimes[i] = 0
      toConsole('Invalid OpStartTime, defaulting to 0', `OpStartTime-${i}`)
    }
  }
  toConsole('Imported OpStartTimes', opStartTimes)

  yama.length = 0 // Clear array
  opNames.length = 0 // Clear array
  opCount = -1
  taskCount = 0
  taktTime = parseTaktTime(taktTimeInput.value)

  const taskHeaders = lines[2].split(',').map((h) => h.trim())
  const expectedTaskHeaders = ['Operation', 'Task', 'VA', 'NVA', 'W']
  if (
    taskHeaders.length !== expectedTaskHeaders.length ||
    !taskHeaders.every((h, i) => h === expectedTaskHeaders[i])
  ) {
    window.alert(
      'Invalid CSV format. Expected task headers: Operation,Task,VA,NVA,W'
    )
    return
  }
  let currentOpName = ''
  let taskIndex = 0
  let lastEndTime = 0
  for (let i = 3; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.trim())
    if (row.length < 5) {
      toConsole('Skipping invalid row', `Line ${i + 1}: ${lines[i]}`)
      continue
    }
    const opName = row[0].replace(/^"|"$/g, '')
    const taskName = row[1].replace(/^"|"$/g, '')
    const va = parseFloat(row[2])
    const nva = parseFloat(row[3])
    const w = parseFloat(row[4])
    const durations = [va, nva, w]
    const nonZeroCount = durations.filter((d) => d > 0).length
    if (nonZeroCount !== 1) {
      window.alert(
        `Invalid row ${i + 1}: Exactly one of VA, NVA, W must be non-zero.`
      )
      return
    }
    if (durations.some((d) => Number.isNaN(d) || d < 0)) {
      window.alert(
        `Invalid row ${i + 1}: Durations must be non-negative numbers.`
      )
      return
    }
    const taskHeight = durations.find((d) => d > 0)
    const taskStatus = va > 0 ? 'VA' : nva > 0 ? 'NVA' : 'W'
    if (opName !== currentOpName) {
      opCount += 1
      opNames[opCount] = opName
      yama[opCount] = []
      taskIndex = 0
      currentOpName = opName
    }
    const taskStart = lastEndTime
    const taskEnd = taskStart + taskHeight
    yama[opCount][taskIndex] = {
      taskName,
      taskStart,
      taskEnd,
      taskHeight,
      taskStatus,
    }
    lastEndTime = taskEnd
    taskIndex += 1
    taskCount = taskIndex
  }
  if (yama.length === 0) {
    window.alert('No valid tasks found in CSV.')
    return
  }
  document.getElementById('chartBody').innerHTML = ''
  document.getElementById('pieChartContainer').innerHTML = ''
  toConsole(
    'CSV imported successfully',
    `Operations: ${opCount + 1}, Tasks: ${taskCount}`
  )
}

const exportToCSV = () => {
  if (yama.length === 0) {
    window.alert('No operations or tasks to export.')
    return
  }
  let csvContent = 'ProcessEndTime'
  for (let i = 0; i <= opCount; i++) {
    csvContent += `,OpStartTime-${i}`
  }
  csvContent += '\n'
  csvContent += `${formatTimeToHHMMSSMS(processEndTime)}`
  for (let i = 0; i <= opCount; i++) {
    csvContent += `,${formatTimeToHHMMSSMS(opStartTimes[i] || 0)}`
  }
  csvContent += '\n'
  csvContent += 'Operation,Task,VA,NVA,W\n'

  for (let i = 0; i < yama.length; i++) {
    for (let j = 0; j < yama[i].length; j++) {
      const task = yama[i][j]
      const status = task.taskStatus.toUpperCase()
      const vaDuration = status === 'VA' ? task.taskHeight : 0
      const nvaDuration = status === 'NVA' ? task.taskHeight : 0
      const wDuration = status === 'W' ? task.taskHeight : 0
      const escapedOpName = opNames[i].includes(',')
        ? `"${opNames[i]}"`
        : opNames[i]
      const escapedTaskName = task.taskName.includes(',')
        ? `"${task.taskName}"`
        : task.taskName
      csvContent += `${escapedOpName},${escapedTaskName},${vaDuration},${nvaDuration},${wDuration}\n`
    }
  }
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8,',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'operation_task_durations.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const drawTable = () => {
  if (yama.length === 0) {
    window.alert('No operations or tasks to chart.')
    return
  }
  if (taktTime === null || taktTime <= 0) {
    window.alert(
      'Invalid Takt Time. Please set a valid Takt Time (HH:MM:SS:MS).'
    )
    return
  }
  const series = []
  for (let j = 0; j < yama.length; j++) {
    if (yama[j] && Array.isArray(yama[j])) {
      for (let i = 0; i < yama[j].length; i++) {
        const task = yama[j][i]
        const status = task.taskStatus.toUpperCase()
        const color =
          status === 'VA' ? '#00FF00' : status === 'NVA' ? '#FFFF00' : '#FF0000'
        const dataPoint = new Array(opNames.length).fill(0)
        dataPoint[j] = task.taskHeight
        series.push({
          name: `${opNames[j]}: ${task.name || task.taskName} (${status})`,
          data: dataPoint,
          stack: opNames[j],
          color,
        })
      }
    } else {
      toConsole('Invalid task array for operation', j)
    }
  }
  toConsole('Generated series', JSON.stringify(series))
  toConsole('xAxis categories', JSON.stringify(opNames))
  window.Highcharts.chart('chartContainer', {
    chart: { type: 'column' },
    accessibility: { enabled: false },
    title: { text: 'Operation Task Durations by Status' },
    xAxis: { categories: opNames },
    yAxis: {
      title: {
        text: `Duration (MM:SS:MS)`,
      },
      labels: {
        formatter() {
          return formatDuration(this.value)
        },
      },
      plotLines: [
        {
          value: taktTime,
          color: '#0000FF',
          width: 2,
          label: {
            text: `Takt: ${formatDuration(taktTime)}`,
            align: 'right',
            style: { color: '#0000FF' },
          },
        },
      ],
    },
    tooltip: {
      formatter() {
        const duration = formatDuration(this.y)
        return `<b>Operation: ${this.x}</b><br>Task: ${this.series.name}<br>Duration: ${duration}`
      },
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        grouping: false,
        pointWidth: 50,
        dataLabels: {
          enabled: true,
          formatter() {
            return this.y > 0 ? formatDuration(this.y) : ''
          },
        },
      },
    },
    series,
  })
  const outputHead =
    '<tr><th>Operation</th><th>VA</th><th>NVA</th><th>W</th></tr>'
  document.getElementById('chartHead').innerHTML = outputHead
  let outputRow = ''
  for (let i = 0; i < yama.length; i++) {
    const statusDurations = { VA: 0, NVA: 0, W: 0 }
    if (yama[i] && Array.isArray(yama[i])) {
      for (let j = 0; j < yama[i].length; j++) {
        const status = yama[i][j].taskStatus.toUpperCase()
        if (status in statusDurations) {
          statusDurations[status] += yama[i][j].taskHeight
        }
      }
    }
    outputRow += `<tr><td>${opNames[i]}</td>`
    outputRow += `<td>${formatDuration(statusDurations.VA)}</td>`
    outputRow += `<td>${formatDuration(statusDurations.NVA)}</td>`
    outputRow += `<td>${formatDuration(statusDurations.W)}</td>`
    outputRow += '</tr>'
  }
  document.getElementById('chartBody').innerHTML = outputRow
  updateProcessTimes()
  const pieChartContainer = document.getElementById('pieChartContainer')
  pieChartContainer.innerHTML = ''
  for (let i = 0; i < yama.length; i++) {
    const statusDurations = { VA: 0, NVA: 0, W: 0 }
    if (yama[i] && Array.isArray(yama[i])) {
      for (let j = 0; j < yama[i].length; j++) {
        if (yama[i][j] && yama[i][j].taskStatus) {
          const status = yama[i][j].taskStatus.toUpperCase()
          if (status in statusDurations) {
            statusDurations[status] += yama[i][j].taskHeight
          }
        } else {
          toConsole('Invalid task data at', `Operation ${i}, Task ${j}`)
        }
      }
    } else {
      toConsole('No tasks for operation', opNames[i])
      continue
    }
    toConsole(
      'Pie chart data for operation',
      `${opNames[i]}: VA=${statusDurations.VA}, NVA=${statusDurations.NVA}, W=${statusDurations.W}`
    )
    const pieData = [
      { name: 'VA', y: statusDurations.VA, color: '#00FF00' },
      { name: 'NVA', y: statusDurations.NVA, color: '#FFFF00' },
      { name: 'W', y: statusDurations.W, color: '#FF0000' },
    ].filter((item) => item.y > 0)
    if (pieData.length === 0) {
      toConsole('No valid pie chart data for operation', opNames[i])
      continue
    }
    const pieDiv = document.createElement('div')
    pieDiv.id = `pieChart${i}`
    pieDiv.className = 'pieChart'
    pieChartContainer.appendChild(pieDiv)
    window.Highcharts.chart(`pieChart${i}`, {
      chart: { type: 'pie', height: 200 },
      accessibility: { enabled: false },
      title: { text: `${opNames[i]} Duration by Status` },
      tooltip: {
        pointFormatter() {
          const duration = formatDuration(this.y)
          return `Duration: <b>${duration} (${this.percentage.toFixed(1)}%)</b>`
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            formatter() {
              return `${this.point.name}: ${formatDuration(this.y)}`
            },
          },
        },
      },
      series: [
        {
          name: 'Duration',
          data: pieData,
        },
      ],
    })
  }
}

export { updateProcessTimes, importFromCSV, exportToCSV, drawTable }
