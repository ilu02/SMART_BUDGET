'use client';

import { useState, useEffect } from 'react';
// IMPORT NEXT.JS ROUTER (from feat-settings)
import { useRouter } from 'next/navigation';
// --------------------

import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert'; // From main
import { useSettings } from '../app/contexts/SettingsContext';
import { useBudgets } from '../app/contexts/BudgetContext';
import { useNotifications, createBudgetAlert } from '../app/contexts/NotificationContext'; // Import Notification tools (from main)
import toast from 'react-hot-toast';

interface SpendingAlert {
    id: number;
    category: string;
    budgetAmount: number;
    spentAmount: number;
    percentage: number;
    type: 'warning' | 'danger' | 'info';
    message: string;
    icon: string;
    color: string;
}

export default function SpendingAlerts() {
    const { formatCurrency, budgetPreferences } = useSettings();
    const { budgets } = useBudgets();
    const { addNotification, notifications } = useNotifications(); // Access notifications and adder (from main)

    // INITIALIZE ROUTER (from feat-settings)
    const router = useRouter(); 
    // -----------------



    const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
    const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
    const [showAll, setShowAll] = useState(false);

    // FIX 2: Use a flag to bypass the double-execution in React Strict Mode on initial mount (from main)
    const [hasRunAlerts, setHasRunAlerts] = useState(false);

    useEffect(() => {
        // --- FIX 2: Skip the first run in development mode (Strict Mode) --- (from main)
        if (process.env.NODE_ENV === 'development' && !hasRunAlerts) {
            setHasRunAlerts(true);
            return;
        }
        // -------------------------------------------------------------------
        
        // Generate alerts based on real budget data
        const generatedAlerts: SpendingAlert[] = [];
        const currencySymbol = formatCurrency(1).substring(0, 1); // Get currency symbol (from main)

        budgets.forEach((budget, index) => {
            const percentage = (budget.spent / budget.budget) * 100;
            let alert: SpendingAlert | null = null;

            // ----------------------------------------------------
            // LOGIC FOR DANGER/EXCEEDED (>= 100%)
            // ----------------------------------------------------
            if (percentage >= 100) {
                const threshold = 100;
                alert = {
                    id: index + 1,
                    category: budget.category,
                    budgetAmount: budget.budget,
                    spentAmount: budget.spent,
                    percentage,
                    type: 'danger',
                    message: `You've exceeded your ${budget.category} budget by ${formatCurrency(budget.spent - budget.budget)}`,
                    icon: budget.icon,
                    color: `bg-${budget.color.split('-')[0]}-500`
                };

                // Check for existing notification for this category and threshold
                const existingNotification = notifications.find(
                    n => n.type === 'budget' && n.category === budget.category && n.threshold === threshold
                );

                // Only create the persistent notification if one doesn't already exist
                if (!existingNotification) {
                    addNotification(createBudgetAlert(
                        budget.category,
                        budget.spent,
                        budget.budget,
                        currencySymbol,
                        threshold
                    ));
                }

            // ----------------------------------------------------
            // LOGIC FOR WARNING (>= Threshold)
            // ----------------------------------------------------
            } else if (percentage >= budgetPreferences.warningThreshold) {
                const threshold = budgetPreferences.warningThreshold;
                alert = {
                    id: index + 1,
                    category: budget.category,
                    budgetAmount: budget.budget,
                    spentAmount: budget.spent,
                    percentage,
                    type: 'warning',
                    message: `You're close to your ${budget.category} budget limit (${percentage.toFixed(1)}% used)`,
                    icon: budget.icon,
                    color: `bg-${budget.color.split('-')[0]}-500`
                };

                // Check for existing notification for this category and threshold
                const existingNotification = notifications.find(
                    n => n.type === 'budget' && n.category === budget.category && n.threshold === threshold
                );

                // Only create the persistent notification if one doesn't already exist
                if (!existingNotification) {
                    addNotification(createBudgetAlert(
                        budget.category,
                        budget.spent,
                        budget.budget,
                        currencySymbol,
                        threshold
                    ));
                }

            // ----------------------------------------------------
            // LOGIC FOR INFO
            // ----------------------------------------------------
            } else if (percentage >= (budgetPreferences.warningThreshold - 15)) {
                // Keep info alert (doesn't generate a persistent notification)
                alert = {
                    id: index + 1,
                    category: budget.category,
                    budgetAmount: budget.budget,
                    spentAmount: budget.spent,
                    percentage,
                    type: 'info',
                    message: `You've used ${percentage.toFixed(1)}% of your ${budget.category} budget`,
                    icon: budget.icon,
                    color: `bg-${budget.color.split('-')[0]}-500`
                };
            }

            if (alert) {
                generatedAlerts.push(alert);
            }
        });

        setAlerts(generatedAlerts);
        
        // FIX 2: Update dependencies (merged)
    }, [budgets, formatCurrency, budgetPreferences.warningThreshold, addNotification, notifications, hasRunAlerts]); 

    const handleDismissAlert = (alertId: number) => {
        setDismissedAlerts(prev => [...prev, alertId]);
        toast.success('Alert dismissed');
    };

    const handleSnoozeAlert = (alertId: number) => {
        // In a real app, this would set a snooze timer
        setDismissedAlerts(prev => [...prev, alertId]);
        toast.success('Alert snoozed for 24 hours');
    };
    
    // NEW HANDLER FUNCTION (from feat-settings)
    const handleAdjustBudgets = () => {
        router.push('/budgets'); // Navigates to the /budgets route
    };
    
    // NEW HANDLER FUNCTION (from feat-settings)
    const handleAlertSettings = () => {
        router.push('/settings'); // Navigates to the /settings route
    };
    // ----------------------

    const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));
    const displayedAlerts = showAll ? visibleAlerts : visibleAlerts.slice(0, 3);

    if (visibleAlerts.length === 0) {
        return (
            <Card className="p-8 bg-gradient-to-br from-white to-green-50/30 border-0 shadow-xl">
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <i className="ri-check-line text-white text-3xl" aria-hidden="true"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">All Good!</h3>
                    <p className="text-gray-600 mb-4">No spending alerts at the moment</p>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        You're staying within your budget limits. Keep up the great work with your financial discipline!
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-8 bg-gradient-to-br from-white to-orange-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <i className="ri-alert-line text-white text-xl" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Spending Alerts</h3>
                        <p className="text-gray-600">{visibleAlerts.length} active alerts require attention</p>
                    </div>
                </div>
                {visibleAlerts.length > 3 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                        className="hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700"
                    >
                        {showAll ? 'Show Less' : `Show All (${visibleAlerts.length})`}
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {displayedAlerts.map((alert) => (
                    <div key={alert.id} className={`relative overflow-hidden rounded-xl p-6 ${
                        alert.type === 'danger' 
                            ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200' 
                            : alert.type === 'warning' 
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                    } hover:shadow-md transition-all duration-200`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alert.color} text-white shadow-sm flex-shrink-0`}>
                                    <i className={`${alert.icon} text-lg`} aria-hidden="true"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 mb-2 text-base">{alert.message}</p>
                                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                                        <span className="font-medium">Spent: {formatCurrency(alert.spentAmount)}</span>
                                        <span className="font-medium">Budget: {formatCurrency(alert.budgetAmount)}</span>
                                        <span className="font-bold">{alert.percentage.toFixed(1)}% used</span>
                                    </div>
                                    <div className="w-full bg-white/70 rounded-full h-2 shadow-inner">
                                        <div
                                            className={`h-2 rounded-full shadow-sm ${
                                                alert.type === 'danger' 
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                                    : alert.type === 'warning' 
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                            }`}
                                            style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                                <button
                                    onClick={() => handleSnoozeAlert(alert.id)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                                    aria-label="Snooze alert"
                                    title="Snooze for 24 hours"
                                >
                                    <i className="ri-time-line text-base" aria-hidden="true"></i>
                                </button>
                                <button
                                    onClick={() => handleDismissAlert(alert.id)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                                    aria-label="Dismiss alert"
                                    title="Dismiss alert"
                                >
                                    <i className="ri-close-line text-base" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Need help managing your budget?</p>
                    <div className="flex items-center space-x-2">
                        {/* MODIFIED BUTTON with onClick handler (from feat-settings) */}
                        <Button variant="outline" size="sm" onClick={handleAlertSettings}>
                            <i className="ri-settings-line mr-2" aria-hidden="true"></i>
                            Alert Settings
                        </Button>
                        {/* ------------------------------------- */}
                        <Button size="sm" onClick={handleAdjustBudgets}>
                            <i className="ri-edit-line mr-2" aria-hidden="true"></i>
                            Adjust Budgets
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}