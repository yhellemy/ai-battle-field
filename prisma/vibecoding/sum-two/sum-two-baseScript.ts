export const sumTwoBase = /* ts */
`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};
`

export const sumTwoGabarito = /* ts */
`var twoSum = function (nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[j] === target - nums[i]) {
                return [i, j];
            }
        }
    }
    // Return an empty array if no solution is found
    return [];
};`

export const sumTwoContext = /* ts */
`const nums = [{
  input:[2,7,11,15],
  target:9,
  output:[0,1]
},
{
  input:[3,2,4],
  target:6,
  output:[1,2]
},
{
  input:[3,3],
  target:6,
  output:[0,1]
}]

{respostaModelo}

const response = nums.forEach((item) => {
  const result = twoSum(item.input, item.target)
  if (JSON.stringify(result) !== JSON.stringify(item.output)) {
    const issue = 'Resposta incorreta, esperado ' + JSON.stringify(item.output) + ' e obtido ' + JSON.stringify(result) + ' para o input ' + JSON.stringify(item.input);
    throw new Error(issue)
  }
})
`