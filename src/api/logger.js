import Boom from "@hapi/boom";

export function validationError(request, h, error) {
  const details = error?.details?.map((d) => d.message) ?? [];
  return Boom.badRequest("Validation error", { details });
}
