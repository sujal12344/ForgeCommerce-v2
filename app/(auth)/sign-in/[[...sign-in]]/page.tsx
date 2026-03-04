import AutoLoginButton from "@/components/auth/auth-login";
import { SignIn } from "@clerk/nextjs";
export default function Page() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SignIn />
      <AutoLoginButton />
    </div>
  );
}
