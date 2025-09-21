export async function compreensaoTextualEngine(output: ComprTextualOutput, gabarito: ComprTextualOutput) {
  const regex = /[^\w\s]/g
  console.log(gabarito.resposta?.toLowerCase().replace(regex, "").trim(), ' e model ', output.resposta?.toLowerCase().replace(regex, "").trim())

  return output.resposta?.toLowerCase().replace(regex, "").trim() === gabarito.resposta?.toLowerCase().replace(regex, "").trim() ? 100 : 0
}