export function isImageUrl(value) {

  if (!value) {
    return false;
  }

  const url =
    String(value).trim().toLowerCase();

  return (
    url.includes('/uploads/') ||
    /\.(jpe?g|png|webp|gif)(\?.*)?$/.test(url)
  );

}
