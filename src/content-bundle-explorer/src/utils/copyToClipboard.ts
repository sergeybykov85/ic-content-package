const resetSelection = (): void => {
  window.getSelection()?.removeAllRanges()
}

export default function copyToClipboard(text: string, onCopy?: () => void): void {
  resetSelection()

  const input = document.createElement('input')

  input.value = text
  input.select()
  input.setSelectionRange(0, 99999)

  navigator.clipboard
    .writeText(input.value)
    .then(() => {
      resetSelection()
      onCopy?.()
    })
    .catch(error => {
      console.error(error)
    })
    .finally(() => {
      input.remove()
    })
}
