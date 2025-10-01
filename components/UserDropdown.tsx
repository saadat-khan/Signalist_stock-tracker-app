'use client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import {LogOut} from "lucide-react";
import NavItems from "@/components/NavItems";
import {signOut} from "@/lib/actions/auth.actions";

const UserDropdown = ({ user }: { user: User }) => {
    const router = useRouter();

    const handleSignOut = async() => {
-        await signOut();
        const result = await signOut();
        if (result && !result.success) {
            // Optionally show a toast error
            console.error("Sign out failed:", result.error);
            return;
        }
        router.push("/sign-in");
    }

  return (
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 text-gray-4 hover:text-yellow-500">
                  <Avatar className={'h-8 w-8'}>
                      <AvatarImage src="https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc" />
                      <AvatarFallback className={"bg-yellow-500 text-yellow-900 text-sm font-bold"}>CN</AvatarFallback>
                  </Avatar>
                  <div className={"hidden md:flex flex-col items-start"}>
                      <span className={"text-base font-medium text-gray-400"}>
                          {user.name}
                      </span>
                  </div>
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={"text-gray-400"}>
              <DropdownMenuLabel>
                  <div className={"flex relative items-center gap-3 py-2"}>
                      <Avatar className={'h-10 w-10'}>
                          <AvatarImage src="https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc" />
                          <AvatarFallback className={"bg-yellow-500 text-yellow-900 text-sm font-bold"}></AvatarFallback>
                      </Avatar>
                      <div className={"flex flex-col"}>
                      <span className={"text-base font-medium text-gray-400"}>
                          {user.name}
                      </span>
                          <span className={"text-sm text-gray-500"}>
                          {user.email}
                      </span>
                      </div>
                  </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={"bg-gray-600"}/>
              <DropdownMenuItem onClick={handleSignOut} className={"text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transform-colors cursor-pointer"}>
                  <LogOut className={"h-4 w-4 mr-2 hidden sm:block"}/>
                  Logout
              </DropdownMenuItem>
              <DropdownMenuSeparator className={"hidden sm:block bg-gray-600"}/>
              <nav className={"sm:hidden"}>
                  <NavItems/>
              </nav>
          </DropdownMenuContent>
      </DropdownMenu>
  )
}

export default UserDropdown