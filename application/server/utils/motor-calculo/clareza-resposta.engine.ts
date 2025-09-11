export async function clarezaRespostaEngine(output: ClarezaRespostaOutput, gabarito: ClarezaRespostaGabarito) {
  //console.log(output.resposta, ' e ', gabarito.resposta)

  return castFirstChar(output.resposta) === gabarito.resposta ? 100 : 0
}