const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const ERP_STATE_ID = import.meta.env.VITE_ERP_STATE_ID || "sbhs-main";
const REMOTE_ENABLED = import.meta.env.VITE_USE_REMOTE_ERP === "true";
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

const endpoint = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/erp_state`
  : "";

export const isRemoteERPConfigured = () => Boolean(REMOTE_ENABLED && SUPABASE_URL && SUPABASE_ANON_KEY);
export const isCloudinaryConfigured = () => Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export async function fetchRemoteERPState() {
  if (!isRemoteERPConfigured()) return null;

  const response = await fetch(`${endpoint}?id=eq.${encodeURIComponent(ERP_STATE_ID)}&select=payload,updated_at`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not load remote ERP state: ${response.status}`);
  }

  const rows = await response.json();
  const row = rows[0];
  return row ? { payload: row.payload, updatedAt: row.updated_at } : null;
}

export async function saveRemoteERPState(payload) {
  if (!isRemoteERPConfigured()) return null;

  const response = await fetch(`${endpoint}?on_conflict=id`, {
    method: "POST",
    headers: {
      ...headers,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: ERP_STATE_ID,
      payload,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not save remote ERP state: ${response.status}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

export async function uploadPortalFile(file, folder = "sbhs-portal") {
  if (!file || !isCloudinaryConfigured()) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }

  const result = await response.json();
  return {
    publicId: result.public_id,
    url: result.secure_url,
    format: result.format,
    resourceType: result.resource_type,
    bytes: result.bytes,
    originalName: file.name,
  };
}
