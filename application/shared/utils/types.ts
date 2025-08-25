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

export type TesteDoEmbedQuestion = {
  pergunta: string,
}

export type TesteDoEmbedOutput = {
  pergunta: string
  resposta: string
}

export interface TesteDoEmbedGabarito {}

export interface TesteDoEmbed {
  tipo: "TesteDoEmbed";
  nome: string;
  indicador: number;
  count: number;
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
export type DireitoAdmResponse = {
  modeloId: number;
  modeloNome: string;
  totalIndicadores: number;
  mediaIndicadores: number;
  metricas: Metrica[];
};

// alucinação

interface EstatisticasMetrica {
  total: number;
  alucinacao: number;
  erros: number;
  zeros: number;
}

interface DesempenhoPorMetrica {
  [tipoMetrica: string]: EstatisticasMetrica;
}

export interface DesempenhoGeralModelos {
  [modeloId: string]: DesempenhoPorMetrica;
}

interface Modelo {
  id: number;
  nome: string;
  provedorId: number;
}

export interface ApiResponseDesempenho {
  contagem: DesempenhoGeralModelos;
  modelos: Modelo[];
}

// alucinação new

export interface ErroDetalhado {
  metricaId: number;
  modeloId: number;
  tipo: string;
  modelo: string;
  erros: number;
  total_geral_erros: number;
  porcentagem_erro: number;
}

export interface AlucinacaoDetalhada {
  metricaId: number;
  modeloId: number;
  modelo: string;
  tipo: string;
  totalucinacao: number;
  total_geral_erros: number;
  porcentagem_erro: number;
}

export interface ApiResponseAlucinacao {
  totalErro: ErroDetalhado[];
  totalAlucinacao: AlucinacaoDetalhada[];
}

export type DireitoAdmOutput = {
  resposta: string
}

export type DireitoAdmQuestion = {
  pergunta: string,
  nivel: string
}

export type DireitoAdmGabarito = {
  gabarito: string,
  justificativa: string,
}