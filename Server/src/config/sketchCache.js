import NodeCache from 'node-cache';

export  const sketchCache = new NodeCache({
  stdTTL:300 , 
  checkperiod:60,
  maxKeys:1000,
});

export const sketchListKey = (userId)=>`sketches:list:${userId}`;

// In sketchCache.js, change sketchKey to:
export const sketchKey = (userId, sketchId) => `sketches:single:${userId}:${sketchId}`;