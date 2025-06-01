import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Chip } from "@heroui/react";
import {
  PlusIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { TaskService } from "../services/taskService";
import { DealService } from "../services/dealService";
import {
  PageContainerList,
  FormModal,
  FormField,
  usePageData,
  useFormModal,
} from "../components/common";
import type { StatItem } from "../components/common";
import type {
  Task,
  CreateTaskInput,
  TaskFilters,
  Deal,
  TaskStatus,
} from "../types/index";

interface TaskFormData {
  title: string;
  description?: string;
  deal_id?: string;
  due_date?: string;
  status?: string;
}

const TASK_STATUSES = [
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);

  const {
    items: tasks,
    loading,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    refreshData,
  } = usePageData<Task, TaskFilters>({
    loadData: TaskService.getTasks,
    loadAdditionalData: async () => {
      const dealsData = await DealService.getDeals();
      setDeals(dealsData);
    },
  });

  const { isOpen, onOpen, onClose, form, handleSubmit, isSubmitting } =
    useFormModal<TaskFormData>({
      onSubmit: async (data) => {
        const taskData: CreateTaskInput = {
          title: data.title,
          description: data.description,
          deal_id: data.deal_id || undefined,
          due_date: data.due_date || undefined,
          status: (data.status as any) || "pending",
        };
        await TaskService.createTask(taskData);
      },
      onSuccess: refreshData,
    });

  const getStatusColor = (
    status: string
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    const colors: Record<
      string,
      "default" | "primary" | "secondary" | "success" | "warning" | "danger"
    > = {
      completed: "success",
      overdue: "danger",
      pending: "warning",
    };
    return colors[status] || "warning";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckIcon className="w-4 h-4" />,
      overdue: <ExclamationTriangleIcon className="w-4 h-4" />,
      pending: <ClockIcon className="w-4 h-4" />,
    };
    return icons[status] || <ClockIcon className="w-4 h-4" />;
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  // Calculate task statistics
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = isOverdue(task) ? "overdue" : task.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats: StatItem[] = [
    {
      label: "Total Tasks",
      value: tasks.length,
      icon: <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600",
      iconBgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Pending",
      value: tasksByStatus.pending || 0,
      icon: <ClockIcon className="w-5 h-5 text-warning" />,
      color: "text-warning",
      iconBgColor: "bg-warning-100 dark:bg-warning-900",
    },
    {
      label: "Completed",
      value: tasksByStatus.completed || 0,
      icon: <CheckIcon className="w-5 h-5 text-success" />,
      color: "text-success",
      iconBgColor: "bg-success-100 dark:bg-success-900",
    },
    {
      label: "Overdue",
      value: tasksByStatus.overdue || 0,
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-danger" />,
      color: "text-danger",
      iconBgColor: "bg-danger-100 dark:bg-danger-900",
    },
  ];

  const dealOptions = deals.map((deal) => ({
    key: deal.id,
    label: deal.title,
  }));

  const renderTaskItem = (task: Task) => {
    const taskStatus = isOverdue(task) ? "overdue" : task.status;

    return (
      <div className="flex items-start justify-between group">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            <div
              className={`
                relative p-3 rounded-xl shadow-sm border-2 transition-all duration-200
                ${
                  taskStatus === "completed"
                    ? "bg-success-50 border-success-200 text-success-600 dark:bg-success-900/20 dark:border-success-800/30"
                    : taskStatus === "overdue"
                    ? "bg-danger-50 border-danger-200 text-danger-600 dark:bg-danger-900/20 dark:border-danger-800/30"
                    : "bg-warning-50 border-warning-200 text-warning-600 dark:bg-warning-900/20 dark:border-warning-800/30"
                }
                group-hover:shadow-md group-hover:scale-105
              `}
            >
              {getStatusIcon(taskStatus)}
              {taskStatus === "pending" && (
                <div className="absolute inset-0 rounded-xl bg-warning-400 opacity-20 animate-pulse" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-text-primary truncate flex-1 min-w-0 group-hover:text-primary-600 transition-colors">
                {task.title}
              </h3>
              <div className="flex-shrink-0">
                <div
                  className={`
                    inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border
                    ${
                      taskStatus === "completed"
                        ? "bg-success-100 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-300 dark:border-success-700/30"
                        : taskStatus === "overdue"
                        ? "bg-danger-100 text-danger-700 border-danger-200 dark:bg-danger-900/30 dark:text-danger-300 dark:border-danger-700/30"
                        : "bg-warning-100 text-warning-700 border-warning-200 dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-700/30"
                    }
                  `}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
                </div>
              </div>
            </div>
            {task.description && (
              <div className="bg-background-secondary/50 rounded-lg p-3 border border-border/50">
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              </div>
            )}
            <div className="flex items-center gap-6 text-xs">
              {task.due_date && (
                <div
                  className={`
                  flex items-center gap-2 px-2 py-1 rounded-md transition-colors
                  ${
                    isOverdue(task)
                      ? "bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400"
                      : "bg-background-secondary text-text-secondary hover:bg-background-tertiary"
                  }
                `}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {isOverdue(task) ? "Overdue: " : "Due: "}
                    {formatDate(task.due_date)}
                  </span>
                </div>
              )}
              {task.deal && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                  <BriefcaseIcon className="w-3.5 h-3.5" />
                  <span className="font-medium truncate max-w-32">
                    {task.deal.title}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-text-tertiary">
                <ClockIcon className="w-3.5 h-3.5" />
                <span>Created {formatDate(task.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="p-2 rounded-lg bg-background-secondary text-text-tertiary hover:bg-background-tertiary hover:text-text-primary transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const filtersContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        name="status"
        control={form.control}
        label="Status"
        type="select"
        placeholder="All statuses"
        options={[
          { key: "pending", label: "Pending" },
          { key: "completed", label: "Completed" },
          { key: "overdue", label: "Overdue" },
        ]}
        onSelectionChange={(value) =>
          setFilters((prev) => ({ ...prev, status: value as TaskStatus }))
        }
      />
      <FormField
        name="deal_id"
        control={form.control}
        label="Deal"
        type="select"
        placeholder="All deals"
        options={dealOptions}
        onSelectionChange={(value) =>
          setFilters((prev) => ({ ...prev, deal_id: value }))
        }
      />
      <Input
        type="date"
        label="Due Date"
        value={filters.due_date || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, due_date: e.target.value }))
        }
      />
    </div>
  );

  return (
    <PageContainerList
      title="Tasks"
      subtitle="Manage and track your tasks"
      actionLabel="Create Task"
      actionIcon={<PlusIcon className="w-4 h-4" />}
      onAction={onOpen}
      stats={stats}
      searchValue={filters.search || ""}
      onSearchChange={(value) =>
        setFilters((prev) => ({ ...prev, search: value }))
      }
      searchPlaceholder="Search tasks..."
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      filtersContent={filtersContent}
      items={tasks}
      loading={loading}
      renderItem={renderTaskItem}
      onItemClick={(task) => navigate(`/tasks/${task.id}`)}
      emptyState={{
        icon: <ClipboardDocumentListIcon className="w-16 h-16" />,
        title: "No tasks found",
        description:
          "Create your first task to get started with task management.",
        actionLabel: "Create Task",
        onAction: onOpen,
      }}
    >
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Task"
        onSubmit={form.handleSubmit(handleSubmit)}
        isSubmitting={isSubmitting}
        submitLabel="Create Task"
      >
        <FormField
          name="title"
          control={form.control}
          label="Task Title"
          required
          placeholder="Enter task title"
        />
        <FormField
          name="description"
          control={form.control}
          label="Description"
          type="textarea"
          placeholder="Enter task description"
        />
        <FormField
          name="deal_id"
          control={form.control}
          label="Deal (Optional)"
          type="select"
          options={dealOptions}
        />
        <FormField
          name="due_date"
          control={form.control}
          label="Due Date"
          type="date"
        />
        <FormField
          name="status"
          control={form.control}
          label="Status"
          type="select"
          options={TASK_STATUSES}
        />
      </FormModal>
    </PageContainerList>
  );
};

export default TasksPage;
