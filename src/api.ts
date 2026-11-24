export async function api<T>(path:string,options:RequestInit={}):Promise<T> {
  const headers = new Headers(options.headers);
  if(options.body && !(options.body instanceof FormData)) headers.set('Content-Type','application/json');
  let response:Response;
  try { response=await fetch(`/api${path}`,{...options,headers,credentials:'same-origin'}); }
  catch { throw new Error('Could not reach the local server. Check that npm run dev is running, then try again.'); }
  if(!response.ok) {
    const body=await response.json().catch(()=>({error:'The request could not be completed. Try again.'}));
    if(response.status===401&&!path.startsWith('/auth/')) window.dispatchEvent(new Event('session-expired'));
    throw new Error(body.error || 'The request could not be completed.');
  }
  return response.json();
}
export async function download(path:string,filename:string) {
  const response=await fetch(`/api${path}`,{credentials:'same-origin'});
  if(!response.ok) { const error=await response.json().catch(()=>({error:'Download failed.'})); throw new Error(error.error); }
  const url=URL.createObjectURL(await response.blob()),a=document.createElement('a');
  a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export const money=(n:number)=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:2}).format(n);
export const number=(n:number)=>new Intl.NumberFormat('en-PH',{maximumFractionDigits:3}).format(n);
export const shortDate=(date:string)=>new Intl.DateTimeFormat('en-PH',{month:'short',day:'numeric',timeZone:'Asia/Manila'}).format(new Date(date));
export const fullDate=(date:string)=>new Intl.DateTimeFormat('en-PH',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:'Asia/Manila'}).format(new Date(date));
export const initials=(name:string)=>name.split(' ').filter(Boolean).map(s=>s[0]).slice(0,2).join('');
export const unitLabel=(unit:string,n:number)=>unit==='meter'?'m':unit==='piece'?'pcs':unit==='set'?(n===1?'set':'sets'):n===1?unit:`${unit}s`;
export const movementLabel={opening:'Opening balance',receive:'Received',issue:'Issued',adjust:'Count adjusted'};
