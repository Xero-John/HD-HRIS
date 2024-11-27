export const calcbuttons = [
  "7", "8", "9", "/", ">", ":",
  "4", "5", "6", "x", "<", "√",
  "1", "2", "3", "-", "=", "^",
  ".", "0", "←", "+", "!", "?",
  "C", "(", ")", "abs"
];

const adjacents = ["0",".","%","-","!","√","^","abs","="];

export function isValidAdjacent(key: string):boolean{
    return !!(parseInt(key) || adjacents.includes(key))
}

export function isNumeric(key: string):boolean {
  return !![0,1,2,3,4,5,6,7,8,9].map(String).includes(key)
}

export const var_buttons = ["rate_p_hr", "total_shft_hr", "payroll_days", "basic_salary"];
