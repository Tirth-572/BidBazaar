export function sendJson(res, data, status = 200) {
  if (!res.headersSent) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  }
}
