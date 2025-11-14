import { SignupForm } from '@/components/forms/signup-form'

function page() {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-1/4">
        <SignupForm />
      </div>
    </div>
  );
}

export default page