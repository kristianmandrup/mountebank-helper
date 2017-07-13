export function isObject(obj) {
  return obj === Object(obj);
}

export function isList(val) {
  return Array.isArray(val)
}

export function toArray(val) {
  if (typeof val === 'undefined') return []
  if (isObject(val)) val = Object.values(val)
  if (val === null) return []
  let items = isList(val) ? val : [val]
  items = items.filter(item => item)
  return items
}
