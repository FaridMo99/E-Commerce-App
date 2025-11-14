import ForgotPasswordForm from '@/components/forms/forgot-password-form'

function page() {
  return (
    <div className="flex h-[75vh] w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>)
}

export default page