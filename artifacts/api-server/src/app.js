import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from './lib/log.js';
import catalogRouter from './routes/catalog.js';
import adminRouter from './routes/admin.js';
import storageRouter from './routes/storage.js';
import { siteUrl } from './lib/config.js';
import { robots, sitemap } from './lib/seo.js';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(pinoHttp({ logger, serializers: { req:req=>({id:req.id,method:req.method,url:req.url?.split('?')[0]}), res:res=>({statusCode:res.statusCode}) } }));
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, strictTransportSecurity: process.env.NODE_ENV === 'production' ? undefined : false }));
app.use(express.json({limit:'100kb'}));
app.use(express.urlencoded({extended:false,limit:'100kb'}));
app.use(cookieParser());
app.use('/api', (req,res,next) => {
  if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
    const origin = req.get('Origin');
    const own = `${req.protocol}://${req.get('host')}`;
    if (req.get('Sec-Fetch-Site') === 'cross-site' || (origin && origin !== own && origin !== siteUrl)) {
      res.status(403).json({error:'Cross-site requests are not allowed.'}); return;
    }
    const hasBody = Number(req.get('content-length') || 0) > 0 || Boolean(req.get('transfer-encoding'));
    if (hasBody && !req.is('application/json')) { res.status(415).json({error:'Send JSON content.'});return; }
  }
  next();
});
app.use('/api',catalogRouter);
app.use('/api/admin',adminRouter);
app.use('/api/storage',storageRouter);
app.get(['/robots.txt','/api/seo/robots.txt'], (_req,res)=>res.type('text/plain').send(robots()));
app.get(['/sitemap.xml','/api/seo/sitemap.xml'],async (_req,res)=>{
  const xml=await sitemap();
  if (!xml) {res.status(503).type('text/plain').send('Configure SITE_URL to generate an accurate sitemap.');return;}
  res.type('application/xml').send(xml);
});
app.use('/api',(_req,res)=>res.status(404).json({error:'Endpoint not found.'}));
export function attachErrorHandler() {
  app.use((err,req,res,_next)=>{
    if (err.name==='ZodError') { res.status(400).json({error:'Please check the required fields.',fields:err.issues?.map(i=>({path:i.path.join('.'),message:i.message}))});return; }
    if (err.code==='23505') {res.status(409).json({error:'A record with this URL slug already exists.'});return;}
    if (err.type==='entity.too.large') {res.status(413).json({error:'Request is too large.'});return;}
    if (err.type==='entity.parse.failed') {res.status(400).json({error:'Invalid JSON request.'});return;}
    const status=err.status || 500;
    if(status>=500) req.log.error({errorName:err.name,code:err.code},'Request could not be completed.');
    res.status(status).json({error:status>=500?'The request could not be completed. Please try again.':err.message});
  });
}
export default app;
