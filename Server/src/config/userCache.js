import NodeCache from 'node-cache'; 

export const userCache = new NodeCache({
  stdTTL:60 , 
  checkperiod:120,
}); 