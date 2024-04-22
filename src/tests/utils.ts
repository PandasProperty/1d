import { areAllRowsFilledRequired } from "@/utils";

// Example usage:
const myArray: any[][] = [[], [1, 2], [], ["a"], []];

console.log(areAllRowsFilledRequired(myArray, [0, 2])); // true, because sub-arrays at indices 0 and 2 are empty
console.log(areAllRowsFilledRequired(myArray, [0, 3])); // false, because sub-array at index 3 is not empty
console.log(areAllRowsFilledRequired(myArray, [0, 2, 4])); // true, because sub-arrays at indices 0, 2, and 4 are empty
console.log(areAllRowsFilledRequired(myArray)); // false, because not all sub-arrays are empty
