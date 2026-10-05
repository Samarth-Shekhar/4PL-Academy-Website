import { rmSync } from 'node:fs';
import { build } from 'esbuild';
// Orval emits TypeScript internally; ship plain ES-module JavaScript runtimes.
await build({stdin:{contents:'export * from "./generated/api"; export {setBaseUrl,setAuthTokenGetter,ApiError} from "./custom-fetch.js";',resolveDir:new URL('../api-client-react/src/',import.meta.url).pathname,loader:'js'},bundle:true,packages:'external',format:'esm',platform:'browser',target:'es2022',outfile:'../api-client-react/src/runtime.js'});
await build({entryPoints:['../api-zod/src/generated/api.ts'],bundle:true,packages:'external',format:'esm',platform:'node',target:'node22',outfile:'../api-zod/src/runtime.js'});
if(process.env.CLEAN_CODEGEN === '1') {
  rmSync('../api-client-react/src/generated',{recursive:true,force:true});
  rmSync('../api-zod/src/generated',{recursive:true,force:true});
  rmSync('../api-client-react/src/index.ts',{force:true});
  rmSync('../api-zod/src/index.ts',{force:true});
}
