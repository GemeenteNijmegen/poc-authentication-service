

export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'this endpoint is secrued with an JWT',
    }),
  };
}