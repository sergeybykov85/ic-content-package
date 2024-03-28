const APP_URL = 'http://localhost:5102/'

const createWidgetFrame = (container, frameIndex) => {
  const { loaded, widgetId } = container.dataset
  if (loaded) {
    return
  }
  const frame = document.createElement('iframe')

  frame.setAttribute('id', `${widgetId}-${frameIndex}`)
  frame.setAttribute('src', `${APP_URL}widget/${widgetId}`)
  frame.setAttribute('height', '481')
  frame.setAttribute('width', '100%')
  frame.setAttribute('style', 'border: none;')

  container.appendChild(frame)
  container.setAttribute('data-loaded', true)
}

const loadWidgets = () => {
  const widgetContainers = document.querySelectorAll('[data-type="content-bundle-widget"]')
  widgetContainers.forEach((container, idx) => createWidgetFrame(container, idx))
}

loadWidgets()

/* HTML EMBED CODE TEMPLATE

<div
  data-type="content-bundle-widget"
  data-widget-id="YOUR WIDGET ID HERE"
></div>
<script src="YOUR-APP-HOST-HERE/widget-constructor.js"></script>

*/
