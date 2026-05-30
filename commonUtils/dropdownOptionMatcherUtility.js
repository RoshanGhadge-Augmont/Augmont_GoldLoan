export async function getCaseInsensitiveOptionLabel(
  dropdownLocator,
  inputText,
) {
  // Normalize input: collapse all whitespace variants to a single space
  const normalizeText = (text) =>
    text
      .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, " ") // replace special unicode spaces
      .replace(/\s+/g, " ") // collapse multiple spaces
      .trim();

  const normalizedInput = normalizeText(inputText);

  // Escape regex special characters
  const escapedValue = normalizedInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create case-insensitive regex
  const regex = new RegExp(`^${escapedValue}$`, "i");

  // Fetch all option labels with their values (for selectOption fallback)
  const options = await dropdownLocator.locator("option").evaluateAll((opts) =>
    opts.map((o) => ({
      raw: o.textContent,
      label: o.textContent
        .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      value: o.value,
    })),
  );

  console.log(
    "All fetched Options (normalized):",
    options.map((o) => o.label),
  );

  // Find matched option
  const matched = options.find((o) => regex.test(o.label));

  if (!matched) {
    console.warn(
      `[getCaseInsensitiveOptionLabel] No match found for "${inputText}". ` +
        `Available options: ${options.map((o) => o.label).join(", ")}`,
    );
    return null;
  }

  return matched.label;
}
