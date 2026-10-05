import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const roots=['artifacts/api-server/src','lib/db/src'];
async function walk(dir) {
  for(const item of await readdir(dir,{withFileTypes:true})) {
    const file=path.join(dir,item.name);
    if(item.isDirectory()) await walk(file);
    else if(item.name.endsWith('.js')) {
      const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
      if(result.status)process.exit(result.status);
    }
  }
}
for(const root of roots)await walk(root);
console.info('JavaScript syntax checks passed.');
