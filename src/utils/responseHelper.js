export function successResponse(data, message = "Operation successful", pagination = null) {
  const response = {
    success: true,
    message,
    data,
  };
  if (pagination) {
    response.pagination = pagination;
  }
  return response;
}

export function errorResponse(message = "Operation failed", statusCode = 400) {
  return {
    success: false,
    message,
    statusCode,
  };
}

export function paginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function simulateDelay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
