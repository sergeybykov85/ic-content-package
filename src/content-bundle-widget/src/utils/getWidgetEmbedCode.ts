const getWidgetEmbedCode = (widgetId: string): string => `<div
  data-type="content-bundle-widget"
  data-widget-id="${widgetId}"
></div>
<script src="${location.origin}/widget-constructor.js"></script>`
export default getWidgetEmbedCode
