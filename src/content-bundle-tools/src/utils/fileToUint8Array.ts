export default async function fileToUint8Array(file: File): Promise<Uint8Array> {
  try {
    return new Uint8Array(await file.arrayBuffer())
  } catch (e) {
    console.error('Failed to convert file to Uint8Array')
    throw e
  }
}
