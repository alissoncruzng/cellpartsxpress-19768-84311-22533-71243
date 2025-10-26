import AuthWithOtp from "./AuthWithOtp";

interface AuthFormProps {
  mode: "signin" | "signup";
  role?: "client" | "driver" | "admin" | "wholesale";
  displayRole?: "client" | "driver" | "admin" | "wholesale";
  customerType?: "regular" | "wholesale";
  onSuccess?: () => void;
}

export default function AuthForm({ role = "client", onSuccess }: AuthFormProps) {
  return <AuthWithOtp role={role} onSuccess={onSuccess || (() => {})} />;
}
