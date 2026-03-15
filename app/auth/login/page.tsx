import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <AuthForm mode="login" />
    </div>
  );
}
