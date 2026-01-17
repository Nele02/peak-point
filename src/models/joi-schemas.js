import Joi from "joi";

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const UserCredentialsSpec = Joi.object()
  .keys({
    email: Joi.string().email().example("homer@simpson.com").required(),
    password: Joi.string().min(6).example("secret").required(),
  })
  .label("UserCredentials");

export const UserSpec = UserCredentialsSpec.keys({
  firstName: Joi.string().trim().min(1).example("Homer").required(),
  lastName: Joi.string().trim().min(1).example("Simpson").required(),
}).label("UserDetails");

export const UserSpecPlus = Joi.object()
  .keys({
    _id: IdSpec,
    firstName: Joi.string().trim().min(1).required(),
    lastName: Joi.string().trim().min(1).required(),
    email: Joi.string().email().required(),
    twoFactorEnabled: Joi.boolean().required(),
    __v: Joi.number().optional(),
  }) .label("UserDetailsPlus");

export const UserArray = Joi.array().items(UserSpecPlus).label("UserArray");

export const CategorySpec = Joi.object({
  name: Joi.string().trim().min(2).max(50).example("Alps").required(),
}).label("CategoryDetails");

export const CategorySpecPlus = CategorySpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("CategoryDetailsPlus");

export const CategoryArray = Joi.array().items(CategorySpecPlus).label("CategoryArray");

// ---- Peak Specs ----

const StoredImageSpec = Joi.object({
  url: Joi.string().uri().required(),
  publicId: Joi.string().allow("").optional(),
});

const PeakNameSpec = Joi.string().trim().min(1).example("Zugspitze").required();
const PeakDescriptionSpec = Joi.string().allow("").example("Highest peak in Germany").optional();

const ElevationSpec = Joi.number().integer().min(1).example(2962);

const LatSpec = Joi.number().min(-90).max(90).example(47.4215);

const LngSpec = Joi.number().min(-180).max(180).example(11.9842);

export const PeakSpec = Joi.object({
  name: PeakNameSpec,
  description: PeakDescriptionSpec,
  elevation: ElevationSpec.required(),
  lat: LatSpec.required(),
  lng: LngSpec.required(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  userid: IdSpec,
  images: Joi.array().items(StoredImageSpec).default([]),
}).label("PeakDetails");

export const PeakSpecPlus = PeakSpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("PeakDetailsPlus");

export const PeakArray = Joi.array().items(PeakSpecPlus).label("PeakArray");

export const PeakUpdateSpec = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow("").optional(),
  elevation: ElevationSpec.optional(),
  lat: LatSpec.optional(),
  lng: LngSpec.optional(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  images: Joi.array().items(StoredImageSpec).optional(),
}).label("PeakUpdate");

// ---- Web form specs (multipart) ----

const UploadFileSpec = Joi.object({
  path: Joi.string().allow("").optional(),
  filename: Joi.string().allow("").optional(),
  headers: Joi.object().optional(),
  bytes: Joi.number().optional(),
});

export const PeakWebSpec = Joi.object({
  name: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("").optional(),
  elevation: ElevationSpec.required(),
  lat: LatSpec.required(),
  lng: LngSpec.required(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  images: Joi.alternatives().try(UploadFileSpec, Joi.array().items(UploadFileSpec)).optional(),
}).label("PeakWeb");

export const PeakUpdateWebSpec = Joi.object({
  name: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("").optional(),
  elevation: ElevationSpec.required(),
  lat: LatSpec.required(),
  lng: LngSpec.required(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  images: Joi.alternatives().try(UploadFileSpec, Joi.array().items(UploadFileSpec)).optional(),
}).label("PeakUpdateWeb");

export const CategoryIdsQuerySpec = Joi.object({
  categoryIds: Joi.array()
    .items(IdSpec)
    .single()
    .optional()
    .description("One or more category IDs."),
}).label("CategoryIdsQuery");

export const JwtAuth = Joi.object()
  .keys({
    success: Joi.boolean().example(true).required(),
    token: Joi.string().example("eyJhbGciOiJND...").required(),
    name: Joi.string().example("Homer Simpson").required(),
    email: Joi.string().email().optional(),
    _id: IdSpec.required(),
  })
  .label("JwtAuth");

// 2fa

export const TwoFactorChallenge = Joi.object()
  .keys({
    twoFactorRequired: Joi.boolean().example(true).required(),
    tempToken: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    _id: IdSpec.required(),
  })
  .label("TwoFactorChallenge");

export const AuthResponse = Joi.alternatives().try(JwtAuth, TwoFactorChallenge).label("AuthResponse");

export const TwoFactorSetupResponse = Joi.object().keys({
    otpauthUrl: Joi.string().required(),
  }).label("TwoFactorSetupResponse");

export const TwoFactorVerifySetupPayload = Joi.object().keys({
    code: Joi.string().trim().min(6).required(),
  }).label("TwoFactorVerifySetupPayload");

export const TwoFactorVerifySetupResponse = Joi.object().keys({
    enabled: Joi.boolean().example(true).required(),
    recoveryCodes: Joi.array().items(Joi.string()).min(1).required(),
  }).label("TwoFactorVerifySetupResponse");

export const TwoFactorLoginPayload = Joi.object().keys({
    tempToken: Joi.string().required(),
    code: Joi.string().trim().min(6).required(),
  }).label("TwoFactorLoginPayload");

export const TwoFactorRecoveryLoginPayload = Joi.object()
  .keys({
    tempToken: Joi.string().required(),
    recoveryCode: Joi.string().trim().min(4).required(),
  }).label("TwoFactorRecoveryLoginPayload");

