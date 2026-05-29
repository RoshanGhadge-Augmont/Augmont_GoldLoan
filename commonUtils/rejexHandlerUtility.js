// // This utility function takes an input object and transforms the values of specific fields into regular expressions.

// const DROPDOWN_FIELDS = [
//   "leadConverter",
//   "branch",
//   "state",
//   "city",
//   "region",
//   "loanType",
//   "nomineeRelation",
//   "ornamment1",
//   "ornament1karat",
//   "ornament1Purity",
//   "ornamment2",
//   "ornament2karat",
//   "ornament2Purity",
//   "partner",
//   "schemeName",
//   "partnerUser",
//   "partnerBranch",
// ];

// export function regexHandler(inputData) {
//   return Object.fromEntries(
//     Object.entries(inputData).map(([key, value]) => {
//       if (DROPDOWN_FIELDS.includes(key) && typeof value === "string") {
//         return [key, new RegExp(`^${value.trim()}$`, "i")];
//       }
//       return [key, value];
//     }),
//   );
// }
