

export async function clarezaRespostaEngine(output: ClarezaRespostaOutput, gabarito: ClarezaRespostaGabarito) {
  console.log('output da ia: ', output.resposta, ' gabarito:', gabarito)
  return castFirstChar(output.resposta) === gabarito.resposta ? 100 : 0
}