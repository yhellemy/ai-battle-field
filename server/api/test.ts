// server/api/test.ts

import { sumTwoContext, sumTwoGabarito } from '~~/prisma/vibecoding/sum-two/sum-two-baseScript';

export default defineEventHandler(async (event) => {
    const codigoDoModelo = sumTwoGabarito; 
    const codigoParaExecutar = sumTwoContext.replaceAll('{respostaModelo}', codigoDoModelo);

    return await runSandbox(codigoParaExecutar);
});