import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Handshake,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  User,
  ShoppingCart,
  Truck,
  ReceiptText
} from 'lucide-react';

import UserManagement from './UserManagement';
import Artisans from './Artisans';
import TourGuides from './TourGuides';
import Inventory from './Inventory';
import InventoryAdd from './InventoryAdd';
import InventoryEdit from './InventoryEdit';
import InventoryProductDetail from './InventoryProductDetail';
import InventoryAddChildProduct from './InventoryAddChildProduct';
import InventoryEditChildProduct from './InventoryEditChildProduct';
import PlaceholderPage from '../components/PlaceholderPage';
import ArtisanCommissionPage from './ArtisanCommissionPage';
import PosPage from './POS';
import OrderPaymentPage from './OrderPayment';
import ReceiptHistoryPage from './ReceiptHistory';
import SettingPage from './SettingPage';
import DeliveryPage from './DeliveryPage';
import TransactionPage from './TransactionPage';
import AnalyticsReport from './AnalyticsReport';
import ForecastPage from './ForecastPage';

// nanti ganti ini dengan page POS beneran
// const PosPage = () => <PlaceholderPage title="POS" />;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isCashier = user?.role === 'cashier';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (name) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const adminMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
    {
      name: 'Partners',
      path: '/dashboard/partners',
      icon: Handshake,
      subItems: [
        { name: 'Artisans', path: '/dashboard/partners/artisans' },
        { name: 'Tour Guides', path: '/dashboard/partners/tour-guides' }
      ]
    },
    { name: 'Forecasting', path: '/dashboard/forecast', icon: BarChart3 },
    { name: 'Analytics Report', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'User Management', path: '/dashboard/user-management', icon: Users },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings }
  ];

  const cashierMenuItems = [
    { name: 'POS', path: '/dashboard/pos', icon: ShoppingCart },
    { name: 'Delivery', path: '/dashboard/delivery', icon: Truck },
    { name: 'Transactions', path: '/dashboard/transactions', icon: ReceiptText },
  ];

  const menuItems = useMemo(() => {
    return isCashier ? cashierMenuItems : adminMenuItems;
  }, [isCashier]);

  return (
    <div className="flex h-screen bg-white">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-[#F5F5F5] transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col`}
      >
        <div className="px-6 mt-4 py-2 flex items-center gap-3">
          <img src="/logo.png" alt="Kriya Logic Logo" className="w-8 h-8" />
          <span className="font-bold text-lg text-primary">Kriya Logic</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMenus[item.name];

            return (
              <div key={item.name}>
                <div
                  onClick={() => {
                    if (hasSubItems) {
                      toggleMenu(item.name);
                    } else {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md cursor-pointer transition-colors flex items-center justify-between ${
                    isActive(item.path) && !hasSubItems
                      ? 'bg-[#D9D9D9] font-medium text-primary'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Link
                    to={hasSubItems ? '#' : item.path}
                    onClick={(e) => hasSubItems && e.preventDefault()}
                    className="flex items-center gap-3 flex-1"
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>

                  {hasSubItems &&
                    (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </div>

                {hasSubItems && isExpanded && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`block w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${
                          isActive(subItem.path)
                            ? 'text-primary font-medium bg-[#EAEAEA]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="py-2 px-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-md font-medium flex items-center gap-2"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Kriya Logic Logo" className="w-8 h-8" />
            <span className="font-bold text-primary">Kriya Logic</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        {isAdmin && (
          <>
            <header className="hidden md:flex bg-white px-6 py-3 items-center justify-end">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none shadow-sm"
              >
                <User size={20} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-primary mt-1">
                      {user?.role || 'Admin'}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>
          </>
        )}

        <main className="flex-1 overflow-auto p-6 bg-white">
          <Routes>
            {/* default landing by role */}
            <Route
              path="/"
              element={
                isCashier ? (
                  <Navigate to="/dashboard/pos" replace />
                ) : (
                  <PlaceholderPage title={`Dashboard ${user?.role || 'Admin'}`} />
                )
              }
            />

            {/* ADMIN ROUTES */}
            {isAdmin && (
              <>
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/add" element={<InventoryAdd />} />
                <Route path="/inventory/edit/:id" element={<InventoryEdit />} />
                <Route path="/inventory/detail/:id" element={<InventoryProductDetail />} />
                <Route path="/inventory/add/child-product" element={<InventoryAddChildProduct />} />
                <Route
                  path="/inventory/edit/child-product/:childId"
                  element={<InventoryEditChildProduct />}
                />
                <Route path="/forecast" element={<ForecastPage />} />
                <Route path="/analytics" element={<AnalyticsReport />} />
                <Route path="/settings" element={<SettingPage />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/partners/artisans" element={<Artisans />} />
                <Route path="/partners/artisans/commission/:id" element={<ArtisanCommissionPage />} />
                <Route path="/partners/tour-guides" element={<TourGuides />} />
              </>
            )}

            {/* CASHIER ROUTES */}
            {isCashier && (
              <>
                <Route path="/pos" element={<PosPage />} />
                <Route path="/pos/order-payment" element={<OrderPaymentPage />} />
                <Route path="/pos/receipt-histories" element={<ReceiptHistoryPage />} />
                <Route path="/delivery" element={<DeliveryPage />} />
                <Route path="/transactions" element={<TransactionPage />} />
              </>
            )}

            {/* fallback */}
            <Route
              path="*"
              element={
                <Navigate to={isCashier ? '/dashboard/pos' : '/dashboard'} replace />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;