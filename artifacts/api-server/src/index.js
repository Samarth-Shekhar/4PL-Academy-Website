import './lib/config.js';
import app, { attachErrorHandler } from './app.js';
import { initializeAdmin } from './lib/auth.js';
import { logger } from './lib/log.js';
import { pool } from '@workspace/db';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { renderMetadata } from './lib/seo.js';

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port<=0) throw new Error('PORT must be a positive integer.');
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length<20) throw new Error('A SESSION_SECRET of at least 20 characters is required.');
await initializeAdmin();
const webRoot = path.resolve(import.meta.dirname,'../../academy');
if (process.env.WEB_DEV === '1') {
  const { createServer } = await import('vite');
  const vite = await createServer({ root:webRoot, configFile:path.join(webRoot,'vite.config.js'), server:{middlewareMode:true}, appType:'custom' });
  app.use(vite.middlewares);
  app.get('/{*splat}',async (req,res,next)=>{
    try {
      const template = readFileSync(path.join(webRoot,'index.html'),'utf8');
      const html = await vite.transformIndexHtml(req.originalUrl,await renderMetadata(template,req.path));
      res.type('html').send(html);
    } catch(err) {vite.ssrFixStacktrace(err);next(err);}
  });
} else if (process.env.NODE_ENV === 'production') {
  const publicDir=path.join(webRoot,'dist/public');
  if (!existsSync(path.join(publicDir,'index.html'))) throw new Error('Build the website before pnpm start.');
  app.use(express.static(publicDir,{index:false,maxAge:'1h'}));
  app.get('/{*splat}',async(req,res)=>{
    const html=await renderMetadata(readFileSync(path.join(publicDir,'index.html'),'utf8'),req.path);
    res.type('html').send(html);
  });
}
attachErrorHandler();
const server=app.listen(port,'0.0.0.0',()=>logger.info({port},'4PL Academy server is ready.'));
for (const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>server.close(async()=>{await pool.end();process.exit(0);}));
