

export async function clarezaRespostaEngine(output: ClarezaRespostaOutput, gabarito: ClarezaRespostaGabarito) {
  return castFirstChar(output.resposta) === gabarito.resposta ? 100 : 0
}