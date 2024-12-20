// app/(portal)/profile/page.tsx
import { getServerSession } from "next-auth";
import { getUserProfile } from "./_actions";
import { ProfileForm } from "./_components/profile-form";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Importar authOptions

export default async function ProfilePage() {
  const session = await getServerSession(authOptions); // Passar authOptions aqui

  if (!session?.user?.id) {
    console.log("No session or user ID, redirecting to login");
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.id);
  console.log("Profile found:", !!profile); // Debug log

  if (!profile) {
    console.log("No profile found, redirecting to login");
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Seu Perfil</h1>
        <p className="text-zinc-400 mt-2">Atualize suas informações pessoais</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <ProfileForm
          initialData={{
            name: profile.name,
            email: profile.email,
            phone: profile.phone ?? "",
            address: profile.address ?? "",
            zipCode: profile.zipCode ?? "",
          }}
          userId={profile.id}
        />
      </div>
    </div>
  );
}
