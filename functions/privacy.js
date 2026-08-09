import{renderPolicy}from'./_lib/policy.js';export async function onRequestGet(){return new Response(renderPolicy('privacy'),{headers:{'Content-Type':'text/html;charset=UTF-8'}})}
