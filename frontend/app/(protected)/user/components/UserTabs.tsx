"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UpdateAccountForm } from './UpdateAccountForm';
import { AuthUser } from '@/types/types';
import SetPasswordForm from './SetPasswordForm';
import ChangePasswordForm from './ChangePasswordForm';

function UserTabs({user}:{user:AuthUser}) {
  return (
    <div className="mx-auto w-1/2">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid bg-backgroundBright w-full grid-cols-2 mb-8 border border-black">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <UpdateAccountForm user={user} />
        </TabsContent>
        <TabsContent value="password" className="space-y-6">
          {user.hasPassword ? <ChangePasswordForm /> : <SetPasswordForm />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UserTabs