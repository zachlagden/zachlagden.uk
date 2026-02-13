import { describe, it, expect } from "vitest";
import { formatDate, formatDateRange } from "./contentLoader";

describe("formatDate", () => {
  it('formats date string to "MMM YYYY" format', () => {
    expect(formatDate("2024-01-15")).toBe("Jan 2024");
    expect(formatDate("2024-12-31")).toBe("Dec 2024");
  });

  it("handles different months correctly", () => {
    expect(formatDate("2024-06-01")).toBe("Jun 2024");
    expect(formatDate("2023-03-15")).toBe("Mar 2023");
  });

  it("handles ISO date strings", () => {
    expect(formatDate("2024-01-01T00:00:00.000Z")).toBe("Jan 2024");
  });
});

describe("formatDateRange", () => {
  it("formats range with start and end dates", () => {
    expect(formatDateRange("2024-01-01", "2024-12-31")).toBe(
      "Jan 2024 - Dec 2024",
    );
  });

  it('shows "Present" when end date is null', () => {
    expect(formatDateRange("2024-01-01", null)).toBe("Jan 2024 - Present");
  });

  it('shows "Present" when end date is undefined', () => {
    expect(formatDateRange("2024-01-01")).toBe("Jan 2024 - Present");
  });

  it("handles same-year ranges", () => {
    expect(formatDateRange("2024-01-01", "2024-06-30")).toBe(
      "Jan 2024 - Jun 2024",
    );
  });

  it("handles cross-year ranges", () => {
    expect(formatDateRange("2023-06-01", "2024-03-15")).toBe(
      "Jun 2023 - Mar 2024",
    );
  });
});
