export function apiNotFound(req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err?.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).json({ error: first?.message || 'Some fields are invalid.' });
  }
  if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid value supplied.' });
  if (err?.code === 11000) return res.status(409).json({ error: 'This record already exists.' });
  if (err?.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be smaller than 12 MB.' : err.code === 'LIMIT_FILE_COUNT' ? 'Too many files in one upload.' : err.message;
    return res.status(400).json({ error: msg });
  }
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });

  const status = Number(err?.status || err?.statusCode) || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong. Please try again.' : err.message });
}
