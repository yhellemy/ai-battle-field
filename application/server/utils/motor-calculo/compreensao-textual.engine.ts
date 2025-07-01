export async function compreensaoTextualEngine(output: ComprTextualOutput, gabarito: ComprTextualOutput) {
  const regex = /[^\w\s]/g
  return output.resposta?.toLowerCase().replace(regex, "").trim() === gabarito.resposta?.toLowerCase().replace(regex, "").trim() ? 100 : 0
}