export const colors = ["#004C97", "#FEDD00", "#d56f24", "#f7931e", "#fbb03b", "#153274", "#054222", "#004f4b", "#1fa12d", "#00766f"]

export function getColorByIndex(i: number): string {
  return colors[i % colors.length]!;
}