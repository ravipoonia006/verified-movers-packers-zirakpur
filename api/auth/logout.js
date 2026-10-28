const { clearCookieLine, sendJson, SESSION_COOKIE } = require('../_lib/common.cjs');
module.exports = function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') { res.setHeader('Allow','GET, POST'); return sendJson(res,405,{ok:false,message:'Method not allowed'}); }
  res.setHeader('Set-Cookie', clearCookieLine(SESSION_COOKIE, '/'));
  return sendJson(res,200,{ok:true,message:'Signed out.'});
};
