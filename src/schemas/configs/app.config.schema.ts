// Create app config schema.
// Create a parser function.

import moment from "moment";
import { z } from "zod";
import { Exception, ExceptionType } from "../../models/exception.model";
import { actionsAppConfigSchema } from "./actions.app.config.schema";
import { gatewayAppConfigSchema } from "./gateway.app.config.schema";

export enum AppMode {
  bap = "bap",
  bpp = "bpp"
}

// import { z } from 'zod';
// import moment from 'moment';

// Define the schema for a single key set
const keySchema = z.object({
  privateKey: z.string(),
  publicKey: z.string(),
  uniqueKey: z.string(),
  subscriberId: z.string(),
  subscriberUri: z.string()
});

// Modify the appConfigSchema to use an array of keySchema
export const appConfigSchema = z.object({
  mode: z.nativeEnum(AppMode),

  gateway: gatewayAppConfigSchema,

  actions: actionsAppConfigSchema,

  keys: z.array(keySchema),

  registryUrl: z.string(),
  auth: z.boolean(),

  city: z.string(),
  country: z.string(),

  ttl: z.string().transform((value) => {
    const duration = moment.duration(value);
    return duration.asMilliseconds();
  }),

  httpTimeout: z.string().transform((value) => {
    const duration = moment.duration(value);
    return duration.asMilliseconds();
  }),
  httpRetryCount: z.number(),

  telemetry: z.object({
    enabled: z.boolean(),
    url: z.string(),
    batchSize: z.number(),
    syncInterval: z.number(),
    redis_db: z.number()
  }),
  useLayer2Config: z.boolean().optional(),
  mandateLayer2Config: z.boolean().optional(),
  unsolicitedWebhook: z.object({
    url: z.string().optional()
  }).optional()
});


// export const appConfigSchema = z.object({
//   mode: z.nativeEnum(AppMode),

//   gateway: gatewayAppConfigSchema,

//   actions: actionsAppConfigSchema,

//   privateKey: z.string(),
//   publicKey: z.string(),

//   subscriberId: z.string(),
//   subscriberUri: z.string(),

//   registryUrl: z.string(),
//   auth: z.boolean(),
//   uniqueKey: z.string(),

//   city: z.string(),
//   country: z.string(),

//   ttl: z.string().transform((value) => {
//     const duration = moment.duration(value);
//     return duration.asMilliseconds();
//   }),

//   httpTimeout: z.string().transform((value) => {
//     const duration = moment.duration(value);
//     return duration.asMilliseconds();
//   }),
//   httpRetryCount: z.number(),

//   telemetry: z.object({
//     enabled: z.boolean(),
//     url: z.string(),
//     batchSize: z.number(),
//     syncInterval: z.number(),
//     redis_db: z.number()
//   }),
//   useLayer2Config: z.boolean().optional(),
//   mandateLayer2Config: z.boolean().optional(),
//   unsolicitedWebhook: z.object({
//     url: z.string().optional()
//   }).optional()
// });

export type AppConfigDataType = z.infer<typeof appConfigSchema>;

export const parseAppConfig = (config: any): AppConfigDataType => {
  if (!config) {
    throw new Exception(
      ExceptionType.Config_AppConfig_NotFound,
      "App config not found",
      404
    );
  }

  try {
    const appConfig = appConfigSchema.parse(config);
    console.log("appConfig", appConfig)
    if (appConfig.mandateLayer2Config && !appConfig.useLayer2Config)
      throw new Error("If mandateLayer2Config value is true, useLayer2Config should also be true")
    return appConfig;
  } catch (e) {
    throw new Exception(
      ExceptionType.Config_AppConfig_Invalid,
      "Invalid app config",
      400,
      e
    );
  }
};
