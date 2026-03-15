import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <AuthForm mode="register" />
    </div>
  );
}
