export function castFirstChar(str: string) {
  const char = str.trim()[0]
  if (typeof char === 'undefined') return null
  
  const isFirstCharANumber = !isNaN(parseFloat(char)) && isFinite(parseFloat(char))

  if (isFirstCharANumber) {
    return Number(char)
  } else {
    return null
  }
}