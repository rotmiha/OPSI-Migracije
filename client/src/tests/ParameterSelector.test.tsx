/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi } from "vitest";
import ParameterSelector from "../components/ParameterSelector";

const mockGroups = [
  {
    id: "group1",
    name: "Demografija",
    parameters: [
      { id: "p1", field: "selitve_v_obcino", name: "Selitve v občino" },
      { id: "p2", field: "odselitve_iz_obcine", name: "Odselitve iz občine" },
    ],
  },
];

test("izbere parameter in sproži spremembo", async () => {
  const onGroupChange = vi.fn();
  const onParameterChange = vi.fn();
  const user = userEvent.setup();

  render(
    <ParameterSelector
      parameterGroups={mockGroups}
      selectedGroupId="group1"
      selectedParameterId="selitve_v_obcino"
      onGroupChange={onGroupChange}
      onParameterChange={onParameterChange}
    />
  );

  // ✅ Popravljeno: poiščemo dejanski trigger preko role "combobox"
  const trigger = screen.getByRole("combobox", { name: /Parameter/i });
  await user.click(trigger);

  // Klikni novo vrednost
  const newOption = await screen.findByText("Odselitve iz občine");
  await user.click(newOption);

  expect(onParameterChange).toHaveBeenCalledWith(
    "odselitve_iz_obcine",
    "Odselitve iz občine"
  );
});
