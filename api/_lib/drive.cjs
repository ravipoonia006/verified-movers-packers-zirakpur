const { sendJson, getQuery, requireSession } = require('./common.cjs');
const FOLDER_NAME = 'Verified Movers Documents';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const MAX_PDF_BYTES = 3 * 1024 * 1024;

function apiError(message, status = 500) { const e = new Error(message); e.statusCode = status; return e; }
async function googleAccessToken() {
  const required = ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REDIRECT_URI','GOOGLE_REFRESH_TOKEN'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) throw apiError(`Google Drive is not fully configured. Missing Vercel variables: ${missing.join(', ')}.`, 503);
  const body = new URLSearchParams({ client_id:process.env.GOOGLE_CLIENT_ID, client_secret:process.env.GOOGLE_CLIENT_SECRET, refresh_token:process.env.GOOGLE_REFRESH_TOKEN, grant_type:'refresh_token' });
  const r = await fetch('https://oauth2.googleapis.com/token', {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  const data = await r.json();
  if (!r.ok || !data.access_token) throw apiError('Google Drive authorization failed. Reconnect the Google account and verify GOOGLE_REFRESH_TOKEN in Vercel.', 502);
  return data.access_token;
}
async function driveFetch(url, accessToken, options={}) {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) } });
  if (!response.ok) {
    let message = `Google Drive API error (${response.status}).`;
    try { const body = await response.json(); if (body.error && body.error.message) message = body.error.message; } catch {}
    throw apiError(message, response.status === 401 ? 502 : response.status);
  }
  return response;
}
async function listFiles(q, accessToken, fields='files(id,name,mimeType,size,webViewLink,createdTime,modifiedTime,appProperties,parents),nextPageToken') {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('spaces','drive');
  url.searchParams.set('pageSize','1000');
  url.searchParams.set('orderBy','createdTime desc');
  url.searchParams.set('fields',fields);
  const response = await driveFetch(url.toString(), accessToken);
  return response.json();
}
async function ensureFolder(accessToken) {
  const escaped = FOLDER_NAME.replace(/'/g,"\\'");
  const found = await listFiles(`name = '${escaped}' and mimeType = '${FOLDER_MIME}' and trashed = false`, accessToken, 'files(id,name,mimeType)');
  if (found.files && found.files.length) return found.files[0].id;
  const response = await driveFetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType', accessToken, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:FOLDER_NAME,mimeType:FOLDER_MIME})
  });
  const folder = await response.json();
  if (!folder.id) throw apiError('Google Drive did not return a folder ID.');
  return folder.id;
}
function cleanName(value, fallback='document') {
  const safe = String(value || '').normalize('NFKC').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').replace(/\s+/g,' ').trim().slice(0,90);
  return safe || fallback;
}
function safeProp(value, max=120) { return String(value == null ? '' : value).replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max); }
function queryEscape(value) { return String(value || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

async function handleStatus(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return sendJson(res,405,{ok:false,message:'Method not allowed'}); }
  const session = requireSession(req,res); if (!session) return;
  if (!process.env.GOOGLE_REFRESH_TOKEN) return sendJson(res,200,{ok:true,authenticated:true,connected:false,folderName:FOLDER_NAME,recordCount:0,message:'Google account sign-in works, but GOOGLE_REFRESH_TOKEN must be added to Vercel and the site redeployed.'});
  try {
    const token = await googleAccessToken();
    const folderId = await ensureFolder(token);
    const items = await listFiles(`'${folderId}' in parents and trashed = false`, token, 'files(id,name,mimeType,size,createdTime,modifiedTime,appProperties),nextPageToken');
    return sendJson(res,200,{ok:true,authenticated:true,connected:true,folderName:FOLDER_NAME,recordCount:(items.files||[]).length,message:'Google Drive is connected.'});
  } catch (e) { return sendJson(res,e.statusCode||500,{ok:false,authenticated:true,connected:false,message:e.message}); }
}

async function handleRecords(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return sendJson(res,405,{ok:false,message:'Method not allowed'}); }
  const session = requireSession(req,res); if (!session) return;
  try {
    const token = await googleAccessToken();
    const folderId = await ensureFolder(token);
    const result = await listFiles(`'${folderId}' in parents and trashed = false`, token);
    const query = (getQuery(req).get('q') || '').toLowerCase().trim();
    const type = (getQuery(req).get('type') || '').toLowerCase().trim();
    const records = (result.files || []).filter(f => f.mimeType !== FOLDER_MIME).map(f => {
      const p = f.appProperties || {};
      return {
        id:f.id, name:f.name, mimeType:f.mimeType, size:Number(f.size||0), createdTime:f.createdTime, modifiedTime:f.modifiedTime,
        docType:p.documentType||'document', docNumber:p.documentNumber||f.name, customerName:p.customerName||'', customerPhone:p.customerPhone||'',
        fromCity:p.fromCity||'', toCity:p.toCity||'', amount:p.amount||'', documentDate:p.documentDate||'', status:p.status||'issued'
      };
    }).filter(r => (!type || r.docType.toLowerCase() === type) && (!query || [r.name,r.docType,r.docNumber,r.customerName,r.customerPhone,r.fromCity,r.toCity].join(' ').toLowerCase().includes(query)));
    return sendJson(res,200,{ok:true,folderName:FOLDER_NAME,records,recordCount:records.length,hasMore:Boolean(result.nextPageToken)});
  } catch(e) { return sendJson(res,e.statusCode||500,{ok:false,message:e.message}); }
}

async function handleUpload(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return sendJson(res,405,{ok:false,message:'Method not allowed'}); }
  const session = requireSession(req,res); if (!session) return;
  try {
    const input = req.body && typeof req.body === 'object' ? req.body : JSON.parse(typeof req.body === 'string' ? req.body : '{}');
    const pdfBase64 = String(input.pdfBase64 || '').replace(/^data:application\/pdf;base64,/i,'').replace(/\s/g,'');
    if (!pdfBase64) throw apiError('A PDF file is required.',400);
    if (pdfBase64.length > Math.ceil(MAX_PDF_BYTES*4/3)+16) throw apiError('PDF is too large. Maximum size is 3 MB; print a compressed PDF and try again.',413);
    const bytes = Buffer.from(pdfBase64,'base64');
    if (bytes.length < 8 || bytes.length > MAX_PDF_BYTES || bytes.subarray(0,5).toString('ascii') !== '%PDF-') throw apiError('Uploaded file is not a valid PDF or exceeds the 3 MB limit.',400);
    const documentType = ['bilty','quotation','bill'].includes(String(input.documentType||'').toLowerCase()) ? String(input.documentType).toLowerCase() : 'document';
    const documentNumber = safeProp(input.documentNumber,60) || `DOC-${new Date().toISOString().slice(0,10)}-${Date.now().toString(36).toUpperCase()}`;
    const customerName = safeProp(input.customerName,120) || 'Customer not specified';
    const customerPhone = safeProp(input.customerPhone,40);
    const documentDate = safeProp(input.documentDate,24);
    const fromCity = safeProp(input.fromCity,120);
    const toCity = safeProp(input.toCity,120);
    const amount = safeProp(input.amount,40);
    const fileName = `${documentType.toUpperCase()}-${cleanName(documentNumber)}-${cleanName(customerName,'customer')}.pdf`.slice(0,180);
    const accessToken = await googleAccessToken();
    const folderId = await ensureFolder(accessToken);
    const metadata = {
      name:fileName, mimeType:'application/pdf', parents:[folderId],
      appProperties:{
        documentType, documentNumber, customerName, customerPhone, documentDate,
        fromCity, toCity, amount, status:'issued', createdBy:session.email
      }
    };
    const boundary = 'vmp_upload_' + require('crypto').randomBytes(12).toString('hex');
    const start = Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,'utf8');
    const end = Buffer.from(`\r\n--${boundary}--`,'utf8');
    const multipart = Buffer.concat([start,bytes,end]);
    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,createdTime,modifiedTime,appProperties,parents';
    const response = await driveFetch(url,accessToken,{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body:multipart});
    const saved = await response.json();
    const p = saved.appProperties || {};
    return sendJson(res,201,{ok:true,record:{id:saved.id,name:saved.name,mimeType:saved.mimeType,size:Number(saved.size||bytes.length),webViewLink:saved.webViewLink,createdTime:saved.createdTime,modifiedTime:saved.modifiedTime,docType:p.documentType||documentType,docNumber:p.documentNumber||documentNumber,customerName:p.customerName||customerName,customerPhone:p.customerPhone||customerPhone,fromCity:p.fromCity||fromCity,toCity:p.toCity||toCity,amount:p.amount||amount,documentDate:p.documentDate||documentDate,status:'issued'}});
  } catch(e) { return sendJson(res,e.statusCode||500,{ok:false,message:e.message||'Failed to save document to Google Drive.'}); }
}

async function handleDownload(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return sendJson(res,405,{ok:false,message:'Method not allowed'}); }
  const session = requireSession(req,res); if (!session) return;
  try {
    const id = getQuery(req).get('id') || '';
    if (!/^[a-zA-Z0-9_-]{10,200}$/.test(id)) throw apiError('A valid Drive file ID is required.',400);
    const token = await googleAccessToken();
    const folderId = await ensureFolder(token);
    const metaResp = await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,parents`,token);
    const meta = await metaResp.json();
    if (!(meta.parents||[]).includes(folderId)) throw apiError('That file is not in the private document folder.',404);
    const fileResp = await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`,token);
    const buf = Buffer.from(await fileResp.arrayBuffer());
    if (buf.length > MAX_PDF_BYTES) throw apiError('This file exceeds the current download limit.',413);
    const safeFilename = cleanName(meta.name,'document.pdf').replace(/[\r\n"]/g,'_');
    res.statusCode = 200;
    res.setHeader('Content-Type',meta.mimeType||'application/pdf');
    res.setHeader('Content-Length',String(buf.length));
    res.setHeader('Content-Disposition',`attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control','private, no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.end(buf);
  } catch(e) { return sendJson(res,e.statusCode||500,{ok:false,message:e.message||'Failed to download file.'}); }
}

module.exports = { handleStatus, handleRecords, handleUpload, handleDownload };
