function isObject(obj) {
  return !isList(obj) && obj === Object(obj);
}

function isList(val) {
  return Array.isArray(val)
}

function toArray(val) {
  if (typeof val === 'undefined') return []
  if (isObject(val)) val = Object.values(val)
  if (val === null) return []
  let items = isList(val) ? val : [val]
  items = items.filter(item => item)
  return items
}

module.exports = {
  isObject,
  isList,
  toArray
}
