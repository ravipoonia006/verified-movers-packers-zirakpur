const { getSession, sendJson } = require('../_lib/common.cjs');
module.exports = function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return sendJson(res,405,{ok:false,message:'Method not allowed'}); }
  const session = getSession(req);
  if (!session) return sendJson(res,200,{ok:true,authenticated:false,driveConfigured:Boolean(process.env.GOOGLE_REFRESH_TOKEN)});
  return sendJson(res,200,{ok:true,authenticated:true,email:session.email,expiresAt:new Date(session.exp*1000).toISOString(),driveConfigured:Boolean(process.env.GOOGLE_REFRESH_TOKEN)});
};
