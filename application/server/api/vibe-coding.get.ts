import ivm from 'isolated-vm'
import { sumTwoContext, sumTwoGabarito } from '~~/prisma/vibecoding/sum-two/sum-two-baseScript';
const isolate = new ivm.Isolate({ memoryLimit: 128 })

export default defineEventHandler(async (event) => {
    try {
        const context = isolate.createContextSync()
        const jail = context.global;
        jail.setSync('global', jail.derefInto())
        jail.setSync('log', function(...args: any) {
            console.log(...args);
        });
        context.evalSync('log("hello world")');
        const hostile = isolate.compileScriptSync(sumTwoContext.replace('{respostaModelo}', sumTwoGabarito));
        await hostile.run(context)
    } catch(e) {
        if (e instanceof Error)
            console.log(e)
    }
});
// {respostaModelo}