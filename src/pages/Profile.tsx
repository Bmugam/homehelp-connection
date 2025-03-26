
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/Button"; // Fixed casing issue

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-homehelp-200 flex items-center justify-center text-2xl font-bold text-homehelp-600">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-homehelp-600">{user?.email}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Account Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-homehelp-600 mb-1">Name</label>
                  <p className="text-homehelp-900">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-homehelp-600 mb-1">Email</label>
                  <p className="text-homehelp-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-homehelp-600 mb-1">Account Type</label>
                  <p className="text-homehelp-900 capitalize">{user?.userType}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button variant="outline">Edit Profile</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
