import { AuthComponent } from "@/components/ui/sign-up";
import { Film } from "lucide-react";

const CustomLogo = () => (
  <div className="bg-red-600 text-white rounded-lg p-2 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
    <Film className="h-5 w-5" />
  </div>
);

export default function CustomAuthDemo() {
  return (
    <AuthComponent 
      logo={<CustomLogo />} 
      brandName="Moviefy" 
    />
  );
}

