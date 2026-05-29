// import { expect } from "@playwright/test";

// function escapeRegex(value) {
//   return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// async function resolveOptionLabel(selectLocator, expectedValue) {
//   await expect(selectLocator).toBeVisible();

//   const pattern =
//     expectedValue instanceof RegExp
//       ? new RegExp(
//           expectedValue.source.replace(/^\^|\$$/g, ""),
//           expectedValue.flags,
//         )
//       : new RegExp(`^${escapeRegex(expectedValue)}$`, "i");

//   const matchingOptions = selectLocator.locator("option").filter({
//     hasText: pattern,
//   });

//   await expect
//     .poll(async () => await matchingOptions.count(), {
//       timeout: 10000,
//       intervals: [250, 500, 1000, 2000],
//     })
//     .toBeGreaterThan(0);

//   const matchedOption = matchingOptions.first();
//   const matchedLabel = (await matchedOption.textContent())?.trim();

//   if (!matchedLabel) {
//     throw new Error(
//       `No dropdown option matched value: ${String(expectedValue)}`,
//     );
//   }

//   return matchedLabel;
// }

// export { resolveOptionLabel };
