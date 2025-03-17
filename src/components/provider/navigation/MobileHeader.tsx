
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SheetTrigger } from "@/components/ui/sheet";

type MobileHeaderProps = {
  onOpenMobileMenu: () => void;
};

const MobileHeader = ({ onOpenMobileMenu }: MobileHeaderProps) => {
  return (
    <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <SheetTrigger asChild onClick={onOpenMobileMenu}>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <h1 className="ml-3 text-lg font-display font-bold text-homehelp-900">Provider Portal</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-homehelp-500 rounded-full"></span>
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="Provider avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default MobileHeader;
