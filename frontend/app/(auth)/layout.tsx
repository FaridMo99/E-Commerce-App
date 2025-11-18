import { ChildrenProps } from '@/types/types';


async function layout({children}:ChildrenProps) {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

export default layout