/**
 * Executa código JavaScript em um processo Bun isolado e seguro,
 * usando a técnica de IIFE para "esconder" os globais perigosos.
 * @param codigo O código a ser executado.
 * @returns Um objeto com a saída padrão (stdout) e a saída de erro (stderr).
 */
export async function runSandbox(codigo: string) {

    const dangerousGlobals = [
        'Bun', 'process', 'fs', 'child_process', 'os', 'net', 'http', 'https', 'path', 'fetch'
    ];

    // Cada global perigoso é um parâmetro da função, que receberá `undefined`.
    // Qualquer tentativa de usar `Bun.file()` dentro do código, por exemplo,
    // se tornará `undefined.file()`, causando um TypeError seguro e controlado.
    const codigoWrapper = /* ts */`
    (function(${dangerousGlobals.join(', ')}) {
      'use strict'; // Ativa o modo estrito para segurança adicional

      try {
        ${codigo}
      } catch (e) {
        // Garante que qualquer erro no código do usuário seja capturado
        // e enviado para o stderr, em vez de travar o processo filho silenciosamente.
        console.error(e instanceof Error ? e.stack : String(e));
      }
    })(${'undefined, '.repeat(dangerousGlobals.length).slice(0, -2)});
  `;

    const proc = Bun.spawn(['bun', 'run', '-'], {
        stdin: 'pipe',
        stdout: 'pipe',
        stderr: 'pipe',
    });

    proc.stdin.write(codigoWrapper);
    proc.stdin.end();

    const [out, error] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
    ]);

    await proc.exited;

    return { 
        out, 
        error: error 
        ? error
        : null
    };
}