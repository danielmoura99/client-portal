// app/(auth)/login/page.tsx
import Image from "next/image";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start"></div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Image
              src="/logo.png"
              width={173}
              height={39}
              alt="LOGO "
              className="mb-8"
            />
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-zinc-800 lg:block">
        <Image
          src="/login.png"
          alt="Trading Background"
          fill
          className="absolute"
        />
      </div>
    </div>
  );
}
