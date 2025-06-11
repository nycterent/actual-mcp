import { success, errorFromCatch } from "../../utils/response.js";
import { createRule as apiCreateRule } from "../../actual-api.js";
import type { CreateRuleArgs } from "../../types.js";

export const schema = {
  name: "create-rule",
  description: "Create a categorization rule to assign a category based on payee",
  inputSchema: {
    type: "object",
    properties: {
      payee: { type: "string", description: "Payee name to match" },
      categoryId: {
        type: "string",
        description: "Category ID to assign when the rule matches",
      },
      stage: {
        type: "string",
        enum: ["pre", "default", "post"],
        description: "Rule stage (pre, default, or post)",
        default: "pre",
      },
    },
    required: ["payee", "categoryId"],
  },
};

export async function handler(args: CreateRuleArgs) {
  try {
    const { payee, categoryId, stage = "pre" } = args;
    const rule = {
      stage,
      conditionsOp: "and",
      conditions: [{ field: "payee", op: "is", value: payee }],
      actions: [{ field: "category", op: "set", value: categoryId }],
    };
    const created = await apiCreateRule(rule as any);
    return success(`Rule created with id ${created.id}`);
  } catch (err) {
    return errorFromCatch(err);
  }
}
