import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react'
import { userRoutes } from '../UserDropdown';
import useAuth from '@/stores/authStore';
import Link from 'next/link';
import { SheetClose } from '@/components/ui/sheet';

function MobileUserDopdown() {
    const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)

      const role = useAuth((state) => state.user?.role);

      const filteredRoutes = userRoutes.filter((route) =>
        route.text === "Admin" ? role === "ADMIN" : true
      );
    
    
  return (
    <div className="block py-2 px-4 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
      <div
        onClick={() => setDropdownIsOpen((pre) => !pre)}
        className="flex justify-between items-center"
      >
        <p>User</p>
        {!dropdownIsOpen ? <ArrowDown /> : <ArrowUp />}
      </div>
      {dropdownIsOpen && (
        <div className="flex flex-col bg-backgroundBright rounded my-2 pl-4">
          {filteredRoutes.map((route) => (
            <SheetClose key={route.link} asChild>
              <Link className="my-4" href={route.link}>
                {route.text}
              </Link>
            </SheetClose>
          ))}
        </div>
      )}
    </div>
  );
}

export default MobileUserDopdown