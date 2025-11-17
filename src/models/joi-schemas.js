import Joi from "joi";

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const UserCredentialsSpec = Joi.object()
  .keys({
    email: Joi.string().email().example("homer@simpson.com").required(),
    password: Joi.string().example("secret").required(),
  }).label("UserCredentials");

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

const ImageSpec = Joi.object({
  path: Joi.string().allow("").example("path/to/images").optional(),
  bytes: Joi.number().optional(),
  filename: Joi.string().allow("").example("peak.jpg").optional(),
  headers: Joi.object().optional(),
});

export const ImageApiSpec = Joi.object({
  images: Joi.alternatives().try(
    Joi.array().items(ImageSpec),
    ImageSpec
  ).required(),
});

export const PeakSpec = Joi.object({
  name: Joi.string().example("Zugspitze").required(),
  description: Joi.string().allow("").example("Highest peak in Germany").optional(),
  elevation: Joi.number().example(2962).required(),
  lat: Joi.number().example(47.4215).required(),
  lng: Joi.number().example(11.9842).required(),
  categories: Joi.alternatives().try(Joi.array().items(IdSpec), IdSpec).optional(),
  userid: IdSpec,
});

export const PeakSpecPlus = PeakSpec.keys({
  images: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  _id: IdSpec,
  __v: Joi.number(),
}).label("PeakDetailsPlus");

export const PeakArray = Joi.array().items(PeakSpecPlus).label("PeakArray");

export const PeakWebSpec = PeakSpec.keys({
  images: Joi.alternatives().try(ImageSpec, Joi.array().items(ImageSpec)).optional(),
});


export const CategoryIdsQuerySpec = Joi.object({
  categoryIds: Joi.array().items(IdSpec).single().optional().description("One or more category IDs. Repeat the parameter (?categoryIds=ID1&categoryIds=ID2) or send an array."),
}).label("CategoryIdsQuery");
