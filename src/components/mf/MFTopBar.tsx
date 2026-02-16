"use client";
import { useTheme } from "./theme-context";
import {
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Settings,
  PackageSearch,
  Bell,
  HelpCircle,
  Check,
  Loader2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";
import { Button } from "../ui/button";
import { MFSingleSelect } from "./MFSingleSelect";
import { MFDateRangePicker } from "./MFDateRangePicker";
import SignOutButton from "./SignOut";
import { usePathname } from "next/navigation";
import { getToken, getIDToken } from "@/lib/token";
import { useEffect, useState, } from "react";
import { usePackage } from "@/components/mf/PackageContext";
import { useRouter } from "next/navigation";
import Endpoint from "@/common/endpoint";
import { fetchMenuWithPackage } from "@/lib/menu-utils";
type ErrorResponse = {
  message: string;
};

type PackageResponse = string[];

type MFTopBarType = {
  isExpanded: boolean;
  onToggle: () => void;
  isCalender?: boolean;
  isToggle?:boolean;
};
const enable: string[] = [
  "/summary",
  "user-analysis",


];
export function MFTopBar({
  isExpanded,
  onToggle,
  isCalender = true,
  isToggle=true
}: MFTopBarType) {
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  // For Hiding the Date Filter
    const isOverviewPage = pathname === "/summary";
    
    // Check if the current path is enabled
  const isEnabled = enable.some((path) => pathname.includes(path));
 
  return (
    <div className="shadow-blue-gray-900/5 col-span-2 h-auto bg-background dark:bg-gray-900 dark:text-white w-full p-2">
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        {/* {isToggle && ( */}
        <Button
          title="Toggle Menu"
          variant="ghost"
          className="w-full sm:w-14 rounded-md border text-center dark:bg-gray-900 dark:text-white"
          size="icon"
          onClick={onToggle}
        >
          {isExpanded ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
        {/* )} */}
 
        {isEnabled && (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {/* Package Select - Always show for enabled pages */}
            <div className="w-full sm:w-auto">
              <PackageSelect />
            </div>
 
            {/* Date Range Picker - Hide for Overview pages */}
            {
              (
              <div className="w-full sm:w-auto">
                <MFDateRangePicker className="rounded-md  border text-body dark:bg-background  w-full" />
              </div>
            )}
           {/* <div className=" flex flex-grow text-black justify-center items-center font-semibold text-header dark:text-white">{dynamicTitle}</div> */}
          </div>
        )}
 
        <div className="ml-auto flex items-center gap-2 w-full sm:w-auto justify-between">
          {/* Theme Toggle Button */}

          <Button
            variant="ghost"
            size="icon"
            title="Support "
            className="rounded-md border"
            onClick={() => {
              router.push("/ticketing/dashboard/overall-summary");
            }}
          >
            
            <HelpCircle className="text-foreground" />
          </Button>
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="rounded-md border"
          >
            {isDarkMode ? <Moon /> : <Sun />}
          </Button>
          <KebabMenu />
          
          {/* User PopUp */}
          <UserPopUp />
        </div>
      </div>
    </div>
  );                             
}
 
function UserPopUp() {
  const [Uname, setUname] = useState("");
const [username, setUsername] = useState<string | null>(null);
 
  useEffect(() => {
    
  }, []);
  useEffect(() => {
    const {name} = getIDToken();
    setUname(name);
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
  
  }, []);
  
 
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="ml-auto mr-2 rounded-md border"
          variant="ghost"
          size="icon"
          title="User"
        >
          <User />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mr-4 w-fit overflow-clip p-0">
        <div className="flex flex-col">
          <div className="bg-slate-200 p-4 dark:bg-slate-700">
            {/* <p className="text-header">{Uname}</p> */}
            <p className="text-header"> {`Hello, ${Uname}`}</p>
               <p className="text-small-font">{username}</p>          
               </div>
          <ul className="flex justify-between gap-2 px-4 py-2">
            <li>
              <Link href="/user-details/security">
                <Button title="Settings" variant="ghost" className="text-xs">
                  <Settings />
                  {/* Change Password */}
                </Button>
              </Link>
            </li>
            <li className="hover:text-red-500">
              <SignOutButton />
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
 
interface PackageType {
  PackageName: string;
  PackageTitle: string;
}
 
function PackageSelect({ compact = false }: { compact?: boolean }) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedPackage, setSelectedPackage } = usePackage();
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("IDToken");
        
        // Get the current product name from the pathname
        let productName = "Website Analytics"; // fallback
        if (pathname.startsWith("/website-analytics")) {
          productName = "Website Analytics";
        }
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT}access_control/user_packages?product_name=${encodeURIComponent(productName)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token || "",
            },
            body: JSON.stringify({
              "product_name": productName
            }),
          }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filter out packages with empty PackageName values
          const validPackages = data.filter((pkg: PackageType) => pkg.PackageName && pkg.PackageName.trim() !== "");

          setPackages(validPackages);

          if (!selectedPackage) {
            const savedPackage = localStorage.getItem("selectedPackage");
            const packageToSelect = savedPackage && validPackages.some(pkg => pkg.PackageName === savedPackage)
              ? savedPackage
              : validPackages[0]?.PackageName;

            if (packageToSelect) {
              setSelectedPackage(packageToSelect);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [pathname, selectedPackage]);

 
  const items = packages.map((pkg) => ({
    title: pkg.PackageTitle || pkg.PackageName,
    value: pkg.PackageName,
  }));
 
  const handlePackageChange = (value: string) => {
    setSelectedPackage(value);
    localStorage.setItem("selectedPackage", value);
  };
 
  const selectedPackageTitle = packages.find(pkg => pkg.PackageName === selectedPackage)?.PackageTitle || selectedPackage;
 
  return (
    <MFSingleSelect
      items={items}
      placeholder={isLoading ? "Loading..." : "Select Package"}
      className="max-w-40 h-9"
      value={selectedPackage}
      onValueChange={handlePackageChange}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}
 
function KebabMenu() {

  function findFirstSubMenuRoute(menus: any[]): string | null {
  for (const menu of menus) {
    if (menu.Route && menu.Route !== "") {
      return menu.Route;
    }
    if (menu.SubMenus && menu.SubMenus.length > 0) {
      const subRoute = findFirstSubMenuRoute(menu.SubMenus);
      if (subRoute) 
        return subRoute;
    }
  }
  return null;
}

  // Function to handle more products redirection
  const handleMoreProductClick = (product: any) => {
    if (product.redirect_link) {
      window.open(product.redirect_link, '_blank');
    }
  };

  // Simulated API response (replace with actual API call in production)
  const [availableProducts, setAvailableProducts] = useState<Array<{
    icon: string;
    label: string;
    display_name?: string;
    route: string;
    name?: string;
  }>>([]);
  const [moreProducts, setMoreProducts] = useState<Array<{
    icon: string;
    label: string;
    display_name?: string;
    route?: string;
    name?: string;
    redirect_link?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [selectedProductIdx, setSelectedProductIdx] = useState<number>(0); // Track selected product index
  const router = useRouter();
  const pathname = usePathname();
 
  // Function to fetch menu data and redirect with first submenu route
  const fetchMenuAndRedirect = async (productRoute: string, productName: string) => {
    setIsMenuLoading(true);
    
    try {
      const token = localStorage.getItem("IDToken");
      
      
      // Use the new utility function that fetches package name first
      const menuData = await fetchMenuWithPackage(token || "", productName);
      let firstSubMenuRoute = findFirstSubMenuRoute(menuData) || "";
      
      // Remove the first segment if it starts with a slash and has more than one segment
      if (firstSubMenuRoute.startsWith("/")) {
        const parts = firstSubMenuRoute.split("/");
        // if (parts.length > 2) {
        //   // parts[0] is '', parts[1] is the first segment to remove
        //   firstSubMenuRoute = "/" + parts.slice(2).join("/");
        // }
      }
 
      const finalRoute = firstSubMenuRoute
        ? `${productRoute}${firstSubMenuRoute.startsWith("/") ? "" : "/"}${firstSubMenuRoute}`
        : productRoute;
      
      window.location.href =`${finalRoute}`
      // router.push(finalRoute);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      console.log("Final route to navigate:", error);
      // fallback to just the product route if menu API fails
      
      // router.push(productRoute);
    } finally {
      // setIsMenuLoading(false);
    }
  };
 
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("IDToken");
        // Replace with your actual API endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT}${Endpoint.PRODUCT}?config=true`,
          {
            method: "GET",
            headers: {
              Authorization: token || "",
            },
          }
        );
        const data = await response.json();
        
        // Expecting data to have available_products and more_products arrays
        setAvailableProducts(Array.isArray(data.available_products) ? data.available_products : []);
        setMoreProducts(Array.isArray(data.more_products) ? data.more_products : []);
        const index = data?.available_products?.findIndex((item: any) => item.label === "Website Analytics");
        setSelectedProductIdx(index); // Always select the first product after fetch
      } catch (error) {
        setAvailableProducts([]);
        setMoreProducts([]);
        // setSelectedProductIdx(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    // Find the index of the product whose route matches the current pathname
    const idx = availableProducts.findIndex((app) =>
      pathname.startsWith(app.route)
    );
    if (idx !== -1 && idx !== selectedProductIdx) {
      setSelectedProductIdx(idx);
    }
    // Optionally, if you have a context for selected product, update it here too
  }, [pathname, availableProducts]);
 
  // Helper to render SVG from string
  const renderSVG = (svgString: string) => (
    <span
      className="mb-1"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
  
  const fetchPackages1 = async (productName: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("IDToken");
      if (!token) {
        console.error("No token available");
        return;
      }
      
      // Get the product name from the available products
      const product = availableProducts.find(p => p.name === productName || p.label === productName);
      if (!product) {
        console.error("Product not found:", productName);
        return;
      }

      const packageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT}access_control/user_packages?product_name=${encodeURIComponent(product.label)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
          body: JSON.stringify({
            "product_name": product.label
          }),
        }
      );
     
      const packageData = await packageResponse.json();
     
     
              // Check if packages are available
       if (Array.isArray(packageData) && packageData.length === 0) {
       
         // Redirect to contact admin page when no packages are available
         router.push("/contact-admin");
         return;
       }
      
      // Use the new utility function that fetches package name first
      const menuData = await fetchMenuWithPackage(token, product.label);
      const firstSubMenuRoute = findFirstSubMenuRoute(menuData) || "";
      const productRoute = product.route ;
      
      const finalRoute = firstSubMenuRoute
        ? `${productRoute}${firstSubMenuRoute.startsWith("/") ? "" : "/"}${firstSubMenuRoute}`
        : productRoute;

      window.location.href = finalRoute;
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

const [activeTab, setActiveTab] = useState('subscriptions');
return (
   
 
  <Popover>
    <PopoverTrigger asChild>
      <Button
        className=" rounded-md border"
        variant="ghost"
        size="icon"
        title="Select Product"
      >
        <PackageSearch />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[380px] max-h-[600px] overflow-hidden p-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border-0">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
            activeTab === 'subscriptions'
              ? 'text-secondary dark:text-white dark:bg-gray-900 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center  justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Subscriptions</span>
            {availableProducts.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'subscriptions'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-secondary dark:text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {availableProducts.length}
              </span>
            )}
          </div>
          {activeTab === 'subscriptions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-gray-300 dark:text-gray-300"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
            activeTab === 'addons'
              ? 'text-orange-600 dark:text-orange-400 dark:bg-gray-900 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add-ons</span>
            {moreProducts.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'addons'
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {moreProducts.length}
              </span>
            )}
          </div>
          {activeTab === 'addons' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500"></div>
          )}
        </button>
      </div>

      {/* Page Content */}
      <div className="p-6 overflow-y-auto scrollbar max-h-[520px]">
        {/* Page 1: Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="animate-in  fade-in-50 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-1 bg-secondary rounded-full"></div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Your Subscriptions
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your active products</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No subscriptions available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {availableProducts.map((app, idx) => {
                  const isSelected = idx === selectedProductIdx;
                  return (
                    <div
                      key={idx}
                      className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? 'dark:border-gray-700 border dark:border-gray-700 dark:bg-gray-800 shadow-xl scale-105 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 dark:hover:from-gray-700 dark:hover:to-gray-700 cursor-pointer hover:scale-105 border border-gray-200 dark:border-gray-700'
                      } ${isMenuLoading ? 'opacity-50' : ''}`}
                      style={isSelected ? { pointerEvents: 'none' } : {}}
                      onClick={async () => {
                        if (!isSelected && app.route && !isMenuLoading) {
                          setSelectedProductIdx(idx);
                          const productName = app?.name || app?.label;
                          await fetchPackages1(productName);
                        }
                      }}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`mb-3 transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {renderSVG(app.icon)}
                      </div>
                      <span className={`text-xs font-semibold text-center transition-colors ${
                        isSelected
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-700 dark:text-gray-300 '
                      }`}>
                        {app.display_name || app?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Page 2: Add-ons */}
        {activeTab === 'addons' && (
          <div className="animate-in fade-in-50 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Available Add-ons
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Discover new features and tools</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
              </div>
            ) : moreProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No add-ons available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {moreProducts.map((app, idx) => (
                  <div
                    key={idx}
                    className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                      app.redirect_link
                        ? 'bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-orange-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-700 cursor-pointer hover:shadow-xl hover:scale-105 border border-gray-200 dark:border-gray-700'
                        : 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                    } ${isMenuLoading ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (app.redirect_link) {
                        handleMoreProductClick(app);
                      }
                    }}
                  >
                    {app.redirect_link && (
                      <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center shadow-lg">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    )}
                    <div className={`mb-3 transform transition-transform duration-300 ${app.redirect_link ? 'group-hover:scale-110' : ''}`}>
                      {renderSVG(app.icon)}
                    </div>
                    <span className={`text-xs font-semibold text-center transition-colors ${
                      app.redirect_link
                        ? 'text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {app.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
      </div>
    </PopoverContent>
  </Popover>

);
}