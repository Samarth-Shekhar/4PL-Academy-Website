import { defineConfig } from 'orval';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const client=path.join(root,'lib/api-client-react/src');
const validator=path.join(root,'lib/api-zod/src');
const input={target:'./openapi.yaml',override:{transformer:config=>{config.info??={};config.info.title='Api';return config;}}};
export default defineConfig({
  'api-client-react': {
    input,
    output: {
      workspace:client,target:'generated',client:'react-query',mode:'split',baseUrl:'/api',clean:true,prettier:true,
      override:{fetch:{includeHttpResponseReturnType:false},mutator:{path:path.join(client,'custom-fetch.js'),name:'customFetch'}},
    },
  },
  zod: {
    input,
    output: {
      workspace:validator,client:'zod',target:'generated',schemas:{path:'generated/types',type:'typescript'},mode:'split',clean:true,prettier:true,
      override:{zod:{version:3,coerce:{query:['boolean','number','string'],param:['boolean','number','string'],body:['bigint','date'],response:['bigint','date']}},useDates:true,useBigInt:true},
    },
  },
});
