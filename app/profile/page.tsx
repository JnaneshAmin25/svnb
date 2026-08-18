import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAuthActor } from "@/lib/auth/session";
import { decryptText } from "@/lib/security/crypto";
import ProfileView from "./ProfileView";

export const metadata = { title: "My Profile — SVNB" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const requestLike = {
    cookies: {
      get: (name: string) => {
        const value = cookieStore.get(name)?.value;
        return value ? { name, value } : undefined;
      },
    },
    headers: new Headers(),
  } as unknown as Parameters<typeof getAuthActor>[0];

  const actor = await getAuthActor(requestLike);
  if (!actor) {
    redirect("/login?from=profile");
  }

  const profile = {
    id: actor.user.id,
    role: actor.user.role,
    phone: decryptText(actor.user.phoneCipher) ?? "",
    fullName: actor.user.fullNameCipher
      ? decryptText(actor.user.fullNameCipher)
      : null,
    email: actor.user.emailCipher ? decryptText(actor.user.emailCipher) : null,
    username: actor.user.username,
  };

  return <ProfileView initialProfile={profile} />;
}