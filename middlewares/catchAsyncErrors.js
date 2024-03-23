export default (AsyncError) => (req, res, next) =>
  Promise.resolve(AsyncError(req, res, next)).catch(next);
