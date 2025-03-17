"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, UserIcon } from "lucide-react";
import { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import { deleteCookie } from "cookies-next";
interface UserHeaderProps {
  user: User;
}

export function UserHeader({ user }: UserHeaderProps) {
  const [data, setData] = useState<User>({} as User);
  const router = useRouter();

  const handleLogout = () => {
    // axios.post(`${process.env.NEXT_PUBLIC_API_RESOURCE}/auth/logout`);
    deleteCookie("token");
    router.push("/login");
  };

  useEffect(() => {
    api.get(`${process.env.NEXT_PUBLIC_API_RESOURCE}/auth/me`).then((res) => {
      console.log(res);
      setData(res.data);
    });
  }, []);

  return (
    <header className="flex items-center justify-between py-4 border-b">
      <h1 className="text-2xl font-bold">Collaborative Notes</h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {user.image ? (
                <AvatarImage src={user.image} alt={data.name || "User"} />
              ) : (
                <AvatarFallback>{data.name?.charAt(0) || "U"}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {data.name && <p className="font-medium">{data.name}</p>}
              {data.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {data.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
