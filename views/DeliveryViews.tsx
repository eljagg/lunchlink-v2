import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { Truck, CheckCircle, Clock, MapPin, Package } from 'lucide-react';

const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 10);
};

export const DeliveryDashboard: React.FC = () => {
    const { orders, departments, markBatchDelivered, currentUser } = useStore();
    const today = toLocalISOString(new Date());

    // Filter orders: Must be Today, for my Company, and NOT Cancelled
    const activeOrders = orders.filter(o => 
        o.date === today && 
        o.companyId === currentUser?.companyId && 
        o.status !== 'Cancelled'
    );

    // Group by Department
    const ordersByDept = activeOrders.reduce((acc, order) => {
        // Find Dept Name (or use "Guest" if guest order)
        let deptName = 'Unknown Dept';
        if (order.guestName) {
            deptName = 'Guests / Reception';
        } else {
            // In a real app we'd look up the user's dept. 
            // For now, we simulate since order doesn't store dept ID directly, 
            // but we can assume 'General' for this demo or map users.
            deptName = 'General Office'; 
        }

        if (!acc[deptName]) acc[deptName] = [];
        acc[deptName].push(order);
        return acc;
    }, {} as Record<string, typeof orders>);

    const handleDeliver = async (deptName: string, deptOrders: typeof orders) => {
        if(confirm(`Mark ${deptOrders.length} orders for ${deptName} as Delivered?`)) {
            const ids = deptOrders.map(o => o.id);
            await markBatchDelivered(ids);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-white">Logistics & Delivery</h1>
                <span className="bg-blue-900/30 text-blue-300 px-4 py-1 rounded-full text-sm font-mono border border-blue-800">
                    {new Date().toLocaleDateString()}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(ordersByDept).map(([deptName, deptOrders]) => {
                    const pendingCount = deptOrders.filter(o => o.status !== 'Delivered').length;
                    const isAllDelivered = pendingCount === 0;

                    return (
                        <div key={deptName} className={`p-6 rounded-2xl border-l-8 shadow-lg transition-all ${isAllDelivered ? 'bg-slate-800 border-green-500 opacity-60' : 'bg-slate-800 border-yellow-500'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-slate-400" />
                                        {deptName}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">{deptOrders.length} Total Orders</p>
                                </div>
                                <div className={`p-2 rounded-full ${isAllDelivered ? 'bg-green-900/30 text-green-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                                    <Package className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Order List Preview */}
                            <div className="bg-slate-900/50 rounded-lg p-3 mb-4 space-y-2 max-h-32 overflow-y-auto">
                                {deptOrders.map(o => (
                                    <div key={o.id} className="flex justify-between text-xs text-slate-300">
                                        <span>{o.guestName ? `Guest: ${o.guestName}` : 'Employee Order'}</span>
                                        <span className={o.status === 'Delivered' ? 'text-green-500' : 'text-yellow-500'}>{o.status}</span>
                                    </div>
                                ))}
                            </div>

                            {pendingCount > 0 ? (
                                <button 
                                    onClick={() => handleDeliver(deptName, deptOrders.filter(o => o.status !== 'Delivered'))}
                                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl flex items-center justify-center transition"
                                >
                                    <Truck className="w-5 h-5 mr-2" />
                                    Mark {pendingCount} as Delivered
                                </button>
                            ) : (
                                <div className="w-full py-3 bg-green-900/20 text-green-500 font-bold rounded-xl flex items-center justify-center border border-green-900/50">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Delivery Complete
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {Object.keys(ordersByDept).length === 0 && (
                    <div className="col-span-full text-center py-20 bg-slate-800 rounded-2xl border border-slate-700">
                        <Truck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No orders ready for delivery yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
