import { sumTwoBase, sumTwoContext, sumTwoGabarito } from './vibecoding/sum-two/sum-two-baseScript'
import sumTwoProblem from './vibecoding/sum-two/sum-two-problem.txt'
export const vibeCodingExercises = [
  {
    problema: sumTwoProblem,
    contexto: sumTwoContext,
    baseScript: sumTwoBase,
    gabarito: sumTwoGabarito,
    nivel: "Médio",
    tipo: "Matemática",
  } 
] satisfies (TesteVibeCodingQuestion & TesteVibeCodingGabarito)[]