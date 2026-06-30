/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievementDefs from "../achievementDefs.js";
import type * as achievements from "../achievements.js";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as calendar from "../calendar.js";
import type * as cards from "../cards.js";
import type * as catalogData from "../catalogData.js";
import type * as crons from "../crons.js";
import type * as decks from "../decks.js";
import type * as draw from "../draw.js";
import type * as entitlements from "../entitlements.js";
import type * as favorites from "../favorites.js";
import type * as group from "../group.js";
import type * as http from "../http.js";
import type * as importCatalog from "../importCatalog.js";
import type * as pro from "../pro.js";
import type * as reminders from "../reminders.js";
import type * as schedule from "../schedule.js";
import type * as seed from "../seed.js";
import type * as streakUtil from "../streakUtil.js";
import type * as streaks from "../streaks.js";
import type * as stripe from "../stripe.js";
import type * as studio from "../studio.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievementDefs: typeof achievementDefs;
  achievements: typeof achievements;
  admin: typeof admin;
  auth: typeof auth;
  calendar: typeof calendar;
  cards: typeof cards;
  catalogData: typeof catalogData;
  crons: typeof crons;
  decks: typeof decks;
  draw: typeof draw;
  entitlements: typeof entitlements;
  favorites: typeof favorites;
  group: typeof group;
  http: typeof http;
  importCatalog: typeof importCatalog;
  pro: typeof pro;
  reminders: typeof reminders;
  schedule: typeof schedule;
  seed: typeof seed;
  streakUtil: typeof streakUtil;
  streaks: typeof streaks;
  stripe: typeof stripe;
  studio: typeof studio;
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
