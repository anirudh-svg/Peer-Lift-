/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admins from "../admins.js";
import type * as anonymousUsers from "../anonymousUsers.js";
import type * as auth from "../auth.js";
import type * as chatSessions from "../chatSessions.js";
import type * as counselors from "../counselors.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admins: typeof admins;
  anonymousUsers: typeof anonymousUsers;
  auth: typeof auth;
  chatSessions: typeof chatSessions;
  counselors: typeof counselors;
  crons: typeof crons;
  http: typeof http;
  messages: typeof messages;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
