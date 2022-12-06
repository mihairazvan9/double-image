
function range (a, b) {
  let r = Math.random()
  return a * r + b * (1 - r)
}

export { range }