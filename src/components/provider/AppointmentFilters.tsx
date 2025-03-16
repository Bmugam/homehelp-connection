
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface AppointmentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search appointments" 
          className="pl-9 w-full sm:w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button variant="outline" size="sm" className="w-full sm:w-auto">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
    </div>
  );
};

export default AppointmentFilters;
