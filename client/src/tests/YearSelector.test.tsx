/// <reference types="@testing-library/jest-dom" />

import { render, fireEvent, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import YearSelector from "../components/YearSelector";

test("sproži spremembo leta pri kliku na značko (Badge)", () => {
  const onChange = vi.fn();

  render(
    <YearSelector
      availableYears={[2020, 2021, 2022]}
      selectedYear={2020}
      onYearChange={onChange}
    />
  );

  // Poiščemo značko (badge) z letom 2021 in kliknemo nanjo
  const badge = screen.getByText("2021");
  expect(badge).toBeInTheDocument();

  fireEvent.click(badge);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(2021);
});
