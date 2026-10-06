// Sunucu (page.tsx) ve istemci (GaleriClient) ortak kullanır.
// "use client" dosyasından sabit dışa aktarmak sunucuda gerçek değeri vermez, bu yüzden ayrı dosyada.
export const GALLERY_PAGE_SIZE = 24;
export const GALLERY_COLUMNS = "id, user_id, username, title, storage_path, created_at, ref_url";
