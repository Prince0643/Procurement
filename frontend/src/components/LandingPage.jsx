import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ProcureFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                to="/login" 
                className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Streamline Your
            <span className="text-yellow-600"> Procurement</span> Process
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Complete procurement management system - from purchase requests to disbursement vouchers, all in one platform.
          </p>
          <div className="mt-10 flex justify-center">
            <Link 
              to="/login" 
              className="bg-yellow-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-yellow-700 inline-flex items-center"
            >
              Start Using ProcureFlow
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need for Procurement</h2>
            <p className="mt-4 text-lg text-gray-500">Complete end-to-end procurement management</p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-100 rounded-lg p-4 inline-block">
                <ShoppingCart className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Purchase Requests</h3>
              <p className="mt-2 text-gray-500">Create and manage purchase requests with approval workflows</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-4 inline-block">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Purchase Orders</h3>
              <p className="mt-2 text-gray-500">Generate and track purchase orders automatically</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-4 inline-block">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Analytics & Reports</h3>
              <p className="mt-2 text-gray-500">Real-time insights and comprehensive reporting</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-lg p-4 inline-block">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Supplier Management</h3>
              <p className="mt-2 text-gray-500">Manage suppliers and track performance</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 rounded-lg p-4 inline-block">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Secure & Compliant</h3>
              <p className="mt-2 text-gray-500">Enterprise-grade security with audit trails</p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 rounded-lg p-4 inline-block">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Disbursement Vouchers</h3>
              <p className="mt-2 text-gray-500">Automated voucher generation and tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-yellow-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Transform Your Procurement?</h2>
          <p className="mt-4 text-xl text-yellow-100">Join hundreds of organizations using ProcureFlow</p>
          <div className="mt-8">
            <Link 
              to="/login" 
              className="bg-white text-yellow-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-50 inline-flex items-center"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage