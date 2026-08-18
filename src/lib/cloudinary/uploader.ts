import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import { randomBytes } from "crypto";

let configured = false;

export function ensureCloudinaryReady() {
  if (configured) return cloudinary;
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are not configured");
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return cloudinary;
}

type UploadResult = {
  public_id: string;
  secure_url: string;
  poster_url: string;
  resource_type: string;
  bytes: number;
};

export async function uploadToCloudinary(
  fileName: string,
  bytes: ArrayBuffer,
  mimeType: string,
  folder = "svnb/gallery",
) {
  const client = ensureCloudinaryReady();
  const safeName = (fileName || "media")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 60) || "media";
  const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const publicId = `${safeName}-${uniqueSuffix}`;

  const source = `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
  const upload = await client.uploader.upload(source, {
    folder,
    resource_type: mimeType.startsWith("video/") ? "video" : "image",
    public_id: publicId,
  });

  const isVideo = mimeType.startsWith("video/");
  const posterURL = isVideo
    ? `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/video/upload/${upload.public_id}.jpg`
    : upload.secure_url;

  return {
    ...upload,
    secure_url: upload.secure_url,
    public_id: upload.public_id,
    poster_url: posterURL,
    resource_type: upload.resource_type,
    bytes: upload.bytes,
  } as unknown as UploadResult;
}

export async function deleteFromCloudinary(publicId: string, kind: "IMAGE" | "VIDEO") {
  const client = ensureCloudinaryReady();
  await client.uploader.destroy(publicId, {
    resource_type: kind === "VIDEO" ? "video" : "image",
  });
}
