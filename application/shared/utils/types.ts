export type ComprTextualQuestion = {
  categoria: string,
  premissa: string,
  hipotese: string,
  nivel: string
}

export type ComprTextualOutput = {
  resposta: string
}

export interface ClarezaRespostaQuestao {
  texto: string
  gabarito: number
}

export interface ClarezaRespostaOutput {
  resposta: string
}

export interface ClarezaRespostaGabarito {
  resposta: number
}

// compreensao textual

interface Metrica {
  indicador: number;
  contagem: number;
  proporcao: number;
}

export interface ContarIndicadoresResponse {
  modeloId: number;
  modeloNome: string;
  totalIndicadores: number;
  mediaIndicadores: number;
  metricas: Metrica[];
}

// clareza-resposta

export type ValorTupla = [number, number];

export type ModeloDados = {
  modelo: string;
  valores: ValorTupla[];
};

export type ClarezaRespostaResponse = ModeloDados[];