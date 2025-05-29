import { formatTimeToHHMMSSMS, toConsole } from './functions.js'

let isDrawing = false
let startX
let startY
let isEditing = false
let cropParams = null
let zoomLevel = 1
let translateX = 0
let translateY = 0
let playerReady = false
let attemptedVideoUrlLoad = false

// Stub for fetchFile (replace with actual implementation if available)
const fetchFile = async (file) => {
  return new Uint8Array(await file.arrayBuffer())
}

const initializePlayer = ({
  seektimeupdate,
  updateTimeDisplay,
  positionControls,
  updateLoadButtonColor,
  toggleVideoPlaceholder,
  startMarquee,
  drawMarquee,
  endMarquee,
  updateZoom,
  showEditControls,
  hideEditControls,
  processVideo,
  setupTimeline,
  updateTimeline,
}) => {
  const player = document.getElementById('my_video')
  player.removeAttribute('src')
  player.src = ''
  player.load()
  playerReady = true
  toConsole('Video element initialized', 'Success')

  const marqueeOverlay = document.getElementById('marqueeOverlay')
  const marqueeRect = document.getElementById('marqueeRect')
  const loadVideoButton = document.getElementById('loadVideoButton')
  const seekBar = document.getElementById('seekBar')
  const playPauseButton = document.getElementById('playPauseButton')
  const rewind5sButton = document.getElementById('rewind5sButton')
  const rewind1sButton = document.getElementById('rewind1sButton')
  const forward1sButton = document.getElementById('forward1sButton')
  const forward5sButton = document.getElementById('forward5sButton')
  const muteButton = document.getElementById('muteButton')
  const volumeSlider = document.getElementById('volumeSlider')

  const showVideoIfReady = () => {
    if (player.src) {
      const duration = player.duration || 0
      seekBar.max = duration
      updateTimeDisplay(duration, 'durationTime')
      positionControls()
      updateLoadButtonColor({
        loadVideoButton,
        player,
        playPauseButton,
        rewind5sButton,
        rewind1sButton,
        forward1sButton,
        forward5sButton,
        muteButton,
        volumeSlider,
      })
      toConsole('Hiding placeholder after video load', 'Showing video')
      toggleVideoPlaceholder(false)
      player.playbackRate = 1
      volumeSlider.value = player.volume
      toConsole('Playback speed reset to 1x after load', 'Success')
    } else {
      toConsole(
        'Video not ready',
        `readyState: ${player.readyState}, src: ${player.src}`
      )
      toggleVideoPlaceholder(true)
    }
  }

  player.addEventListener('timeupdate', seektimeupdate)
  player.addEventListener('loadedmetadata', () => {
    toConsole(
      'Loadedmetadata fired',
      `readyState: ${player.readyState}, duration: ${player.duration}, src: ${player.src}`
    )
    showVideoIfReady()
  })
  player.addEventListener('canplay', () => {
    toConsole(
      'Canplay fired',
      `readyState: ${player.readyState}, duration: ${player.duration}, src: ${player.src}`
    )
    showVideoIfReady()
  })
  player.addEventListener('play', () => {
    playPauseButton.textContent = 'Pause'
  })
  player.addEventListener('pause', () => {
    playPauseButton.textContent = 'Play'
  })
  player.addEventListener('error', () => {
    toConsole(
      'Video load error',
      `src: ${player.src}, readyState: ${player.readyState}`
    )
    if (attemptedVideoUrlLoad) {
      window.alert(
        "Failed to load the video from the provided URL. Please use the 'Load Video' button to select a video file manually."
      )
    }
    toggleVideoPlaceholder(true)
    updateLoadButtonColor({
      loadVideoButton,
      player,
      playPauseButton,
      rewind5sButton,
      rewind1sButton,
      forward1sButton,
      forward5sButton,
      muteButton,
      volumeSlider,
    })
    attemptedVideoUrlLoad = false
  })

  const urlParams = new URLSearchParams(window.location.search)
  const videoUrl = urlParams.get('v')
  if (videoUrl) {
    toConsole('Found video URL in GET parameter', videoUrl)
    attemptedVideoUrlLoad = true
    player.src = videoUrl
    player.load()
  } else {
    toConsole('No video URL in GET parameter', 'Waiting for manual load')
    toggleVideoPlaceholder(true)
  }

  loadVideoButton.addEventListener('click', () => {
    document.getElementById('videoFileInput').click()
  })
  playPauseButton.addEventListener('click', () => {
    if (player.paused) {
      player.play()
    } else {
      player.pause()
    }
  })

  rewind5sButton.addEventListener('click', () => {
    player.currentTime = Math.max(0, player.currentTime - 5)
    toConsole('Rewind 5s', player.currentTime)
  })
  rewind1sButton.addEventListener('click', () => {
    player.currentTime = Math.max(0, player.currentTime - 1)
    toConsole('Rewind 1s', player.currentTime)
  })
  forward1sButton.addEventListener('click', () => {
    player.currentTime = Math.min(player.duration, player.currentTime + 1)
    toConsole('Forward 1s', player.currentTime)
  })
  forward5sButton.addEventListener('click', () => {
    player.currentTime = Math.min(player.duration, player.currentTime + 5)
    toConsole('Forward 5s', player.currentTime)
  })

  muteButton.addEventListener('click', () => {
    player.muted = !player.muted
    muteButton.textContent = player.muted ? 'Unmute' : 'Mute'
    toConsole('Mute toggled', player.muted)
    volumeSlider.value = player.muted ? 0 : player.volume
  })

  volumeSlider.addEventListener('input', () => {
    const volume = parseFloat(volumeSlider.value)
    player.volume = volume
    player.muted = volume === 0
    muteButton.textContent = player.muted ? 'Unmute' : 'Mute'
    toConsole('Volume adjusted', volume)
  })

  if (seekBar) {
    seekBar.addEventListener('input', function () {
      toConsole('Seek bar input event fired', this.value)
      const time = parseFloat(this.value)
      player.currentTime = time
      toConsole('Video seeked to', time)
    })
  }

  document
    .getElementById('videoFileInput')
    .addEventListener('change', (event) => {
      const file = event.target.files[0]
      if (!file) {
        toConsole('No video file selected')
        return
      }

      const fileURL = URL.createObjectURL(file)
      player.src = fileURL
      player.load()

      document.getElementById('chartBody').innerHTML = ''
      document.getElementById('pieChartContainer').innerHTML = ''
      document.getElementById('chartContainer').innerHTML = ''
      document.getElementById('chartFoot').innerHTML = ''
      document.querySelector('.highchart').style.display = 'none'
      toConsole('Cleared all previous data and charts')
    })

  document.getElementById('zoomIn').addEventListener('click', () => {
    zoomLevel += 0.1
    updateZoom()
  })
  document.getElementById('zoomOut').addEventListener('click', () => {
    zoomLevel = Math.max(0.1, zoomLevel - 0.1)
    updateZoom()
  })
  document.getElementById('resetZoom').addEventListener('click', () => {
    zoomLevel = 1
    translateX = 0
    translateY = 0
    updateZoom()
  })

  marqueeOverlay.addEventListener('mousedown', startMarquee)
  marqueeOverlay.addEventListener('mousemove', drawMarquee)
  marqueeOverlay.addEventListener('mouseup', endMarquee)

  document
    .getElementById('editVideoButton')
    .addEventListener('click', showEditControls)

  document.getElementById('cropBtn').addEventListener('click', () => {
    window.alert(
      'Use the marquee to select a crop area. Click and drag over the video.'
    )
    toConsole('Crop initiated', 'Awaiting marquee selection')
  })

  document.getElementById('zoomBtn').addEventListener('click', () => {
    document.getElementById('zoomBtn').dataset.zoomed = 'true'
    window.alert('Zoom (2x) will be applied on export.')
    toConsole('Zoom set', '2x')
  })

  document.getElementById('exportBtn').addEventListener('click', async () => {
    const newUrl = await processVideo()
    if (newUrl) {
      const link = document.createElement('a')
      link.href = newUrl
      link.download = 'edited-video.mp4'
      link.click()
      player.src = newUrl
      player.load()
      updateLoadButtonColor({
        loadVideoButton,
        player,
        playPauseButton,
        rewind5sButton,
        rewind1sButton,
        forward1sButton,
        forward5sButton,
        muteButton,
        volumeSlider,
      })
      toggleVideoPlaceholder(false)
      hideEditControls()
      toConsole('Video exported and reloaded', newUrl)
    }
  })

  document
    .getElementById('cancelEditBtn')
    .addEventListener('click', hideEditControls)

  setupTimeline()

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case ' ':
        e.preventDefault()
        if (player.paused) {
          player.play()
        } else {
          player.pause()
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        player.currentTime = Math.max(0, player.currentTime - 1)
        toConsole('Rewind 1s (Left Arrow)', player.currentTime)
        break
      case 'ArrowDown':
        e.preventDefault()
        player.currentTime = Math.max(0, player.currentTime - 5)
        toConsole('Rewind 5s (Down Arrow)', player.currentTime)
        break
      case 'ArrowRight':
        e.preventDefault()
        player.currentTime = Math.min(player.duration, player.currentTime + 1)
        toConsole('Forward 1s (Right Arrow)', player.currentTime)
        break
      case 'ArrowUp':
        e.preventDefault()
        player.currentTime = Math.min(player.duration, player.currentTime + 5)
        toConsole('Forward 5s (Up Arrow)', player.currentTime)
        break
      case 'm':
        e.preventDefault()
        player.muted = !player.muted
        muteButton.textContent = player.muted ? 'Unmute' : 'Mute'
        toConsole('Mute toggled (M key)', player.muted)
        volumeSlider.value = player.muted ? 0 : player.volume
        break
      case '=':
        e.preventDefault()
        zoomLevel += 0.1
        updateZoom()
        break
      case '-':
        e.preventDefault()
        zoomLevel = Math.max(0.1, zoomLevel - 0.1)
        updateZoom()
        break
      case 'Backspace':
        e.preventDefault()
        zoomLevel = 1
        translateX = 0
        translateY = 0
        updateZoom()
        break
    }
  })
}

const seektimeupdate = () => {
  const player = document.getElementById('my_video')
  const seekBar = document.getElementById('seekBar')
  if (player && playerReady) {
    const currentTime = player.currentTime
    const duration = player.duration
    if (seekBar) {
      seekBar.value = currentTime
      seekBar.max = duration || 0
    }
    updateTimeDisplay(currentTime, 'currentTime')
    if (duration) {
      updateTimeDisplay(duration, 'durationTime')
    }
  }
}

const updateTimeDisplay = (seconds, elementId) => {
  document.getElementById(elementId).textContent = formatTimeToHHMMSSMS(seconds)
}

const positionControls = () => {
  const controlsBar = document.getElementById('video_controls_bar')
  if (controlsBar) {
    controlsBar.style.position = 'relative'
    toConsole('Controls repositioned after video load', 'Success')
  }
}

const updateLoadButtonColor = ({
  loadVideoButton,
  player,
  playPauseButton,
  rewind5sButton,
  rewind1sButton,
  forward1sButton,
  forward5sButton,
  muteButton,
  volumeSlider,
}) => {
  if (
    loadVideoButton &&
    player &&
    playPauseButton &&
    rewind5sButton &&
    rewind1sButton &&
    forward1sButton &&
    forward5sButton &&
    muteButton &&
    volumeSlider
  ) {
    const src = player.src
    toConsole('updateLoadButtonColor called', `src: ${src}`)
    if (!src) {
      loadVideoButton.classList.remove('btn-orange')
      loadVideoButton.classList.add('btn-yellow')
      playPauseButton.disabled = true
      rewind5sButton.disabled = true
      rewind1sButton.disabled = true
      forward1sButton.disabled = true
      forward5sButton.disabled = true
      muteButton.disabled = true
      volumeSlider.disabled = true
      toConsole('Controls disabled', 'No video source')
    } else {
      loadVideoButton.classList.remove('btn-yellow')
      loadVideoButton.classList.add('btn-orange')
      playPauseButton.disabled = false
      rewind5sButton.disabled = false
      rewind1sButton.disabled = false
      forward1sButton.disabled = false
      forward5sButton.disabled = false
      muteButton.disabled = false
      volumeSlider.disabled = false
      toConsole('Controls enabled', 'Video source present')
    }
  } else {
    toConsole('updateLoadButtonColor failed', 'Missing elements')
  }
}

const toggleVideoPlaceholder = (show) => {
  const placeholder = document.getElementById('videoPlaceholder')
  const videoWrapper = document.getElementById('videoWrapper')
  if (placeholder && videoWrapper) {
    if (show) {
      toConsole('Showing placeholder, hiding video wrapper')
      placeholder.style.display = 'flex'
      videoWrapper.style.display = 'none'
    } else {
      toConsole('Hiding placeholder, showing video wrapper')
      placeholder.style.display = 'none'
      videoWrapper.style.display = 'block'
    }
  }
}

const startMarquee = (e) => {
  const marqueeOverlay = document.getElementById('marqueeOverlay')
  const marqueeRect = document.getElementById('marqueeRect')
  if (e.target.closest('.zoom-controls')) return
  isDrawing = true
  marqueeOverlay.classList.add('active')
  const rect = marqueeOverlay.getBoundingClientRect()
  startX = e.clientX - rect.left
  startY = e.clientY - rect.top
  marqueeRect.style.left = `${startX}px`
  marqueeRect.style.top = `${startY}px`
  marqueeRect.style.width = '0px'
  marqueeRect.style.height = '0px'
  marqueeRect.style.display = 'block'
  toConsole('Marquee start', `(${startX}, ${startY})`)
}

const drawMarquee = (e) => {
  const marqueeOverlay = document.getElementById('marqueeOverlay')
  const marqueeRect = document.getElementById('marqueeRect')
  if (!isDrawing) return
  const rect = marqueeOverlay.getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top

  const width = currentX - startX
  const height = currentY - startY

  if (width < 0) {
    marqueeRect.style.left = `${currentX}px`
    marqueeRect.style.width = `${-width}px`
  } else {
    marqueeRect.style.left = `${startX}px`
    marqueeRect.style.width = `${width}px`
  }

  if (height < 0) {
    marqueeRect.style.top = `${currentY}px`
    marqueeRect.style.height = `${-height}px`
  } else {
    marqueeRect.style.top = `${startY}px`
    marqueeRect.style.height = `${height}px`
  }
}

const endMarquee = (e) => {
  const marqueeOverlay = document.getElementById('marqueeOverlay')
  const marqueeRect = document.getElementById('marqueeRect')
  if (!isDrawing) return
  isDrawing = false
  marqueeOverlay.classList.remove('active')
  marqueeRect.style.display = 'none'

  const rect = marqueeOverlay.getBoundingClientRect()
  const endX = e.clientX - rect.left
  const endY = e.clientY - rect.top

  const x1 = Math.min(startX, endX)
  const x2 = Math.max(startX, endX)
  const y1 = Math.min(startY, endY)
  const y2 = Math.max(startY, endY)

  const marqueeWidth = x2 - x1
  const marqueeHeight = y2 - y1

  toConsole('Marquee end', `Box: (${x1}, ${y1}) to (${x2}, ${y2})`)

  if (marqueeWidth < 10 || marqueeHeight < 10) {
    toConsole('Marquee too small, ignoring')
    return
  }

  if (isEditing) {
    const video = document.getElementById('my_video')
    const videoRect = video.getBoundingClientRect()
    const wrapperRect = document
      .getElementById('videoWrapper')
      .getBoundingClientRect()
    const offsetX = videoRect.left - wrapperRect.left
    const offsetY = videoRect.top - wrapperRect.top
    const videoDisplayWidth = videoRect.width
    const videoDisplayHeight = videoRect.height

    const videoX1 = Math.max(0, x1 - offsetX)
    const videoY1 = Math.max(0, y1 - offsetY)
    const videoWidth = Math.min(videoDisplayWidth - videoX1, marqueeWidth)
    const videoHeight = Math.min(videoDisplayHeight - videoY1, marqueeHeight)

    const actualWidth = video.videoWidth
    const actualHeight = video.videoHeight
    const scaleX = actualWidth / videoDisplayWidth
    const scaleY = actualHeight / videoDisplayHeight

    cropParams = {
      x: Math.round(videoX1 * scaleX),
      y: Math.round(videoY1 * scaleY),
      w: Math.round(videoWidth * scaleX),
      h: Math.round(videoHeight * scaleY),
    }
    toConsole('Crop params', JSON.stringify(cropParams))
  } else {
    const videoWrapper = document.getElementById('videoWrapper')
    const wrapperWidth = videoWrapper.clientWidth
    const wrapperHeight = videoWrapper.clientHeight

    const video = document.getElementById('my_video')
    const videoRect = video.getBoundingClientRect()
    const wrapperRect = videoWrapper.getBoundingClientRect()
    const offsetX = videoRect.left - wrapperRect.left
    const offsetY = videoRect.top - wrapperRect.top
    const videoDisplayWidth = videoRect.width
    const videoDisplayHeight = videoRect.height
    toConsole(
      'Video display',
      `Width: ${videoDisplayWidth}, Height: ${videoDisplayHeight}, Offset: (${offsetX}, ${offsetY})`
    )

    const marqueeX1 = x1 - offsetX
    const marqueeY1 = y1 - offsetY
    const marqueeX2 = x2 - offsetX
    const marqueeY2 = y2 - offsetY

    const marqueeCenterX = (marqueeX1 + marqueeX2) / 2
    const marqueeCenterY = (marqueeY1 + marqueeY2) / 2
    toConsole(
      'Marquee center (display)',
      `(${marqueeCenterX}, ${marqueeCenterY})`
    )

    const zoomX = videoDisplayWidth / marqueeWidth
    const zoomY = videoDisplayHeight / marqueeHeight
    const newZoomLevel = Math.min(zoomX, zoomY)
    toConsole('New zoom level (relative)', newZoomLevel)

    const previousZoomLevel = zoomLevel
    zoomLevel *= newZoomLevel
    toConsole('Cumulative zoom level', zoomLevel)

    const videoCoordX =
      (marqueeCenterX - translateX * previousZoomLevel) / previousZoomLevel
    const videoCoordY =
      (marqueeCenterY - translateY * previousZoomLevel) / previousZoomLevel
    toConsole(
      'Marquee center (video coords)',
      `(${videoCoordX}, ${videoCoordY})`
    )

    const scaledVideoCoordX = videoCoordX * zoomLevel
    const scaledVideoCoordY = videoCoordY * zoomLevel
    toConsole(
      'Scaled video coordinates',
      `(${scaledVideoCoordX}, ${scaledVideoCoordY})`
    )

    translateX = (wrapperWidth / 2 - scaledVideoCoordX) / zoomLevel
    translateY = (wrapperHeight / 2 - scaledVideoCoordY) / zoomLevel
    toConsole('New translation', `(${translateX}, ${translateY})`)

    const finalX = videoCoordX * zoomLevel + translateX * zoomLevel
    const finalY = videoCoordY * zoomLevel + translateY * zoomLevel
    toConsole('Final center position', `(${finalX}, ${finalY})`)

    updateZoom()
  }
}

const updateZoom = () => {
  const video = document.getElementById('my_video')
  video.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`
  toConsole(
    'Zoom updated',
    `Level: ${zoomLevel}, Translate: (${translateX}, ${translateY})`
  )
}

const showEditControls = () => {
  document.getElementById('editControls').style.display = 'block'
  document.getElementById('video_controls_bar').style.display = 'none'
  isEditing = true
  const player = document.getElementById('my_video')
  player.pause()
  updateTimeline()
  toConsole('Edit mode', 'Activated')
}

const hideEditControls = () => {
  document.getElementById('editControls').style.display = 'none'
  document.getElementById('video_controls_bar').style.display = 'flex'
  isEditing = false
  cropParams = null
  const marqueeRect = document.getElementById('marqueeRect')
  marqueeRect.style.display = 'none'
  toConsole('Edit mode', 'Deactivated')
}

const processVideo = async () => {
  const player = document.getElementById('my_video')
  if (!player.src) {
    window.alert('Please load a video first.')
    return null
  }
  if (!ffmpeg.isLoaded()) await ffmpeg.load()
  const fileInput = document.getElementById('videoFileInput')
  const file = fileInput.files[0]
  if (!file) {
    window.alert('No video file available')
    return null
  }

  ffmpeg.FS('writeFile', file.name, await fetchFile(file))
  const output = 'output.mp4'

  const filter = []
  if (cropParams) {
    filter.push(
      `crop=${cropParams.w}:${cropParams.h}:${cropParams.x}:${cropParams.y}`
    )
  }
  if (document.getElementById('zoomBtn').dataset.zoomed === 'true') {
    filter.push('scale=iw*2:ih*2')
  }

  const args = ['-i', file.name]
  if (filter.length > 0) {
    args.push('-vf', filter.join(','))
  }
  args.push(output)

  await ffmpeg.run(...args)
  const data = ffmpeg.FS('readFile', output)
  const url = URL.createObjectURL(
    new Blob([data.buffer], { type: 'video/mp4' })
  )
  return url
}

const setupTimeline = () => {
  const timeline = document.getElementById('timeline')
  const marker = document.getElementById('timelineMarker')
  timeline.addEventListener('click', (e) => {
    if (!isEditing) return
    const rect = timeline.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    marker.style.left = `${pos * 100}%`
    const player = document.getElementById('my_video')
    player.currentTime = pos * player.duration
    toConsole('Timeline click', `Time: ${player.currentTime}`)
  })
}

const updateTimeline = () => {
  toConsole('updateTimeline', 'Timeline updated')
}

export {
  initializePlayer,
  seektimeupdate,
  updateTimeDisplay,
  positionControls,
  updateLoadButtonColor,
  toggleVideoPlaceholder,
  startMarquee,
  drawMarquee,
  endMarquee,
  updateZoom,
  showEditControls,
  hideEditControls,
  processVideo,
  setupTimeline,
  updateTimeline,
}
