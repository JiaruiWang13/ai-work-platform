import http from 'node:http';
import {Readable} from 'node:stream';
import worker from '../dist/server/index.js';

const port=Number(process.env.PORT || 5091);
const serviceOrigin=process.env.SERVICE_ORIGIN || 'http://127.0.0.1:'+port;
const clientOrigins=new Set((process.env.PAGES_ORIGIN || '').split(',').map(origin=>origin.trim()).filter(Boolean));
const server=http.createServer(async(request,response)=>{
  try {
    const isAPI=request.url.startsWith('/api/');
    const origin=request.headers.origin;
    const crossOrigin=isAPI && origin && origin!==serviceOrigin;
    if(crossOrigin && !clientOrigins.has(origin)){response.writeHead(403).end();return;}
    const cors=crossOrigin ? {'Access-Control-Allow-Origin':origin,'Vary':'Origin'} : {};
    if(isAPI && request.method==='OPTIONS'){
      response.writeHead(204,{...cors,'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers':'Content-Type, X-Workspace','Access-Control-Max-Age':'600'}).end();
      return;
    }
    const headers=new Headers(request.headers);
    if(crossOrigin)headers.delete('origin'); // Checked the explicitly configured Pages origins above.
    const body=['GET','HEAD'].includes(request.method)?undefined:Readable.toWeb(request);
    const result=await worker.fetch(new Request(serviceOrigin+request.url,{
      method:request.method,headers,body,...(body?{duplex:'half'}:{}),
    }),process.env);
    response.writeHead(result.status,{...Object.fromEntries(result.headers),...cors});
    if(result.body)Readable.fromWeb(result.body).on('error',()=>response.destroy()).pipe(response);
    else response.end();
  }catch{if(!response.headersSent)response.writeHead(500);response.end();}
});
server.listen(port,'127.0.0.1',()=>console.log('Listening on 127.0.0.1:'+port));
