import { LoginForm } from '@/components/forms/login-form';

//make it without the mainlayout included, doesnt look good
function page() {
  return (
    <div className="flex h-[75vh] w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>)
  
}

export default page