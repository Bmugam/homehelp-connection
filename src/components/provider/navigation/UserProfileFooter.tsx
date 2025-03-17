
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

const UserProfileFooter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // In a real app, this would clear authentication state
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your provider account.",
    });
    navigate("/provider-login");
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="Provider avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-500 truncate">john@example.com</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-700"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfileFooter;
