import Joi from "joi";

export const UserCredentialsSpec = {
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const UserSpec = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const PeakApiSpec = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  elevation: Joi.number().required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
});

const FileUpload = Joi.object({
  path: Joi.string().required(),
  bytes: Joi.number().required(),
  filename: Joi.string().required(),
  headers: Joi.object().required(),
}).unknown(true);

export const PeakWebSpec = PeakApiSpec.keys({
  images: Joi.alternatives()
    .try(
      FileUpload,
      Joi.array().items(FileUpload)
    )
    .optional(),
});

export const PeakImageUploadSpec = Joi.object({
  images: Joi.alternatives()
    .try(
      FileUpload,
      Joi.array().items(FileUpload)
    )
    .required(),
});