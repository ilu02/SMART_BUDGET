'use client';

import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

const goalCategories = [
  'Emergency Fund',
  'Vacation',
  'Car Purchase',
  'Home Down Payment',
  'Debt Repayment',
  'Investment',
  'Education',
  'Retirement',
  'Other'
];

export default function FinancialGoals() {
  const { formatCurrency } = useSettings();
  const [goals, setGoals] = useState<Goal[]>([]);

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: '',
    priority: 'medium' as const
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline || !newGoal.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline,
      category: newGoal.category,
      priority: newGoal.priority
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetAmount: '',
      deadline: '',
      category: '',
      priority: 'medium'
    });
    setIsAddingGoal(false);
    toast.success('Goal added successfully!');
  };

  const handleUpdateProgress = (id: string, amount: number) => {
    setGoals(goals.map(goal =>
      goal.id === id
        ? { ...goal, currentAmount: Math.max(0, goal.currentAmount + amount) }
        : goal
    ));
    toast.success('Progress updated!');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    toast.success('Goal deleted');
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Goals</h2>
        <p className="text-gray-600">Set and track your financial objectives</p>
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {goals.length} active goal{goals.length !== 1 ? 's' : ''}
        </div>
        <Button onClick={() => setIsAddingGoal(true)}>
          <i className="ri-add-line mr-2" aria-hidden="true"></i>
          Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      {isAddingGoal && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title *
              </label>
              <Input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Emergency Fund"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {goalCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount *
              </label>
              <Input
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline *
              </label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                type="text"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              Add Goal
            </Button>
          </div>
        </Card>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-trophy-line text-2xl text-blue-600" aria-hidden="true"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">
              Start working towards your financial dreams by setting your first goal.
            </p>
            <Button onClick={() => setIsAddingGoal(true)}>
              <i className="ri-add-line mr-2" aria-hidden="true"></i>
              Create Your First Goal
            </Button>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = getProgressPercentage(goal);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isOverdue = daysRemaining < 0;
            const isCompleted = progress >= 100;

            return (
              <Card key={goal.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority)}`}>
                        {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Completed
                        </span>
                      )}
                      {isOverdue && !isCompleted && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{goal.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{goal.category}</span>
                      <span>•</span>
                      <span>Target: {formatCurrency(goal.targetAmount)}</span>
                      <span>•</span>
                      <span>
                        {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Delete goal"
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true"></i>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{formatCurrency(goal.currentAmount)} saved</span>
                    <span>{progress.toFixed(1)}% complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' :
                        progress > 75 ? 'bg-blue-500' :
                        progress > 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(goal.id, 100)}
                    >
                      +{formatCurrency(100)}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(goal.id, 500)}
                    >
                      +{formatCurrency(500)}
                    </Button>
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      className="w-32"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const amount = Number((e.target as HTMLInputElement).value);
                          if (amount > 0) {
                            handleUpdateProgress(goal.id, amount);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Goal Statistics */}
      {goals.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {goals.filter(g => getProgressPercentage(g) >= 100).length}
              </div>
              <div className="text-sm text-gray-600">Completed Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(goals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(goals.reduce((sum, goal) => sum + (goal.targetAmount - goal.currentAmount), 0))}
              </div>
              <div className="text-sm text-gray-600">Remaining to Save</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}