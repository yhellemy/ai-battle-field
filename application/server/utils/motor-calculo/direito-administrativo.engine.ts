export async function direitoAdministrativoEngine(output: DireitoAdmOutput, gabarito: DireitoAdmGabarito) {
  const regex = /[^\w\s]/g
  console.log(gabarito.gabarito?.toLowerCase().replace(regex, "").trim(), ' e ', output.resposta?.toLowerCase().replace(regex, "").trim())
  return output.resposta?.toLowerCase().replace(regex, "").trim() === gabarito.gabarito?.toLowerCase().replace(regex, "").trim() ? 100 : 0
}