/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as aiHelpers from "../aiHelpers.js";
import type * as auditLogs from "../auditLogs.js";
import type * as caseActivities from "../caseActivities.js";
import type * as caseNotes from "../caseNotes.js";
import type * as cases from "../cases.js";
import type * as clients from "../clients.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as documents from "../documents.js";
import type * as goals from "../goals.js";
import type * as lib_auth from "../lib/auth.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as partners from "../partners.js";
import type * as qaSetup from "../qaSetup.js";
import type * as referrals from "../referrals.js";
import type * as seed from "../seed.js";
import type * as serviceDeliveries from "../serviceDeliveries.js";
import type * as services from "../services.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  aiHelpers: typeof aiHelpers;
  auditLogs: typeof auditLogs;
  caseActivities: typeof caseActivities;
  caseNotes: typeof caseNotes;
  cases: typeof cases;
  clients: typeof clients;
  crons: typeof crons;
  dashboard: typeof dashboard;
  documents: typeof documents;
  goals: typeof goals;
  "lib/auth": typeof lib_auth;
  notifications: typeof notifications;
  organizations: typeof organizations;
  partners: typeof partners;
  qaSetup: typeof qaSetup;
  referrals: typeof referrals;
  seed: typeof seed;
  serviceDeliveries: typeof serviceDeliveries;
  services: typeof services;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
