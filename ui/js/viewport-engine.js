window.zoomLevel = 1.0;
window.translateX = 0;
window.translateY = 0;

window.initializeVideoViewportZoomPan = (videoElement, container) => {
	if (!videoElement) return;
	const containerElement = container || document.getElementById("videoWrapper") || videoElement.parentElement;
	if (!containerElement) return;

	let isPanningVideo = false;
	let startMouseX = 0;
	let startMouseY = 0;

	videoElement.addEventListener("contextmenu", (e) => {
		e.preventDefault();
	});
	containerElement.addEventListener("contextmenu", (e) => {
		e.preventDefault();
	});

	containerElement.addEventListener("mousedown", (event) => {
		if (event.button === 2) {
			isPanningVideo = true;
			startMouseX = event.clientX;
			startMouseY = event.clientY;
			videoElement.style.cursor = "grabbing";
		}
	});

	window.addEventListener("mousemove", (event) => {
		if (!isPanningVideo) return;
		const rawDeltaX = event.clientX - startMouseX;
		const rawDeltaY = event.clientY - startMouseY;

		window.translateX = (window.translateX || 0) + rawDeltaX;
		window.translateY = (window.translateY || 0) + rawDeltaY;

		startMouseX = event.clientX;
		startMouseY = event.clientY;

		window.updateViewportTransform(videoElement);
	});

	window.addEventListener("mouseup", (event) => {
		if (event.button === 2) {
			isPanningVideo = false;
			videoElement.style.cursor = "default";
		}
	});

	containerElement.addEventListener("mouseleave", () => {
		if (isPanningVideo) {
			isPanningVideo = false;
			videoElement.style.cursor = "default";
		}
	});

	containerElement.addEventListener(
		"wheel",
		(event) => {
			event.preventDefault();
			const containerRect = containerElement.getBoundingClientRect();
			const mouseX = event.clientX - containerRect.left;
			const mouseY = event.clientY - containerRect.top;

			const oldZoom = window.zoomLevel || 1.0;
			let targetZoom = oldZoom;
			if (event.deltaY < 0) {
				targetZoom = oldZoom + 0.04;
			} else {
				targetZoom = oldZoom - 0.04;
			}

			targetZoom = Math.min(15.0, Math.max(1.0, targetZoom));

			if (targetZoom <= 1.0) {
				targetZoom = 1.0;
				window.zoomLevel = 1.0;
				window.translateX = 0;
				window.translateY = 0;
				translateX = 0;
				translateY = 0;
			} else {
				const scaleRatio = targetZoom / oldZoom;
				window.zoomLevel = targetZoom;
				window.translateX = mouseX - (mouseX - (window.translateX || 0)) * scaleRatio;
				window.translateY = mouseY - (mouseY - (window.translateY || 0)) * scaleRatio;
				translateX = window.translateX;
				translateY = window.translateY;
			}

			window.updateViewportTransform(videoElement);
		},
		{ passive: false },
	);
};

window.updateViewportTransform = (videoElement) => {
	if (!videoElement) return;
	videoElement.style.transformOrigin = "0px 0px";
	videoElement.style.transform =
		"translate(" +
		(window.translateX || 0) +
		"px, " +
		(window.translateY || 0) +
		"px) scale(" +
		(window.zoomLevel || 1.0) +
		")";

	// Sync back to globals in state.js so app.js can read them
	zoomLevel = window.zoomLevel;
	translateX = window.translateX;
	translateY = window.translateY;
};

window.resetVideoViewport = (video) => {
	window.zoomLevel = 1.0;
	window.translateX = 0;
	window.translateY = 0;
	if (video) {
		video.style.transform = "none";
	}
	// Sync back to globals in state.js
	zoomLevel = window.zoomLevel;
	translateX = window.translateX;
	translateY = window.translateY;
};
