
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NavItemProps = {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isActive: boolean;
  onClick?: () => void;
};

const SidebarNavItem = ({ 
  title, 
  href, 
  icon, 
  badge, 
  isActive, 
  onClick 
}: NavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-homehelp-50 text-homehelp-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="ml-3">{title}</span>
      {badge && (
        <Badge className="ml-auto" variant="secondary">
          {badge}
        </Badge>
      )}
    </Link>
  );
};

export default SidebarNavItem;
