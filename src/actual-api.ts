import api from "@actual-app/api";
import fs from "fs";
import path from "path";
import { BudgetFile } from "./types.js";

// Track whether console.log has been redirected to stderr
let logRedirected = false;

const DEFAULT_DATA_DIR: string = path.resolve(
  process.env.HOME || process.env.USERPROFILE || ".",
  ".actual"
);

// API initialization state
let initialized: boolean = false;
let initializing: boolean = false;
let initializationError: Error | null = null;

/**
 * Initialize the Actual Budget API
 */
export async function initActualApi(): Promise<void> {
  if (initialized) return;
  if (initializing) {
    // Wait for initialization to complete if already in progress
    while (initializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (initializationError) throw initializationError;
    return;
  }

  try {
    console.error("Initializing Actual Budget API...");
    if (!logRedirected) {
      // Redirect any console.log output from the Actual API to stderr
      console.log = (...args: unknown[]) => console.error(...args);
      logRedirected = true;
    }
    const dataDir = process.env.ACTUAL_DATA_DIR || DEFAULT_DATA_DIR;
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    await api.init({
      dataDir,
      serverURL: process.env.ACTUAL_SERVER_URL,
      password: process.env.ACTUAL_PASSWORD,
    });

    const budgets: BudgetFile[] = await api.getBudgets();
    if (!budgets || budgets.length === 0) {
      throw new Error(
        "No budgets found. Please create a budget in Actual first."
      );
    }

    // Use specified budget or the first one
    const budgetId: string =
      process.env.ACTUAL_BUDGET_SYNC_ID ||
      budgets[0].cloudFileId ||
      budgets[0].id ||
      "";
    console.error(`Loading budget: ${budgetId}`);
    await api.downloadBudget(budgetId);

    initialized = true;
    console.error("Actual Budget API initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Actual Budget API:", error);
    initializationError =
      error instanceof Error ? error : new Error(String(error));
    throw initializationError;
  } finally {
    initializing = false;
  }
}

/**
 * Shutdown the Actual Budget API
 */
export async function shutdownActualApi(): Promise<void> {
  if (!initialized) return;
  await api.shutdown();
  initialized = false;
}

/**
 * Get all accounts (ensures API is initialized)
 */
export async function getAccounts() {
  await initActualApi();
  return api.getAccounts();
}

/**
 * Get all categories (ensures API is initialized)
 */
export async function getCategories() {
  await initActualApi();
  return api.getCategories();
}

/**
 * Get all category groups (ensures API is initialized)
 */
export async function getCategoryGroups() {
  await initActualApi();
  return api.getCategoryGroups();
}

/**
 * Get transactions for a specific account and date range (ensures API is initialized)
 */
export async function getTransactions(accountId: string, start: string, end: string) {
  await initActualApi();
  return api.getTransactions(accountId, start, end);
}

export async function createRule(rule: unknown) {
  await initActualApi();
  return api.createRule(rule as any);
}

export async function getRules() {
  await initActualApi();
  return api.getRules();
}
