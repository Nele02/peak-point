import Joi from "joi";

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const UserCredentialsSpec = Joi.object()
  .keys({
    email: Joi.string().email().example("homer@simpson.com").required(),
    password: Joi.string().example("secret").required(),
  })
  .label("UserCredentials");

export const UserSpec = UserCredentialsSpec.keys({
  firstName: Joi.string().example("Homer").required(),
  lastName: Joi.string().example("Simpson").required(),
}).label("UserDetails");

export const UserSpecPlus = UserSpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("UserDetailsPlus");

export const UserArray = Joi.array().items(UserSpecPlus).label("UserArray");

export const CategorySpec = Joi.object({
  name: Joi.string().min(2).max(50).example("Alps").required(),
}).label("CategoryDetails");

export const CategorySpecPlus = CategorySpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("CategoryDetailsPlus");

export const CategoryArray = Joi.array().items(CategorySpecPlus).label("CategoryArray");

const StoredImageSpec = Joi.object({
  url: Joi.string().uri().required(),
  publicId: Joi.string().allow("").optional(),
});

export const PeakSpec = Joi.object({
  name: Joi.string().example("Zugspitze").required(),
  description: Joi.string().allow("").example("Highest peak in Germany").optional(),
  elevation: Joi.number().example(2962).required(),
  lat: Joi.number().example(47.4215).required(),
  lng: Joi.number().example(11.9842).required(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  userid: IdSpec,
  images: Joi.array().items(StoredImageSpec).default([]),
});

export const PeakSpecPlus = PeakSpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("PeakDetailsPlus");

export const PeakArray = Joi.array().items(PeakSpecPlus).label("PeakArray");

export const PeakUpdateSpec = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().allow("").optional(),
  elevation: Joi.number().optional(),
  lat: Joi.number().optional(),
  lng: Joi.number().optional(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  images: Joi.array().items(StoredImageSpec).optional(),
}).label("PeakUpdate");

const UploadFileSpec = Joi.object({
  path: Joi.string().allow("").optional(),
  filename: Joi.string().allow("").optional(),
  headers: Joi.object().optional(),
  bytes: Joi.number().optional(),
});

// Web create: required fields + optional files
export const PeakWebSpec = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  elevation: Joi.number().required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  images: Joi.alternatives().try(UploadFileSpec, Joi.array().items(UploadFileSpec)).optional(),
});

// Web update: same required fields (edit form sends full set) + optional new images
export const PeakUpdateWebSpec = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  elevation: Joi.number().required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  images: Joi.alternatives().try(UploadFileSpec, Joi.array().items(UploadFileSpec)).optional(),
});

export const CategoryIdsQuerySpec = Joi.object({
  categoryIds: Joi.array().items(IdSpec).single().optional().description("One or more category IDs."),
}).label("CategoryIdsQuery");

export const JwtAuth = Joi.object()
  .keys({
    success: Joi.boolean().example("true").required(),
    token: Joi.string().example("eyJhbGciOiJND...").required(),
  })
  .label("JwtAuth");
