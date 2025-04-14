
import { Building2 } from "lucide-react";

const Header = () => {
  return (
    <header className="h-16 border-b flex items-center px-6 bg-background">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-realty-600" />
        <span className="font-semibold text-lg">RealtyWhisper</span>
      </div>
    </header>
  );
};

export default Header;
